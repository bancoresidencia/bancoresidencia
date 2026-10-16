import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

async function cnt(filter) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?${filter}&select=id&limit=1`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Prefer': 'count=planned',
      'Range': '0-0'
    }
  });
  return parseInt(res.headers.get('content-range')?.split('/')[1] ?? '0') || 0;
}

async function main() {
  const total        = await cnt('institution=ilike.*AMRIGS*');
  const comGabarito  = await cnt('institution=ilike.*AMRIGS*&correct_answer=not.is.null');
  const semGabarito  = await cnt('institution=ilike.*AMRIGS*&correct_answer=is.null');
  const anuladas     = await cnt('institution=ilike.*AMRIGS*&correct_answer=eq.ANULADA');

  console.log('\n=== AMRIGS — Totais no Supabase ===');
  console.log(`Total de questões       : ${total}`);
  console.log(`Com gabarito            : ${comGabarito}`);
  console.log(`Sem gabarito (null)     : ${semGabarito}`);
  console.log(`Anuladas oficialmente   : ${anuladas}`);
  console.log(`Cobertura              : ${((comGabarito/total)*100).toFixed(1)}%`);
  console.log('===================================\n');
}

main().catch(console.error);
