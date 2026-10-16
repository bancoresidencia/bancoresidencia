import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

async function check() {
  const inst = 'PSU-MG - Processo Seletivo Unificado de Minas Gerais';
  let lastId = '00000000-0000-0000-0000-000000000000';
  let all = [];
  const start = Date.now();
  console.log(`Buscando todas as questões de ${inst}...`);

  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/questions?institution=eq.${encodeURIComponent(inst)}&id=gt.${lastId}&order=id.asc&select=id,year,especialidade,correct_answer,commentary&limit=250`;
    const res = await fetch(url, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    all.push(...batch);
    lastId = batch[batch.length - 1].id;
    console.log(`Fetched chunk: ${batch.length}, total: ${all.length}`);
    if (batch.length < 250) break;
  }

  console.log(`Done in ${Date.now() - start}ms. Total: ${all.length}`);
  const byYear = {};
  const bySpec = {};
  let homologadas = 0;
  for (const q of all) {
    byYear[q.year] = (byYear[q.year] || 0) + 1;
    bySpec[q.especialidade || 'Outros'] = (bySpec[q.especialidade || 'Outros'] || 0) + 1;
    if (q.commentary && q.commentary.includes('Gabarito Oficial Homologado')) homologadas++;
  }
  console.log('By Year:', byYear);
  console.log('By Especialidade:', bySpec);
  console.log('Currently Homologadas:', homologadas);
}

check().catch(console.error);
