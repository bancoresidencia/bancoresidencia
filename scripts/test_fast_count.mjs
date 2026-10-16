import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

async function testFastCount() {
  const sample = [
    'UERJ/HUPE - Hospital Universitário Pedro Ernesto (RJ)',
    'SES-GO - Secretaria de Estado de Saúde de Goiás',
    'AMRIGS - Associação Médica do Rio Grande do Sul',
    'AMP - Associação Médica do Paraná',
    'PSU-MG - Processo Seletivo Unificado de Minas Gerais'
  ];

  for (const inst of sample) {
    const t0 = Date.now();
    const urlTotal = `${SUPABASE_URL}/rest/v1/questions?institution=eq.${encodeURIComponent(inst)}&select=id`;
    const resTotal = await fetch(urlTotal, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Range': '0-0',
        'Prefer': 'count=exact'
      }
    });
    const cr = resTotal.headers.get('content-range');
    const total = cr ? parseInt(cr.split('/')[1], 10) : 0;

    const urlHomolog = `${SUPABASE_URL}/rest/v1/questions?institution=eq.${encodeURIComponent(inst)}&commentary=ilike.*Gabarito%20Oficial%20Homologado*&select=id`;
    const resHomolog = await fetch(urlHomolog, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Range': '0-0',
        'Prefer': 'count=exact'
      }
    });
    const crHomolog = resHomolog.headers.get('content-range');
    const homologadas = crHomolog ? parseInt(crHomolog.split('/')[1], 10) : 0;

    console.log(`${inst} -> Total: ${total} | Homologadas: ${homologadas} (${Date.now() - t0}ms)`);
  }
}

testFastCount().catch(console.error);
