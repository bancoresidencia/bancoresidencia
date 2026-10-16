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

async function sample(filter, limit = 12) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?${filter}&select=correct_answer&limit=${limit}`, { headers });
  return await res.json();
}

async function main() {
  console.log('\n================================================================');
  console.log('  GABARITO MARCÁVEL — VISÃO REAL DO CAMPO correct_answer');
  console.log('================================================================');

  const total   = await cnt('');
  const comGab  = await cnt('correct_answer=not.is.null');
  const semGab  = await cnt('correct_answer=is.null');

  // Alternativas clássicas
  const altA = await cnt('correct_answer=eq.A');
  const altB = await cnt('correct_answer=eq.B');
  const altC = await cnt('correct_answer=eq.C');
  const altD = await cnt('correct_answer=eq.D');
  const altE = await cnt('correct_answer=eq.E');
  const anulada = await cnt('correct_answer=eq.ANULADA');

  const validas = altA + altB + altC + altD + altE;
  const outros  = comGab - validas - anulada;

  console.log(`Total no banco                : ${total.toLocaleString('pt-BR')}`);
  console.log(`Com correct_answer preenchido : ${comGab.toLocaleString('pt-BR')}  (${((comGab/total)*100).toFixed(1)}%)`);
  console.log(`Sem gabarito (null)           : ${semGab.toLocaleString('pt-BR')}  (${((semGab/total)*100).toFixed(1)}%)`);
  console.log('\n--- Alternativas clássicas marcáveis (A/B/C/D/E) ---');
  console.log(`  A : ${altA.toLocaleString('pt-BR')}`);
  console.log(`  B : ${altB.toLocaleString('pt-BR')}`);
  console.log(`  C : ${altC.toLocaleString('pt-BR')}`);
  console.log(`  D : ${altD.toLocaleString('pt-BR')}`);
  console.log(`  E : ${altE.toLocaleString('pt-BR')}`);
  console.log(`  TOTAL A-E marcáveis : ${validas.toLocaleString('pt-BR')}  (${((validas/total)*100).toFixed(1)}% do banco)`);
  console.log(`  ANULADA             : ${anulada.toLocaleString('pt-BR')}`);
  console.log(`  Outros valores      : ${outros.toLocaleString('pt-BR')}`);

  // Amostras dos "outros" — usar not.in sem regex
  console.log('\n--- Amostra dos "outros valores" (não A/B/C/D/E/ANULADA) ---');
  const amostras = await sample('correct_answer=not.in.(A,B,C,D,E,ANULADA)&correct_answer=not.is.null', 15);
  if (Array.isArray(amostras)) {
    // Agrupa por valor
    const freq = {};
    for (const q of amostras) {
      const v = String(q.correct_answer).substring(0, 80);
      freq[v] = (freq[v] || 0) + 1;
    }
    for (const [v, n] of Object.entries(freq)) {
      console.log(`  (${n}x) "${v}"`);
    }
  }

  console.log('================================================================\n');
}

main().catch(console.error);
