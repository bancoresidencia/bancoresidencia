import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

/**
 * ========================================================================
 * RESOLVEDOR PERICIAL DE QUARENTENA EM PARALELO MULTI-WORKER (FREE TIER)
 * ========================================================================
 * 
 * Funcionalidade:
 *   Processa a quarentena em lote (batching) com PARALELISMO REAL:
 *   cada chave de API do pool opera como um worker concorrente independente.
 *   Com 6 chaves a 14 RPM em lotes de 5, atinge até 420 questões por minuto!
 * 
 * Opções de Filtro:
 *   --apenas-so-subfoco    Processa APENAS focos que NÃO possuem Sub-subfoco (só nível 4)
 *   --apenas-com-subsub    Processa APENAS focos que POSSUEM Sub-subfoco (nível 4 + 5)
 *   --batch <n>            Tamanho do lote por requisição (Padrão: 5)
 *   --concurrency <n>      Número de workers simultâneos (Padrão: total de chaves ativas)
 *   --execute              Grava as decisões no SQLite local (Padrão: simulação auditada)
 *   --limit <n>            Processa no máximo N questões
 *   --especialidade <nome> Filtra apenas uma especialidade
 */

// 1. Carrega Variáveis de Ambiente (.env.local)
const env = {};
const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

// 2. Argumentos da Linha de Comando (CLI)
const args = process.argv.slice(2);
const getArg = (flag, defaultVal = null) => {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : defaultVal;
};
const hasFlag = (flag) => args.includes(flag);

const SINGLE_KEY_ENV = getArg('--key-env', null);

const RAW_API_KEYS = SINGLE_KEY_ENV
  ? [env[SINGLE_KEY_ENV]].filter(Boolean)
  : Object.keys(env)
      .filter(k => k.startsWith('GEMINI_API_KEY'))
      .map(k => env[k])
      .filter((k, idx, self) => k && k.length > 10 && self.indexOf(k) === idx);

if (RAW_API_KEYS.length === 0) {
  console.error(`❌ Nenhuma chave válida encontrada${SINGLE_KEY_ENV ? ` para a variável ${SINGLE_KEY_ENV}` : ''} em .env.local`);
  process.exit(1);
}

if (hasFlag('--help') || hasFlag('-h')) {
  console.log(`
Resolvedor Pericial de Quarentena em Paralelo (Multi-Worker Free Tier)

Opções:
  --execute              Aplica e grava as decisões no SQLite local (Padrão: simulação auditada)
  --apenas-so-subfoco    Filtra APENAS questões onde a árvore termina no Subfoco (sem 5º nível)
  --apenas-com-subsub    Filtra APENAS questões que possuem Sub-subfocos cadastrados (5º nível)
  --batch <n>            Tamanho do lote por requisição (Padrão: 5)
  --concurrency <n>      Número de workers paralelos (Padrão: número de chaves disponíveis)
  --limit <n>            Processa no máximo N questões
  --especialidade <nome> Filtra apenas uma especialidade
  --model <nome>         Modelo Gemini principal (Padrão: gemini-3.1-flash-lite)
  --help                 Exibe esta ajuda
  `);
  process.exit(0);
}

const IS_EXECUTE           = hasFlag('--execute');
const ONLY_SO_SUBFOCO      = hasFlag('--apenas-so-subfoco') || hasFlag('--only-so-subfoco') || hasFlag('--only-subfoco');
const ONLY_COM_SUBSUB      = hasFlag('--apenas-com-subsub') || hasFlag('--only-subsub');
const BATCH_SIZE           = getArg('--batch') ? Math.max(1, parseInt(getArg('--batch'), 10)) : 5;
const MAX_CONCURRENCY      = getArg('--concurrency') ? parseInt(getArg('--concurrency'), 10) : RAW_API_KEYS.length;
const RUN_LIMIT            = getArg('--limit') ? parseInt(getArg('--limit'), 10) : null;
const DEFAULT_TREE         = fs.existsSync('data/catalogo_arvore_canonica_completa.json')
  ? 'data/catalogo_arvore_canonica_completa.json'
  : (fs.existsSync('src/data/hierarquiaCompletaFiltros.json')
      ? 'src/data/hierarquiaCompletaFiltros.json'
      : 'docs/hierarquia_completa_filtros_recategorizada.json');
