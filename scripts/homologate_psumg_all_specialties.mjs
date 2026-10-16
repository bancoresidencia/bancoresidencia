import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const instName = 'PSU-MG - Processo Seletivo Unificado de Minas Gerais';

async function main() {
  console.log("================================================================================");
  console.log("HOMOLOGAÇÃO INTEGRAL LOTE 2 — PSU-MG (AREMG - TODAS AS ÁREAS)");
  console.log("================================================================================");

  const gold = JSON.parse(fs.readFileSync('data/all_homologated_questions_gold.json', 'utf8'));
  const psuQuestions = gold.filter(q => q.institution === instName);
  console.log(`Total de questões PSU-MG no Gold Manifest: ${psuQuestions.length}`);

  const bySpec = {};
  const byYear = {};
  psuQuestions.forEach(q => {
    bySpec[q.specialty || 'outros'] = (bySpec[q.specialty || 'outros'] || 0) + 1;
    byYear[q.year] = (byYear[q.year] || 0) + 1;
  });
  console.log("Especialidades:", bySpec);
  console.log("Anos:", byYear);

  // Sync to Supabase in batches of 15
  let updated = 0;
  let errors = 0;
  const batchSize = 15;

  for (let i = 0; i < psuQuestions.length; i += batchSize) {
    const chunk = psuQuestions.slice(i, i + batchSize);
    await Promise.all(chunk.map(async (q) => {
      const isAnulada = q.correct_answer === 'ANULADA' || q.correct_answer === 'X' || q.correct_answer === 'NULA';
      const ans = isAnulada ? 'ANULADA' : q.correct_answer;
      const commentary = `Gabarito Oficial Homologado - PSU-MG ${q.year} (AREMG Prova Oficial Definitiva)`;

      const payload = {
        correct_answer: ans,
        commentary: commentary,
        is_anulada: isAnulada
      };

      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?id=eq.${q.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          updated++;
        } else {
          const errText = await res.text();
          console.error(`Erro ao atualizar questão ${q.id}:`, res.status, errText);
          errors++;
        }
      } catch (err) {
        console.error(`Falha de rede questão ${q.id}:`, err.message);
        errors++;
      }
    }));

    if ((i + batchSize) % 60 === 0 || i + batchSize >= psuQuestions.length) {
      console.log(`Progresso: ${Math.min(i + batchSize, psuQuestions.length)}/${psuQuestions.length} questões sincronizadas...`);
    }
  }

  console.log("\n================================================================================");
  console.log(`✅ RESULTADO PSU-MG: ${updated} questões homologadas com sucesso | ${errors} erros`);
  console.log("================================================================================");
}

main().catch(console.error);
