import fs from 'fs';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const headers = {
  'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
  'Authorization': 'Bearer ' + env.SUPABASE_SERVICE_ROLE_KEY,
  'Prefer': 'count=exact',
  'Range': '0-0'
};

async function c(name, q) {
  const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/questions?${q ? q + '&' : ''}select=id&limit=1`;
  const res = await fetch(url, { headers });
  const cr = res.headers.get('content-range');
  const count = cr ? parseInt(cr.split('/')[1] || '0') : 0;
  console.log(`${name.padEnd(48)} : ${count.toLocaleString('pt-BR').padStart(8)}`);
  return count;
}

async function run() {
  console.log('='.repeat(70));
  console.log('📊 STATUS ATUALIZADO DO SUPABASE APÓS FASES 2 & 3:');
  console.log('='.repeat(70));
  const total = await c('Total de Questões no Banco', '');
  const comGab = await c('has_gabarito = TRUE (Homologadas / Visíveis)', 'has_gabarito=eq.true');
  const semGab = await c('has_gabarito = FALSE (Ocultas para Alunos)', 'has_gabarito=eq.false');
  const discursivas = await c('type = Discursiva', 'type=eq.Discursiva');
  const multipla = await c('type = Múltipla escolha', 'type=eq.Múltipla+escolha');
  const anuladas = await c('is_anulada = true', 'is_anulada=eq.true');
  const validAE = await c('Gabarito Válido (A, B, C, D, E)', 'correct_answer=in.(A,B,C,D,E)');

  console.log('='.repeat(70));
  console.log(`Percentual de Homologação Ativa: ${((comGab / total) * 100).toFixed(2)}%`);
  console.log(`Total Isolado/Oculto (Discursivas + Órfãs): ${semGab.toLocaleString('pt-BR')} (${((semGab / total) * 100).toFixed(2)}%)`);
  console.log('='.repeat(70));
}

run().catch(console.error);