const TREE_PATH            = getArg('--tree', DEFAULT_TREE);
const ESPECIALIDADE_FILTER = getArg('--especialidade', null);
const MODEL_NAME           = getArg('--model', 'gemini-3.1-flash-lite');
const DB_PATH              = path.resolve('data/questoes_132k.db');

if (!fs.existsSync(DB_PATH)) {
  console.error(`❌ Banco de dados SQLite não encontrado em: ${DB_PATH}`);
  process.exit(1);
}
if (!fs.existsSync(TREE_PATH)) {
  console.error(`❌ Árvore canônica não encontrada em: ${TREE_PATH}`);
  process.exit(1);
}

// Pre-Flight de Saúde das Chaves
console.log('🔍 Executando Pre-Flight Check de Saúde das Chaves do Pool...');
const API_KEYS = [];
for (const k of RAW_API_KEYS) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${k}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'PING' }] }] }),
      signal: AbortSignal.timeout(15000)
    });
    if (res.ok) {
      API_KEYS.push(k);
      console.log(`  ✅ Chave (...${k.slice(-6)}): ATIVA E PRONTA`);
    } else {
      if (res.status === 429) {
        console.warn(`  ⏸️  Chave (...${k.slice(-6)}): Cota diária esgotada hoje`);
      } else if (res.status === 401) {
        console.warn(`  ❌ Chave (...${k.slice(-6)}): Chave desativada/inválida`);
      } else {
        console.warn(`  ⚠️  Chave (...${k.slice(-6)}): Status HTTP ${res.status}`);
      }
    }
  } catch (e) {
    console.warn(`  ⚠️  Chave (...${k.slice(-6)}): Timeout de rede`);
  }
}

if (API_KEYS.length === 0) {
  console.error('❌ Nenhuma chave do pool possui cota disponível no momento.');
  process.exit(1);
}

const numWorkers = Math.min(MAX_CONCURRENCY, API_KEYS.length);

console.log('\n========================================================================');
console.log('⚡ RESOLVEDOR PARALELO MULTI-WORKER DE QUARENTENA (GEMINI POOL)');
console.log(`🛡️  Modo: ${IS_EXECUTE ? '⚡ EXECUÇÃO ATIVA NO SQLITE LOCAL' : '🧪 SIMULAÇÃO AUDITADA (--dry-run)'}`);
console.log(`🔑 Pool Operacional: ${API_KEYS.length} chaves 100% ativas (.env.local)`);
console.log(`🚀 Paralelismo: ${numWorkers} workers simultâneos (1 por chave ativa)`);
console.log(`📦 Lotes: ${BATCH_SIZE} questões/requisição agrupadas por Foco`);
if (ONLY_SO_SUBFOCO) console.log(`🎯 Filtro: EXCLUSIVAMENTE QUESTÕES DE SUBFOCO (sem 5º nível)`);
if (ONLY_COM_SUBSUB) console.log(`🎯 Filtro: EXCLUSIVAMENTE QUESTÕES COM SUB-SUBFOCO (com 5º nível)`);
console.log(`🧠 Modelo: ${MODEL_NAME}`);
console.log(`🌲 Árvore: ${TREE_PATH}`);
console.log(`🔒 Custo: R$ 0,00 (Free Tier com Auto-Stop Seguro)`);
console.log('========================================================================\n');

// 3. Carrega e Indexa Árvore Canônica
const rawTreeData = JSON.parse(fs.readFileSync(TREE_PATH, 'utf8'));

export function buildCanonicalFocoIndex(inputTree) {
  const specialties      = new Set();
  const compositeFocoMap = new Map();
  const focoFallbackMap  = new Map();
  const canonicalTuples  = new Set();

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
    specialties.add(esp);
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

        for (const sub of subfocosList) {
          canonicalTuples.add(`${esp}|||${tema}|||${foco}|||${sub}`);
          const subSubs = subSubfocosMap.get(sub.toLowerCase().trim()) || [];
          for (const ss of subSubs) {
            canonicalTuples.add(`${esp}|||${tema}|||${foco}|||${sub}|||${ss}`);
          }
        }
      }
    }
  }

  return { specialties, compositeFocoMap, focoFallbackMap, canonicalTuples };
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

