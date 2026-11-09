import fs from 'fs';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

async function fetchDistinctModalidades() {
  // Let's query using Postgres RPC or direct select with aggregation if possible,
  // or fetch sample/distinct values. Supabase REST doesn't do "select distinct modalidade" directly unless via RPC,
  // but we can query by known terms or fetch pages, or check if an RPC exists.
  
  // Let's check what RPCs exist or test querying by modalidade.
  console.log('Testing modalidade values in questions table...');
  
  const testValues = [
    'R+ Especialidades',
    'R+ Clínica Médica',
    'R+ Cirurgia',
    'R+ Pediatria',
    'R+ Ginecologia e Obstetrícia',
    'R+ Neuropediatria',
    'R+',
    'R3',
    'Residência Médica',
    'Revalida'
  ];

  for (const val of testValues) {
    const url = `${SUPABASE_URL}/rest/v1/questions?modalidade=eq.${encodeURIComponent(val)}&select=id`;
    const res = await fetch(url, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Range': '0-0',
        'Prefer': 'count=exact'
      }
    });
    const cr = res.headers.get('content-range');
    console.log(`modalidade = "${val}": count = ${cr}`);
  }

  // Let's also check ilike '%R+%'
  const urlRPlus = `${SUPABASE_URL}/rest/v1/questions?modalidade=ilike.*R%2B*&select=id`;
  const resRPlus = await fetch(urlRPlus, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Range': '0-0',
      'Prefer': 'count=exact'
    }
  });
  console.log(`modalidade ilike '%R+%' count = ${resRPlus.headers.get('content-range')}`);

  // Let's check modalidade is null
  const urlNull = `${SUPABASE_URL}/rest/v1/questions?modalidade=is.null&select=id`;
  const resNull = await fetch(urlNull, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Range': '0-0',
      'Prefer': 'count=exact'
    }
  });
  console.log(`modalidade is null count = ${resNull.headers.get('content-range')}`);

  // Let's check modalidade not in ('Residência Médica', 'Revalida')
  const urlOther = `${SUPABASE_URL}/rest/v1/questions?modalidade=not.in.(Residência Médica,Revalida)&select=modalidade&limit=20`;
  const resOther = await fetch(urlOther, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`
    }
  });
  const dataOther = await resOther.json();
  console.log('Sample rows not in Residência Médica/Revalida:', dataOther);
}

fetchDistinctModalidades().catch(console.error);

