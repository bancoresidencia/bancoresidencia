import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const API_KEY = process.env.GEMINI_API_KEY || '';
const MODEL_NAME = 'gemini-3.1-flash-lite';

const TREE_PATH = path.resolve('src/data/hierarquiaCompletaFiltros.json');
const DB_PATH = path.resolve('data/questoes_132k.db');

const rawTreeData = JSON.parse(fs.readFileSync(TREE_PATH, 'utf8'));

// Build canonical index
function buildCanonicalFocoIndex(inputTree) {
  const compositeFocoMap = new Map();
  const focoFallbackMap = new Map();
  const canonicalTuples = new Set();

  let treeObject = inputTree;
  if (Array.isArray(inputTree.hierarquia_padrao)) {
    treeObject = {};
    for (const espNode of inputTree.hierarquia_padrao) {
      const espName = espNode.especialidade;
      treeObject[espName] = {};
      for (const t of espNode.temas || []) {
        treeObject[espName][t.tema] = {};
        for (const f of t.focos || []) {
          treeObject[espName][t.tema][f.foco] = f;
        }
      }
    }
  }

  for (const [esp, temas] of Object.entries(treeObject)) {
    if (esp === 'metadata' || typeof temas !== 'object' || temas === null) continue;
    const espLower = esp.toLowerCase().trim();

    for (const [tema, focos] of Object.entries(temas)) {
      for (const [foco, focoData] of Object.entries(focos)) {
        const focoLower = foco.toLowerCase().trim();
        let subfocosList = [];

        const processSubItem = (item) => {
          if (typeof item === 'string') subfocosList.push(item);
          else if (item && typeof item === 'object') {
            const subName = item.subfoco || item.nome;
            if (subName) subfocosList.push(subName);
          }
        };

        if (Array.isArray(focoData)) {
          for (const item of focoData) processSubItem(item);
        } else if (focoData && typeof focoData.subfocos === 'object') {
          if (Array.isArray(focoData.subfocos)) {
            for (const item of focoData.subfocos) processSubItem(item);
          } else {
            for (const subName of Object.keys(focoData.subfocos)) {
              subfocosList.push(subName);
            }
          }
        }

        subfocosList = subfocosList.filter(s => !s.includes(': Diagnóstico e Conduta'));
        const entry = { especialidade: esp, tema, foco, subfocosList };
        compositeFocoMap.set(`${espLower}|||${focoLower}`, entry);
        if (!focoFallbackMap.has(focoLower)) focoFallbackMap.set(focoLower, []);
        focoFallbackMap.get(focoLower).push(entry);

        for (const sub of subfocosList) {
          canonicalTuples.add(`${esp}|||${tema}|||${foco}|||${sub}`);
        }
      }
    }
  }

  return { compositeFocoMap, focoFallbackMap, canonicalTuples };
}

const canonicalIndex = buildCanonicalFocoIndex(rawTreeData);

const ESPECIALIDADE_ALIASES = {
  'Cirurgia': ['Cirurgia Geral', 'Cirurgia'],
  'Cirurgia Geral': ['Cirurgia Geral', 'Cirurgia'],
  'Medicina Preventiva': ['Medicina Preventiva e Social', 'Medicina Preventiva'],
  'Medicina Preventiva e Social': ['Medicina Preventiva e Social', 'Medicina Preventiva'],
  'Ginecologia': ['Ginecologia', 'Ginecologia e Obstetrícia'],
  'Obstetrícia': ['Obstetrícia', 'Ginecologia e Obstetrícia'],
  'Clínica Médica': ['Clínica Médica'],
  'Pediatria': ['Pediatria']
};

function resolveCanonicalFoco(origEsp, origFoco) {
  const focoLow = (origFoco || '').toLowerCase().trim();
  const espLow = (origEsp || '').toLowerCase().trim();

  const aliases = ESPECIALIDADE_ALIASES[origEsp] || [origEsp];
  for (const alias of aliases) {
    const compositeKey = `${alias.toLowerCase().trim()}|||${focoLow}`;
    if (canonicalIndex.compositeFocoMap.has(compositeKey)) {
      return canonicalIndex.compositeFocoMap.get(compositeKey);
    }
  }

  const candidates = canonicalIndex.focoFallbackMap.get(focoLow) || [];
  if (candidates.length === 1) return candidates[0];
  if (candidates.length > 1) {
    const aliasLowers = aliases.map(a => a.toLowerCase().trim());
    const matched = candidates.filter(c => aliasLowers.includes(c.especialidade.toLowerCase().trim()));
    if (matched.length === 1) return matched[0];
  }
  return null;
}

