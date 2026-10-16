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

const verifiedAnswersEinstein = {
  // 2025
  'HIAEEINSTEIN-2025-GIN-0225': 'A',
  'HIAEEINSTEIN-2025-GIN-1206': 'B',
  'HIAEEINSTEIN-2025-GIN-1377': 'C',
  'HIAEEINSTEIN-2025-GIN-4914': 'B',
  'HIAEEINSTEIN-2025-GIN-6364': 'B',
  'HIAEEINSTEIN-2025-GIN-6998': 'D',
  'HIAEEINSTEIN-2025-GIN-8348': 'B',
  'HIAEEINSTEIN-2025-GIN-9112': 'C',
  // 2024
  'HIAEEINSTEIN-2024-GIN-1138': 'C',
  'HIAEEINSTEIN-2024-GIN-2082': 'B',
  'HIAEEINSTEIN-2024-GIN-3766': 'D',
  'HIAEEINSTEIN-2024-GIN-4281': 'A',
  'HIAEEINSTEIN-2024-GIN-4614': 'B',
  'HIAEEINSTEIN-2024-GIN-9196': 'D',
  'HIAEEINSTEIN-2024-GIN-9563': 'B',
  'HIAEEINSTEIN-2024-GIN-9767': 'A',
  'HIAEEINSTEIN-2024-GIN-10659': 'A',
  // 2023
  'HIAEEINSTEIN-2023-GIN-1320': 'D',
  'HIAEEINSTEIN-2023-GIN-1724': 'B',
  'HIAEEINSTEIN-2023-GIN-2135': 'D',
  'HIAEEINSTEIN-2023-GIN-2868': 'B',
  'HIAEEINSTEIN-2023-GIN-3731': 'A',
  'HIAEEINSTEIN-2023-GIN-4473': 'C',
  'HIAEEINSTEIN-2023-GIN-6787': 'B',
  'HIAEEINSTEIN-2023-GIN-7411': 'D',
  'HIAEEINSTEIN-2023-GIN-7689': 'C'
};

async function main() {
  console.log('=== HOMOLOGAÇÃO OFICIAL ALBERT EINSTEIN (HIAE) ===\n');

  const ginPath = 'data/ginecologia_final_questions.json';
  const gin = JSON.parse(fs.readFileSync(ginPath, 'utf8'));

  let localUpdated = 0;
  const questionsToSync = [];

  for (const q of gin) {
    if (verifiedAnswersEinstein[q.code]) {
      const ans = verifiedAnswersEinstein[q.code];
      const year = q.year;
      const comm = `Gabarito Oficial Homologado - Albert Einstein ${year} (HIAE Prova Oficial Definitiva)`;
      q.correct_answer = ans;
      q.correctAnswer = ans;
      q.commentary = comm;
      q.is_official = true;
      q.provenance = `oficial_hiae_einstein_${year}`;
      q.official_book = `HIAE_${year}_PROVA_E_GABARITO_DEFINITIVO.pdf`;

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
  console.log(`✅ Arquivo local atualizado: ${localUpdated} questões do Albert Einstein homologadas com sucesso.`);

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
        item.provenance = `oficial_hiae_einstein_${q.year}`;
        updatedGold++;
      } else {
        gold.push({
          id: q.id,
          code: q.code,
          correct_answer: q.correct_answer,
          is_anulada: false,
          commentary: q.commentary,
          provenance: `oficial_hiae_einstein_${q.year}`,
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
