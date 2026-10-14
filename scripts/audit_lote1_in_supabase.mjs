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

const lote1 = [
  { name: 'SES-PE', term: 'Pernambuco' },
  { name: 'SUS-SP', term: 'SUS-SP' },
  { name: 'Santa Casa SP', term: 'Santa*Casa*Paulo' },
  { name: 'IAMSPE', term: 'IAMSPE' },
  { name: 'USP / HCFMUSP', term: 'HCFMUSP' },
  { name: 'USP / HCRP', term: 'HCRP' },
  { name: 'UNIFESP', term: 'UNIFESP' },
  { name: 'FMABC', term: 'FMABC' },
  { name: 'UNESP Botucatu', term: 'UNESP' },
  { name: 'AMRIGS', term: 'AMRIGS' }
];

async function main() {
  console.log("================================================================================");
  console.log("📊 STATUS REAL DOS GABARITOS DO LOTE 1 NA PLATAFORMA (SUPABASE AO VIVO)");
  console.log("================================================================================");
  let grandTotal = 0;
  let grandAns = 0;

  for (const inst of lote1) {
    const url = `${SUPABASE_URL}/rest/v1/questions?institution=ilike.*${inst.term}*&select=id,correct_answer&limit=5000`;
    const res = await fetch(url, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });
    const rows = await res.json();
    const count = Array.isArray(rows) ? rows.length : 0;
    const answered = Array.isArray(rows) ? rows.filter(r => r.correct_answer && r.correct_answer.trim() !== '').length : 0;
    const pct = count > 0 ? ((answered / count) * 100).toFixed(1) : '0.0';

    grandTotal += count;
    grandAns += answered;

    let badge = '🟡';
    if (parseFloat(pct) >= 80) badge = '🟢';
    else if (parseFloat(pct) < 40) badge = '🟠';

    console.log(`${badge} ${inst.name.padEnd(20)}: ${String(answered).padStart(4)}/${String(count).padStart(4)} questões com Gabarito Oficial na Plataforma (${pct}%)`);
  }

  const grandPct = grandTotal > 0 ? ((grandAns / grandTotal) * 100).toFixed(1) : '0.0';
  console.log("--------------------------------------------------------------------------------");
  console.log(`🏆 TOTAL GERAL LOTE 1 NA PLATAFORMA: ${grandAns.toLocaleString('pt-BR')} / ${grandTotal.toLocaleString('pt-BR')} questões com gabarito (${grandPct}%)`);
  console.log("================================================================================\n");
}

main().catch(console.error);
