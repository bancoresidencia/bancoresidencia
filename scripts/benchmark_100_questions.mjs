import fs from 'fs';
import path from 'path';
import { pipeline, cos_sim } from '@xenova/transformers';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.trim().split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

// 1. Carregar Árvore Canônica e Vetores em Cache
const TREE_PATH = path.resolve('data/catalogo_arvore_canonica_completa.json');
const rawTree = JSON.parse(fs.readFileSync(TREE_PATH, 'utf8'));

const allCanonicalFocos = [];
for (const espNode of (rawTree.hierarquia_padrao || [])) {
  const espName = espNode.especialidade;
  for (const t of (espNode.temas || [])) {
    for (const f of (t.focos || [])) {
      const focoName = f.foco;
      const subfocos = [];
      for (const s of (f.subfocos || [])) {
        const subName = typeof s === 'string' ? s : s.subfoco;
        if (subName) subfocos.push(subName);
      }
      allCanonicalFocos.push({
        especialidade: espName,
        tema: t.tema,
        foco: focoName,
        subfocos
      });
    }
  }
}

const VECTOR_CACHE_FILE = path.resolve('data/cache_canonical_tree_vectors.json');
const cached = JSON.parse(fs.readFileSync(VECTOR_CACHE_FILE, 'utf8'));
const focoVectors = new Map(Object.entries(cached.focos));
const subfocoVectors = new Map(Object.entries(cached.subfocos));

// 2. Tokenização dos focos
const STOPWORDS = new Set([
  'para', 'com', 'sem', 'dos', 'das', 'uma', 'uns', 'pelo', 'pela',
  'sobre', 'entre', 'após', 'onde', 'qual', 'como', 'mais', 'menos',
  'que', 'nao', 'sao', 'este', 'esta', 'esse', 'essa', 'isso', 'isto',
  'foram', 'como', 'pode', 'deve', 'sendo', 'caso', 'sobre', 'paciente'
]);

function tokenize(text) {
  return (text || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(t => t.length >= 3 && !STOPWORDS.has(t));
}

for (const f of allCanonicalFocos) {
  const baseTokens = tokenize(`${f.tema} ${f.foco}`);
  const subTokens = f.subfocos.flatMap(s => tokenize(s));
  f.tokens = Array.from(new Set([...baseTokens, ...subTokens]));
}

// 3. Regras Clínicas Negativas
const OBSTETRIC_KEYWORDS = [
  'gestante', 'gestacao', 'gravidez', 'gravida', 'parto', 'puerperio', 'partograma',
  'feto', 'fetal', 'bcf', 'pre-natal', 'preeclampsia', 'eclampsia', 'dpp', 'placenta',
  'liquido amniotico', 'amniorrexe', 'cesariana', 'puerpera', 'nagele', 'tocurgia',
  'cardiotocografia', 'alojamento conjunto', 'stff', 'gemelar', 'colo uterino apagado'
];

function hasObstetricTerm(text) {
  return OBSTETRIC_KEYWORDS.some(kw => text.includes(kw));
}

function isAdultPatient(text) {
  const match = text.match(/(\d{1,3})\s*anos/i);
  if (match) {
    const age = parseInt(match[1], 10);
    return age >= 18;
  }
  return /idoso|idosa|homem de|mulher de/i.test(text);
}

// 4. Carregar Modelo Local
console.log('⚡ Carregando modelo @xenova/transformers...');
const extractor = await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');
console.log('✅ Modelo pronto!');

// 5. Buscar Lote de 100 Questões Não Categorizadas
console.log('📡 Buscando 100 questões com especialidade IS NULL em questions_direto...');
const idsRes = await fetch(`${SUPABASE_URL}/rest/v1/questions_direto?select=id&especialidade=is.null&limit=100`, {
  headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` }
});
const idRows = await idsRes.json();
const targetIds = idRows.map(r => r.id);
console.log(`✅ ${targetIds.length} IDs obtidos. Buscando enunciados e alternativas...`);

const questionsRes = await fetch(`${SUPABASE_URL}/rest/v1/questions_direto?select=id,code,statement,options,correct_answer,commentary&id=in.(${targetIds.join(',')})`, {
  headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` }
});
const questions = await questionsRes.json();
console.log(`✅ ${questions.length} questões carregadas para o benchmark.\n`);

// 6. Preparar Snippets Clínicos
const snippets = [];
const prepared = [];