// 4. Rate Limiter Individual por Worker/Chave (14 RPM)
class WorkerRateLimiter {
  constructor() {
    this.keyTimestamps = new Map();
  }

  async waitTurn(apiKey) {
    if (!this.keyTimestamps.has(apiKey)) {
      this.keyTimestamps.set(apiKey, []);
    }
    const timestamps = this.keyTimestamps.get(apiKey);

    while (true) {
      const now = Date.now();
      // Remove marcas de mais de 60 segundos
      const valid = timestamps.filter(t => now - t < 60000);
      this.keyTimestamps.set(apiKey, valid);

      if (valid.length < 14) {
        valid.push(now);
        return;
      }

      const oldest = Math.min(...valid);
      const waitMs = Math.max(500, 60000 - (now - oldest) + 200);
      await new Promise(r => setTimeout(r, waitMs));
    }
  }
}

const rateLimiter = new WorkerRateLimiter();
const exhaustedKeys = new Set();

function isKeyExhausted(key) {
  return exhaustedKeys.has(key);
}
function markKeyExhausted(key, reason = 'Daily Quota 429') {
  if (!exhaustedKeys.has(key)) {
    exhaustedKeys.add(key);
    console.warn(`\n  ⚠️  Worker com chave (...${key.slice(-6)}) esgotou a cota diária (${reason}).`);
    console.warn(`     Restam ${API_KEYS.length - exhaustedKeys.size} workers ativos.`);
  }
}

// 5. Chamada de Inferência Médica Estruturada para o Lote
const MODEL_FALLBACKS = [
  MODEL_NAME,
  'gemini-3.5-flash-lite',
  'gemini-2.5-flash'
].filter((m, idx, self) => self.indexOf(m) === idx);

