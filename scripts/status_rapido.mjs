import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

async function countWithHeader(filter) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?${filter}&select=id&limit=1`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Prefer': 'count=planned',
      'Range': '0-0'
    }
  });
  const range = res.headers.get('content-range');
  return range ? range.split('/')[1] : '?';
}

async function main() {
  console.log('\n======================================');
  console.log('  STATUS AO VIVO — SUPABASE');
  console.log('======================================');

  const total = await countWithHeader('');
  const comGabarito = await countWithHeader('correct_answer=not.is.null');
  const homologadas = await countWithHeader('commentary=ilike.*Gabarito+Oficial+Homologado*');
  const semGabarito = await countWithHeader('correct_answer=is.null');

  console.log(`Total de questões no banco      : ${total}`);
  console.log(`Com gabarito (any)              : ${comGabarito}`);
  console.log(`Sem gabarito (null)             : ${semGabarito}`);
  console.log(`Homologadas Lote 2 (oficiais)   : ${homologadas}`);
  
  const totalNum = parseInt(total) || 0;
  const homNum = parseInt(homologadas) || 0;
  const cobertura = totalNum > 0 ? ((homNum / totalNum) * 100).toFixed(1) : '?';
  console.log(`Cobertura Lote 2 / Total        : ${cobertura}%`);
  console.log('======================================\n');
}

main().catch(console.error);
