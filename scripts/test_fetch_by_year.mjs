import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

async function checkYears() {
  const inst = 'PSU-MG - Processo Seletivo Unificado de Minas Gerais';
  const years = [2025, 2024, 2023, 2022, 2021, 2020];
  
  for (const y of years) {
    const t0 = Date.now();
    const url = `${SUPABASE_URL}/rest/v1/questions?institution=eq.${encodeURIComponent(inst)}&year=eq.${y}&select=id,year,especialidade,correct_answer,commentary&limit=150`;
    const res = await fetch(url, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });
    const data = await res.json();
    console.log(`Year ${y}: count=${Array.isArray(data) ? data.length : 'ERR'}, time=${Date.now() - t0}ms`);
    if (Array.isArray(data) && data.length > 0) {
      const specs = {};
      data.forEach(q => specs[q.especialidade || 'Outros'] = (specs[q.especialidade || 'Outros'] || 0) + 1);
      console.log(`  Especialidades:`, specs);
    }
  }
}

checkYears().catch(console.error);
