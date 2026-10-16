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

async function check2026() {
  const headers = { 'apikey': SERVICE_KEY, 'Authorization': 'Bearer ' + SERVICE_KEY };
  const res = await fetch(SUPABASE_URL + '/rest/v1/questions?institution=ilike.*UNICAMP*&year=eq.2026&select=*&limit=1', { headers });
  const rows = await res.json();
  if (rows.length) {
    console.log(JSON.stringify(rows[0], null, 2));
  } else {
    console.log('Nenhuma encontrada');
  }
}
check2026();
