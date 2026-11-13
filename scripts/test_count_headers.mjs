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

for (const pref of ['count=exact', 'count=planned', 'count=estimated']) {
  const t0 = Date.now();
  const res = await fetch(`${url}/rest/v1/questions_direto?limit=1`, {
    method: 'HEAD',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: pref
    }
  });
  console.log(`${pref.padEnd(20)} -> Status: ${res.status}, Range: ${res.headers.get('content-range')} (${Date.now() - t0}ms)`);
}

