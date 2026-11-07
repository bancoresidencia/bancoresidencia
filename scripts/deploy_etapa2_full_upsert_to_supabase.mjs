import fs from 'fs';

// 1. Carrega credenciais do .env.local
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Credenciais do Supabase não encontradas no .env.local');
  process.exit(1);
}

const CHECKPOINT_FILE = 'data/staging/patches_deploy_checkpoint.json';

let checkpoint = {};
if (fs.existsSync(CHECKPOINT_FILE)) {
  try {
    checkpoint = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf8'));
  } catch (e) {
    checkpoint = {};
  }
}

function saveCheckpoint(fileName, lastBatchIdx) {
  checkpoint[fileName] = lastBatchIdx;
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2), 'utf8');
}

function cleanNullChars(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/\0/g, '').replace(/\\u0000/g, '');
}

function cleanPayload(item) {
  return {
    id: item.id,
    code: item.code || 'CODE',
    institution: cleanNullChars(item.institution) || 'N/A',
    banca: cleanNullChars(item.banca) || 'N/A',
    year: parseInt(item.year, 10) || 2024,
    tipo_prova: cleanNullChars(item.tipo_prova) || 'Residência Médica',
    modalidade: item.modalidade || 'Residência Médica (Acesso Direto)',
    especialidade: item.especialidade,
    tema: item.tema,
    foco: item.foco,
    subfoco: item.subfoco,
    difficulty: item.difficulty || 'Média',
    type: item.type || 'Múltipla escolha',
    is_anulada: Boolean(item.is_anulada),
    statement: cleanNullChars(item.statement || ''),
    options: (item.options || []).map(opt => {
      if (typeof opt === 'string') return cleanNullChars(opt);
      if (opt && typeof opt === 'object') {
        const cleaned = {};
        for (const [k, v] of Object.entries(opt)) {
          cleaned[k] = cleanNullChars(v);
        }
        return cleaned;
      }
      return opt;
    }),
    correct_answer: item.correct_answer || null,
    commentary: item.commentary ? cleanNullChars(item.commentary) : null,
    images: item.images || []
  };
}

const files = [
  { name: 'Preventiva', path: 'data/medicina_preventiva_final_questions.json' },
  { name: 'Pediatria', path: 'data/pediatria_final_questions.json' },
  { name: 'Cirurgia Geral', path: 'data/cirurgia_final_questions.json' },
  { name: 'Ginecologia', path: 'data/ginecologia_final_questions.json' },
  { name: 'Obstetricia', path: 'data/obstetricia_final_questions.json' },
  { name: 'Clinica Medica', path: 'data/clinica_medica_final_questions.json' }
];

const BATCH_SIZE = 250;
const CONCURRENCY = 12;

console.log('='.repeat(70));
console.log('⚡ FASE 2.6: DEPLOY DOS PATCHES TAXONÔMICOS OURO NO SUPABASE');
console.log(`• Destino: ${SUPABASE_URL}`);
console.log(`• Batch size: ${BATCH_SIZE} | Concorrência: ${CONCURRENCY} workers`);
console.log('='.repeat(70));

let globalSuccess = 0;
let globalErrors = 0;
const globalT0 = Date.now();

for (const f of files) {
  if (!fs.existsSync(f.path)) {
    console.warn(`[AVISO] Arquivo não encontrado: ${f.path}`);
    continue;
  }

  console.log(`\n📂 Processando ${f.name} (${f.path})...`);
  const rawData = JSON.parse(fs.readFileSync(f.path, 'utf8'));
  console.log(`   Carregadas ${rawData.length.toLocaleString('pt-BR')} questões.`);

  const batches = [];
  for (let i = 0; i < rawData.length; i += BATCH_SIZE) {
    batches.push(rawData.slice(i, i + BATCH_SIZE));
  }

  const startBatch = checkpoint[f.path] || 0;
  if (startBatch >= batches.length) {
    console.log(`   ✅ Arquivo ${f.name} já concluído anteriormente (checkpoint: batch ${startBatch}/${batches.length}).`);
    globalSuccess += rawData.length;
    continue;
  }

  console.log(`   Iniciando a partir do batch ${startBatch + 1}/${batches.length}...`);

  let batchPointer = startBatch;
  let fileSuccess = 0;
  let fileErrors = 0;
  const fileT0 = Date.now();

  async function runWorker(workerId) {
    while (batchPointer < batches.length) {
      const bIdx = batchPointer++;
      const rawBatch = batches[bIdx];
      const payload = rawBatch.map(cleanPayload);

      let ok = false;
      for (let attempt = 1; attempt <= 4; attempt++) {
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/questions`, {
            method: 'POST',
            headers: {
              'apikey': SERVICE_KEY,
              'Authorization': `Bearer ${SERVICE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'resolution=merge-duplicates,return=minimal'
            },
            body: JSON.stringify(payload)
          });

          if (res.ok) {
            ok = true;
            fileSuccess += rawBatch.length;
            break;
          } else {
            const errText = await res.text();
            if (attempt === 4) {
              fileErrors += rawBatch.length;
              console.error(`   ❌ [Worker ${workerId}] Erro definitivo no batch ${bIdx}: ${res.status} ${errText.slice(0, 120)}`);
            }
            await new Promise(r => setTimeout(r, 400 * attempt));
          }
        } catch (e) {
          if (attempt === 4) {
            fileErrors += rawBatch.length;
            console.error(`   ❌ [Worker ${workerId}] Exceção no batch ${bIdx}: ${e.message}`);
          }
          await new Promise(r => setTimeout(r, 400 * attempt));
        }
      }

      if (bIdx % 10 === 0 || bIdx === batches.length - 1) {
        saveCheckpoint(f.path, bIdx + 1);
        const elapsedSec = ((Date.now() - fileT0) / 1000).toFixed(1);
        const rate = (fileSuccess / (elapsedSec || 1)).toFixed(0);
        console.log(`   [PROGRESSO] Batch ${bIdx + 1}/${batches.length} | Sucessos: ${fileSuccess.toLocaleString('pt-BR')} | Taxa: ${rate} q/s`);
      }
    }
  }

  const workers = [];
  for (let w = 0; w < CONCURRENCY; w++) {
    workers.push(runWorker(w + 1));
  }
  await Promise.all(workers);

  saveCheckpoint(f.path, batches.length);
  globalSuccess += fileSuccess;
  globalErrors += fileErrors;
  const fileElapsed = ((Date.now() - fileT0) / 1000).toFixed(1);
  console.log(`   🎉 Concluído ${f.name} em ${fileElapsed}s! Sucessos: ${fileSuccess.toLocaleString('pt-BR')} | Falhas: ${fileErrors}`);
}

const totalElapsed = ((Date.now() - globalT0) / 1000).toFixed(1);
console.log('\n' + '='.repeat(70));
console.log('🏆 DEPLOY TAXONÔMICO NO SUPABASE CONCLUÍDO!');
console.log(`• Total Sucessos: ${globalSuccess.toLocaleString('pt-BR')}`);
console.log(`• Total Erros: ${globalErrors}`);
console.log(`• Tempo total: ${totalElapsed}s`);
console.log('='.repeat(70));

if (globalErrors === 0) {
  process.exit(0);
} else {
  process.exit(1);
}

