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

async function getCount(endpoint) {
  const res = await fetch(`${url}/rest/v1/${endpoint}`, {
    method: 'HEAD',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Prefer': 'count=exact'
    }
  });
  const range = res.headers.get('content-range');
  return range ? parseInt(range.split('/')[1], 10) : 0;
}

async function run() {
  console.log('Detailed commentary inspection in questions_direto:');
  const total = await getCount('questions_direto?limit=1');
  const withAny = await getCount('questions_direto?limit=1&commentary=not.is.null&commentary=neq.');
  const withPlaceholder = await getCount('questions_direto?limit=1&commentary=like.*Gabarito Oficial Homologado*');
  const withTakeHome = await getCount('questions_direto?limit=1&commentary=like.*Take-Home*');
  const withMotivo = await getCount('questions_direto?limit=1&commentary=like.*Motivo*');
  const withPerola = await getCount('questions_direto?limit=1&commentary=like.*Pérola*');
  const withSintese = await getCount('questions_direto?limit=1&commentary=like.*Síntese*');

  console.log(`Total: ${total}`);
  console.log(`With any commentary: ${withAny}`);
  console.log(`With placeholder 'Gabarito Oficial Homologado': ${withPlaceholder}`);
  console.log(`With 'Take-Home': ${withTakeHome}`);
  console.log(`With 'Motivo': ${withMotivo}`);
  console.log(`With 'Pérola': ${withPerola}`);
  console.log(`With 'Síntese': ${withSintese}`);
}

run().catch(console.error);

