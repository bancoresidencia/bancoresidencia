import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

async function cnt(pattern) {
  const filter = `commentary=ilike.*${encodeURIComponent(pattern)}*`;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?${filter}&select=id&limit=1`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Prefer': 'count=planned',
      'Range': '0-0'
    }
  });
  const range = res.headers.get('content-range');
  return parseInt(range?.split('/')[1] ?? '0') || 0;
}

const institucoes = [
  { sigla: 'AMRIGS',       pattern: 'AMRIGS' },
  { sigla: 'AMP/PR',       pattern: 'AMP' },
  { sigla: 'PSU-MG',       pattern: 'PSU-MG' },
  { sigla: 'Einstein',     pattern: 'Einstein' },
  { sigla: 'UERJ',         pattern: 'UERJ' },
  { sigla: 'SES-RJ',       pattern: 'SES-RJ' },
  { sigla: 'UEL',          pattern: 'UEL' },
  { sigla: 'SCBH',         pattern: 'Belo Horizonte' },
  { sigla: 'FMJ/Jundiaí',  pattern: 'Jundiaí' },
  { sigla: 'SES-DF',       pattern: 'SES-DF' },
  { sigla: 'CERMAM',       pattern: 'CERMAM' },
  { sigla: 'Sírio-Libanês',pattern: 'Sírio' },
  { sigla: 'UNAERP',       pattern: 'UNAERP' },
  { sigla: 'UEPA',         pattern: 'UEPA' },
  { sigla: 'PUCPR',        pattern: 'PUCPR' },
  { sigla: 'SES-GO',       pattern: 'SES-GO' },
  { sigla: 'UFCSPA',       pattern: 'UFCSPA' },
  { sigla: 'INTO',         pattern: 'INTO' },
  { sigla: 'UFPR/HC',      pattern: 'UFPR' },
  { sigla: 'UESPI',        pattern: 'UESPI' },
  { sigla: 'HAC',          pattern: 'HAC' },
  { sigla: 'PUC-SP',       pattern: 'PUC-SP' },
  { sigla: 'PSU-GO',       pattern: 'PSU-GO' },
  { sigla: 'FAMEMA',       pattern: 'FAMEMA' },
  { sigla: 'CMC',          pattern: 'CMC' },
  { sigla: 'UFG/HC',       pattern: 'UFG' },
  { sigla: 'UNITAU',       pattern: 'UNITAU' },
  { sigla: 'HPP Peq.Príncipe', pattern: 'Pequeno' },
  { sigla: 'UERN',         pattern: 'UERN' },
  { sigla: 'IPSEMG',       pattern: 'IPSEMG' },
  { sigla: 'FCMMG',        pattern: 'FCMMG' },
  { sigla: 'HSL PUCRS',    pattern: 'PUCRS' },
  { sigla: 'Mário Gatti',  pattern: 'Gatti' },
  { sigla: 'UFMA',         pattern: 'UFMA' },
  { sigla: 'UFF',          pattern: 'UFF' },
  { sigla: 'SES-MA',       pattern: 'SES-MA' },
  { sigla: 'UFS',          pattern: 'UFS' },
  { sigla: 'UFMT',         pattern: 'UFMT' },
  { sigla: 'SURCE',        pattern: 'SURCE' },
  { sigla: 'UFPI',         pattern: 'UFPI' },
  { sigla: 'UFT',          pattern: 'UFT' },
  { sigla: 'UNICAMP',      pattern: 'UNICAMP' },
  { sigla: 'UFRJ',         pattern: 'UFRJ' },
  { sigla: 'UFRGS/HCPA',   pattern: 'FAURGS' },
];

async function main() {
  console.log('\n============================================================');
  console.log('  LOTE 2 — STATUS POR INSTITUIÇÃO (ao vivo Supabase)');
  console.log('============================================================');

  let grandTotal = 0;
  const results = [];

  for (const inst of institucoes) {
    const n = await cnt(inst.pattern);
    grandTotal += n;
    results.push({ sigla: inst.sigla, n });
    const bar = '█'.repeat(Math.min(Math.round(n / 15), 30));
    console.log(`${inst.sigla.padEnd(18)}: ${String(n).padStart(5)}  ${bar}`);
  }

  console.log('------------------------------------------------------------');
  console.log(`TOTAL HOMOLOGADO  : ${grandTotal.toLocaleString('pt-BR')} questões`);
  console.log('============================================================\n');
}

main().catch(console.error);