for (const q of questions) {
  let opts = [];
  try { opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options; } catch {}
  let correctText = '';
  const letters = ['A', 'B', 'C', 'D', 'E'];
  for (let k = 0; k < (opts || []).length; k++) {
    const o = opts[k];
    const letter = o.letter || (typeof o.index === 'number' ? letters[o.index] : null);
    if (letter && letter === q.correct_answer) {
      correctText = o.text || '';
      break;
    }
  }

  const lines = (q.statement || '').split('\n').map(l => l.trim()).filter(Boolean);
  const commandPrompt = lines[lines.length - 1] || '';
  const normFullText = `${q.statement} ${correctText} ${q.commentary || ''}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const qSnippet = `${commandPrompt || q.statement?.slice(0, 250)}. Resposta: ${correctText.slice(0, 150)}.${q.commentary ? ' ' + q.commentary.slice(0, 150) : ''}`;
  snippets.push(qSnippet);

  prepared.push({
    q,
    correctText,
    commandPrompt,
    normFullText
  });
}

// 7. Extração Vetorial em Batches de 48
console.log('🚀 Gerando embeddings densos locais para as 100 questões...');
const t0 = Date.now();
const allVectors = [];
for (let i = 0; i < snippets.length; i += 48) {
  const chunk = snippets.slice(i, i + 48);
  const out = await extractor(chunk, { pooling: 'mean', normalize: true });
  for (let k = 0; k < chunk.length; k++) {
    allVectors.push(Array.from(out.data.subarray(k * 384, (k + 1) * 384)));
  }
}
const embedTime = ((Date.now() - t0) / 1000).toFixed(2);
console.log(`✅ 100 embeddings gerados em ${embedTime}s (${(100 / embedTime).toFixed(1)} q/s)\n`);

// 8. Classificação e Coleta de Métricas
const results = [];
const espCounts = {
  'Clínica Médica': 0,
  'Cirurgia Geral': 0,
  'Pediatria': 0,
  'Ginecologia': 0,
  'Obstetrícia': 0,
  'Medicina Preventiva e Social': 0
};

let totalApproved = 0;
let totalQuarantine = 0;
let sumCosine = 0;
let sumMargin = 0;

for (let i = 0; i < prepared.length; i++) {
  const { q, correctText, commandPrompt, normFullText } = prepared[i];
  const qVec = allVectors[i];

  const normCorrect = correctText.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  // Busca em todos os 435 focos
  const scored = allCanonicalFocos.map(f => {
    const fKey = `${f.especialidade}|||${f.foco}`;
    const fVec = focoVectors.get(fKey);
    const cosSim = fVec ? cos_sim(qVec, fVec) : 0;

    let lexScore = 0;
    for (const t of f.tokens) {
      const re = new RegExp(`(?:^|\\W)${t}(?:$|\\W)`, 'i');
      if (re.test(normCorrect)) lexScore += 4.0;
      if (re.test(normFullText)) lexScore += 1.0;
    }
    const normLex = lexScore / Math.pow(Math.max(f.tokens.length, 1), 0.65);

    let penalty = 0;
    if (f.especialidade === 'Obstetrícia' && !hasObstetricTerm(normFullText)) {
      penalty += 0.15;
    }
    if (f.especialidade === 'Pediatria' && isAdultPatient(normFullText)) {
      penalty += 0.20;
    }

    const combinedScore = (cosSim * 0.70) + (Math.min(normLex, 2.0) / 2.0 * 0.30) - penalty;
    return { f, cosSim, normLex, combinedScore };
  });

  scored.sort((a, b) => b.combinedScore - a.combinedScore);

  const top1 = scored[0];
  const top2 = scored[1] || { combinedScore: 0 };
  const margin = top2.combinedScore > 0 ? (top1.combinedScore - top2.combinedScore) / top1.combinedScore : 1.0;

  let bestSub = null;
  if (top1.f.subfocos && top1.f.subfocos.length > 0) {
    const subScored = top1.f.subfocos.map(s => {
      const sKey = `${top1.f.especialidade}|||${top1.f.foco}|||${s}`;
      const sVec = subfocoVectors.get(sKey);
      const sim = sVec ? cos_sim(qVec, sVec) : 0;
      return { s, sim };
    });
    subScored.sort((a, b) => b.sim - a.sim);
    bestSub = subScored[0]?.s;
  }

  // Quality Gate
  const isApproved = top1.cosSim >= 0.62 && margin >= 0.12 && top1.combinedScore >= 0.50;

  if (isApproved) totalApproved++;
  else totalQuarantine++;

  espCounts[top1.f.especialidade] = (espCounts[top1.f.especialidade] || 0) + 1;
  sumCosine += top1.cosSim;
  sumMargin += margin;

  results.push({
    id: q.id,
    code: q.code,
    statement: q.statement,
    correctText,
    especialidade: top1.f.especialidade,
    tema: top1.f.tema,
    foco: top1.f.foco,
    subfoco: bestSub,
    cosSim: top1.cosSim,
    margin,
    combinedScore: top1.combinedScore,
    isApproved,
    runnerUp: {
      especialidade: top2.f?.especialidade,
      foco: top2.f?.foco,
      cosSim: top2.cosSim,
      combinedScore: top2.combinedScore
    }
  });
}

// 9. Relatório Consolidado de Métricas
console.log('========================================================================');
console.log('📊 RESULTADOS DO BENCHMARK DE 100 QUESTÕES (MODO SIMULAÇÃO)');
console.log('========================================================================');
console.log(`Total de Questões Processadas: 100`);
console.log(`✅ Aprovadas Direto no Gate (Fase 1 Embeddings): ${totalApproved} (${totalApproved}%)`);
console.log(`⚠️ Retidas para Quarentena Segura (Fase 2 LLM):   ${totalQuarantine} (${totalQuarantine}%)`);
console.log(`📈 Cosseno Médio do Vencedor: ${(sumCosine / 100).toFixed(3)}`);
console.log(`📏 Margem Média para o 2º Colocado: ${((sumMargin / 100) * 100).toFixed(1)}%\n`);

console.log('Distribuição por Especialidade Canônica ($N_1$):');
for (const [esp, count] of Object.entries(espCounts)) {
  const bar = '█'.repeat(Math.round(count / 2));
  console.log(`  • ${esp.padEnd(28)}: ${String(count).padStart(3)} questões (${String(count).padStart(2)}%) ${bar}`);
}
console.log('');

// 10. Salvar resultado completo em JSON para auditoria detalhada
const BENCHMARK_OUT = path.resolve('data/benchmark_100_questoes_resultado.json');
fs.writeFileSync(BENCHMARK_OUT, JSON.stringify(results, null, 2), 'utf8');
console.log(`💾 Relatório completo salvo em: ${BENCHMARK_OUT}`);
