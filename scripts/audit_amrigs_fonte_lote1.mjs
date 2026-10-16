import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const headers = { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` };

async function cnt(filter) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?${filter}&select=id&limit=1`, {
    headers: { ...headers, 'Prefer': 'count=planned', 'Range': '0-0' }
  });
  return parseInt(res.headers.get('content-range')?.split('/')[1] ?? '0') || 0;
}

async function sample(filter, limit = 6) {
  const url = `${SUPABASE_URL}/rest/v1/questions?${filter}&select=id,correct_answer,commentary&limit=${limit}`;
  const res = await fetch(url, { headers });
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function main() {
  // =============================================
  // AMRIGS — FONTES
  // =============================================
  console.log('\n====================================================');
  console.log('  AMRIGS — FONTES DOS GABARITOS (ao vivo)');
  console.log('====================================================');

  const homologadas = await cnt('institution=ilike.*AMRIGS*&commentary=ilike.*Gabarito+Oficial+Homologado*');
  const comIA       = await cnt('institution=ilike.*AMRIGS*&commentary=ilike.*IA*');
  const comFundatec = await cnt('institution=ilike.*AMRIGS*&commentary=ilike.*Fundatec*');
  const semComment  = await cnt('institution=ilike.*AMRIGS*&correct_answer=not.is.null&commentary=is.null');
  const totalCG     = await cnt('institution=ilike.*AMRIGS*&correct_answer=not.is.null');

  const restante = totalCG - homologadas - comIA;

  console.log(`Total com gabarito (any)                          : ${totalCG}`);
  console.log(`├─ Homologadas oficiais (carimbo Fundatec)        : ${homologadas}`);
  console.log(`├─ Fonte IA no commentary                         : ${comIA}`);
  console.log(`├─ Com menção "Fundatec" no commentary            : ${comFundatec}`);
  console.log(`├─ Sem commentary (origem a verificar)            : ${semComment}`);
  console.log(`└─ Demais (outras fontes/plataforma original)     : ${restante}`);

  // Amostras de commentary
  console.log('\n--- Amostras de commentary (tipos de fonte) ---');
  const amostras = await sample('institution=ilike.*AMRIGS*&correct_answer=not.is.null', 8);
  for (const q of amostras) {
    const c = (q.commentary || '(sem commentary)').substring(0, 110);
    console.log(`  [${q.id}] resp=${q.correct_answer} | ${c}`);
  }

  // =============================================
  // LOTE 1 — STATUS
  // =============================================
  const lote1 = [
    { sigla: 'ENARE/ENAMED',  pattern: 'ENARE' },
    { sigla: 'SUS-SP',        pattern: 'SUS-SP' },
    { sigla: 'SES-PE',        pattern: 'SES-PE' },
    { sigla: 'USP/HCFMUSP',   pattern: 'HCFMUSP' },
    { sigla: 'IAMSPE/HSPE',   pattern: 'IAMSPE' },
    { sigla: 'UNESP/HCFMB',   pattern: 'UNESP' },
    { sigla: 'FMABC',         pattern: 'FMABC' },
    { sigla: 'UNIFESP/EPM',   pattern: 'UNIFESP' },
    { sigla: 'Santa Casa SP', pattern: 'Santa+Casa+de+S%C3%A3o+Paulo' },
    { sigla: 'USP/HCRP (RP)', pattern: 'Ribeir%C3%A3o+Preto' },
  ];

  console.log('\n====================================================');
  console.log('  LOTE 1 — STATUS POR BANCA (ao vivo)');
  console.log('  Bancas: ENARE, SUS-SP, SES-PE, USP, IAMSPE,');
  console.log('          UNESP, FMABC, UNIFESP, Santa Casa SP, HCRP');
  console.log('====================================================');

  let totalComGab = 0, totalGeral = 0;
  for (const inst of lote1) {
    const total  = await cnt(`institution=ilike.*${inst.pattern}*`);
    const comGab = await cnt(`institution=ilike.*${inst.pattern}*&correct_answer=not.is.null`);
    totalComGab += comGab;
    totalGeral  += total;
    const pct = total > 0 ? ((comGab / total) * 100).toFixed(0) : '0';
    const icon = parseInt(pct) >= 90 ? '✅' : parseInt(pct) >= 60 ? '⚠️' : '❌';
    console.log(`${icon} ${inst.sigla.padEnd(18)}: ${String(comGab).padStart(5)} / ${String(total).padStart(5)}  (${pct}%)`);
  }
  console.log('----------------------------------------------------');
  const pctTotal = totalGeral > 0 ? ((totalComGab / totalGeral) * 100).toFixed(1) : '?';
  console.log(`   TOTAL LOTE 1     : ${totalComGab} / ${totalGeral} com gabarito (${pctTotal}%)`);
  console.log('====================================================\n');
}

main().catch(console.error);
