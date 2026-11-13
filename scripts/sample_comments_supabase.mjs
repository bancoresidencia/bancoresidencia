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

async function checkSampleComments() {
  console.log('--- Sample Comments with Take-Home ---');
  const res1 = await fetch(`${url}/rest/v1/questions_direto?select=id,commentary&commentary=like.*Take-Home*&limit=2`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  const data1 = await res1.json();
  for (const q of data1) {
    console.log(`ID: ${q.id} (len: ${q.commentary?.length})`);
    console.log(q.commentary.slice(0, 300));
    console.log('...\n');
  }

  console.log('--- Sample Comments WITHOUT Take-Home ---');
  const res2 = await fetch(`${url}/rest/v1/questions_direto?select=id,commentary&commentary=not.like.*Take-Home*&commentary=not.is.null&commentary=neq.&limit=2`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  const data2 = await res2.json();
  for (const q of data2) {
    console.log(`ID: ${q.id} (len: ${q.commentary?.length})`);
    console.log(q.commentary.slice(0, 300));
    console.log('...\n');
  }
}

checkSampleComments().catch(console.error);