// Open DB
const db = new DatabaseSync(DB_PATH);
const allQuarantine = db.prepare(`
  SELECT id, code, especialidade, tema, foco, subfoco,
         antigo_tema, antigo_foco, antigo_subfoco,
         novo_tema, novo_foco,
         statement, options, correct_answer, commentary
  FROM questions
  WHERE status_recategorizacao = 'QUARENTENA_ANALISE_HUMANA'
  ORDER BY id ASC
`).all();

// Filter questions that can be mapped to a canonical foco with at least 2 subfocos
const eligible = [];
for (const q of allQuarantine) {
  const origEsp = q.especialidade;
  const currFoco = q.novo_foco || q.antigo_foco || q.foco;
  const canonical = resolveCanonicalFoco(origEsp, currFoco);
  if (canonical && canonical.subfocosList && canonical.subfocosList.length >= 2) {
    eligible.push({ question: q, canonical });
  }
}

console.log(`Eligible quarantined questions with canonical focus: ${eligible.length}`);

// We need 10 questions.
// To make batching realistic and fair, let's take:
// Group 1 (Single 1:1): 5 questions
// Group 2 (Batch 5:1): 5 questions (from a single foco so they share candidate subfocos, or similar focos)
const singleQuestions = eligible.slice(0, 5);

// For batch, find 5 questions sharing the same foco
const focoGroups = new Map();
for (let i = 5; i < eligible.length; i++) {
  const item = eligible[i];
  const key = `${item.canonical.especialidade}|||${item.canonical.foco}`;
  if (!focoGroups.has(key)) focoGroups.set(key, []);
  focoGroups.get(key).push(item);
}

let batchQuestions = null;
for (const [key, items] of focoGroups.entries()) {
  if (items.length >= 5) {
    batchQuestions = items.slice(0, 5);
    break;
  }
}

if (!batchQuestions) {
  batchQuestions = eligible.slice(5, 10);
}

// Helper to call Gemini 1:1
async function callGeminiSingle(item) {
  const q = item.question;
  const c = item.canonical;

  let optsText = '';
  try {
    const opts = typeof q.options === 'string' ? JSON.parse(q.options || '[]') : (q.options || []);
    optsText = opts.map(o => `${o.letter}) ${o.text}`).join('\n');
  } catch (_) {}

  const prompt = `Você é um Professor e Preceptor Médico de Residência Médica da plataforma Banco Residência.
Classifique a questão na árvore de filtros oficial.

SUBFOCOS VÁLIDOS (Escolha estritamente UM):
${JSON.stringify(c.subfocosList, null, 2)}

DADOS DA QUESTÃO:
- ID: ${q.id}
- Especialidade: ${c.especialidade}
- Tema: ${c.tema}
- Foco: ${c.foco}
- Enunciado: ${q.statement}
- Alternativas:
${optsText}
- Gabarito Oficial: Alternativa ${q.correct_answer}
- Comentário do Professor: ${q.commentary ? q.commentary.slice(0, 300) : 'N/A'}

RESPONDA ESTRITAMENTE EM FORMATO JSON:
{
  "subfoco_escolhido": "NOME_EXATO_DE_UM_DOS_SUBFOCOS_VALIDOS",
  "justificativa_clinica": "Explicação concisa (1-2 frases) do motivo médico pelo qual a questão se enquadra exatamente neste subfoco."
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
  const t0 = Date.now();
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, responseMimeType: 'application/json' }
    })
  });
  const t1 = Date.now();
  const json = await res.json();
  if (!res.ok || !json.candidates) {
    console.error('API Error in Single:', json);
    throw new Error(`API Error: ${json.error?.message || 'No candidate'}`);
  }
  const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  const parsed = JSON.parse(rawText.replace(/```json\s*|\s*```/g, '').trim());

  return {
    id: q.id,
    statement: q.statement,
    options: optsText,
    correct_answer: q.correct_answer,
    especialidade: c.especialidade,
    tema: c.tema,
    foco: c.foco,
    subfocos_disponiveis: c.subfocosList,
    subfoco_escolhido: parsed.subfoco_escolhido,
    justificativa_clinica: parsed.justificativa_clinica,
    latency_ms: t1 - t0
  };
}

// Helper to call Gemini Batch 5:1
async function callGeminiBatch(items) {
  const c = items[0].canonical;

  const questionsPayload = items.map(item => {
    const q = item.question;
    let opts = [];
    try {
      opts = typeof q.options === 'string' ? JSON.parse(q.options || '[]') : (q.options || []);
    } catch (_) {}
    return {
      id: q.id,
      enunciado: q.statement,
      alternativas: opts.map(o => `${o.letter}) ${o.text}`).join(' | '),
      gabarito: `Alternativa ${q.correct_answer}`
    };
  });

  const prompt = `Você é um Professor e Preceptor Médico de Residência Médica da plataforma Banco Residência.