async function callBatchWithKey(items, canonicalFoco, apiKey) {
  const hasSubSubsInFoco = Array.from(canonicalFoco.subSubfocosMap.values()).some(list => Array.isArray(list) && list.length > 0);

  const questionsPayload = items.map(item => {
    const q = item.question;
    let optsText = '';
    try {
      const opts = typeof q.options === 'string' ? JSON.parse(q.options || '[]') : (q.options || []);
      optsText = opts.map(o => `${o.letter}) ${o.text}`).join(' | ');
    } catch (_) {}

    return {
      id: q.id,
      enunciado: q.statement || '',
      alternativas: optsText,
      gabarito_oficial: `Alternativa ${q.correct_answer || ''}`,
      comentario_curto: q.commentary ? q.commentary.slice(0, 300) : ''
    };
  });

  let prompt = '';

  // Prompt enxuto e ultrarrápido para questões que são SÓ SUBFOCO
  if (!hasSubSubsInFoco || ONLY_SO_SUBFOCO) {
    prompt = `Você é um Professor e Preceptor Médico de Residência Médica da plataforma Banco Residência.
Classifique o LOTE DE QUESTÕES abaixo na árvore taxonômica oficial.

ESPECIALIDADE: ${canonicalFoco.especialidade}
TEMA: ${canonicalFoco.tema}
FOCO: ${canonicalFoco.foco}

SUBFOCOS VÁLIDOS (Escolha estritamente UM por questão):
${JSON.stringify(canonicalFoco.subfocosList, null, 2)}

REGRAS:
1. Para cada questão, escolha OBRIGATORIAMENTE um dos nomes exatos da lista de Subfocos acima.
2. Analise o que o examinador realmente está cobrando (comando terminal + gabarito oficial da banca).

LOTE DE QUESTÕES:
${JSON.stringify(questionsPayload, null, 2)}

RESPONDA ESTRITAMENTE EM FORMATO JSON COMO UM ARRAY DE OBJETOS:
[
  {
    "id": "ID_EXATO_DA_QUESTAO",
    "subfoco_escolhido": "NOME_EXATO_DO_SUBFOCO",
    "justificativa_clinica": "Explicação médica concisa (1 frase)."
  }
]`;
  } else {
    // Prompt completo com suporte a 5º nível
    const candidatesStructure = canonicalFoco.subfocosList.map(sub => {
      const subSubs = canonicalFoco.subSubfocosMap.get(sub.toLowerCase().trim()) || [];
      return {
        subfoco: sub,
        possui_sub_subfocos: subSubs.length > 0,
        sub_subfocos: subSubs
      };
    });

    prompt = `Você é um Professor e Preceptor Médico de Residência Médica da plataforma Banco Residência.
Classifique o LOTE DE QUESTÕES abaixo na árvore taxonômica oficial.

ESPECIALIDADE: ${canonicalFoco.especialidade}
TEMA: ${canonicalFoco.tema}
FOCO: ${canonicalFoco.foco}

SUBFOCOS E SUB-SUBFOCOS VÁLIDOS:
${JSON.stringify(candidatesStructure, null, 2)}

REGRAS:
1. Escolha OBRIGATORIAMENTE um dos "subfoco" válidos da lista acima.
2. Se o subfoco possuir "sub_subfocos", escolha também o "sub_subfoco" correspondente (senão defina null).

LOTE DE QUESTÕES:
${JSON.stringify(questionsPayload, null, 2)}

RESPONDA ESTRITAMENTE EM JSON:
[
  {
    "id": "ID_EXATO",
    "subfoco_escolhido": "NOME_DO_SUBFOCO",
    "sub_subfoco_escolhido": "NOME_DO_SUB_SUBFOCO ou null",
    "justificativa_clinica": "Explicação concisa (1 frase)."
  }
]`;
  }

  let totalAttempts = 0;
  const maxAttempts = 4;

  while (totalAttempts < maxAttempts) {
    totalAttempts++;

    for (const model of MODEL_FALLBACKS) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json'
            }
          }),
          signal: AbortSignal.timeout(15000)
        });

        if (res.status === 401 || res.status === 403) {
          markKeyExhausted(apiKey, `Conta de Serviço / Chave Desativada (${res.status})`);
          return { status: 'ALL_EXHAUSTED' };
        }

        if (res.status === 429) {
          const errorBody = await res.text();
          const isDailyQuota =
            errorBody.includes('PerDay') ||
            errorBody.includes('requests per day') ||
            errorBody.includes('per day limit exceeded') ||
            errorBody.includes('quota exceeded for the day') ||
            /retry in \d+h/.test(errorBody);

          if (isDailyQuota) {
            markKeyExhausted(apiKey, 'Cota Diária RPD');
            return { status: 'ALL_EXHAUSTED' };
          } else {
            // Rate limit transitório por minuto (RPM / TPM)
            let waitSeconds = 16;
            const match = errorBody.match(/retry in ([\d\.]+)s/) || errorBody.match(/"retryDelay":\s*"(\d+)s"/);
            if (match) {
              waitSeconds = Math.ceil(parseFloat(match[1])) + 2;
            }
            await new Promise(r => setTimeout(r, waitSeconds * 1000));
            break; // Quebra o for para o while retentar com o modelo principal
          }
        }

        if (!res.ok) continue;

        const jsonRes = await res.json();
        const rawText = jsonRes?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) continue;

        let parsedArray = JSON.parse(rawText.replace(/```json\s*|\s*```/g, '').trim());
        if (!Array.isArray(parsedArray)) parsedArray = [parsedArray];

        return {
          status: 'SUCCESS',
          decisions: parsedArray,
          model
        };

      } catch (e) {
        // Timeout ou rede oscilando
      }
    }
  }

  return { status: 'FAILED' };
}

// 6. Conexão ao SQLite e Montagem da Fila
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA synchronous = NORMAL;');
db.exec('PRAGMA busy_timeout = 30000;');

let quarantineQuery = `
  SELECT id, code, especialidade, tema, foco, subfoco,
         antigo_tema, antigo_foco, antigo_subfoco,
         novo_tema, novo_foco,
         statement, options, correct_answer, commentary, is_anulada, motivo_regra
  FROM questions
  WHERE status_recategorizacao = 'QUARENTENA_ANALISE_HUMANA'
`;
const queryParams = [];

