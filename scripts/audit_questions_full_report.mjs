import fs from 'fs';
import path from 'path';

// 1. Carrega credenciais do .env.local
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Credenciais do Supabase não encontradas no .env.local');
  process.exit(1);
}

const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Prefer': 'count=exact'
};

async function countFilter(name, query = '') {
  const t0 = Date.now();
  const url = `${SUPABASE_URL}/rest/v1/questions?${query ? query + '&' : ''}select=id&limit=1`;
  const res = await fetch(url, { headers });
  const cr = res.headers.get('content-range');
  const cnt = cr ? parseInt(cr.split('/')[1] || '0') : 0;
  console.log(`${name.padEnd(50)} : ${cnt.toLocaleString('pt-BR').padStart(8)} (${Date.now() - t0}ms)`);
  return cnt;
}

async function run() {
  console.log('='.repeat(80));
  console.log('📊 AUDITORIA DO BANCO DE QUESTÕES NO SUPABASE');
  console.log('='.repeat(80));

  const total = await countFilter('Total de questões no Supabase');
  const validAns = await countFilter('Com gabarito válido (A, B, C, D, E)', 'correct_answer=in.(A,B,C,D,E)');
  const isAnuladaTrue = await countFilter('Marcadas is_anulada = true', 'is_anulada=eq.true');
  const ansAnulada = await countFilter('Com correct_answer = ANULADA', 'correct_answer=eq.ANULADA');
  const orAnulada = await countFilter('Total Anuladas (is_anulada=true OU correct_answer=ANULADA)', 'or=(is_anulada.eq.true,correct_answer.eq.ANULADA)');
  const nullAns = await countFilter('Com correct_answer IS NULL', 'correct_answer=is.null');
  const emptyAns = await countFilter('Com correct_answer vazio ("")', 'correct_answer=eq.');
  
  // Combinações cruciais
  const validOrAnulada = await countFilter('Com gabarito OU anulada (prontas para estudo)', 'or=(correct_answer.in.(A,B,C,D,E),is_anulada.eq.true)');
  const semGabaritoTotal = await countFilter('Sem gabarito válido e não anulada (PENDENTES)', 'and=(correct_answer.not.in.(A,B,C,D,E),is_anulada.eq.false)');
  
  // Carimbos de Homologação
  const carimboHomologado = await countFilter('Com carimbo "Gabarito Oficial Homologado"', 'commentary=ilike.*Gabarito+Oficial+Homologado*');
  const carimboOficial = await countFilter('Com carimbo "Gabarito Oficial" (amplo)', 'commentary=ilike.*Gabarito+Oficial*');
  const carimboAncora = await countFilter('Com menção "Âncora de Ouro"', 'commentary=ilike.*Âncora+de+Ouro*');

  // Especialidades no Supabase
  console.log('\n' + '='.repeat(80));
  console.log('🩺 DISTRIBUIÇÃO POR ESPECIALIDADE NO SUPABASE:');
  console.log('='.repeat(80));

  const specs = [
    'Clínica Médica',
    'Cirurgia Geral',
    'Pediatria',
    'Medicina Preventiva',
    'Obstetrícia',
    'Ginecologia',
    'Nefrologia',
    'Urologia'
  ];

  for (const s of specs) {
    const sUrl = encodeURIComponent(s);
    const espTotal = await countFilter(`[${s}] Total`, `especialidade=eq.${sUrl}`);
    await countFilter(`  └─ com gabarito A-E`, `especialidade=eq.${sUrl}&correct_answer=in.(A,B,C,D,E)`);
    await countFilter(`  └─ anulada`, `especialidade=eq.${sUrl}&or=(is_anulada.eq.true,correct_answer.eq.ANULADA)`);
    await countFilter(`  └─ sem gabarito válido`, `especialidade=eq.${sUrl}&and=(correct_answer.not.in.(A,B,C,D,E),is_anulada.eq.false)`);
  }

  // Outras especialidades ou nulas
  await countFilter('[Outras / Nulas] especialidade IS NULL', 'especialidade=is.null');
  
  console.log('\n' + '='.repeat(80));
  console.log('🏁 FIM DA CONSULTA SUPABASE');
  console.log('='.repeat(80));
}

run().catch(console.error);

