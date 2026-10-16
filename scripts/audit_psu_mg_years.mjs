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

async function checkPSUYeaers() {
  const headers = { 'apikey': SERVICE_KEY, 'Authorization': 'Bearer ' + SERVICE_KEY };
  
  // Search for PSU-MG questions
  const res1 = await fetch(SUPABASE_URL + '/rest/v1/questions?banca=eq.PSU-MG&select=year,correct_answer&limit=1000&offset=0', { headers });
  const rows1 = await res1.json();
  const res2 = await fetch(SUPABASE_URL + '/rest/v1/questions?banca=eq.PSU-MG&select=year,correct_answer&limit=1000&offset=1000', { headers });
  const rows2 = await res2.json();
  const all = [...(Array.isArray(rows1) ? rows1 : []), ...(Array.isArray(rows2) ? rows2 : [])];

  console.log('Total PSU-MG baixadas com banca=eq.PSU-MG:', all.length);

  const byYear = {};
  for (const r of all) {
    const y = r.year || 'Sem ano';
    byYear[y] = byYear[y] || { total: 0, homologadas: 0, vazias: 0 };
    byYear[y].total++;
    if (r.correct_answer && r.correct_answer.trim().length > 0) {
      byYear[y].homologadas++;
    } else {
      byYear[y].vazias++;
    }
  }
  console.log(JSON.stringify(byYear, null, 2));
}
checkPSUYeaers();