if (ESPECIALIDADE_FILTER) {
  quarantineQuery += ' AND especialidade = ?';
  queryParams.push(ESPECIALIDADE_FILTER);
}
quarantineQuery += ' ORDER BY id ASC';

const rawQuarantineRows = db.prepare(quarantineQuery).all(...queryParams);
console.log(`📋 Total de Questões na Quarentena: ${rawQuarantineRows.length.toLocaleString('pt-BR')}`);

if (rawQuarantineRows.length === 0) {
  console.log('🎉 Nenhuma questão em quarentena pendente de resolução!');
  db.close();
  process.exit(0);
}

// Agrupamento por Foco Canônico
const focoGroups = new Map();
let unmappedCount = 0;

for (const q of rawQuarantineRows) {
  const origEsp  = q.especialidade;
  let currFoco   = q.novo_foco || q.antigo_foco || q.foco;
  let canonicalFoco = resolveCanonicalFoco(origEsp, currFoco);

  if ((!canonicalFoco || !canonicalFoco.subfocosList || canonicalFoco.subfocosList.length === 0) && q.antigo_foco && q.antigo_foco !== currFoco) {
    const fallback = resolveCanonicalFoco(origEsp, q.antigo_foco);
    if (fallback && fallback.subfocosList && fallback.subfocosList.length > 0) canonicalFoco = fallback;
  }
  if ((!canonicalFoco || !canonicalFoco.subfocosList || canonicalFoco.subfocosList.length === 0) && q.foco && q.foco !== currFoco) {
    const fallback = resolveCanonicalFoco(origEsp, q.foco);
    if (fallback && fallback.subfocosList && fallback.subfocosList.length > 0) canonicalFoco = fallback;
  }

  if (!canonicalFoco || !canonicalFoco.subfocosList || canonicalFoco.subfocosList.length === 0) {
    unmappedCount++;
    continue;
  }

  const hasSubSubs = Array.from(canonicalFoco.subSubfocosMap.values()).some(list => Array.isArray(list) && list.length > 0);

  // Aplicação dos Filtros Exclusivos
  if (ONLY_SO_SUBFOCO && hasSubSubs) continue; // Pula focos que têm 5º nível
  if (ONLY_COM_SUBSUB && !hasSubSubs) continue; // Pula focos que não têm 5º nível

  const groupKey = `${canonicalFoco.especialidade}|||${canonicalFoco.foco}`;
  if (!focoGroups.has(groupKey)) {
    focoGroups.set(groupKey, { canonicalFoco, items: [] });
  }
  focoGroups.get(groupKey).items.push({ question: q, canonicalFoco });
}

// Monta Fila de Lotes respeitando RUN_LIMIT
const batchQueue = [];
let totalFiltered = Array.from(focoGroups.values()).reduce((acc, g) => acc + g.items.length, 0);
let targetLimit = RUN_LIMIT || totalFiltered;
let scheduled = 0;

for (const [key, group] of focoGroups.entries()) {
  if (scheduled >= targetLimit) break;
  const items = group.items;
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    if (scheduled >= targetLimit) break;
    const chunk = items.slice(i, Math.min(items.length, i + BATCH_SIZE, i + (targetLimit - scheduled)));
    batchQueue.push({
      canonicalFoco: group.canonicalFoco,
      items: chunk
    });
    scheduled += chunk.length;
  }
}

console.log(`📦 Fila Paralela: ${batchQueue.length.toLocaleString('pt-BR')} lotes montados para ${scheduled.toLocaleString('pt-BR')} questões agendadas (${totalFiltered.toLocaleString('pt-BR')} elegíveis no filtro)`);

if (batchQueue.length === 0) {
  console.log('🎉 Nenhuma questão encontrada para os critérios selecionados!');
  db.close();
  process.exit(0);
}

// Statement de Atualização com Proteção Transacional
const updateStmt = IS_EXECUTE ? db.prepare(`
  UPDATE questions SET
    novo_tema             = ?,
    novo_foco             = ?,
    novo_subfoco          = ?,
    novo_sub_subfoco      = ?,
    status_recategorizacao = ?,
    motivo_regra          = ?
  WHERE id = ?;
`) : null;

// 7. Orquestração Paralela Multi-Worker
let queueIndex       = 0;
let resolvedCount    = 0;
let subSubResolved   = 0;
let skippedCount     = 0;
const startTime      = Date.now();

