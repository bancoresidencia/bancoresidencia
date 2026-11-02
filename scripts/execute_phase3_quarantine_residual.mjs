import fs from 'fs';
import path from 'path';

// Carregar variáveis de ambiente de .env.local
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
  console.error('❌ ERRO: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausentes em .env.local');
  process.exit(1);
}

const BASE_DIR = process.cwd();
const DATA_DIR = path.join(BASE_DIR, 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups', `phase3_backup_${Date.now()}`);

function safeWriteFileSync(filePath, content) {
  let attempts = 0;
  while (attempts < 10) {
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      return;
    } catch (err) {
      attempts++;
      if (attempts >= 10) throw err;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 150 * attempts);
    }
  }
}

const FILES = [
  { key: 'cirurgia', name: 'Cirurgia', file: 'cirurgia_final_questions.json' },
  { key: 'clinica', name: 'Clínica Médica', file: 'clinica_medica_final_questions.json' },
  { key: 'ginecologia', name: 'Ginecologia', file: 'ginecologia_final_questions.json' },
  { key: 'preventiva', name: 'Medicina Preventiva e Social', file: 'medicina_preventiva_final_questions.json' },
  { key: 'obstetricia', name: 'Obstetrícia', file: 'obstetricia_final_questions.json' },
  { key: 'pediatria', name: 'Pediatria', file: 'pediatria_final_questions.json' },
  { key: 'urologia', name: 'Urologia', file: 'urologia_final_questions.json' }
];

async function main() {
  console.log('='.repeat(90));
  console.log('🚀 EXECUÇÃO DA FASE 3: HIGIENIZAÇÃO RESIDUAL E QUARENTENA DE QUESTÕES FORA DO PADRÃO');
  console.log('='.repeat(90));

  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`\n📦 1. Criando backup em: ${BACKUP_DIR}`);
  for (const f of FILES) {
    const src = path.join(DATA_DIR, f.file);
    if (fs.existsSync(src)) {
      const dest = path.join(BACKUP_DIR, f.file);
      fs.copyFileSync(src, dest);
      console.log(`   • Backup criado: ${f.file}`);
    }
  }

  // Carregar quarentena existente
  const quarPath = path.join(DATA_DIR, 'quarentena_questions.json');
  let quarantineList = [];
  if (fs.existsSync(quarPath)) {
    try {
      quarantineList = JSON.parse(fs.readFileSync(quarPath, 'utf8'));
    } catch {}
  }
  const quarSet = new Set(quarantineList.map(q => q.id));

  console.log(`\n📦 2. Quarentena existente: ${quarantineList.length} registros.`);

  const newQuarantined = [];
  const supabaseUpdates = [];

  for (const f of FILES) {
    const fpath = path.join(DATA_DIR, f.file);
    if (!fs.existsSync(fpath)) continue;

    const questions = JSON.parse(fs.readFileSync(fpath, 'utf8'));
    let specQuar = 0;

    for (const q of questions) {
      const qid = q.id;
      if (!qid) continue;

      const ans = (q.correctAnswer || q.correct_answer || '').trim().toUpperCase();
      const isAnul = Boolean(q.isAnulada || q.is_anulada || ans === 'ANULADA');
      const opts = (q.options || []).map(o => o.letter);
      const isOutOfOptions = !isAnul && ans && opts.length > 0 && !opts.includes(ans);

      if (isOutOfOptions && !isAnul) {
        q.isAnulada = true;
        q.is_anulada = true;
        q.correctAnswer = 'ANULADA';
        q.correct_answer = 'ANULADA';
        q.commentary = '';

        specQuar++;
        const item = {
          id: qid,
          code: q.code,
          spec: f.name,
          reason: 'LETRA_DE_GABARITO_FORA_DAS_OPCOES_EXISTENTES',
          optionsAvailable: opts,
          invalidAnswer: ans,
          statementSnippet: (q.statement || '').slice(0, 70)
        };
        newQuarantined.push(item);
        if (!quarSet.has(qid)) {
          quarantineList.push(item);
          quarSet.add(qid);
        }

        supabaseUpdates.push(qid);
      }
    }

    if (specQuar > 0) {
      safeWriteFileSync(fpath, JSON.stringify(questions, null, 2));
      console.log(`   ✅ [${f.name.padEnd(28)}]: +${specQuar} novas questões isoladas em quarentena`);
    } else {
      console.log(`   ℹ️ [${f.name.padEnd(28)}]: 100% limpo, sem inconsistências residuais`);
    }
  }

  // Atualizar arquivo de quarentena
  safeWriteFileSync(quarPath, JSON.stringify(quarantineList, null, 2));
  console.log(`\n📄 Catálogo geral de quarentena atualizado: ${quarantineList.length} questões totais.`);

  // Sincronizar com Supabase
  if (supabaseUpdates.length > 0) {
    console.log(`\n📡 3. Sincronizando ${supabaseUpdates.length} novas anulações no Supabase...`);
    const filter = `id=in.(${supabaseUpdates.join(',')})`;
    const url = `${SUPABASE_URL}/rest/v1/questions?${filter}`;

    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        correct_answer: 'ANULADA',
        is_anulada: true,
        commentary: ''
      })
    });

    if (res.ok) {
      console.log(`   ✅ Supabase atualizado com sucesso para as ${supabaseUpdates.length} questões.`);
    } else {
      console.error(`   ❌ Erro ao atualizar Supabase:`, await res.text());
    }
  } else {
    console.log(`\n📡 3. Nenhuma sincronização remota residual necessária.`);
  }

  console.log('\n' + '='.repeat(90));
  console.log('🏁 RESULTADO CONSOLIDADO DA FASE 3:');
  console.log('='.repeat(90));
  console.log(`🛡️ Novas Questões Isoladas em Quarentena (Letra fora das opções): ${newQuarantined.length}`);
  console.log(`📦 Total Geral de Questões em Quarentena Protegida: ${quarantineList.length}`);
  console.log('='.repeat(90) + '\n');
}

main().catch(err => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});

