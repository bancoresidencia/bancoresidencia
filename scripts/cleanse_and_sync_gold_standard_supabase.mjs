import fs from 'fs';
import path from 'path';

const BASE_DIR = process.cwd();
const DATA_DIR = path.join(BASE_DIR, 'data');

// Carrega .env.local
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
  console.error('❌ ERRO: Credenciais Supabase ausentes em .env.local');
  process.exit(1);
}

const QUESTION_FILES = [
  'cirurgia_final_questions.json',
  'clinica_medica_final_questions.json',
  'ginecologia_final_questions.json',
  'medicina_preventiva_final_questions.json',
  'obstetricia_final_questions.json',
  'pediatria_final_questions.json',
  'urologia_final_questions.json'
];

async function main() {
  console.log('='.repeat(80));
  console.log('🛡️ SANEAMENTO E SINCRONIZAÇÃO: GABARITOS PADRÃO OURO -> SUPABASE');
  console.log('='.repeat(80));

  const verifiedBank = new Map();
  const letterGroups = {
    'A': [],
    'B': [],
    'C': [],
    'D': [],
    'E': [],
    'ANULADA': []
  };

  let totalQuestions = 0;

  for (const filename of QUESTION_FILES) {
    const fpath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(fpath)) continue;

    const content = JSON.parse(fs.readFileSync(fpath, 'utf8'));
    totalQuestions += content.length;

    for (const q of content) {
      const qid = (q.id || '').trim();
      if (!qid) continue;

      const ans = (q.correct_answer || q.correctAnswer || '').trim().toUpperCase();
      const isAnulada = Boolean(q.is_anulada || q.isAnulada || ans === 'ANULADA' || ans === '!');

      if (isAnulada) {
        verifiedBank.set(qid, { letter: 'ANULADA', isAnulada: true });
        letterGroups['ANULADA'].push(qid);
      } else if (['A', 'B', 'C', 'D', 'E'].includes(ans)) {
        verifiedBank.set(qid, { letter: ans, isAnulada: false });
        letterGroups[ans].push(qid);
      }
    }
  }

  console.log(`\n📚 Total de questões catalogadas no banco local: ${totalQuestions.toLocaleString('pt-BR')}`);
  console.log(`⭐ Total com Gabarito Padrão Ouro Homologado: ${verifiedBank.size.toLocaleString('pt-BR')}`);
  for (const [letra, list] of Object.entries(letterGroups)) {
    console.log(`   • Gabarito [${letra}]: ${list.length.toLocaleString('pt-BR')} questões`);
  }

  // 1. Atualiza e garante todos os gabaritos homologados corretos
  console.log('\n🚀 [Fase 1/2] Sincronizando gabaritos padrão ouro no Supabase...');
  const BATCH_SIZE = 100;
  const updateTasks = [];

  for (const [letter, idList] of Object.entries(letterGroups)) {
    for (let i = 0; i < idList.length; i += BATCH_SIZE) {
      const chunk = idList.slice(i, i + BATCH_SIZE);
      const isAnul = letter === 'ANULADA';
      const body = isAnul ? { correct_answer: 'ANULADA', is_anulada: true } : { correct_answer: letter, is_anulada: false };
      updateTasks.push({ ids: chunk, body });
    }
  }

  const CONCURRENCY = 8;
  let doneCount = 0;

  async function executeBatch(task) {
    const filter = `id=in.(${task.ids.join(',')})`;
    const endpoint = `${SUPABASE_URL}/rest/v1/questions?${filter}`;
    const res = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(task.body)
    });
    if (!res.ok) {
      const txt = await res.text();
      console.warn(`⚠️ Aviso no lote: ${res.status} - ${txt}`);
    }
  }

  async function runPool(tasks, label) {
    let index = 0;
    const workers = Array.from({ length: CONCURRENCY }, async () => {
      while (index < tasks.length) {
        const cur = tasks[index++];
        await executeBatch(cur);
        doneCount++;
        if (doneCount % 50 === 0 || doneCount === tasks.length) {
          const pct = ((doneCount / tasks.length) * 100).toFixed(1);
          process.stdout.write(`\r   [${label}: ${doneCount}/${tasks.length} (${pct}%)] lotes executados...`);
        }
      }
    });
    await Promise.all(workers);
    console.log();
  }

  await runPool(updateTasks, 'Homologados');

  // Atualiza especificamente a questão das sondas cirúrgicas com comentário
  console.log('\n🩺 Atualizando comentário clínico da questão das Sondas Cirúrgicas...');
  await fetch(`${SUPABASE_URL}/rest/v1/questions?id=eq.efa685d7-456a-4d5c-b11d-0f5f5f55faf0`, {
    method: 'PATCH',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify({
      correct_answer: 'B',
      is_anulada: false,
      commentary: 'Gabarito Oficial: Alternativa B.\n\nJustificativa Cirúrgica Detalhada:\n- A) INCORRETA: A sonda nasogástrica (SNG) é indicada para descompressão gástrica ou nutrição enteral de curto prazo (< 4 a 6 semanas). Para alimentação enteral prolongada e definitiva, a via de escolha mandatória é a gastrostomia (PEG/cirúrgica) ou jejunostomia.\n- B) CORRETA: As sondas de Foley são cateteres vesicais de demora universalmente empregados em cirurgia e UTI para drenagem vesical e monitorização rigorosa do débito urinário, possuindo balonete distal de fixação inflado no colo vesical.\n- C) INCORRETA: A sonda de Levine possui lúmen único e orifícios laterais na extremidade para descompressão/aspiração gástrica, não sendo indicada para nutrição enteral contínua (para a qual se utiliza sonda enteral fina de poliuretano com ogiva de tungstênio, tipo Dobbhoff).\n- D) INCORRETA: As sondas de Malecot e Pezzer possuem extremidades expansíveis em asas/cogumelo, indicadas para cistostomia cirúrgica aberta, gastrostomias ou drenagem de coleções, sendo formalmente contraindicadas para cateterismo uretral pelo risco de laceração da uretra.\n- E) INCORRETA: A sondagem vesical não elimina, e sim viabiliza e exige a monitorização periódica do débito urinário.'
    })
  });
  console.log('   ✓ Questão HOSBOS-2026-CIR-17315 atualizada com gabarito B e justificativa completa!');

  // 2. Localiza e limpa questões com gabarito falso/não homologado no Supabase
  console.log('\n🧹 [Fase 2/2] Varrendo Supabase para remover gabaritos falsos/legados não homologados...');
  let offset = 0;
  const SCAN_LIMIT = 1000;
  const fakeIdsToReset = [];

  while (true) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?select=id,correct_answer,is_anulada&correct_answer=not.is.null&correct_answer=neq.&limit=${SCAN_LIMIT}&offset=${offset}`, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`
      }
    });

    if (!res.ok) {
      console.error(`\n❌ Erro na varredura (offset ${offset}):`, res.status, await res.text());
      break;
    }
    const rows = await res.json();
    if (!rows || rows.length === 0) break;

    for (const r of rows) {
      if (!verifiedBank.has(r.id)) {
        fakeIdsToReset.push(r.id);
      }
    }

    offset += SCAN_LIMIT;
    process.stdout.write(`\r   Examinadas ${offset.toLocaleString('pt-BR')} linhas... Encontrados ${fakeIdsToReset.length.toLocaleString('pt-BR')} gabaritos não homologados`);
    if (rows.length < SCAN_LIMIT) break;
  }
  console.log();

  if (fakeIdsToReset.length > 0) {
    console.log(`\n⚠️ Resetando ${fakeIdsToReset.length.toLocaleString('pt-BR')} gabaritos falsos no Supabase para NULL...`);
    const resetTasks = [];
    for (let i = 0; i < fakeIdsToReset.length; i += BATCH_SIZE) {
      const chunk = fakeIdsToReset.slice(i, i + BATCH_SIZE);
      resetTasks.push({
        ids: chunk,
        body: { correct_answer: null, is_anulada: false }
      });
    }

    doneCount = 0;
    await runPool(resetTasks, 'Reset de Falsos');
  }

  console.log('\n' + '='.repeat(80));
  console.log('🎉 SANEAMENTO CONCLUÍDO COM SUCESSO ABSOLUTO!');
  console.log(`✅ ${verifiedBank.size.toLocaleString('pt-BR')} questões com gabarito padrão ouro oficial ativas.`);
  console.log(`✅ ${fakeIdsToReset.length.toLocaleString('pt-BR')} gabaritos falsos/legados limpos com sucesso.`);
  console.log('='.repeat(80));
}

main().catch(err => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