function getNextBatch() {
  if (queueIndex >= batchQueue.length) return null;
  return batchQueue[queueIndex++];
}

function saveDecisions(result, items, canonicalFoco) {
  for (const item of items) {
    const q = item.question;
    const decision = result.decisions.find(d => String(d.id).trim() === String(q.id).trim()) ||
                     result.decisions[items.indexOf(item)];

    if (!decision || !decision.subfoco_escolhido) {
      skippedCount++;
      continue;
    }

    let chosenSubfoco = String(decision.subfoco_escolhido).trim();

    // Invariante I4: Zero Sufixos Artificiais
    if (chosenSubfoco.includes(': Diagnóstico e Conduta')) {
      chosenSubfoco = chosenSubfoco.replace(': Diagnóstico e Conduta', '').trim();
    }

    // Validação do Subfoco
    let matchedSubfoco = canonicalFoco.subfocosList.find(s => s === chosenSubfoco) ||
                         canonicalFoco.subfocosList.find(s => s.toLowerCase().trim() === chosenSubfoco.toLowerCase());

    if (!matchedSubfoco) {
      skippedCount++;
      continue;
    }

    // Invariante I3: Anti-Duplicação
    if (matchedSubfoco.toLowerCase().trim() === canonicalFoco.foco.toLowerCase().trim()) {
      skippedCount++;
      continue;
    }

    // Invariante I2: Tupla Fechada
    const tuple4 = `${canonicalFoco.especialidade}|||${canonicalFoco.tema}|||${canonicalFoco.foco}|||${matchedSubfoco}`;
    if (!canonicalIndex.canonicalTuples.has(tuple4)) {
      skippedCount++;
      continue;
    }

    // 5º Nível (Sub-subfoco, se aplicável)
    let matchedSubSubfoco = null;
    const availableSubSubs = canonicalFoco.subSubfocosMap.get(matchedSubfoco.toLowerCase().trim()) || [];

    if (availableSubSubs.length > 0 && decision.sub_subfoco_escolhido) {
      const rawSubSub = String(decision.sub_subfoco_escolhido).trim();
      matchedSubSubfoco = availableSubSubs.find(ss => ss === rawSubSub) ||
                          availableSubSubs.find(ss => ss.toLowerCase().trim() === rawSubSub.toLowerCase());

      if (matchedSubSubfoco) {
        const tuple5 = `${canonicalFoco.especialidade}|||${canonicalFoco.tema}|||${canonicalFoco.foco}|||${matchedSubfoco}|||${matchedSubSubfoco}`;
        if (!canonicalIndex.canonicalTuples.has(tuple5)) {
          matchedSubSubfoco = null;
        }
      }
    }

    const novoStatus = 'SUBFOCO_RESOLVIDO_LLM';
    let motivoFinal = `[Preceptor LLM ${result.model}] ${decision.justificativa_clinica || 'Classificado via Preceptor LLM'}`;
    if (matchedSubSubfoco) {
      motivoFinal += ` | Sub-subfoco: '${matchedSubSubfoco}'`;
    }

    if (IS_EXECUTE && updateStmt) {
      updateStmt.run(
        canonicalFoco.tema,
        canonicalFoco.foco,
        matchedSubfoco,
        matchedSubSubfoco || null,
        novoStatus,
        motivoFinal,
        q.id
      );
      resolvedCount++;
      if (matchedSubSubfoco) subSubResolved++;
    } else if (!IS_EXECUTE) {
      resolvedCount++;
      if (matchedSubSubfoco) subSubResolved++;
    }
  }

  const remaining = scheduled - resolvedCount;
  const activeWorkers = API_KEYS.length - exhaustedKeys.size;
  process.stdout.write(`\r   ⚡ [Paralelo] Resolvidas: ${resolvedCount.toLocaleString('pt-BR')} | Restantes: ${remaining.toLocaleString('pt-BR')} | Workers Ativos: ${activeWorkers}/${numWorkers} `);
}

