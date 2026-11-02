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
const BACKUP_DIR = path.join(DATA_DIR, 'backups', `deep_audit_backup_${Date.now()}`);

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
  console.log('🚀 EXECUÇÃO DA HOMOLOGAÇÃO PROFUNDA: PERMUTAÇÕES DE CADERNO, ANULAÇÕES E RECUPERAÇÕES');
  console.log('='.repeat(90));

  // 1. Carregar manifesto
  const manifestPath = path.join(DATA_DIR, 'manifesto_harmonizacao_e_anulacoes.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('❌ ERRO: manifesto_harmonizacao_e_anulacoes.json não encontrado!');
    process.exit(1);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  const scrambleMap = new Map(manifest.to_scramble_fix.map(i => [i.id, i]));
  const anulateMap = new Map(manifest.to_anulate.map(i => [i.id, i]));
  const recoverMap = new Map(manifest.to_recover_unhomologated.map(i => [i.id, i]));

  console.log(`📋 Itens no manifesto a processar:`);
  console.log(`   • Permutações de caderno (Booklet Scrambles): ${scrambleMap.size}`);
  console.log(`   • Anulações oficiais confirmadas: ${anulateMap.size}`);
  console.log(`   • Gabaritos oficiais recuperados: ${recoverMap.size}`);
  console.log(`   • Total de intervenções planejadas: ${scrambleMap.size + anulateMap.size + recoverMap.size}`);

  // 2. Criar backup
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`\n📦 2. Criando backup em: ${BACKUP_DIR}`);
  for (const f of FILES) {
    const src = path.join(DATA_DIR, f.file);
    if (fs.existsSync(src)) {
      const dest = path.join(BACKUP_DIR, f.file);
      fs.copyFileSync(src, dest);
      console.log(`   • Backup criado: ${f.file}`);
    }
  }

  // 3. Processar arquivos locais
  console.log(`\n⚙️ 3. Aplicando correções nos arquivos locais de questões...`);
  const allUpdatesToSync = [];
  const auditLog = {
    applied_scrambles: [],
    applied_anulations: [],
    applied_recoveries: []
  };

  for (const f of FILES) {
    const fpath = path.join(DATA_DIR, f.file);
    if (!fs.existsSync(fpath)) continue;

    const questions = JSON.parse(fs.readFileSync(fpath, 'utf8'));
    let modifiedCount = 0;

    for (const q of questions) {
      const qid = q.id;
      if (!qid) continue;

      // Prioridade 1: Anulação oficial
      if (anulateMap.has(qid)) {
        const item = anulateMap.get(qid);
        q.isAnulada = true;
        q.is_anulada = true;
        q.correctAnswer = 'ANULADA';
        q.correct_answer = 'ANULADA';
        q.commentary = '';
        modifiedCount++;
        auditLog.applied_anulations.push({ id: qid, code: q.code, spec: f.name, source: item.source });
        allUpdatesToSync.push({
          id: qid,
          payload: { correct_answer: 'ANULADA', is_anulada: true, commentary: '' }
        });
        continue;
      }

      // Prioridade 2: Permutação de caderno
      if (scrambleMap.has(qid)) {
        const item = scrambleMap.get(qid);
        q.correctAnswer = item.new_letter;
        q.correct_answer = item.new_letter;
        q.commentary = ''; // Limpar comentário antigo
        modifiedCount++;
        auditLog.applied_scrambles.push({
          id: qid,
          code: q.code,
          spec: f.name,
          old_letter: item.old_letter,
          new_letter: item.new_letter,
          source: item.source
        });
        allUpdatesToSync.push({
          id: qid,
          payload: { correct_answer: item.new_letter, commentary: '' }
        });
        continue;
      }

      // Prioridade 3: Recuperação de gabarito em questão sem gabarito
      if (recoverMap.has(qid)) {
        const item = recoverMap.get(qid);
        q.correctAnswer = item.recovered_letter;
        q.correct_answer = item.recovered_letter;
        modifiedCount++;
        auditLog.applied_recoveries.push({
          id: qid,
          code: q.code,
          spec: f.name,
          recovered_letter: item.recovered_letter,
          source: item.source
        });
        allUpdatesToSync.push({
          id: qid,
          payload: { correct_answer: item.recovered_letter }
        });
      }
    }

    if (modifiedCount > 0) {
      safeWriteFileSync(fpath, JSON.stringify(questions, null, 2));
      console.log(`   ✅ [${f.name.padEnd(28)}]: ${modifiedCount} questões atualizadas com sucesso`);
    } else {
      console.log(`   ℹ️ [${f.name.padEnd(28)}]: Nenhuma alteração necessária`);
    }
  }

  // 4. Salvar log de auditoria
  const logPath = path.join(DATA_DIR, 'deep_audit_corrections_log.json');
  safeWriteFileSync(logPath, JSON.stringify(auditLog, null, 2));
  console.log(`\n📄 Log de auditoria detalhado gravado em: ${logPath}`);

  // 5. Sincronizar em lotes atômicos com o Supabase
  console.log(`\n📡 5. Sincronizando ${allUpdatesToSync.length} alterações com o banco remoto Supabase...`);
  
  // Agrupar por tipo de payload para envio em massa ultra-rápido via in.(...)
  const anulationsIds = allUpdatesToSync.filter(u => u.payload.is_anulada).map(u => u.id);
  const byLetterMap = new Map();
  for (const u of allUpdatesToSync) {
    if (u.payload.is_anulada) continue;
    const letCode = u.payload.correct_answer;
    if (!byLetterMap.has(letCode)) byLetterMap.set(letCode, []);
    byLetterMap.get(letCode).push(u.id);
  }

  let totalRemoteSynced = 0;

  // Sync Anulações
  if (anulationsIds.length > 0) {
    console.log(`   • Sincronizando ${anulationsIds.length} anulações no Supabase...`);
    const BATCH_SIZE = 100;
    for (let i = 0; i < anulationsIds.length; i += BATCH_SIZE) {
      const batch = anulationsIds.slice(i, i + BATCH_SIZE);
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
      if (!res.ok) {
        console.error(`     ❌ Erro no lote de anulações ${i}:`, await res.text());
      } else {
        totalRemoteSynced += batch.length;
      }
    }
  }

  // Sync Gabaritos por Letra
  for (const [letCode, ids] of byLetterMap.entries()) {
    console.log(`   • Sincronizando ${ids.length} questões com gabarito '${letCode}'...`);
    const BATCH_SIZE = 100;
    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      const batch = ids.slice(i, i + BATCH_SIZE);
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
          correct_answer: letCode,
          commentary: ''
        })
      });
      if (!res.ok) {
        console.error(`     ❌ Erro no lote '${letCode}' ${i}:`, await res.text());
      } else {
        totalRemoteSynced += batch.length;
      }
    }
  }

  console.log(`\n` + '='.repeat(90));
  console.log(`🏁 RESULTADO DA HOMOLOGAÇÃO:`);
  console.log(`='.repeat(90)`);
  console.log(`🔄 Permutações de caderno harmonizadas: ${auditLog.applied_scrambles.length}`);
  console.log(`❌ Anulações oficiais homologadas: ${auditLog.applied_anulations.length}`);
  console.log(`✨ Gabaritos recuperados homologados: ${auditLog.applied_recoveries.length}`);
  console.log(`📡 Total sincronizado no Supabase: ${totalRemoteSynced} / ${allUpdatesToSync.length}`);
  console.log('='.repeat(90) + '\n');
}

main().catch(err => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});

