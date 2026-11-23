import fs from 'fs';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
}

const url = env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/questions?select=id&limit=1';

async function testKey(name, key) {
  if (!key) {
    console.log(`Key ${name}: NÃO DEFINIDA`);
    return;
  }
  console.log(`Testando ${name} (len=${key.length}, prefix=${key.slice(0, 15)}...):`);
  try {
    const r = await fetch(url, {
      headers: {
        'apikey': key,
        'Authorization': 'Bearer ' + key
      }
    });
    console.log(`-> Status: ${r.status} ${r.statusText}`);
    const text = await r.text();
    console.log(`-> Body: ${text.slice(0, 150)}`);
  } catch (e) {
    console.log(`-> Erro: ${e.message}`);
  }
}

async function run() {
  await testKey('SUPABASE_SECRET_KEY', env.SUPABASE_SECRET_KEY);
  await testKey('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  await testKey('SUPABASE_SERVICE_ROLE_KEY', env.SUPABASE_SERVICE_ROLE_KEY);
}

run();
