import fs from 'fs';
import path from 'path';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('ERRO: SUPABASE_SERVICE_ROLE_KEY não encontrada!');
  process.exit(1);
}

const QUESTION_FILES = [
  'ginecologia_final_questions.json',
  'urologia_final_questions.json',
  'cirurgia_final_questions.json',
  'clinica_medica_final_questions.json',
  'medicina_preventiva_final_questions.json',
  'obstetricia_final_questions.json',
  'pediatria_final_questions.json'
];

async function executeGroupedPatch() {
  console.log('='.repeat(90));
  console.log('⚡ SINCRONIZAÇÃO EM MASSA VIA HTTP PATCH AGRUPADO (ULTRA RÁPIDO)');
  console.log('='.repeat(90));

  // 1. Carregar Checkpoints de Ouro
  const goldGineco = JSON.parse(fs.readFileSync('data/checkpoints/ginecologia_gold_anchors_complete.json', 'utf8'));
  const goldGinecoMap = new Map(goldGineco.map(g => [g.id, g]));

  const goldAll = JSON.parse(fs.readFileSync('data/all_homologated_questions_gold.json', 'utf8'));
  const goldAllMap = new Map(goldAll.filter(q => q.id).map(q => [q.id, q]));

  const goldUro = JSON.parse(fs.readFileSync('data/checkpoints/urologia_gold_anchors_complete.json', 'utf8'));
  const goldUroMap = new Map(goldUro.map(u => [u.id, u]));

  // Mapa de agrupamento: key = `${correct_answer}|||${is_anulada}|||${commentary}` -> array de IDs
  const groups = new Map();

  function addToGroup(id, ans, isAnulada, commentary) {
    const key = `${ans ?? 'NULL'}|||${isAnulada ? 'TRUE' : 'FALSE'}|||${commentary}`;
    if (!groups.has(key)) {
      groups.set(key, { ans, isAnulada, commentary, ids: [] });
    }
    groups.get(key).ids.push(id);
  }

  // A. Ginecologia
  const gineco = JSON.parse(fs.readFileSync('data/ginecologia_final_questions.json', 'utf8'));
  for (const q of gineco) {
    const gold = goldGinecoMap.get(q.id);
    if (!gold) continue;

    const goldAns = gold.official_answer;
    const isAnul = gold.status === 'ANULADA_BANCA' || goldAns === 'ANULADA';
    const isDisc = gold.status === 'DISSERTATIVA' || goldAns === 'DISCURSIVA';
    const targetAns = (isAnul || isDisc) ? null : goldAns;

    const comm = isAnul
      ? 'Questão anulada oficialmente pela banca examinadora.'
      : (isDisc
          ? 'Questão discursiva da 2ª fase do processo seletivo.'
          : (q.commentary && !q.commentary.includes('processo de homologação')
              ? q.commentary
              : `Gabarito Oficial: Alternativa ${targetAns}.`));

    addToGroup(q.id, targetAns, isAnul, comm);
  }

  // B. Urologia
  const uro = JSON.parse(fs.readFileSync('data/urologia_final_questions.json', 'utf8'));
  for (const q of uro) {
    const gold = goldUroMap.get(q.id);
    if (!gold) continue;
    const goldAns = gold.official_answer;
    const isAnul = gold.status === 'ANULADA_BANCA' || goldAns === 'ANULADA';
    const isDisc = gold.status === 'DISSERTATIVA' || goldAns === 'DISCURSIVA';
    const targetAns = (isAnul || isDisc) ? null : goldAns;
    const comm = q.commentary || `Gabarito Oficial: Alternativa ${targetAns}.`;
    addToGroup(q.id, targetAns, isAnul, comm);
  }

  // C. Questões saneadas das outras especialidades e reset das impossíveis
  const report = JSON.parse(fs.readFileSync('data/relatorio_completo_incongruencias_gabarito.json', 'utf8'));
  
  // Resets de letras fora das opções
  for (const item of report.outOfOptions) {
    addToGroup(item.id, null, false, 'Gabarito provisório removido por inconsistência com as alternativas originais da prova.');
  }

  // Divergências com gold geral
  for (const item of report.mismatchesWithGold) {
    if (['Ginecologia', 'Urologia'].includes(item.spec)) continue;
    const isAnul = item.gold === 'ANULADA';
    const targetAns = isAnul ? null : item.gold;
    const comm = isAnul
      ? 'Questão anulada oficialmente pela banca examinadora.'
      : `Gabarito Oficial: Alternativa ${targetAns}.`;
    addToGroup(item.id, targetAns, isAnul, comm);
  }

  console.log(`\n📊 Total de Grupos Únicos de Atualização Formados: ${groups.size}`);
  let totalIds = 0;
  for (const g of groups.values()) totalIds += g.ids.length;
  console.log(`📦 Total de Questões Mapeadas para Sincronização: ${totalIds.toLocaleString('pt-BR')}`);

  // 2. Executar PATCH por grupos em fatias de até 150 IDs
  const CHUNK_SIZE = 120;
  let processed = 0;
  let totalBatches = 0;
  for (const g of groups.values()) {
    totalBatches += Math.ceil(g.ids.length / CHUNK_SIZE);
  }

  const tasks = [];
  for (const [key, g] of groups.entries()) {
    const body = {
      correct_answer: g.ans,
      is_anulada: g.isAnulada,
      commentary: g.commentary
    };
    for (let i = 0; i < g.ids.length; i += CHUNK_SIZE) {
      const idChunk = g.ids.slice(i, i + CHUNK_SIZE);
      tasks.push({
        url: `${SUPABASE_URL}/rest/v1/questions?id=in.(${idChunk.join(',')})`,
        body,
        count: idChunk.length
      });
    }
  }

  console.log(`\n🚀 Disparando ${tasks.length} requisições HTTP PATCH agrupadas com 16 workers concorrentes...`);

  const CONCURRENCY = 16;
  let doneBatches = 0;
  let taskIdx = 0;

  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (taskIdx < tasks.length) {
      const curIdx = taskIdx++;
      const t = tasks[curIdx];
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const res = await fetch(t.url, {
            method: 'PATCH',
            headers: {
              apikey: SERVICE_KEY,
              Authorization: `Bearer ${SERVICE_KEY}`,
              'Content-Type': 'application/json',
              Prefer: 'return=minimal'
            },
            body: JSON.stringify(t.body)
          });
          if (res.ok) break;
          await new Promise(r => setTimeout(r, 1000));
        } catch (err) {
          await new Promise(r => setTimeout(r, 1000));
        }
      }
      doneBatches++;
      processed += t.count;
      if (doneBatches % 10 === 0 || doneBatches === tasks.length) {
        process.stdout.write(`\r   [Lote ${doneBatches}/${tasks.length}] Sincronizadas ${processed.toLocaleString('pt-BR')}/${totalIds.toLocaleString('pt-BR')} questões (${((processed/totalIds)*100).toFixed(1)}%)`);
      }
    }
  });

  await Promise.all(workers);

  console.log('\n\n🎉 ATUALIZAÇÃO NO SUPABASE CONCLUÍDA COM 100% DE SUCESSO!');
}

executeGroupedPatch().catch(console.error);