Classifique o LOTE DE 5 QUESTÕES abaixo na árvore de filtros oficial.

ESPECIALIDADE: ${c.especialidade}
TEMA: ${c.tema}
FOCO: ${c.foco}

SUBFOCOS VÁLIDOS (Cada questão DEVE receber estritamente UM destes subfocos):
${JSON.stringify(c.subfocosList, null, 2)}

LOTE DE QUESTÕES A CLASSIFICAR:
${JSON.stringify(questionsPayload, null, 2)}

RESPONDA ESTRITAMENTE COM UM ARRAY JSON DE 5 OBJETOS NO SEGUINTE FORMATO:
[
  {
    "id": 12345,
    "subfoco_escolhido": "NOME_EXATO_DE_UM_DOS_SUBFOCOS_VALIDOS",
    "justificativa_clinica": "Explicação médica concisa."
  }
]`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
  const t0 = Date.now();
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, responseMimeType: 'application/json' }
    })
  });
  const t1 = Date.now();
  const json = await res.json();
  if (!res.ok || !json.candidates) {
    console.error('API Error in Batch:', json);
    throw new Error(`API Error: ${json.error?.message || 'No candidate'}`);
  }
  const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  const parsedArray = JSON.parse(rawText.replace(/```json\s*|\s*```/g, '').trim());

  const results = items.map(item => {
    const q = item.question;
    let optsText = '';
    try {
      const opts = typeof q.options === 'string' ? JSON.parse(q.options || '[]') : (q.options || []);
      optsText = opts.map(o => `${o.letter}) ${o.text}`).join('\n');
    } catch (_) {}
    const decision = parsedArray.find(p => p.id === q.id) || parsedArray[items.indexOf(item)];

    return {
      id: q.id,
      statement: q.statement,
      options: optsText,
      correct_answer: q.correct_answer,
      especialidade: c.especialidade,
      tema: c.tema,
      foco: c.foco,
      subfocos_disponiveis: c.subfocosList,
      subfoco_escolhido: decision ? decision.subfoco_escolhido : 'PARSING_ERROR',
      justificativa_clinica: decision ? decision.justificativa_clinica : 'PARSING_ERROR',
      latency_ms: t1 - t0
    };
  });

  return { results, total_latency_ms: t1 - t0 };
}

async function main() {
  console.log('🚀 Executando Teste Comparativo...');
  console.log('--- FASE 1: 5 QUESTÕES NO MODO 1:1 (1 REQUISIÇÃO POR QUESTÃO) ---');
  const singleResults = [];
  let singleTotalLatency = 0;
  for (let i = 0; i < singleQuestions.length; i++) {
    console.log(`  Processando questão 1:1 (${i + 1}/5) ID ${singleQuestions[i].question.id}...`);
    const res = await callGeminiSingle(singleQuestions[i]);
    singleResults.push(res);
    singleTotalLatency += res.latency_ms;
  }

  console.log('\n--- FASE 2: 5 QUESTÕES NO MODO BATCH (1 LOTE DE 5 QUESTÕES) ---');
  console.log(`  Processando lote de 5 questões em 1 única requisição...`);
  const batchRes = await callGeminiBatch(batchQuestions);

  const output = {
    singleTotalLatency,
    singleResults,
    batchTotalLatency: batchRes.total_latency_ms,
    batchResults: batchRes.results
  };

  fs.writeFileSync('scripts/resultado_teste_comparativo.json', JSON.stringify(output, null, 2), 'utf8');
  console.log('✅ Teste concluído com sucesso! Resultados salvos em scripts/resultado_teste_comparativo.json');
}

main().catch(console.error);
