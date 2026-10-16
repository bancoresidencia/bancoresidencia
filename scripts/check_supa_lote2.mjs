import fs from 'fs';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

async function getCount(filter = '') {
  const url = `${SUPABASE_URL}/rest/v1/questions?select=id${filter ? '&' + filter : ''}`;
  const res = await fetch(url, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Range': '0-0',
      'Prefer': 'count=exact'
    }
  });
  const cr = res.headers.get('content-range');
  if (cr && cr.includes('/')) return parseInt(cr.split('/')[1], 10);
  return 0;
}

async function main() {
  const insts = [
    { label: 'UERJ / HUPE', code: '*HUPE*' },
    { label: 'SES-GO', code: '*SES-GO*' },
    { label: 'PSU-MG', code: '*PSU*' },
    { label: 'AMP (PR)', code: '*AMP*' },
    { label: 'AMRIGS', code: '*AMRIGS*' },
    { label: 'HCPA / UFRGS', code: '*HCPA*' },
    { label: 'Albert Einstein', code: '*Einstein*' },
    { label: 'SES-DF', code: '*SES-DF*' }
  ];

  console.log('=== AUDITORIA SUPABASE LOTE 2 (METADADOS OFICIAIS) ===\n');
  for (const item of insts) {
    const total = await getCount(`institution=ilike.${item.code}`);
    const official = await getCount(`institution=ilike.${item.code}&commentary=ilike.*Gabarito%20Oficial%20Homologado*`);
    console.log(`${item.label.padEnd(16)} | Total Supabase: ${String(total).padStart(5)} | Homologados 100% Oficial: ${String(official).padStart(4)}`);
  }
}

main().catch(console.error);
