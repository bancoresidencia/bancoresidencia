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
const BACKUP_DIR = path.join(DATA_DIR, 'backups', `hrac_blind_backup_${Date.now()}`);

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
  { key: 'clinica_medica', name: 'Clínica Médica', file: 'clinica_medica_final_questions.json' },
  { key: 'ginecologia', name: 'Ginecologia', file: 'ginecologia_final_questions.json' },
  { key: 'medicina_preventiva', name: 'Medicina Preventiva e Social', file: 'medicina_preventiva_final_questions.json' },
  { key: 'obstetricia', name: 'Obstetrícia', file: 'obstetricia_final_questions.json' },
  { key: 'pediatria', name: 'Pediatria', file: 'pediatria_final_questions.json' },
  { key: 'urologia', name: 'Urologia', file: 'urologia_final_questions.json' },
  { key: 'nefrologia', name: 'Nefrologia', file: 'nefrologia_final_questions.json' }
];

async function main() {
  console.log('='.repeat(90));
  console.log('🚀 EXECUÇÃO DA QUARENTENA PREVENTIVA: HRAC-USP 2025 E QUESTÕES CEGAS');
  console.log('='.repeat(90));

  // 1. Carregar lista de questões cegas
  const repPath = path.join(DATA_DIR, 'relatorio_mega_bateria_testes.json');
  if (!fs.existsSync(repPath)) {
    console.error('❌ ERRO: relatorio_mega_bateria_testes.json não encontrado!');
    process.exit(1);
  }
  const rep = JSON.parse(fs.readFileSync(repPath, 'utf8'));
  const blindMap = new Map(rep.missing_image_questions.map(q => [q.id, q]));

  // 2. Criar backup preventivo
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

  // 3. Carregar quarentena existente
  const quarPath = path.join(DATA_DIR, 'quarentena_questions.json');
  let quarantineList = [];
  if (fs.existsSync(quarPath)) {
    try {
      quarantineList = JSON.parse(fs.readFileSync(quarPath, 'utf8'));
    } catch {}
  }
  const quarSet = new Set(quarantineList.map(q => q.id));

  const newQuarantined = [];
  const supabaseUpdates = [];
  let hracQuarantined = 0;
  let blindQuarantined = 0;

  for (const f of FILES) {
    const fpath = path.join(DATA_DIR, f.file);
    if (!fs.existsSync(fpath)) continue;

    const questions = JSON.parse(fs.readFileSync(fpath, 'utf8'));
    let modifiedInFile = 0;

    for (const q of questions) {
      const qid = q.id;
      if (!qid) continue;

      const isHrac2025 = (q.banca || '').includes('HRAC') && q.year === 2025;
      const isBlind = blindMap.has(qid);

      if (isHrac2025 || isBlind) {
        q.isAnulada = true;
        q.is_anulada = true;
        q.correctAnswer = 'ANULADA';
        q.correct_answer = 'ANULADA';
        q.commentary = '';

        modifiedInFile++;
        supabaseUpdates.push(qid);

        const reason = isHrac2025 ? 'HRAC_USP_2025_GABARITO_DUMMY_PENDENTE_FUVEST' : 'QUESTAO_CEGA_IMAGEM_AUSENTE';
        if (isHrac2025) hracQuarantined++;
        if (isBlind) blindQuarantined++;

        const quarItem = {
          id: qid,
          code: q.code,
          spec: f.name,
          reason,
          banca: q.banca,
          year: q.year,
          statementSnippet: (q.statement || '').slice(0, 80)
        };
        newQuarantined.push(quarItem);

        if (!quarSet.has(qid)) {
          quarantineList.push(quarItem);
          quarSet.add(qid);
        }
      }
    }

    if (modifiedInFile > 0) {
      safeWriteFileSync(fpath, JSON.stringify(questions, null, 2));
      console.log(`   ✅ [${f.name.padEnd(28)}]: ${modifiedInFile} questões isoladas em quarentena`);
    } else {
      console.log(`   ℹ️ [${f.name.padEnd(28)}]: Nenhuma alteração`);
    }
  }

  // 4. Salvar quarentena consolidada
  safeWriteFileSync(quarPath, JSON.stringify(quarantineList, null, 2));
  console.log(`\n📄 Catálogo geral de quarentena atualizado: ${quarantineList.length} itens totais.`);

  // 5. Sincronizar com o Supabase
  console.log(`\n📡 5. Sincronizando ${supabaseUpdates.length} anulações de proteção no Supabase...`);
  const BATCH_SIZE = 100;
  let remoteSuccess = 0;

  for (let i = 0; i < supabaseUpdates.length; i += BATCH_SIZE) {
    const batch = supabaseUpdates.slice(i, i + BATCH_SIZE);
    const url = `${SUPABASE_URL}/rest/v1/questions?id=in.(${batch.join(',')})`;
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
      remoteSuccess += batch.length;
    } else {
      console.error(`   ❌ Erro ao atualizar lote ${i}:`, await res.text());
    }
  }

  console.log('\n' + '='.repeat(90));
  console.log('🏁 RESULTADO CONSOLIDADO:');
  console.log('='.repeat(90));
  console.log(`🛡️ Questões do HRAC-USP 2025 isoladas (gabarito dummy removido): ${hracQuarantined}`);
  console.log(`👁️ Questões cegas isoladas (dependência de imagem ausente): ${blindQuarantined}`);
  console.log(`📦 Total isolado nesta rodada: ${newQuarantined.length}`);
  console.log(`📡 Sincronizados com sucesso no Supabase: ${remoteSuccess} / ${supabaseUpdates.length}`);
  console.log(`📋 Catálogo geral de quarentena total: ${quarantineList.length}`);
  console.log('='.repeat(90) + '\n');
}

main().catch(err => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