async function startWorker(workerId, apiKey) {
  while (true) {
    if (exhaustedKeys.size >= API_KEYS.length) break;
    if (isKeyExhausted(apiKey)) break;

    const batch = getNextBatch();
    if (!batch) break; // Fila concluída!

    await rateLimiter.waitTurn(apiKey);

    const result = await callBatchWithKey(batch.items, batch.canonicalFoco, apiKey);

    if (result.status === 'ALL_EXHAUSTED') {
      break;
    }

    if (result.status === 'SUCCESS' && Array.isArray(result.decisions)) {
      saveDecisions(result, batch.items, batch.canonicalFoco);
    } else {
      // Re-agenda o lote para outro worker ativo tentar
      batchQueue.push(batch);
    }
  }
}

console.log(`🚀 Disparando ${numWorkers} Workers Paralelos...\n`);

const workerPromises = API_KEYS.slice(0, numWorkers).map((key, idx) => startWorker(idx + 1, key));
await Promise.all(workerPromises);

const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);

console.log('\n\n========================================================================');
console.log('📊 RELATÓRIO DE RESOLUÇÃO PARALELA (LLM FREE TIER):');
console.log('========================================================================');
console.log(`  • Questões Agendadas:           ${scheduled.toLocaleString('pt-BR')}`);
console.log(`  • Resolvidas com Sucesso:       ${resolvedCount.toLocaleString('pt-BR')} (${((resolvedCount / Math.max(1, scheduled)) * 100).toFixed(1)}%)`);
if (!ONLY_SO_SUBFOCO) {
  console.log(`  • Promovidas até Sub-subfoco:   ${subSubResolved.toLocaleString('pt-BR')} (5º nível hierárquico)`);
}
console.log(`  • Falhas / Pulos no Lote:       ${skippedCount.toLocaleString('pt-BR')}`);
if (unmappedCount > 0) {
  console.log(`  • Focos Não Mapeáveis na Base:  ${unmappedCount.toLocaleString('pt-BR')}`);
}
console.log(`  • Tempo Total de Execução:      ${elapsedSec}s`);
console.log(`  • Status da Cota Diária:        ${exhaustedKeys.size >= API_KEYS.length ? '⏸️  Pausado por esgotamento de cotas em todas as chaves' : '✅ Finalizado com chaves ativas'}`);
console.log('========================================================================\n');

// Quality Gates
if (IS_EXECUTE && resolvedCount > 0) {
  console.log('🔍 Executando Quality Gates sobre as questões resolvidas...');
  
  const espCheckSql = ESPECIALIDADE_FILTER ? `AND especialidade = '${ESPECIALIDADE_FILTER.replace(/'/g, "''")}'` : '';

  const dupCheck = db.prepare(`
    SELECT COUNT(*) as c FROM questions 
    WHERE status_recategorizacao = 'SUBFOCO_RESOLVIDO_LLM' 
      AND LOWER(TRIM(novo_subfoco)) = LOWER(TRIM(novo_foco))
      ${espCheckSql}
  `).get().c;
  console.log(`  ${dupCheck === 0 ? '✅' : '❌'} Anti-Duplicação (novo_subfoco != novo_foco): ${dupCheck} inconsistências`);

  const sufixCheck = db.prepare(`
    SELECT COUNT(*) as c FROM questions 
    WHERE status_recategorizacao = 'SUBFOCO_RESOLVIDO_LLM' 
      AND novo_subfoco LIKE '%: Diagnóstico e Conduta%'
      ${espCheckSql}
  `).get().c;
  console.log(`  ${sufixCheck === 0 ? '✅' : '❌'} Zero Sufixos Artificiais: ${sufixCheck} inconsistências`);

  const histCheck = db.prepare(`
    SELECT COUNT(*) as c FROM questions 
    WHERE status_recategorizacao = 'SUBFOCO_RESOLVIDO_LLM' 
      AND (antigo_tema IS NULL OR antigo_foco IS NULL OR antigo_subfoco IS NULL)
      ${espCheckSql}
  `).get().c;
  console.log(`  ${histCheck === 0 ? '✅' : '❌'} Rastreabilidade Histórica (antigo_* 100% preservado): ${histCheck} inconsistências\n`);
}

db.close();
console.log('🔒 Banco de dados SQLite preservado e fechado com segurança.');
