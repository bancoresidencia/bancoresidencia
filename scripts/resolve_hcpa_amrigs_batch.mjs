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

const verifiedAnswersHCPA = {
  // 2025
  'UFRGSHCPA-2025-GIN-0342': 'C',
  'UFRGSHCPA-2025-GIN-3238': 'B',
  'UFRGSHCPA-2025-GIN-4837': 'A',
  'UFRGSHCPA-2025-GIN-5347': 'B',
  'UFRGSHCPA-2025-GIN-6408': 'D',
  'UFRGSHCPA-2025-GIN-6925': 'D',
  'UFRGSHCPA-2025-GIN-7663': 'A',
  'UFRGSHCPA-2025-GIN-7705': 'D',
  'UFRGSHCPA-2025-GIN-9488': 'A',
  // 2024
  'UFRGSHCPA-2024-GIN-4646': 'A',
  'UFRGSHCPA-2024-GIN-4947': 'B',
  'UFRGSHCPA-2024-GIN-5904': 'A',
  'UFRGSHCPA-2024-GIN-6046': 'B',
  'UFRGSHCPA-2024-GIN-6255': 'D',
  'UFRGSHCPA-2024-GIN-6429': 'D',
  'UFRGSHCPA-2024-GIN-6558': 'C',
  'UFRGSHCPA-2024-GIN-9466': 'A',
  // 2023
  'UFRGSHCPA-2023-GIN-1621': 'A',
  'UFRGSHCPA-2023-GIN-2476': 'C',
  'UFRGSHCPA-2023-GIN-2719': 'C',
  'UFRGSHCPA-2023-GIN-3581': 'D',
  'UFRGSHCPA-2023-GIN-3774': 'A',
  'UFRGSHCPA-2023-GIN-5746': 'D',
  'UFRGSHCPA-2023-GIN-8481': 'B',
  'UFRGSHCPA-2023-GIN-11219': 'B',
  'UFRGSHCPA-2023-GIN-11867': 'A'
};

const verifiedAnswersAMRIGS = {
  // 2025
  'AMRIGS-2025-GIN-2217': 'C',
  'AMRIGS-2025-GIN-2574': 'B',
  'AMRIGS-2025-GIN-6737': 'B',
  'AMRIGS-2025-GIN-8409': 'C',
  'AMRIGS-2025-GIN-8774': 'B',
  'AMRIGS-2025-GIN-8965': 'A',
  'AMRIGS-2025-GIN-10116': 'C',
  'AMRIGS-2025-GIN-10502': 'C',
  'AMRIGS-2025-GIN-10696': 'C',
  // 2024
  'AMRIGS-2024-GIN-1032': 'A',
  'AMRIGS-2024-GIN-4367': 'C',
  'AMRIGS-2024-GIN-8986': 'D',
  'AMRIGS-2024-GIN-9585': 'A',
  'AMRIGS-2024-GIN-10685': 'D',
  'AMRIGS-2024-GIN-10962': 'D',
  'AMRIGS-2024-GIN-11765': 'B',
  // 2023
  'AMRIGS-2023-GIN-0970': 'C',
  'AMRIGS-2023-GIN-4528': 'C',
  'AMRIGS-2023-GIN-4882': 'B',
  'AMRIGS-2023-GIN-5484': 'B',
  'AMRIGS-2023-GIN-6006': 'C',
  'AMRIGS-2023-GIN-7285': 'D',
  'AMRIGS-2023-GIN-7544': 'C',
  'AMRIGS-2023-GIN-8482': 'C',
  'AMRIGS-2023-GIN-11341': 'C',
  'AMRIGS-2023-GIN-12317': 'A'
};

async function main() {
  console.log('=== HOMOLOGAÇÃO OFICIAL HCPA / UFRGS E AMRIGS ===\n');

  const ginPath = 'data/ginecologia_final_questions.json';
  const gin = JSON.parse(fs.readFileSync(ginPath, 'utf8'));

  let localUpdatedHCPA = 0;
  let localUpdatedAMRIGS = 0;
  const questionsToSync = [];

  for (const q of gin) {
    if (verifiedAnswersHCPA[q.code]) {
      const ans = verifiedAnswersHCPA[q.code];
      const comm = `Gabarito Oficial Homologado - UFRGS/HCPA ${q.year} (FAURGS Prova Oficial Definitiva)`;
      q.correct_answer = ans;
      q.correctAnswer = ans;
      q.commentary = comm;
      q.is_official = true;
      q.provenance = `oficial_hcpa_faurgs_${q.year}`;
      q.official_book = `HCPA_${q.year}_PROVA_E_GABARITO_DEFINITIVO.pdf`;

      questionsToSync.push({
        id: q.id,
        code: q.code,
        year: q.year,
        banca: 'UFRGS/HCPA',
        correct_answer: ans,
        commentary: comm
      });
      localUpdatedHCPA++;
    } else if (verifiedAnswersAMRIGS[q.code]) {
      const ans = verifiedAnswersAMRIGS[q.code];
      const comm = `Gabarito Oficial Homologado - AMRIGS ${q.year} (Fundatec Prova Oficial Definitiva)`;
      q.correct_answer = ans;
      q.correctAnswer = ans;
      q.commentary = comm;
      q.is_official = true;
      q.provenance = `oficial_amrigs_fundatec_${q.year}`;
      q.official_book = `AMRIGS_${q.year}_PROVA_E_GABARITO_DEFINITIVO.pdf`;

      questionsToSync.push({
        id: q.id,
        code: q.code,
        year: q.year,
        banca: 'AMRIGS',
        correct_answer: ans,
        commentary: comm
      });
      localUpdatedAMRIGS++;
    }
  }

  fs.writeFileSync(ginPath, JSON.stringify(gin, null, 2), 'utf8');
  console.log(`✅ Arquivo local atualizado: ${localUpdatedHCPA} de HCPA e ${localUpdatedAMRIGS} de AMRIGS.`);

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
        item.provenance = `oficial_${q.banca.toLowerCase()}_${q.year}`;
        updatedGold++;
      } else {
        gold.push({
          id: q.id,
          code: q.code,
          correct_answer: q.correct_answer,
          is_anulada: false,
          commentary: q.commentary,
          provenance: `oficial_${q.banca.toLowerCase()}_${q.year}`,
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
