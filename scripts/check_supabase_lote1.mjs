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

async function checkLote1InSupabase() {
  const lote1Keywords = ['SES-PE', 'UNIFESP', 'SUS-SP', 'FMABC', 'USP', 'AMRIGS', 'Santa Casa', 'IAMSPE', 'UNESP'];
  console.log("=== VERIFICANDO STATUS DO LOTE 1 DIRETAMENTE NO SUPABASE ===");

  for (const kw of lote1Keywords) {
    // Total
    const resTotal = await fetch(`${SUPABASE_URL}/rest/v1/questions?institution=ilike.*${encodeURIComponent(kw)}*&select=id`, {
      method: 'HEAD',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'count=exact'
      }
    });
    const total = resTotal.headers.get('content-range')?.split('/')[1] || 0;

    // Com gabarito
    const resCom = await fetch(`${SUPABASE_URL}/rest/v1/questions?institution=ilike.*${encodeURIComponent(kw)}*&correct_answer=neq.&correct_answer=not.is.null&select=id`, {
      method: 'HEAD',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'count=exact'
      }
    });
    const com = resCom.headers.get('content-range')?.split('/')[1] || 0;

    console.log(`• [${kw.padEnd(12)}]: Total = ${String(total).padStart(5)} | Com Gabarito = ${String(com).padStart(5)} (${total > 0 ? ((com/total)*100).toFixed(1) : 0}%)`);
  }
}

checkLote1InSupabase();
