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

// Check first 3 rows with commentary
const res = await fetch(`${url}/rest/v1/questions_direto?select=id,commentary&commentary=not.is.null&limit=3`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` }
});
const data = await res.json();
console.log('Sample rows with commentary:');
for (const d of data) {
  console.log(`ID: ${d.id}`);
  console.log(`Len: ${d.commentary?.length}`);
  console.log(`Snippet: ${d.commentary?.slice(0, 200)}\n`);
}

// Check with ilike *take*
const res2 = await fetch(`${url}/rest/v1/questions_direto?select=id&commentary=ilike.*take*&limit=5`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` }
});
const data2 = await res2.json();
console.log('Found with ilike *take*:', data2.length);

// Check with ilike *motivo*
const res3 = await fetch(`${url}/rest/v1/questions_direto?select=id&commentary=ilike.*motivo*&limit=5`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` }
});
const data3 = await res3.json();
console.log('Found with ilike *motivo*:', data3.length);

