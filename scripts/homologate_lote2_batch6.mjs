import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const targetInstitutions = [
  { name: 'Faculdade de Medicina de Marília', banca: 'FAMEMA Prova Oficial Definitiva' },
  { name: 'CMC - Fundação Centro Médico de Campinas (SP)', banca: 'CMC Prova Oficial Definitiva' },
  { name: 'Universidade de Taubaté - UNITAU', banca: 'UNITAU Prova Oficial Definitiva' },
  { name: 'HSL PUCRS - Hospital São Lucas da PUCRS (RS)', banca: 'PUCRS Prova Oficial Definitiva' },
  { name: 'HMG - Hospital Municipal Dr. Mário Gatti - Campinas (SP)', banca: 'Mário Gatti Prova Oficial Definitiva' }
];

async function main() {
  console.log("================================================================================");
  console.log("HOMOLOGAÇÃO OFICIAL LOTE 2 — BLOCO 6 (TODAS AS ESPECIALIDADES)");
  console.log("================================================================================");

  const gold = JSON.parse(fs.readFileSync('data/all_homologated_questions_gold.json', 'utf8'));

  let grandTotal = 0;

  for (const item of targetInstitutions) {
    const list = gold.filter(q => q.institution === item.name);
    console.log(`\nIniciando ${item.name} (${list.length} questões)...`);

    const bySpec = {};
    list.forEach(q => bySpec[q.specialty || 'outros'] = (bySpec[q.specialty || 'outros'] || 0) + 1);
    console.log('  Especialidades:', bySpec);

    let updated = 0;
    let errors = 0;
    const batchSize = 15;

    for (let i = 0; i < list.length; i += batchSize) {
      const chunk = list.slice(i, i + batchSize);
      await Promise.all(chunk.map(async (q) => {
        const isAnulada = q.correct_answer === 'ANULADA' || q.correct_answer === 'X' || q.correct_answer === 'NULA';
        const ans = isAnulada ? 'ANULADA' : q.correct_answer;
        const shortName = item.name.split(' - ')[0];
        const commentary = `Gabarito Oficial Homologado - ${shortName} ${q.year} (${item.banca})`;

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
            console.error(`Erro questão ${q.id}:`, res.status, errText);
            errors++;
          }
        } catch (err) {
          console.error(`Falha questão ${q.id}:`, err.message);
          errors++;
        }
      }));

      if ((i + batchSize) % 60 === 0 || i + batchSize >= list.length) {
        console.log(`  Progresso: ${Math.min(i + batchSize, list.length)}/${list.length}...`);
      }
    }

    grandTotal += updated;
    console.log(`✅ ${item.name}: ${updated} homologadas com sucesso | ${errors} erros`);
  }

  console.log("\n================================================================================");
  console.log(`TOTAL BLOCO 6 HOMOLOGADO NESTA ETAPA: ${grandTotal} questões!`);
  console.log("================================================================================");
}

main().catch(console.error);
