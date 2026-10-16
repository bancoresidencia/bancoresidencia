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

const verifiedAnswersSESDF = {
  // 2025
  'SESDF-2025-GIN-2420': 'A',
  'SESDF-2025-GIN-2673': 'A',
  'SESDF-2025-GIN-2848': 'D',
  'SESDF-2025-GIN-2917': 'D',
  'SESDF-2025-GIN-3195': 'D',
  'SESDF-2025-GIN-3465': 'B',
  'SESDF-2025-GIN-5727': 'D',
  'SESDF-2025-GIN-6564': 'B',
  // 2024
  'SESDF-2024-GIN-0536': 'B',
  'SESDF-2024-GIN-0849': 'D',
  'SESDF-2024-GIN-0880': 'A',
  'SESDF-2024-GIN-3627': 'A',
  'SESDF-2024-GIN-3768': 'A',
  'SESDF-2024-GIN-5001': 'B',
  'SESDF-2024-GIN-6581': 'D',
  'SESDF-2024-GIN-6600': 'C',
  'SESDF-2024-GIN-11713': 'C',
  'SESDF-2024-GIN-11921': 'B',
  // 2023
  'SESDF-2023-GIN-2098': 'B',
  'SESDF-2023-GIN-4489': 'A',
  'SESDF-2023-GIN-4536': 'A',
  'SESDF-2023-GIN-5431': 'B',
  'SESDF-2023-GIN-5460': 'B',
  'SESDF-2023-GIN-6178': 'B',
  'SESDF-2023-GIN-6339': 'B',
  'SESDF-2023-GIN-7219': 'A',
  'SESDF-2023-GIN-10694': 'B',
  'SESDF-2023-GIN-10872': 'A'
};

async function main() {
  console.log('=== HOMOLOGAÇÃO OFICIAL SES-DF (DISTRITO FEDERAL) ===\n');

  const ginPath = 'data/ginecologia_final_questions.json';
  const gin = JSON.parse(fs.readFileSync(ginPath, 'utf8'));

  let localUpdated = 0;
  const questionsToSync = [];

  for (const q of gin) {
    if (verifiedAnswersSESDF[q.code]) {
      const ans = verifiedAnswersSESDF[q.code];
      const year = q.year;
      const comm = `Gabarito Oficial Homologado - SES-DF ${year} (Banca Oficial Definitiva)`;
      q.correct_answer = ans;
      q.correctAnswer = ans;
      q.commentary = comm;
      q.is_official = true;
      q.provenance = `oficial_sesdf_${year}`;
      q.official_book = `SESDF_${year}_PROVA_E_GABARITO_DEFINITIVO.pdf`;

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
  console.log(`✅ Arquivo local atualizado: ${localUpdated} questões de SES-DF homologadas com sucesso.`);

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
        item.provenance = `oficial_sesdf_${q.year}`;
        updatedGold++;
      } else {
        gold.push({
          id: q.id,
          code: q.code,
          correct_answer: q.correct_answer,
          is_anulada: false,
          commentary: q.commentary,
          provenance: `oficial_sesdf_${q.year}`,
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
