import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { pipeline, cos_sim } from '@xenova/transformers';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.trim().split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const FTS_DB_PATH = path.resolve('data/questions_golden_fts.db');
const ftsDb = new DatabaseSync(FTS_DB_PATH, { readOnly: true });

// Carregar Árvore Canônica e Vetores em Cache
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

const VECTOR_CACHE_FILE = fs.existsSync('data/cache_canonical_tree_clinical_centroids.json')
  ? path.resolve('data/cache_canonical_tree_clinical_centroids.json')
  : path.resolve('data/cache_canonical_tree_vectors.json');
const cached = JSON.parse(fs.readFileSync(VECTOR_CACHE_FILE, 'utf8'));
const focoVectors = new Map(Object.entries(cached.focos));
const subfocoVectors = new Map(Object.entries(cached.subfocos));

console.log('⚡ Carregando Transformers...');
const extractor = await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');
console.log('✅ Pronto!');

// Buscar as 100 questões do benchmark
const idsRes = await fetch(`${SUPABASE_URL}/rest/v1/questions_direto?select=id&especialidade=is.null&limit=100`, {
  headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` }
});
const targetIds = (await idsRes.json()).map(r => r.id);

const questionsRes = await fetch(`${SUPABASE_URL}/rest/v1/questions_direto?select=id,code,statement,options,correct_answer,commentary&id=in.(${targetIds.join(',')})`, {
  headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` }
});
const questions = await questionsRes.json();
console.log(`✅ ${questions.length} questões carregadas para o benchmark.\n`);

const bm25Stmt = ftsDb.prepare(`
  SELECT id, especialidade, tema, foco, subfoco, bm25(questions_fts) as rank
  FROM questions_fts
  WHERE questions_fts MATCH ?
  ORDER BY rank
  LIMIT 5
`);

// Stopwords estendidas incluindo verbos clínicos genéricos
const STOPWORDS = new Set([
  'para', 'com', 'sem', 'dos', 'das', 'uma', 'uns', 'pelo', 'pela',
  'sobre', 'entre', 'após', 'onde', 'qual', 'como', 'mais', 'menos',
  'que', 'nao', 'sao', 'este', 'esta', 'esse', 'essa', 'isso', 'isto',
  'foram', 'como', 'pode', 'deve', 'sendo', 'caso', 'sobre', 'paciente',
  'abaixo', 'acima', 'assinale', 'alternativa', 'correta', 'incorreta',
  'analise', 'seguinte', 'quadro', 'apresenta', 'relacao', 'segundo',
  'diante', 'considere', 'quanto', 'podemos', 'afirmar', 'referente',
  'apresentando', 'dirigiu', 'solicitarmos', 'administracao', 'queixou',
  'localizada', 'assintomatica', 'proceder', 'durante', 'ultima', 'semana'
]);

function extractClinicalTerms(statement, correctText) {
  const norm = `${statement} ${correctText}`
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ');

  const tokens = norm.split(/\s+/).filter(w => w.length >= 4 && !STOPWORDS.has(w));
  const unique = Array.from(new Set(tokens));

  unique.sort((a, b) => b.length - a.length);
  return unique.slice(0, 8);
}

// 4. Execução da Classificação com Consenso Estrito e Centróides Clínicos
console.log('🚀 Pré-extraindo embeddings das 100 questões em batch...');
const qSnippets = questions.map(q => {
  let opts = [];
  try { opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options; } catch {}
  let correctText = '';
  const letters = ['A', 'B', 'C', 'D', 'E'];
  for (let k = 0; k < (opts || []).length; k++) {
    const o = opts[k];
    const letter = o.letter || (typeof o.index === 'number' ? letters[o.index] : null);
    if (letter && letter === q.correct_answer) { correctText = o.text || ''; break; }
  }
  return `${q.statement?.slice(0, 200)}. Resposta: ${correctText.slice(0, 100)}.`;
});

const allQuestionVectors = [];
for (let i = 0; i < qSnippets.length; i += 48) {
  const chunk = qSnippets.slice(i, i + 48);
  const out = await extractor(chunk, { pooling: 'mean', normalize: true });
  for (let k = 0; k < chunk.length; k++) {
    allQuestionVectors.push(Array.from(out.data.subarray(k * 384, (k + 1) * 384)));
  }
}
console.log('✅ Embeddings pré-calculados!');

console.log('🚀 Executando Motor de Consenso Duplo (BM25 + Centróides Clínicos)...');
const t0 = Date.now();

let totalApproved = 0;
let totalQuarantine = 0;
const results = [];
const espDistribution = {};

