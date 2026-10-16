import fs from 'fs';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const verifiedAnswers = {
  // 2024
  'PSUMG-2024-GIN-0331': 'D',
  'PSUMG-2024-GIN-2004': 'D',
  'PSUMG-2024-GIN-2117': 'B',
  'PSUMG-2024-GIN-2184': 'A',
  'PSUMG-2024-GIN-3137': 'C',
  'PSUMG-2024-GIN-4649': 'B',
  'PSUMG-2024-GIN-8414': 'B',
  'PSUMG-2024-GIN-9200': 'A',
  // 2023
  'PSUMG-2023-GIN-3621': 'C',
  'PSUMG-2023-GIN-6391': 'D',
  'PSUMG-2023-GIN-6575': 'C',
  'PSUMG-2023-GIN-9167': 'B',
  'PSUMG-2023-GIN-9723': 'B',
  'PSUMG-2023-GIN-10389': 'B',
  'PSUMG-2023-GIN-10619': 'D',
  'PSUMG-2023-GIN-11094': 'C',
  'PSUMG-2023-GIN-11443': 'D'
};

async function main() {
  console.log('=== HOMOLOGAÇÃO OFICIAL PSU-MG 2024 & 2023 (AREMG) ===\n');

  const ginPath = 'data/ginecologia_final_questions.json';
  const gin = JSON.parse(fs.readFileSync(ginPath, 'utf8'));

  let localUpdated = 0;
  const questionsToSync = [];

  for (const q of gin) {
    if (verifiedAnswers[q.code]) {
      const ans = verifiedAnswers[q.code];
      const year = q.year;
      const comm = `Gabarito Oficial Homologado - PSU-MG ${year} (AREMG Prova Oficial Definitiva)`;
      q.correct_answer = ans;
      q.correctAnswer = ans;
      q.commentary = comm;
      q.is_official = true;
      q.provenance = `oficial_aremg_psu_${year}`;
      q.official_book = `PSU_MG_${year}_GABARITO_DEFINITIVO.pdf`;

      questionsToSync.push({
        id: q.id,
        code: q.code,
        year: year,
        correct_answer: ans,
        commentary: comm
      });
      localUpdated++;
    }
  }

  fs.writeFileSync(ginPath, JSON.stringify(gin, null, 2), 'utf8');
  console.log(`✅ Arquivo local atualizado: ${localUpdated} questões homologadas com sucesso.`);

  // Sync to Supabase
  let supaSuccess = 0;
  let supaErrors = 0;
  for (const q of questionsToSync) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?id=eq.${q.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          correct_answer: q.correct_answer,
          commentary: q.commentary
        })
      });
      if (res.ok) supaSuccess++;
      else supaErrors++;
    } catch (e) {
      supaErrors++;
    }
  }
  console.log(`✅ Supabase atualizado: ${supaSuccess} com sucesso, ${supaErrors} erros.`);

  // Update gold manifest
  const goldPath = 'data/all_homologated_questions_gold.json';
  if (fs.existsSync(goldPath)) {
    const gold = JSON.parse(fs.readFileSync(goldPath, 'utf8'));
    const goldMap = new Map();
    gold.forEach(x => goldMap.set(x.id, x));

    let addedGold = 0;
    let updatedGold = 0;

    for (const q of questionsToSync) {
      if (goldMap.has(q.id)) {
        const item = goldMap.get(q.id);
        item.correct_answer = q.correct_answer;
        item.commentary = q.commentary;
        item.is_official = true;
        item.provenance = `oficial_aremg_psu_${q.year}`;
        updatedGold++;
      } else {
        gold.push({
          id: q.id,
          code: q.code,
          correct_answer: q.correct_answer,
          is_anulada: false,
          commentary: q.commentary,
          provenance: `oficial_aremg_psu_${q.year}`,
          is_official: true
        });
        goldMap.set(q.id, true);
        addedGold++;
      }
    }

    fs.writeFileSync(goldPath, JSON.stringify(gold, null, 2), 'utf8');
    console.log(`✨ Manifesto de Ouro atualizado: ${updatedGold} atualizadas, ${addedGold} adicionadas. Total: ${gold.length}`);
  }
}

main().catch(console.error);
