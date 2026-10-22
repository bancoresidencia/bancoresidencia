import fs from 'fs';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

async function checkAnuladasInSupabase() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?is_anulada=eq.true&select=id,correct_answer,is_anulada&limit=5`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`
    }
  });
  const data = await res.json();
  console.log('Sample Anuladas in Supabase:', data);
}

checkAnuladasInSupabase().catch(console.error);