for (let idx = 0; idx < questions.length; idx++) {
  const q = questions[idx];
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

  // 1. Busca BM25
  const terms = extractClinicalTerms(q.statement, correctText);
  let neighbors = [];
  if (terms.length >= 2) {
    const andQuery = terms.slice(0, 3).map(t => `"${t}"`).join(' AND ');
    try {
      neighbors = bm25Stmt.all(andQuery);
    } catch {}

    if (!neighbors || neighbors.length < 3) {
      const orQuery = terms.slice(0, 6).map(t => `"${t}"`).join(' OR ');
      try {
        neighbors = bm25Stmt.all(orQuery);
      } catch {}
    }
  }

  // 2. Votação dos Vizinhos
  const focoVotes = new Map();
  const subfocoVotes = new Map();

  for (const n of (neighbors || [])) {
    const fKey = `${n.especialidade}|||${n.tema}|||${n.foco}`;
    focoVotes.set(fKey, (focoVotes.get(fKey) || 0) + 1);
    if (n.subfoco) {
      const sKey = `${fKey}|||${n.subfoco}`;
      subfocoVotes.set(sKey, (subfocoVotes.get(sKey) || 0) + 1);
    }
  }

  let topFocoVote = null;
  let topFocoCount = 0;
  for (const [fKey, count] of focoVotes.entries()) {
    if (count > topFocoCount) {
      topFocoCount = count;
      topFocoVote = fKey;
    }
  }

  let topSubVote = null;
  let topSubCount = 0;
  for (const [sKey, count] of subfocoVotes.entries()) {
    if (count > topSubCount) {
      topSubCount = count;
      topSubVote = sKey;
    }
  }

  // 3. Validação Vetorial Cruzada com Centróides Clínicos Reais
  const qVec = allQuestionVectors[idx];

  let targetEsp = null;
  let targetTema = null;
  let targetFoco = null;
  let targetSubfoco = null;
  let isApproved = false;
  let confidenceReason = '';

  if (topFocoVote && topFocoCount >= 2) {
    const parts = topFocoVote.split('|||');
    targetEsp = parts[0];
    targetTema = parts[1];
    targetFoco = parts[2];

    if (topSubVote && topSubVote.startsWith(topFocoVote)) {
      targetSubfoco = topSubVote.split('|||')[3] || null;
    }

    const fVec = focoVectors.get(`${targetEsp}|||${targetFoco}`);
    const cosSim = fVec ? cos_sim(qVec, fVec) : 0;

    // Quality Gate de Consenso Duplo
    if (topFocoCount >= 3 && cosSim >= 0.42) {
      isApproved = true;
      confidenceReason = `Consenso Sólido (${topFocoCount}/5 vizinhos nas 130k) + Cosseno ${cosSim.toFixed(3)}`;
    } else if (topFocoCount >= 2 && cosSim >= 0.55) {
      isApproved = true;
      confidenceReason = `Consenso Moderado (${topFocoCount}/5 vizinhos) + Cosseno Alto (${cosSim.toFixed(3)})`;
    } else {
      confidenceReason = `Divergência Vetorial ou Margem Estreita (${topFocoCount}/5 vizinhos, Cosseno: ${cosSim.toFixed(3)})`;
    }
  } else {
    confidenceReason = 'Dispersão de vizinhos no acervo (sem consenso unânime)';
    if (neighbors[0]) {
      targetEsp = neighbors[0].especialidade;
      targetTema = neighbors[0].tema;
      targetFoco = neighbors[0].foco;
      targetSubfoco = neighbors[0].subfoco;
    }
  }

  if (isApproved && targetEsp && targetFoco) {
    totalApproved++;
    espDistribution[targetEsp] = (espDistribution[targetEsp] || 0) + 1;
  } else {
    totalQuarantine++;
  }

  results.push({
    id: q.id,
    code: q.code,
    statement: q.statement,
    correctText,
    targetEsp,
    targetTema,
    targetFoco,
    targetSubfoco,
    topFocoCount,
    isApproved,
    confidenceReason,
    topNeighbor: neighbors[0] ? `[${neighbors[0].especialidade}] > [${neighbors[0].foco}]` : 'Nenhum'
  });

  if (idx < 10) {
    console.log(`[Q#${idx + 1}] ID: ${q.id} | ${isApproved ? '✅ APROVADA' : '⚠️ QUARENTENA'}`);
    console.log(`   📝 ${q.statement.slice(0, 105).replace(/\s+/g, ' ')}...`);
    console.log(`   🎯 Gabarito: ${correctText.slice(0, 50)}`);
    console.log(`   🏷️ Mapeamento: [${targetEsp}] > [${targetTema}] > [${targetFoco}] > [${targetSubfoco}]`);
    console.log(`   📊 ${confidenceReason}`);
    console.log('---');
  }
}

const execTime = ((Date.now() - t0) / 1000).toFixed(2);

console.log('\n========================================================================');
console.log('📊 RESULTADOS DO BENCHMARK DE CONSENSO DUPLO (100 QUESTÕES)');
console.log('========================================================================');
console.log(`Tempo Total: ${execTime}s (${(100 / execTime).toFixed(1)} q/s)`);
console.log(`✅ APROVADAS DIRETO NO GATE (Fase 1 Local): ${totalApproved} (${totalApproved}%)`);
console.log(`⚠️ RETIDAS PARA QUARENTENA (Fase 2 LLM):   ${totalQuarantine} (${totalQuarantine}%)`);
console.log('\nDistribuição das Questões Aprovadas por Área:');
for (const [esp, count] of Object.entries(espDistribution)) {
  console.log(`  • ${esp.padEnd(28)}: ${count} questões (${count}%)`);
}

fs.writeFileSync('data/benchmark_consenso_100_resultado.json', JSON.stringify(results, null, 2), 'utf8');
console.log('\n💾 Relatório salvo em: data/benchmark_consenso_100_resultado.json');
