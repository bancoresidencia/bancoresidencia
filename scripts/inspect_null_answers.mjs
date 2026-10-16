import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

async function checkNulls() {
  console.log("=== AMOSTRA DAS QUESTÕES COM GABARITO NULO (correct_answer == null) ===");

  const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?correct_answer=is.null&select=id,institution,year,especialidade,statement&limit=250`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`
    }
  });

  const sample = await res.json();
  if (Array.isArray(sample)) {
    console.log(`Carregadas ${sample.length} questões com gabarito nulo.`);
    const instCounts = {};
    const yearCounts = {};
    const specCounts = {};
    sample.forEach(q => {
      instCounts[q.institution || 'Desconhecida'] = (instCounts[q.institution || 'Desconhecida'] || 0) + 1;
      yearCounts[q.year || 'Sem ano'] = (yearCounts[q.year || 'Sem ano'] || 0) + 1;
      specCounts[q.especialidade || 'Outros'] = (specCounts[q.especialidade || 'Outros'] || 0) + 1;
    });

    console.log('\nTop Instituições na amostra com gabarito nulo:');
    for (const [k, v] of Object.entries(instCounts).sort((a,b) => b[1] - a[1]).slice(0, 15)) {
      console.log(`  ${k}: ${v}`);
    }

    console.log('\nDistribuição por Ano na amostra:');
    console.log(yearCounts);

    console.log('\nDistribuição por Especialidade na amostra:');
    console.log(specCounts);
  }
}

checkNulls().catch(console.error);
