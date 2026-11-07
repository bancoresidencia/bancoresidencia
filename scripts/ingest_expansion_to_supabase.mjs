import fs from 'fs';
import readline from 'readline';

// Carrega credenciais do .env.local
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

const stagingFile = 'data/staging/expansao_ineditas_consolidadas.jsonl';
const checkpointFile = 'data/staging/supabase_ingest_checkpoint.json';

if (!fs.existsSync(stagingFile)) {
  console.error(`❌ Arquivo de staging não encontrado: ${stagingFile}`);
  process.exit(1);
}

// Carregar checkpoint se existir
let checkpoint = { lastIndex: 0, totalSuccess: 0, totalErrors: 0 };
if (fs.existsSync(checkpointFile)) {
  try {
    checkpoint = JSON.parse(fs.readFileSync(checkpointFile, 'utf8'));
    console.log(`Retomando do checkpoint: índice ${checkpoint.lastIndex.toLocaleString('pt-BR')}...`);
  } catch (e) {
    console.warn('Checkpoint corrompido, iniciando do zero.');
  }
}

const BATCH_SIZE = 200;
const CONCURRENCY = 8;

console.log('='.repeat(70));
console.log('🚀 INGESTÃO DE QUESTÕES INÉDITAS DE EXPANSÃO NO SUPABASE');
console.log(`• Destino: ${SUPABASE_URL}`);
console.log(`• Batch size: ${BATCH_SIZE} | Concorrência: ${CONCURRENCY} workers`);
console.log('='.repeat(70));

// Ler todas as linhas de questões que ainda precisam ser inseridas
async function loadPendingBatches() {
  const rl = readline.createInterface({
    input: fs.createReadStream(stagingFile),
    crlfDelay: Infinity
  });

  let currentIndex = 0;
  let currentBatch = [];
  const batches = [];

  for await (const line of rl) {
    if (!line.trim()) continue;
    currentIndex++;
    if (currentIndex <= checkpoint.lastIndex) continue;

    const raw = JSON.parse(line);
    const item = {
      id: raw.id,
      code: raw.code,
      institution: raw.institution || 'N/A',
      banca: raw.banca || 'N/A',
      year: parseInt(raw.year, 10) || 2024,
      tipo_prova: raw.tipo_prova || 'Residência Médica',
      modalidade: raw.modalidade || 'Residência Médica',
      especialidade: raw.especialidade || 'Clínica Geral',
      tema: raw.tema || 'Geral',
      foco: raw.foco || 'Geral',
      subfoco: raw.subfoco || 'Geral',
      difficulty: 'Média',
      type: 'Múltipla escolha',
      is_anulada: Boolean(raw.is_anulada),
      statement: raw.statement,
      options: raw.options || [],
      correct_answer: raw.correct_answer,
      commentary: raw.commentary || null,
      images: raw.images || []
    };

    currentBatch.push(item);
    if (currentBatch.length >= BATCH_SIZE) {
      batches.push({ startIndex: currentIndex - currentBatch.length + 1, endIndex: currentIndex, items: currentBatch });
      currentBatch = [];
    }
  }

  if (currentBatch.length > 0) {
    batches.push({ startIndex: currentIndex - currentBatch.length + 1, endIndex: currentIndex, items: currentBatch });
  }

  return { batches, totalItems: currentIndex };
}

const { batches, totalItems } = await loadPendingBatches();
console.log(`Total de itens pendentes: ${batches.reduce((acc, b) => acc + b.items.length, 0).toLocaleString('pt-BR')} em ${batches.length} batches.`);

let batchPointer = 0;
let successCount = checkpoint.totalSuccess;
let errorCount = checkpoint.totalErrors;
const t0 = Date.now();

function saveCheckpoint(lastIdx) {
  fs.writeFileSync(checkpointFile, JSON.stringify({
    lastIndex: lastIdx,
    totalSuccess: successCount,
    totalErrors: errorCount,
    updatedAt: new Date().toISOString()
  }, null, 2));
}

async function runWorker(workerId) {
  while (batchPointer < batches.length) {
    const bIdx = batchPointer++;
    const batch = batches[bIdx];

    let inserted = false;
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
          body: JSON.stringify(batch.items)
        });

        if (res.ok) {
          inserted = true;
          successCount += batch.items.length;
          break;
        } else {
          const errText = await res.text();
          if (attempt === 4) {
            errorCount += batch.items.length;
            console.error(`❌ [Worker ${workerId}] Falha no batch ${batch.startIndex}-${batch.endIndex}: ${res.status} ${errText.slice(0, 150)}`);
          }
          await new Promise(r => setTimeout(r, 400 * attempt));
        }
      } catch (err) {
        if (attempt === 4) {
          errorCount += batch.items.length;
          console.error(`❌ [Worker ${workerId}] Erro de rede batch ${batch.startIndex}: ${err.message}`);
        }
        await new Promise(r => setTimeout(r, 500 * attempt));
      }
    }

    if (bIdx % 10 === 0 || bIdx === batches.length - 1) {
      saveCheckpoint(batch.endIndex);
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      const rate = (successCount / Math.max(1, elapsed)).toFixed(0);
      console.log(`⚡ Progresso: ${successCount.toLocaleString('pt-BR')} inseridas (${rate} q/s) | Erros: ${errorCount} | Batch ${bIdx + 1}/${batches.length}`);
    }
  }
}

// Disparar workers concorrentes
const workers = [];
for (let i = 0; i < CONCURRENCY; i++) {
  workers.push(runWorker(i + 1));
}

await Promise.all(workers);

saveCheckpoint(totalItems);

console.log('='.repeat(70));
console.log('🏁 INGESTÃO CONCLUÍDA!');
console.log(`• Total Sucesso: ${successCount.toLocaleString('pt-BR')}`);
console.log(`• Total Erros  : ${errorCount}`);
console.log(`• Tempo Total  : ${((Date.now() - t0) / 1000).toFixed(1)}s`);
console.log('='.repeat(70));

