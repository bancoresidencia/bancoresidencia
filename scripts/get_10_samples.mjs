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

async function main() {
  const url = `${SUPABASE_URL}/rest/v1/questions?select=id,statement,institution,year,correct_answer,commentary,options&especialidade=ilike.*Cirurgia*&commentary=ilike.*Principal%20Motivo*&limit=10`;
  const res = await fetch(url, {
    headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` }
  });
  const data = await res.json();
  fs.writeFileSync('scripts/sample_10_resolved.json', JSON.stringify(data, null, 2), 'utf8');
  console.log(`Sucesso: ${data.length} questões recuperadas.`);
}

main().catch(console.error);
