import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

/**
 * ========================================================================
 * REFINADOR DE 5º NÍVEL (SUB-SUBFOCOS) PARA QUESTÕES JÁ CLASSIFICADAS
 * ========================================================================
 * 
 * Objetivo:
 *   Promove as ~7.203 questões que já foram classificadas com sucesso
 *   (Tema, Foco e Subfoco válidos), mas cujo subfoco possui desdobramentos
 *   de 5º nível (Sub-subfocos) na árvore canônica que ainda estão vazios (NULL).
 * 
 * Vantagens:
 *   1. Cirúrgico: NÃO altera o Tema, nem o Foco, nem o Subfoco já homologados.
 *   2. Eficiência Máxima: Envia lotes de questões agrupadas pelo MESMO Subfoco.
 *   3. 100% Gratuito: Opera no Free Tier com Auto-Stop e rotação das 6 chaves.
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

const API_KEYS = Object.keys(env)
  .filter(k => k.startsWith('GEMINI_API_KEY'))
  .map(k => env[k])
  .filter((k, idx, self) => k && k.length > 10 && self.indexOf(k) === idx);

if (API_KEYS.length === 0) {
  console.error('❌ Nenhuma chave GEMINI_API_KEY válida encontrada em .env.local');
  process.exit(1);
}

// 2. Argumentos CLI
const args = process.argv.slice(2);
const getArg = (flag, defaultVal = null) => {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : defaultVal;
};
const hasFlag = (flag) => args.includes(flag);

if (hasFlag('--help') || hasFlag('-h')) {
  console.log(`
Refinador de 5º Nível (Sub-subfocos) para Questões Já Classificadas

Opções:
  --execute              Aplica e grava as decisões no SQLite local (Padrão: simulação auditada)
  --batch <n>            Tamanho do lote por requisição (Padrão: 5)
  --limit <n>            Processa no máximo N questões
  --especialidade <nome> Filtra apenas uma especialidade (Ex: "Clínica Médica")
  --model <nome>         Modelo Gemini principal (Padrão: gemini-3.1-flash-lite)
  --help                 Exibe esta ajuda
  `);
  process.exit(0);
}

const IS_EXECUTE           = hasFlag('--execute');
const BATCH_SIZE           = getArg('--batch') ? Math.max(1, parseInt(getArg('--batch'), 10)) : 5;
const RUN_LIMIT            = getArg('--limit') ? parseInt(getArg('--limit'), 10) : null;
const ESPECIALIDADE_FILTER = getArg('--especialidade', null);
const MODEL_NAME           = getArg('--model', 'gemini-3.1-flash-lite');
const DB_PATH              = path.resolve('data/questoes_132k.db');
const TREE_PATH            = path.resolve('data/catalogo_arvore_canonica_completa.json');

if (!fs.existsSync(DB_PATH)) {
  console.error(`❌ Banco de dados SQLite não encontrado em: ${DB_PATH}`);
  process.exit(1);
}
if (!fs.existsSync(TREE_PATH)) {
  console.error(`❌ Árvore canônica não encontrada em: ${TREE_PATH}`);
  process.exit(1);
}

console.log('========================================================================');
console.log('🎯 REFINADOR PERICIAL DE 5º NÍVEL (SUB-SUBFOCOS) - BANCO RESIDÊNCIA');
console.log(`🛡️  Modo: ${IS_EXECUTE ? '⚡ EXECUÇÃO ATIVA NO SQLITE LOCAL' : '🧪 SIMULAÇÃO AUDITADA (--dry-run)'}`);
console.log(`🔑 Pool de Chaves: ${API_KEYS.length} chaves ativas (.env.local)`);
console.log(`📦 Lotes: ${BATCH_SIZE} questões/requisição agrupadas por Subfoco`);
console.log(`🧠 Modelo: ${MODEL_NAME}`);
console.log(`🔒 Custo: R$ 0,00 (Free Tier com Auto-Stop)`);
console.log('========================================================================\n');

// 3. Carrega Árvore Canônica e Mapeia Subfocos que possuem Sub-subfocos
const cat = JSON.parse(fs.readFileSync(TREE_PATH, 'utf8'));
const subWithSubSubs = new Map(); // "esp|||subfoco" -> { esp, tema, foco, subfoco, subSubfocosList }

for (const esp of cat.hierarquia_padrao) {
  for (const t of (esp.temas || [])) {
    for (const f of (t.focos || [])) {
      for (const sf of (f.subfocos || [])) {
        if (Array.isArray(sf.sub_subfocos) && sf.sub_subfocos.length > 0) {
          const key = `${esp.especialidade}|||${sf.subfoco}`.toLowerCase().trim();
          subWithSubSubs.set(key, {
            especialidade: esp.especialidade,
            tema: t.tema,
            foco: f.foco,
            subfoco: sf.subfoco,
            subSubfocosList: sf.sub_subfocos
          });
        }
      }
    }
  }
}

console.log(`🌲 Subfocos no Catálogo com 5º Nível Disponível: ${subWithSubSubs.size}`);

// 4. Pool de Chaves com Rate Limit Guard
class FreeTierKeyPool {
  constructor(keys) {
    this.keys = keys.map(k => ({
      key: k,
      exhaustedToday: false,
      requestTimestamps: []
    }));
    this.currentIndex = 0;
  }

  getActiveKeyCount() {
    return this.keys.filter(k => !k.exhaustedToday).length;
  }

  async acquireKey(maxRetries = 25) {
    let attempt = 0;
    while (attempt < maxRetries) {
      attempt++;
      const activeKeys = this.keys.filter(k => !k.exhaustedToday);
      if (activeKeys.length === 0) return null;

      const now = Date.now();

      for (let i = 0; i < activeKeys.length; i++) {
        const candidate = activeKeys[this.currentIndex % activeKeys.length];
        this.currentIndex++;

        candidate.requestTimestamps = candidate.requestTimestamps.filter(t => now - t < 60000);

        if (candidate.requestTimestamps.length < 14) {
          candidate.requestTimestamps.push(now);
          return candidate.key;
        }
      }

      const allTimestamps = activeKeys.flatMap(k => k.requestTimestamps);
      const oldest = allTimestamps.length > 0 ? Math.min(...allTimestamps) : (now - 60000);
      const waitMs = Math.max(1000, Math.min(60500, 60000 - (now - oldest) + 500));
      await new Promise(r => setTimeout(r, waitMs));
    }
    return null;
  }

  markExhausted(keyStr, reason = 'Daily Quota') {
    const entry = this.keys.find(k => k.key === keyStr);
    if (entry && !entry.exhaustedToday) {
      entry.exhaustedToday = true;
      console.warn(`  ⚠️  Chave (...${keyStr.slice(-6)}) atingiu cota diária (${reason}).`);
      console.warn(`     Restam ${this.getActiveKeyCount()} chaves ativas no pool.`);
    }
  }
}

const keyPool = new FreeTierKeyPool(API_KEYS);

// 5. Chamada de Inferência Médica Estruturada para Sub-subfocos
const MODEL_FALLBACKS = [
  MODEL_NAME,
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.8-flash'
].filter((m, idx, self) => self.indexOf(m) === idx);

async function callSubSubPreceptor(batchItems, subfocoContext) {
  const questionsPayload = batchItems.map(item => {
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

  const prompt = `Você é um Professor e Preceptor Médico de Residência Médica da plataforma Banco Residência.
As questões abaixo já estão homologadas no Subfoco: "${subfocoContext.subfoco}".
Sua missão pericial é classificar cada questão no seu respectivo SUB-SUBFOCO (5º nível da árvore).

CONTEXTO TAXONÔMICO HOMOLOGADO:
- Especialidade: ${subfocoContext.especialidade}
- Tema: ${subfocoContext.tema}
- Foco: ${subfocoContext.foco}
- Subfoco: ${subfocoContext.subfoco}

SUB-SUBFOCOS VÁLIDOS (Escolha estritamente UM por questão):
${JSON.stringify(subfocoContext.subSubfocosList, null, 2)}

REGRAS:
1. Escolha OBRIGATORIAMENTE um dos nomes exatos da lista de Sub-subfocos acima.
2. Analise o que o gabarito oficial homologado e o comando da questão estão cobrando.

LOTE DE QUESTÕES:
${JSON.stringify(questionsPayload, null, 2)}

RESPONDA ESTRITAMENTE EM JSON COMO UM ARRAY DE OBJETOS:
[
  {
    "id": "ID_DA_QUESTAO",
    "sub_subfoco_escolhido": "NOME_EXATO_DE_UM_DOS_SUB_SUBFOCOS",
    "justificativa_clinica": "Explicação médica concisa (1 frase)."
  }
]`;

  let totalAttempts = 0;
  const maxTotalAttempts = 5;

  while (totalAttempts < maxTotalAttempts) {
    totalAttempts++;

    const activeKey = await keyPool.acquireKey();
    if (!activeKey) {
      return { status: 'ALL_EXHAUSTED', error: 'Todas as cotas diárias gratuitas esgotadas.' };
    }

    for (const model of MODEL_FALLBACKS) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`;

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
          })
        });

        if (res.status === 401 || res.status === 403) {
          keyPool.markExhausted(activeKey, `Conta de Serviço / Chave Desativada (${res.status})`);
          break;
        }

        if (res.status === 429) {
          const errorBody = await res.text();
          const isDailyQuota =
            errorBody.includes('requests per day') ||
            errorBody.includes('PerDay') ||
            errorBody.includes('Queries per day') ||
            errorBody.includes('quota exceeded for the day') ||
            errorBody.includes('per day limit exceeded') ||
            /retry in \d+h/.test(errorBody);

          if (isDailyQuota) {
            keyPool.markExhausted(activeKey, 'Cota Diária RPD');
            break;
          } else {
            const waitTime = Math.min(15000, 3000 * totalAttempts);
            await new Promise(r => setTimeout(r, waitTime));
            continue;
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
        // Falha de rede temporária
      }
    }
  }

  return { status: 'FAILED', error: 'Falha após tentativas.' };
}

// 6. Conexão ao SQLite e Busca das Questões Elegíveis
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA synchronous = NORMAL;');
db.exec('PRAGMA busy_timeout = 30000;');

let selectQuery = `
  SELECT id, code, especialidade, tema, foco, subfoco,
         novo_tema, novo_foco, novo_subfoco, novo_sub_subfoco,
         statement, options, correct_answer, commentary, motivo_regra
  FROM questions
  WHERE status_recategorizacao != 'QUARENTENA_ANALISE_HUMANA'
    AND status_recategorizacao IS NOT NULL
    AND (novo_sub_subfoco IS NULL OR novo_sub_subfoco = '')
`;
const queryParams = [];

if (ESPECIALIDADE_FILTER) {
  selectQuery += ' AND especialidade = ?';
  queryParams.push(ESPECIALIDADE_FILTER);
}
selectQuery += ' ORDER BY id ASC';

const candidateRows = db.prepare(selectQuery).all(...queryParams);

// Filtra apenas as questões cujo novo_subfoco realmente possui Sub-subfocos na árvore
const eligibleQuestions = [];
const subfocoGroups = new Map();

for (const q of candidateRows) {
  const key = `${q.especialidade || ''}|||${q.novo_subfoco || ''}`.toLowerCase().trim();
  if (subWithSubSubs.has(key)) {
    const subfocoContext = subWithSubSubs.get(key);
    eligibleQuestions.push({ question: q, subfocoContext });

    if (!subfocoGroups.has(key)) {
      subfocoGroups.set(key, { subfocoContext, items: [] });
    }
    subfocoGroups.get(key).items.push({ question: q, subfocoContext });
  }
}

console.log(`📋 Questões Já Classificadas Elegíveis para 5º Nível: ${eligibleQuestions.length.toLocaleString('pt-BR')}`);

if (eligibleQuestions.length === 0) {
  console.log('🎉 Todas as questões já classificadas que suportam Sub-subfoco já estão 100% preenchidas!');
  db.close();
  process.exit(0);
}

// Monta fila de lotes de até BATCH_SIZE
const batchQueue = [];
let targetLimit = RUN_LIMIT || eligibleQuestions.length;
let scheduled = 0;

for (const [key, group] of subfocoGroups.entries()) {
  if (scheduled >= targetLimit) break;
  const items = group.items;
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    if (scheduled >= targetLimit) break;
    const chunk = items.slice(i, Math.min(items.length, i + BATCH_SIZE, i + (targetLimit - scheduled)));
    batchQueue.push({
      subfocoContext: group.subfocoContext,
      items: chunk
    });
    scheduled += chunk.length;
  }
}

console.log(`📦 Fila Montada: ${batchQueue.length.toLocaleString('pt-BR')} lotes para ${scheduled.toLocaleString('pt-BR')} questões agendadas\n`);

// Update Statement
const updateStmt = IS_EXECUTE ? db.prepare(`
  UPDATE questions SET
    novo_sub_subfoco = ?,
    motivo_regra     = motivo_regra || ' | Sub-subfoco: ''' || ? || ''' [Refinado LLM]'
  WHERE id = ?;
`) : null;

// 7. Loop de Refinamento
let resolvedCount    = 0;
let skippedCount     = 0;
let stoppedDueToQuota = false;
const startTime      = Date.now();

console.log('🚀 Iniciando Refinamento com Auto-Stop Seguro...');

for (let b = 0; b < batchQueue.length; b++) {
  if (keyPool.getActiveKeyCount() === 0) {
    console.log('\n🛑 AUTO-STOP ACIONADO: Todas as cotas gratuitas diárias esgotadas.');
    stoppedDueToQuota = true;
    break;
  }

  const batch = batchQueue[b];
  const subfocoContext = batch.subfocoContext;
  const items = batch.items;

  const result = await callSubSubPreceptor(items, subfocoContext);

  if (result.status === 'ALL_EXHAUSTED') {
    console.log('\n🛑 AUTO-STOP ACIONADO: Cota diária gratuita esgotada.');
    stoppedDueToQuota = true;
    break;
  }

  if (result.status === 'SUCCESS' && Array.isArray(result.decisions)) {
    for (const item of items) {
      const q = item.question;
      const decision = result.decisions.find(d => String(d.id).trim() === String(q.id).trim()) ||
                       result.decisions[items.indexOf(item)];

      if (!decision || !decision.sub_subfoco_escolhido) {
        skippedCount++;
        continue;
      }

      const chosenSubSub = String(decision.sub_subfoco_escolhido).trim();
      let matched = subfocoContext.subSubfocosList.find(ss => ss === chosenSubSub) ||
                    subfocoContext.subSubfocosList.find(ss => ss.toLowerCase().trim() === chosenSubSub.toLowerCase());

      if (!matched) {
        skippedCount++;
        continue;
      }

      if (IS_EXECUTE && updateStmt) {
        updateStmt.run(matched, matched, q.id);
        resolvedCount++;
      } else if (!IS_EXECUTE) {
        resolvedCount++;
      }
    }

    const remaining = scheduled - resolvedCount;
    process.stdout.write(`\r   ✅ 5º Nível Refinado: ${resolvedCount.toLocaleString('pt-BR')} | Restantes: ${remaining.toLocaleString('pt-BR')} | Chaves ativas: ${keyPool.getActiveKeyCount()} `);
  } else {
    skippedCount += items.length;
  }
}

const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);

console.log('\n\n========================================================================');
console.log('📊 RELATÓRIO DE REFINAMENTO DE 5º NÍVEL (SUB-SUBFOCOS):');
console.log('========================================================================');
console.log(`  • Questões Submetidas:          ${scheduled.toLocaleString('pt-BR')}`);
console.log(`  • Promovidas até Sub-subfoco:   ${resolvedCount.toLocaleString('pt-BR')} (${((resolvedCount / Math.max(1, scheduled)) * 100).toFixed(1)}%)`);
console.log(`  • Pulos / Casos Não Resolvidos: ${skippedCount.toLocaleString('pt-BR')}`);
console.log(`  • Tempo Total de Execução:      ${elapsedSec}s`);
console.log(`  • Status da Cota Diária:        ${stoppedDueToQuota ? '⏸️  Pausado por cota diária' : '✅ Finalizado sem interrupção'}`);
console.log('========================================================================\n');

db.close();
console.log('🔒 Banco de dados SQLite preservado e fechado com segurança.');
