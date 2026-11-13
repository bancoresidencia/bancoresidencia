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

const res = await fetch(`${url}/rest/v1/questions_direto?commentary=ilike.*take-home*&limit=1`, {
  method: 'HEAD',
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Prefer: 'count=exact'
  }
});

console.log('Range with ilike *take-home*:', res.headers.get('content-range'));

const resMotivo = await fetch(`${url}/rest/v1/questions_direto?commentary=ilike.*motivo*&limit=1`, {
  method: 'HEAD',
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Prefer: 'count=exact'
  }
});

console.log('Range with ilike *motivo*:', resMotivo.headers.get('content-range'));

