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
  console.log('  AUDITORIA DE FONTES DE GABARITO — BANCO COMPLETO');
  console.log('================================================================');

  // Total geral
  const total       = await cnt('');
  const comGabarito = await cnt('correct_answer=not.is.null');
  console.log(`Total de questões no banco          : ${total.toLocaleString('pt-BR')}`);
  console.log(`Total com gabarito (any)            : ${comGabarito.toLocaleString('pt-BR')}`);

  console.log('\n--- BREAKDOWN POR TIPO DE FONTE ---');

  // 1) Homologadas oficiais (gabaritos definitivos de bancas)
  const homologOficial = await cnt('commentary=ilike.*Gabarito+Oficial+Homologado*');
  console.log(`[1] Homologadas oficiais (Lote 2 - bancas)          : ${homologOficial.toLocaleString('pt-BR')}`);

  // 2) Provas oficiais - "processo de homologação" (plataforma original)
  const homologProcesso = await cnt('commentary=ilike.*processo+de+homologa%C3%A7%C3%A3o*');
  console.log(`[2] Gabarito oficial (processo homologação plataforma): ${homologProcesso.toLocaleString('pt-BR')}`);

  // 3) Medcurso (livros)
  const medcurso = await cnt('commentary=ilike.*Medcurso*');
  console.log(`[3] Gabarito extraído de Medcurso (livros)           : ${medcurso.toLocaleString('pt-BR')}`);

  // 4) Estratégia/livros estratégicos
  const estrategia = await cnt('commentary=ilike.*Estrat%C3%A9gia*');
  console.log(`[4] Gabarito de livros Estratégia Medicina           : ${estrategia.toLocaleString('pt-BR')}`);

  // 5) Drive / MedEvo
  const drive = await cnt('commentary=ilike.*Drive*');
  console.log(`[5] Gabarito extraído do Drive (MedEvo/coleções)     : ${drive.toLocaleString('pt-BR')}`);

  // 6) Fonte IA (excluir)
  const fonteIA = await cnt('commentary=ilike.*IA*&correct_answer=not.is.null');
  console.log(`[6] Fonte IA (a EXCLUIR)                             : ${fonteIA.toLocaleString('pt-BR')}`);

  // 7) Commentary null mas com gabarito
  const semComment = await cnt('correct_answer=not.is.null&commentary=is.null');
  console.log(`[7] Com gabarito mas SEM commentary                  : ${semComment.toLocaleString('pt-BR')}`);

  // 8) Outros padrões
  const outros = comGabarito - homologOficial - homologProcesso - medcurso - estrategia - drive - fonteIA - semComment;
  console.log(`[8] Outros/sobreposições                             : ${outros.toLocaleString('pt-BR')}`);

  console.log('\n================================================================');
  console.log('  TOTAL EXCLUINDO FONTE IA');
  console.log('================================================================');

  // Contagem direta: com gabarito E commentary NÃO contém "IA"
  // Estratégia: total com gabarito - os que têm commentary com IA
  // Mas precisa ser: com gabarito e (commentary not ilike *IA* OR commentary is null)
  // PostgREST não faz OR facilmente, então calculamos por subtração
  const comGabSemIA = comGabarito - fonteIA;

  console.log(`Total com gabarito                  : ${comGabarito.toLocaleString('pt-BR')}`);
  console.log(`(-) Fonte IA                        : ${fonteIA.toLocaleString('pt-BR')}`);
  console.log(`= COM GABARITO (excluindo IA)       : ${comGabSemIA.toLocaleString('pt-BR')}`);
  
  const pct = ((comGabSemIA / total) * 100).toFixed(1);
  console.log(`Cobertura sobre total do banco      : ${pct}%`);

  console.log('\n--- COMPOSIÇÃO DAS FONTES NÃO-IA ---');
  console.log(`  Provas oficiais homologadas (Lote 2)     : ${homologOficial.toLocaleString('pt-BR')}`);
  console.log(`  Gabarito oficial da plataforma original  : ${homologProcesso.toLocaleString('pt-BR')}`);
  console.log(`  Livros Medcurso                          : ${medcurso.toLocaleString('pt-BR')}`);
  console.log(`  Livros Estratégia Medicina               : ${estrategia.toLocaleString('pt-BR')}`);
  console.log(`  Drive MedEvo/Coleções                    : ${drive.toLocaleString('pt-BR')}`);
  console.log(`  Com gabarito sem commentary              : ${semComment.toLocaleString('pt-BR')}`);
  console.log('================================================================\n');
}

main().catch(console.error);
