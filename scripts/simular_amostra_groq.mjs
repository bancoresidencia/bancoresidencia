import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

// 1. Carrega Variáveis de Ambiente (.env.local)
const env = {};
const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const GROQ_API_KEY = env.GROQ_API_KEY || process.env.GROQ_API_KEY;
const MODEL_NAME   = 'openai/gpt-oss-120b';
const DB_PATH      = path.resolve('data/questoes_132k.db');
const TREE_PATH    = path.resolve('data/catalogo_arvore_canonica_completa.json');

if (!GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY não encontrada em .env.local');
  process.exit(1);
}

// 2. Conecta ao SQLite em Modo Somente Leitura (READ-ONLY)
const db = new DatabaseSync(DB_PATH, { readOnly: true });

// 3. Carrega e Indexa Árvore Canônica
const rawTreeData = JSON.parse(fs.readFileSync(TREE_PATH, 'utf8'));

function buildCanonicalFocoIndex(inputTree) {
  const compositeFocoMap = new Map();
  const focoFallbackMap  = new Map();

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
        const subSubfocosMap = new Map();

        const processSubItem = (item) => {
          if (typeof item === 'string') {
            subfocosList.push(item);
          } else if (item && typeof item === 'object') {
            const subName = item.subfoco || item.nome;
            if (subName) {
              subfocosList.push(subName);
              if (Array.isArray(item.sub_subfocos)) {
                subSubfocosMap.set(subName.toLowerCase().trim(), item.sub_subfocos);
              }
            }
          }
        };

        if (Array.isArray(focoData)) {
          for (const item of focoData) processSubItem(item);
        } else if (focoData && typeof focoData.subfocos === 'object') {
          if (Array.isArray(focoData.subfocos)) {
            for (const item of focoData.subfocos) processSubItem(item);
          } else {
            for (const [subName, subVal] of Object.entries(focoData.subfocos)) {
              subfocosList.push(subName);
              if (Array.isArray(subVal)) {
                subSubfocosMap.set(subName.toLowerCase().trim(), subVal);
              } else if (subVal && typeof subVal === 'object' && subVal.sub_subfocos) {
                subSubfocosMap.set(subName.toLowerCase().trim(), subVal.sub_subfocos);
              }
            }
          }
        }

        subfocosList = subfocosList.filter(s => !s.includes(': Diagnóstico e Conduta'));

        const entry = { especialidade: esp, tema, foco, subfocosList, subSubfocosMap };
        compositeFocoMap.set(`${espLower}|||${focoLower}`, entry);

        if (!focoFallbackMap.has(focoLower)) focoFallbackMap.set(focoLower, []);
        focoFallbackMap.get(focoLower).push(entry);
      }
    }
  }

  return { compositeFocoMap, focoFallbackMap };
}

const canonicalIndex = buildCanonicalFocoIndex(rawTreeData);

// 4. Seleciona 3 questões representativas da quarentena
const sampleQuery = `
  SELECT id, code, especialidade, tema, foco, subfoco,
         antigo_tema, antigo_foco, antigo_subfoco,
         novo_tema, novo_foco,
         statement, options, correct_answer, commentary
  FROM questions
  WHERE status_recategorizacao = 'QUARENTENA_ANALISE_HUMANA'
    AND id IN (
      '078d867e-3dab-4bfa-8628-c3878c721e91',
      '07a15e0d-f66e-4eb1-8802-3eef66bca956',
      '07af0236-cac9-4e1f-9b70-040276c6a9a5'
    )
  ORDER BY id ASC;
`;

const sampleQuestions = db.prepare(sampleQuery).all();

// 5. Para cada questão, envia para o modelo
const simulatedOutputs = [];

for (const q of sampleQuestions) {
  const espLower  = (q.especialidade || '').toLowerCase().trim();
  const focoLower = (q.novo_foco || q.foco || '').toLowerCase().trim();

  let canonicalEntry = canonicalIndex.compositeFocoMap.get(`${espLower}|||${focoLower}`);
  if (!canonicalEntry) {
    const fallbacks = canonicalIndex.focoFallbackMap.get(focoLower);
    if (fallbacks && fallbacks.length === 1) canonicalEntry = fallbacks[0];
  }

  if (!canonicalEntry) continue;

  const candidatesStructure = canonicalEntry.subfocosList.map(sub => {
    const subSubs = canonicalEntry.subSubfocosMap.get(sub.toLowerCase().trim()) || [];
    return {
      subfoco: sub,
      possui_sub_subfocos: subSubs.length > 0,
      sub_subfocos: subSubs
    };
  });

  let parsedOpts = [];
  try {
    parsedOpts = typeof q.options === 'string' ? JSON.parse(q.options || '[]') : (q.options || []);
  } catch (_) {}

  const optsText = parsedOpts.map(o => `${o.letter}) ${o.text}`).join('\n');

  const systemPrompt = `Você é um Professor e Preceptor Médico de Residência Médica da plataforma Banco Residência.
Classifique a questão na árvore taxonômica oficial.

ESPECIALIDADE: ${canonicalEntry.especialidade}
TEMA: ${canonicalEntry.tema}
FOCO: ${canonicalEntry.foco}

SUBFOCOS E SUB-SUBFOCOS VÁLIDOS (Escolha estritamente UM da lista abaixo):
${JSON.stringify(candidatesStructure, null, 2)}

REGRAS:
1. Escolha OBRIGATORIAMENTE um dos "subfoco" válidos da lista acima.
2. Se o subfoco possuir "sub_subfocos", escolha também o "sub_subfoco" correspondente (senão defina null).
3. Responda ESTRITAMENTE em formato JSON:
{
  "decisoes": [
    {
      "id": "${q.id}",
      "subfoco_escolhido": "NOME_DO_SUBFOCO",
      "sub_subfoco_escolhido": "NOME_DO_SUB_SUBFOCO ou null",
      "justificativa_clinica": "Explicação médica concisa em 1 frase baseada no caso clínico."
    }
  ]
}`;

  const userPrompt = `ENUNCIADO:
${q.statement || ''}

ALTERNATIVAS:
${optsText}

GABARITO OFICIAL: Alternativa ${q.correct_answer || ''}`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 600
    })
  });

  if (!res.ok) {
    console.error('Erro:', await res.text());
    continue;
  }

  const jsonRes = await res.json();
  const rawContent = jsonRes?.choices?.[0]?.message?.content;
  const parsed = JSON.parse(rawContent.trim());
  const decision = Array.isArray(parsed) ? parsed[0] : (parsed.decisoes?.[0] || parsed.decisions?.[0] || parsed);

  simulatedOutputs.push({
    id: q.id,
    code: q.code,
    especialidade: canonicalEntry.especialidade,
    tema: canonicalEntry.tema,
    foco: canonicalEntry.foco,
    subfocos_disponiveis: canonicalEntry.subfocosList,
    subfoco_escolhido: decision.subfoco_escolhido,
    sub_subfoco_escolhido: decision.sub_subfoco_escolhido || null,
    justificativa_clinica: decision.justificativa_clinica,
    enunciado: q.statement,
    alternativas: parsedOpts,
    gabarito: q.correct_answer
  });
}

db.close();

fs.writeFileSync('scripts/amostra_simulada_resultado.json', JSON.stringify(simulatedOutputs, null, 2), 'utf8');
console.log('SIMULACAO_CONCLUIDA');
