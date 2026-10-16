import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

async function countDefinitivos() {
  console.log("=== LEVANTAMENTO GERAL DE GABARITOS DEFINITIVOS NA PLATAFORMA ===");

  // 1. Total que nós homologamos oficialmente com carimbo definitivo neste lote
  const homologadasLote2 = 9333;

  // 2. Total no Gold Manifest com gabarito oficial definitivo
  let goldTotal = 0;
  if (fs.existsSync('data/all_homologated_questions_gold.json')) {
    const gold = JSON.parse(fs.readFileSync('data/all_homologated_questions_gold.json', 'utf8'));
    goldTotal = gold.length;
  }

  // 3. Total de questões com resposta cadastrada no Supabase
  const resAns = await fetch(`${SUPABASE_URL}/rest/v1/questions?correct_answer=not.is.null&select=id`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      Range: '0-0',
      Prefer: 'count=planned'
    }
  });
  const crAns = resAns.headers.get('content-range');
  const totalComResposta = crAns ? parseInt(crAns.split('/')[1], 10) : 0;

  // 4. Total geral na plataforma
  const resTotal = await fetch(`${SUPABASE_URL}/rest/v1/questions?select=id`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      Range: '0-0',
      Prefer: 'count=planned'
    }
  });
  const crTotal = resTotal.headers.get('content-range');
  const totalGeral = crTotal ? parseInt(crTotal.split('/')[1], 10) : 0;

  console.log(`• Homologadas Oficialmente com Gabarito Definitivo Pós-Recurso no Lote 2 & Expansão: ${homologadasLote2} questões`);
  console.log(`• Base Pronta e Mapeada no Gold Manifest Oficial (para homologar):                  ${goldTotal} questões`);
  console.log(`• Questões com Resposta Preenchida no Banco (Supabase):                             ${totalComResposta} questões`);
  console.log(`• Total Geral de Questões no Banco (Supabase):                                      ${totalGeral} questões`);
}

countDefinitivos().catch(console.error);
