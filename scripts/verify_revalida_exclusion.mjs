import fs from 'node:fs';
import path from 'node:path';

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

async function checkExclusion(param) {
  const res = await fetch(`${url}/rest/v1/questions_direto?${param}&limit=1`, {
    method: 'HEAD',
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Prefer': 'count=exact' }
  });
  const range = res.headers.get('content-range');
  return range ? parseInt(range.split('/')[1], 10) : 0;
}

async function run() {
  console.log('='.repeat(75));
  console.log('🛡️ QUALITY GATE: AUDITORIA DE EXPURGO DO REVALIDA EM questions_direto');
  console.log('='.repeat(75));

  const cModalidade = await checkExclusion('modalidade=ilike.*revalida*');
  console.log(`  🔎 modalidade ILIKE '%revalida%': ${cModalidade} questões`);

  const cBanca = await checkExclusion('banca=ilike.*revalida*');
  console.log(`  🔎 banca ILIKE '%revalida%':      ${cBanca} questões`);

  const cInst = await checkExclusion('institution=ilike.*revalida*');
  console.log(`  🔎 institution ILIKE '%revalida%': ${cInst} questões`);

  console.log('='.repeat(75));
  if (cModalidade === 0 && cBanca === 0 && cInst === 0) {
    console.log('✅ QUALITY GATE 100% APROVADO: NENHUMA CONTAMINAÇÃO DO REVALIDA EM ACESSO DIRETO!');
  } else {
    console.log('⚠️ Alerta: foram encontrados registros suspeitos remanescentes.');
  }
  console.log('='.repeat(75));
}

run().catch(console.error);
