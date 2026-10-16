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

const verifiedAnswers2025 = {
  'PSUMG-2025-GIN-1401': 'B',
  'PSUMG-2025-GIN-1820': 'A',
  'PSUMG-2025-GIN-7649': 'A',
  'PSUMG-2025-GIN-7964': 'B',
  'PSUMG-2025-GIN-10302': 'C',
  'PSUMG-2025-GIN-11920': 'C',
  'PSUMG-2025-GIN-12194': 'B',
  'PSUMG-2025-GIN-12195': 'A',
  'PSUMG-2025-GIN-12196': 'D',
  'PSUMG-2025-GIN-12197': 'C',
  'PSUMG-2025-GIN-12198': 'B',
  'PSUMG-2025-GIN-12199': 'D',
  'PSUMG-2025-GIN-12200': 'D',
  'PSUMG-2025-GIN-12202': 'B'
};

async function main() {
  console.log('=== HOMOLOGAÇÃO OFICIAL PSU-MG 2025 (AREMG) ===\n');

  const ginPath = 'data/ginecologia_final_questions.json';
  const gin = JSON.parse(fs.readFileSync(ginPath, 'utf8'));

  let localUpdated = 0;
  const questionsToSync = [];

  for (const q of gin) {
    if (verifiedAnswers2025[q.code]) {
      const ans = verifiedAnswers2025[q.code];
      const comm = 'Gabarito Oficial Homologado - PSU-MG 2025 (AREMG Prova Oficial Definitiva)';
      q.correct_answer = ans;
      q.correctAnswer = ans;
      q.commentary = comm;
      q.is_official = true;
      q.provenance = 'oficial_aremg_psu_2025';
      q.official_book = 'PSU_MG_2025_GABARITO_DEFINITIVO.pdf';

      questionsToSync.push({
        id: q.id,
        code: q.code,
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
        item.provenance = 'oficial_aremg_psu_2025';
        updatedGold++;
      } else {
        gold.push({
          id: q.id,
          code: q.code,
          correct_answer: q.correct_answer,
          is_anulada: false,
          commentary: q.commentary,
          provenance: 'oficial_aremg_psu_2025',
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
