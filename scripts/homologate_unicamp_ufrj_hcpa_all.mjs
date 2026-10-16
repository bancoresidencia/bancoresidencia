import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const institutions = [
  { name: 'UNICAMP/HC - Hospital de Clínicas da Unicamp - Campinas (SP)', banca: 'FCM Unicamp Prova Oficial Definitiva' },
  { name: 'UFRJ/HUCFF - Hospital Universitário Clementino Fraga Filho (RJ)', banca: 'UFRJ Prova Oficial Definitiva' },
  { name: 'UFRGS/HCPA - Hospital de Clínicas de Porto Alegre (RS)', banca: 'FAURGS Prova Oficial Definitiva' }
];

async function main() {
  console.log("================================================================================");
  console.log("HOMOLOGAÇÃO INTEGRAL LOTE 2 — UNICAMP, UFRJ & UFRGS/HCPA (TODAS AS ÁREAS)");
  console.log("================================================================================");

  const gold = JSON.parse(fs.readFileSync('data/all_homologated_questions_gold.json', 'utf8'));

  for (const inst of institutions) {
    const list = gold.filter(q => q.institution === inst.name);
    console.log(`\nSincronizando ${inst.name}: ${list.length} questões...`);

    let updated = 0;
    let errors = 0;
    const batchSize = 15;

    for (let i = 0; i < list.length; i += batchSize) {
      const chunk = list.slice(i, i + batchSize);
      await Promise.all(chunk.map(async (q) => {
        const isAnulada = q.correct_answer === 'ANULADA' || q.correct_answer === 'X' || q.correct_answer === 'NULA';
        const ans = isAnulada ? 'ANULADA' : q.correct_answer;
        const commentary = `Gabarito Oficial Homologado - ${q.institution.split(' - ')[0]} ${q.year} (${inst.banca})`;

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
    }

    console.log(`✅ ${inst.name}: ${updated} homologadas | ${errors} erros`);
  }

  console.log("\n================================================================================");
  console.log("LOTE 2 EXPANSÃO COMPLETA!");
  console.log("================================================================================");
}

main().catch(console.error);
