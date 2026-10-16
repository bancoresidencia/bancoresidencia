import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const sample = [
  'AMRIGS - Associação Médica do Rio Grande do Sul',
  'AMP - Associação Médica do Paraná',
  'PSU-MG - Processo Seletivo Unificado de Minas Gerais',
  'HIAE/Einstein - Hospital Israelita Albert Einstein (SP)',
  'UERJ/HUPE - Hospital Universitário Pedro Ernesto (RJ)',
  'SES-GO - Secretaria de Estado de Saúde de Goiás',
  'SURCE - Seleção Unificada para Residência Médica no Estado do Ceará',
  'SES-DF - Secretaria de Estado de Saúde do Distrito Federal',
  'UEL - Hospital Universitário de Londrina (PR)'
];

async function main() {
  for (const inst of sample) {
    const t0 = Date.now();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?institution=eq.${encodeURIComponent(inst)}&select=id`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Range': '0-0',
        'Prefer': 'count=planned'
      }
    });
    const cr = res.headers.get('content-range');
    const total = cr ? parseInt(cr.split('/')[1], 10) : 'N/A';
    console.log(`${inst.padEnd(65)} -> Total 130k DB: ${total.toString().padStart(5)} (${Date.now() - t0}ms)`);
  }
}

main().catch(console.error);
