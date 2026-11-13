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
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const adminKey = env.SUPABASE_SERVICE_ROLE_KEY;

const views = [
  'view_questions_acesso_direto',
  'view_questions_revalida',
  'view_questions_rplus',
  'view_questions_titulo'
];

async function checkView(v) {
  const t0 = Date.now();
  const res = await fetch(`${url}/rest/v1/${v}?limit=1`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Prefer': 'count=exact' }
  });
  const elapsed = Date.now() - t0;
  const range = res.headers.get('content-range');
  const count = range ? range.split('/')[1] : 'unknown';
  const data = await res.json();
  console.log(`✅ ${v.padEnd(30)} -> ${count} registros (${elapsed}ms) - Exemplo ID: ${data[0]?.id}`);
}

async function run() {
  console.log('='.repeat(75));
  console.log('🔍 VERIFICAÇÃO DAS VIEWS E ÍNDICES NO SUPABASE VIA ANON KEY');
  console.log('='.repeat(75));
  for (const v of views) {
    await checkView(v);
  }
  console.log('='.repeat(75));
}

run().catch(console.error);
