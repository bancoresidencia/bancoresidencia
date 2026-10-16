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

async function main() {
  const total   = await cnt('');
  const nulls   = await cnt('correct_answer=is.null');
  const validas = await cnt('correct_answer=in.(A,B,C,D,E)');
  const anulada = await cnt('correct_answer=eq.ANULADA');
  // Strings vazias = total - nulls - validas - anulada - outros não-vazios
  // Usar neq vazio via URL encoding
  const vazios  = await cnt('correct_answer=neq.null&correct_answer=not.in.(A,B,C,D,E,ANULADA)');

  const comReal = validas + anulada;
  const semReal = nulls + vazios;

  console.log('\n================================================================');
  console.log('  GABARITO MARCÁVEL — VISÃO DEFINITIVA');
  console.log('================================================================');
  console.log(`Total de questões no banco         : ${total.toLocaleString('pt-BR')}`);
  console.log('');
  console.log('✅ COM GABARITO REAL (A/B/C/D/E ou ANULADA):');
  console.log(`   Alternativas A/B/C/D/E          : ${validas.toLocaleString('pt-BR')}`);
  console.log(`   ANULADA                         : ${anulada.toLocaleString('pt-BR')}`);
  console.log(`   SUBTOTAL                        : ${comReal.toLocaleString('pt-BR')}  (${((comReal/total)*100).toFixed(1)}%)`);
  console.log('');
  console.log('❌ SEM GABARITO REAL:');
  console.log(`   correct_answer = null           : ${nulls.toLocaleString('pt-BR')}`);
  console.log(`   correct_answer = vazio/outro    : ${vazios.toLocaleString('pt-BR')}`);
  console.log(`   SUBTOTAL                        : ${semReal.toLocaleString('pt-BR')}  (${((semReal/total)*100).toFixed(1)}%)`);
  console.log('================================================================\n');
}

main().catch(console.error);
