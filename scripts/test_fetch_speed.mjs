import fs from 'node:fs';
import path from 'node:path';

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

const t0 = Date.now();
const res = await fetch(`${url}/rest/v1/questions_direto?select=id,modalidade,type&limit=10000`, {
  headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
});
const data = await res.json();
console.log(`Fetched ${data.length} rows in ${Date.now() - t0}ms`);

