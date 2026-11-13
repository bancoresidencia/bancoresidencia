import fs from 'node:fs';

const env = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
  const t = line.trim();
  if (t && !t.startsWith('#')) {
    const idx = t.indexOf('=');
    if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  }
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

// Check first 5 rows
const res = await fetch(`${url}/rest/v1/questions_direto?select=id,institution,modalidade&limit=5`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` }
});
console.log('Status:', res.status);
const data = await res.json();
console.log('Sample rows:', data);

