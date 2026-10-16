import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Prefer': 'count=planned',
  'Range': '0-0'
};

async function cnt(filter) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?${filter}&select=id&limit=1`, { headers });
  return parseInt(res.headers.get('content-range')?.split('/')[1] ?? '0') || 0;
}

async function main() {
  console.log('\n================================================================');
  console.log('  GABARITO MARCÁVEL — CONTAGEM POR ALTERNATIVA (correct_answer)');
  console.log('================================================================');

  const total    = await cnt('');
  const comQual  = await cnt('correct_answer=not.is.null');
  const semGab   = await cnt('correct_answer=is.null');

  const altA     = await cnt('correct_answer=eq.A');
  const altB     = await cnt('correct_answer=eq.B');
  const altC     = await cnt('correct_answer=eq.C');
  const altD     = await cnt('correct_answer=eq.D');
  const altE     = await cnt('correct_answer=eq.E');
  const anulada  = await cnt('correct_answer=eq.ANULADA');
  const outros   = comQual - altA - altB - altC - altD - altE - anulada;

  console.log(`Total de questões no banco          : ${total.toLocaleString('pt-BR')}`);
  console.log(`Com gabarito marcável (any)         : ${comQual.toLocaleString('pt-BR')}  (${((comQual/total)*100).toFixed(1)}%)`);
  console.log(`Sem gabarito (null)                 : ${semGab.toLocaleString('pt-BR')}  (${((semGab/total)*100).toFixed(1)}%)`);

  console.log('\n--- DISTRIBUIÇÃO POR ALTERNATIVA ---');
  console.log(`  Alternativa A                     : ${altA.toLocaleString('pt-BR')}  (${((altA/comQual)*100).toFixed(1)}%)`);
  console.log(`  Alternativa B                     : ${altB.toLocaleString('pt-BR')}  (${((altB/comQual)*100).toFixed(1)}%)`);
  console.log(`  Alternativa C                     : ${altC.toLocaleString('pt-BR')}  (${((altC/comQual)*100).toFixed(1)}%)`);
  console.log(`  Alternativa D                     : ${altD.toLocaleString('pt-BR')}  (${((altD/comQual)*100).toFixed(1)}%)`);
  console.log(`  Alternativa E                     : ${altE.toLocaleString('pt-BR')}  (${((altE/comQual)*100).toFixed(1)}%)`);
  console.log(`  ANULADA                           : ${anulada.toLocaleString('pt-BR')}  (${((anulada/comQual)*100).toFixed(1)}%)`);
  console.log(`  Outros valores                    : ${outros.toLocaleString('pt-BR')}`);

  console.log('\n--- SUBTOTAL ALTERNATIVAS VÁLIDAS (A/B/C/D/E) ---');
  const validas = altA + altB + altC + altD + altE;
  console.log(`  Total alternativas A-E marcáveis  : ${validas.toLocaleString('pt-BR')}  (${((validas/total)*100).toFixed(1)}% do banco total)`);
  console.log('================================================================\n');
}

main().catch(console.error);
