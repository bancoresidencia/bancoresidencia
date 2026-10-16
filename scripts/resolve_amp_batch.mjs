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

const verifiedAnswersAMP = {
  // 2025
  'AMP-2025-GIN-0837': 'A',
  'AMP-2025-GIN-4057': 'D',
  'AMP-2025-GIN-5466': 'D',
  'AMP-2025-GIN-7257': 'A',
  'AMP-2025-GIN-8313': 'E',
  'AMP-2025-GIN-9125': 'B',
  'AMP-2025-GIN-11122': 'E',
  // 2024
  'AMP-2024-GIN-4351': 'E',
  'AMP-2024-GIN-7978': 'A',
  'AMP-2024-GIN-8678': 'D',
  'AMP-2024-GIN-8939': 'B',
  'AMP-2024-GIN-9791': 'D',
  'AMP-2024-GIN-12201': 'A',
  // 2023
  'AMP-2023-GIN-12795': 'A',
  'AMP-2023-GIN-12796': 'C',
  'AMP-2023-GIN-12797': 'C',
  'AMP-2023-GIN-12798': 'D',
  'AMP-2023-GIN-12799': 'D',
  'AMP-2023-GIN-12800': 'B',
  'AMP-2023-GIN-12801': 'B',
  'AMP-2023-GIN-12802': 'C',
  'AMP-2023-GIN-12803': 'D',
  'AMP-2023-GIN-12804': 'B',
  'AMP-2023-GIN-12805': 'B',
  'AMP-2023-GIN-12806': 'B',
  'AMP-2023-GIN-12807': 'A',
  'AMP-2023-GIN-12808': 'C',
  'AMP-2023-GIN-12809': 'D'
};

async function main() {
  console.log('=== HOMOLOGAÇÃO OFICIAL AMP (PARANÁ / UCAMP) ===\n');

  const ginPath = 'data/ginecologia_final_questions.json';
  const gin = JSON.parse(fs.readFileSync(ginPath, 'utf8'));

  let localUpdated = 0;
  const questionsToSync = [];

  for (const q of gin) {
    if (verifiedAnswersAMP[q.code]) {
      const ans = verifiedAnswersAMP[q.code];
      const year = q.year;
      const comm = `Gabarito Oficial Homologado - AMP Paraná ${year} (UCAMP Prova Oficial Definitiva)`;
      q.correct_answer = ans;
      q.correctAnswer = ans;
      q.commentary = comm;
      q.is_official = true;
      q.provenance = `oficial_amp_ucamp_${year}`;
      q.official_book = `AMP_${year}_PROVA_E_GABARITO_DEFINITIVO.pdf`;

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
  console.log(`✅ Arquivo local atualizado: ${localUpdated} questões de AMP homologadas com sucesso.`);

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
        item.provenance = `oficial_amp_ucamp_${q.year}`;
        updatedGold++;
      } else {
        gold.push({
          id: q.id,
          code: q.code,
          correct_answer: q.correct_answer,
          is_anulada: false,
          commentary: q.commentary,
          provenance: `oficial_amp_ucamp_${q.year}`,
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
