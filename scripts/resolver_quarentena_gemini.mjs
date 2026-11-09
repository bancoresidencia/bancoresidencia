import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

/**
 * ========================================================================
 * RESOLVEDOR DE QUARENTENA GEMINI 3.5 FLASH (SINGLE KEY - BATCH 10)
 * ========================================================================
 * 
 * Configuração:
 *   - Modelo: gemini-3.5-flash (Google AI Studio)
 *   - Chave: GEMINI_API_KEY (Chave Principal)
 *   - Lote: 10 questões por requisição
 *   - Pacing: 4.800 ms por lote (~12.5 chamadas/min = ~125 q/minutos)
 * 
 * Proteção do SSD:
 *   - In-RAM Transaction Buffer: comita a cada 30 questões (3 lotes)
 *   - PRAGMA temp_store = MEMORY; synchronous = NORMAL; cache_size = -64000;
 * 
 * Regras Estritas de Negócio:
 *   1. Classifica EXCLUSIVAMENTE o Subfoco (novo_sub_subfoco = NULL).
 *   2. Análise completa dos 4 pilares: Enunciado, Alternativas, Comentários e Gabarito.
 *   3. Fidelidade 100% à árvore canônica oficial.
 *   4. Quality gates: Anti-duplicação, zero sufixos, tupla válida e histórico preservado.
 */

// 1. Variáveis de Ambiente
const env = {};
const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

// 2. Argumentos CLI
const args = process.argv.slice(2);
const getArg = (flag, defaultVal = null) => {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : defaultVal;
};
const hasFlag = (flag) => args.includes(flag);

const KEY_ENV_VAR          = getArg('--key-env', 'GEMINI_API_KEY');
const GEMINI_API_KEY       = env[KEY_ENV_VAR] || env.GEMINI_API_KEY || env.GEMINI_API_KEY_1;
const DB_PATH              = path.resolve('data/questoes_132k.db');
const TREE_PATH            = path.resolve('data/catalogo_arvore_canonica_completa.json');
const IS_EXECUTE           = hasFlag('--execute');
const BATCH_SIZE           = getArg('--batch') ? Math.max(1, parseInt(getArg('--batch'), 10)) : 10;
const RUN_LIMIT            = getArg('--limit') ? parseInt(getArg('--limit'), 10) : null;
const ESPECIALIDADE_FILTER = getArg('--especialidade', null);
const GEMINI_MODEL         = getArg('--model', 'gemini-3.1-flash-lite');

if (!GEMINI_API_KEY) {
  console.error(`❌ Chave ${KEY_ENV_VAR} não encontrada em .env.local`);
  process.exit(1);
}
if (!fs.existsSync(DB_PATH)) {
  console.error(`❌ SQLite não encontrado em: ${DB_PATH}`);
  process.exit(1);
}
if (!fs.existsSync(TREE_PATH)) {
  console.error(`❌ Árvore canônica não encontrada em: ${TREE_PATH}`);
  process.exit(1);
}

// 3. Rate Limiter Seguro para Gemini (Free Tier: 15 RPM max -> usamos ~12.5 RPM)
class SafeRateLimiter {
  constructor(minDelayMs = 5000) {
    this.minDelayMs = minDelayMs;
    this.lastTime = Date.now();
  }
  async waitTurn() {
    const now = Date.now();
    const diff = now - this.lastTime;
    if (diff < this.minDelayMs) {
      await new Promise(r => setTimeout(r, this.minDelayMs - diff));
    }
    this.lastTime = Date.now();
  }
}
const rateLimiter = new SafeRateLimiter(5000);

// 4. Pre-Flight Check da Chave Gemini
console.log(`🔍 Executando Pre-Flight Check no ${GEMINI_MODEL}...`);
try {
  const pingUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const pingRes = await fetch(pingUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'Ping' }] }],
      generationConfig: { maxOutputTokens: 5, thinkingConfig: { thinkingBudget: 0 } }
    }),
    signal: AbortSignal.timeout(10000)
  });
  if (pingRes.ok) {
    console.log(`  ✅ ${GEMINI_MODEL}: ONLINE [Chave Principal pronta]\n`);
  } else {
    console.error(`  ❌ Gemini respondeu HTTP ${pingRes.status}: ${await pingRes.text()}`);
    process.exit(1);
  }
} catch (e) {
  console.error(`  ❌ Falha de conexão com Gemini: ${e.message}`);
  process.exit(1);
}

console.log('========================================================================');
console.log('⚡ RESOLVEDOR DE QUARENTENA GEMINI 3.5 FLASH (SINGLE KEY - TURBO)');
console.log(`🛡️  Modo: ${IS_EXECUTE ? '⚡ EXECUÇÃO ATIVA NO SQLITE LOCAL' : '🧪 SIMULAÇÃO AUDITADA (--dry-run)'}`);
console.log(`🤖 Modelo: ${GEMINI_MODEL} (Google AI Studio Free Tier)`);
console.log(`📦 Lotes: ${BATCH_SIZE} questões/requisição agrupadas por Foco Canônico`);
console.log(`🎯 Escopo: EXCLUSIVAMENTE SUBFOCO (novo_sub_subfoco = NULL)`);
console.log(`📚 Análise: 4 Pilares Clínicos (Enunciado + Alternativas + Comentários + Gabarito)`);
console.log(`💾 Proteção SSD: In-RAM Transaction Buffer (Commits atômicos a cada 30 questões)`);
console.log(`🔒 Custo Financeiro: R$ 0,00 (Free Tier oficial)`);
console.log('========================================================================\n');

// 5. Indexação da Árvore Canônica Oficial
const rawTreeData = JSON.parse(fs.readFileSync(TREE_PATH, 'utf8'));

function buildCanonicalFocoIndex(inputTree) {
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
    const espLower = esp.toLowerCase().trim();

    for (const [tema, focos] of Object.entries(temas)) {
      for (const [foco, focoData] of Object.entries(focos)) {
        const focoLower = foco.toLowerCase().trim();
        let subfocosList = [];

        const processSubItem = (item) => {
          if (typeof item === 'string') {
            subfocosList.push(item);
          } else if (item && typeof item === 'object') {
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

        for (const s of subfocosList) {
          canonicalTuples.add(`${esp}|||${tema}|||${foco}|||${s}`);
        }
      }
    }
  }

  return { compositeFocoMap, focoFallbackMap, canonicalTuples };
}

const canonicalIndex = buildCanonicalFocoIndex(rawTreeData);

function findCanonicalEntry(esp, focoName) {
  if (!focoName) return null;
  let espLower = (esp || '').toLowerCase().trim();
  if (espLower === 'cirurgia') espLower = 'cirurgia geral';
  if (espLower === 'medicina preventiva') espLower = 'medicina preventiva e social';
  const fLower = focoName.toLowerCase().trim();

  let entry = canonicalIndex.compositeFocoMap.get(`${espLower}|||${fLower}`);
  if (!entry) {
    const fallbacks = canonicalIndex.focoFallbackMap.get(fLower);
    if (fallbacks && fallbacks.length === 1) entry = fallbacks[0];
  }
  return entry;
}

// 6. Chamada de Inferência Médica Estruturada para Lote no Gemini
async function inferBatch(items, canonicalFoco) {
  const questionsPayload = items.map(q => {
    let optsText = '';
    try {
      const opts = typeof q.options === 'string' ? JSON.parse(q.options || '[]') : (q.options || []);
      optsText = opts.map(o => `${o.letter}) ${o.text}`).join(' | ');
    } catch (_) {}

    return {
      id: q.id,
      enunciado: (q.statement || '').slice(0, 900),
      alternativas: optsText.slice(0, 700),
      comentarios_banca: q.commentary ? q.commentary.slice(0, 600) : 'Sem comentário adicional.',
      gabarito_oficial: `Alternativa ${q.correct_answer || ''}`
    };
  });

  const prompt = `Você é um Professor e Preceptor Médico de Residência Médica da plataforma Banco Residência.
Classifique o LOTE DE QUESTÕES na árvore taxonômica oficial.

ESPECIALIDADE: ${canonicalFoco.especialidade}
TEMA: ${canonicalFoco.tema}
FOCO: ${canonicalFoco.foco}

SUBFOCOS VÁLIDOS (Escolha estritamente UM da lista abaixo para cada questão):
${JSON.stringify(canonicalFoco.subfocosList, null, 2)}

QUESTÕES A CLASSIFICAR:
${JSON.stringify(questionsPayload, null, 2)}

REGRAS OBRIGATÓRIAS:
1. Para cada questão, analise o Enunciado, as Alternativas, os Comentários da banca e o Gabarito oficial.
2. Escolha OBRIGATORIAMENTE um dos nomes exatos da lista de Subfocos acima.
3. Responda ESTRITAMENTE em formato JSON com o seguinte formato:
{
  "decisoes": [
    {
      "id": "ID_EXATO",
      "subfoco_escolhido": "NOME_EXATO_DO_SUBFOCO",
      "justificativa_clinica": "Explicação médica concisa em 1 frase."
    }
  ]
}`;

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      await rateLimiter.waitTurn();

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
            maxOutputTokens: 3000,
            thinkingConfig: { thinkingBudget: 0 }
          }
        }),
        signal: AbortSignal.timeout(30000)
      });

      if (res.status === 429 || res.status === 503) {
        console.log(`\n  ⏳ Rate limit / pico temporário Gemini (HTTP ${res.status}). Aguardando 12s...`);
        await new Promise(r => setTimeout(r, 12000));
        continue;
      }

      if (!res.ok) continue;

      const data = await res.json();
      const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) continue;

      let cleanText = content.trim();
      if (cleanText.startsWith('```json')) cleanText = cleanText.replace(/^```json/, '').replace(/```$/, '').trim();
      else if (cleanText.startsWith('```')) cleanText = cleanText.replace(/^```/, '').replace(/```$/, '').trim();

      const parsed = JSON.parse(cleanText);
      const decisions = Array.isArray(parsed) ? parsed : (parsed.decisoes || parsed.decisions || []);

      if (Array.isArray(decisions) && decisions.length > 0) {
        return {
          status: 'SUCCESS',
          decisions
        };
      }
    } catch (e) {
      // Timeout ou oscilação de rede
    }
  }

  return { status: 'FAILED' };
}

// 7. Conexão ao SQLite e Otimização para Alta Performance de Disco
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA synchronous = NORMAL;');
db.exec('PRAGMA temp_store = MEMORY;');
db.exec('PRAGMA cache_size = -64000;'); // 64 MB de cache em RAM
db.exec('PRAGMA busy_timeout = 30000;');

let quarantineQuery = `
  SELECT id, code, especialidade, tema, foco, subfoco,
         antigo_tema, antigo_foco, antigo_subfoco,
         novo_tema, novo_foco,
         statement, options, correct_answer, commentary, is_anulada, motivo_regra
  FROM questions
  WHERE status_recategorizacao = 'QUARENTENA_ANALISE_HUMANA'
`;
if (ESPECIALIDADE_FILTER) {
  quarantineQuery += ` AND especialidade = '${ESPECIALIDADE_FILTER.replace(/'/g, "''")}'`;
}
quarantineQuery += ` ORDER BY id ASC;`;

const allQuarantine = db.prepare(quarantineQuery).all();
console.log(`📋 Total de Questões na Quarentena: ${allQuarantine.length.toLocaleString('pt-BR')}`);

if (allQuarantine.length === 0) {
  console.log('🎉 Quarentena zerada! Todas as questões já estão homologadas.');
  db.close();
  process.exit(0);
}

// Agrupamento por Foco Canônico (com fallback novo_foco -> foco original)
const focusGroups = new Map();
let unmappedCount = 0;

for (const q of allQuarantine) {
  let canonicalEntry = findCanonicalEntry(q.especialidade, q.novo_foco);
  if (!canonicalEntry || canonicalEntry.subfocosList.length === 0) {
    canonicalEntry = findCanonicalEntry(q.especialidade, q.foco);
  }

  if (!canonicalEntry || canonicalEntry.subfocosList.length === 0) {
    unmappedCount++;
    continue;
  }

  const groupKey = `${canonicalEntry.especialidade}|||${canonicalEntry.tema}|||${canonicalEntry.foco}`;
  if (!focusGroups.has(groupKey)) {
    focusGroups.set(groupKey, {
      canonicalFoco: canonicalEntry,
      items: []
    });
  }
  focusGroups.get(groupKey).items.push(q);
}

// Montagem dos Lotes de 10 questões
const batchQueue = [];
let targetLimit = RUN_LIMIT || allQuarantine.length;
let scheduled   = 0;

for (const [key, group] of focusGroups.entries()) {
  if (scheduled >= targetLimit) break;
  const items = group.items;
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    if (scheduled >= targetLimit) break;
    const chunk = items.slice(i, Math.min(items.length, i + BATCH_SIZE, i + (targetLimit - scheduled)));
    batchQueue.push({
      canonicalFoco: group.canonicalFoco,
      items: chunk,
      retries: 0
    });
    scheduled += chunk.length;
  }
}

console.log(`📦 Fila Montada: ${batchQueue.length.toLocaleString('pt-BR')} lotes para ${scheduled.toLocaleString('pt-BR')} questões agendadas`);
if (unmappedCount > 0) {
  console.log(`ℹ️  Questões sem foco canônico imediato (focos legados para etapa de foco): ${unmappedCount.toLocaleString('pt-BR')}`);
}
console.log('');

// Update Statement
const updateStmt = IS_EXECUTE ? db.prepare(`
  UPDATE questions
  SET novo_tema              = ?,
      novo_foco              = ?,
      novo_subfoco           = ?,
      novo_sub_subfoco       = NULL,
      status_recategorizacao = ?,
      motivo_regra           = ?
  WHERE id = ?;
`) : null;

// 8. Buffer em RAM para Gravação em Disco (Proteção Atômica do SSD)
const writeBuffer = [];
const BUFFER_FLUSH_SIZE = 30; // Grava em disco apenas a cada 30 questões (3 lotes de 10)

function flushWriteBuffer(force = false) {
  if (writeBuffer.length === 0) return;
  if (!force && writeBuffer.length < BUFFER_FLUSH_SIZE) return;

  if (IS_EXECUTE && updateStmt) {
    db.exec('BEGIN IMMEDIATE TRANSACTION;');
    try {
      while (writeBuffer.length > 0) {
        const item = writeBuffer.shift();
        updateStmt.run(
          item.tema,
          item.foco,
          item.subfoco,
          item.status,
          item.motivo,
          item.id
        );
      }
      db.exec('COMMIT;');
    } catch (err) {
      db.exec('ROLLBACK;');
      console.error('\n❌ Erro ao persistir lote no SQLite:', err.message);
      throw err;
    }
  } else {
    writeBuffer.length = 0;
  }
}

// Handlers de saída graciosa para proteger integridade do banco
process.on('SIGINT', () => {
  console.log('\n🛑 Recebido SIGINT. Persistindo buffer em RAM e fechando SQLite...');
  flushWriteBuffer(true);
  try { db.close(); } catch (_) {}
  process.exit(0);
});
process.on('SIGTERM', () => {
  console.log('\n🛑 Recebido SIGTERM. Persistindo buffer em RAM e fechando SQLite...');
  flushWriteBuffer(true);
  try { db.close(); } catch (_) {}
  process.exit(0);
});

// 9. Orquestração do Processamento Turbo
let resolvedCount = 0;
let skippedCount  = 0;
const startTime   = Date.now();
const norm = str => (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

function saveDecisions(result, items, canonicalFoco) {
  for (const q of items) {
    const decision = result.decisions.find(d => String(d.id).trim() === String(q.id).trim()) ||
                     result.decisions[items.indexOf(q)];

    if (!decision || !decision.subfoco_escolhido) {
      skippedCount++;
      continue;
    }

    let chosenSubfoco = String(decision.subfoco_escolhido).trim();

    // Invariante: Zero Sufixos Artificiais
    if (chosenSubfoco.includes(': Diagnóstico e Conduta')) {
      chosenSubfoco = chosenSubfoco.replace(': Diagnóstico e Conduta', '').trim();
    }

    // Validação do Subfoco na Árvore Canônica (com tolerância a acentos)
    let matchedSubfoco = canonicalFoco.subfocosList.find(s => s === chosenSubfoco) ||
                         canonicalFoco.subfocosList.find(s => s.toLowerCase().trim() === chosenSubfoco.toLowerCase()) ||
                         canonicalFoco.subfocosList.find(s => norm(s) === norm(chosenSubfoco));

    if (!matchedSubfoco) {
      skippedCount++;
      continue;
    }

    // Invariante: Anti-Duplicação
    if (matchedSubfoco.toLowerCase().trim() === canonicalFoco.foco.toLowerCase().trim()) {
      skippedCount++;
      continue;
    }

    // Invariante: Tupla Fechada Canônica
    const tuple4 = `${canonicalFoco.especialidade}|||${canonicalFoco.tema}|||${canonicalFoco.foco}|||${matchedSubfoco}`;
    if (!canonicalIndex.canonicalTuples.has(tuple4)) {
      skippedCount++;
      continue;
    }

    const novoStatus = 'SUBFOCO_RESOLVIDO_LLM';
    const motivoFinal = `[Preceptor Gemini 3.5 Flash] ${decision.justificativa_clinica || 'Classificado via Preceptor Gemini'}`;

    writeBuffer.push({
      tema: canonicalFoco.tema,
      foco: canonicalFoco.foco,
      subfoco: matchedSubfoco,
      status: novoStatus,
      motivo: motivoFinal,
      id: q.id
    });

    resolvedCount++;
    flushWriteBuffer(false);
  }

  const remaining = scheduled - resolvedCount;
  const elapsedMinutes = Math.max(0.01, (Date.now() - startTime) / 60000);
  const currentRPM = Math.round(resolvedCount / elapsedMinutes);

  process.stdout.write(`\r   ⚡ [Gemini Flash Turbo] Resolvidas: ${resolvedCount.toLocaleString('pt-BR')} | Restam: ${remaining.toLocaleString('pt-BR')} | Vazão: ~${currentRPM} q/min | Buffer RAM: ${writeBuffer.length}   `);
}

// Loop Principal de Consumo da Fila
console.log('🚀 Iniciando Processamento Turbo com Gemini 3.5 Flash (Lotes de 10)...\n');

while (batchQueue.length > 0) {
  const batch = batchQueue.shift();
  const result = await inferBatch(batch.items, batch.canonicalFoco);

  if (result.status === 'SUCCESS' && Array.isArray(result.decisions)) {
    saveDecisions(result, batch.items, batch.canonicalFoco);
  } else {
    batch.retries = (batch.retries || 0) + 1;
    if (batch.retries <= 3) {
      batchQueue.push(batch);
    } else {
      skippedCount += batch.items.length;
    }
  }
}

// Flush Final do Buffer de RAM
flushWriteBuffer(true);

const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
const finalRPM = Math.round(resolvedCount / (Math.max(1, elapsedSec) / 60));

console.log('\n\n========================================================================');
console.log('📊 RELATÓRIO FINAL DE RESOLUÇÃO GEMINI 3.5 FLASH:');
console.log('========================================================================');
console.log(`  • Questões Agendadas:           ${scheduled.toLocaleString('pt-BR')}`);
console.log(`  • Resolvidas com Sucesso:       ${resolvedCount.toLocaleString('pt-BR')} (${((resolvedCount / Math.max(1, scheduled)) * 100).toFixed(1)}%)`);
console.log(`  • Falhas / Pulos no Lote:       ${skippedCount.toLocaleString('pt-BR')}`);
if (unmappedCount > 0) {
  console.log(`  • Focos Não Mapeáveis na Base:  ${unmappedCount.toLocaleString('pt-BR')}`);
}
console.log(`  • Tempo Total de Execução:      ${elapsedSec}s (~${(elapsedSec / 60).toFixed(1)} min)`);
console.log(`  • Vazão Média Real:             ~${finalRPM} questões por minuto`);
console.log('========================================================================\n');

// 10. Quality Gates de Validação Pós-Execução
if (IS_EXECUTE && resolvedCount > 0) {
  console.log('🔍 Executando Quality Gates sobre as questões resolvidas...');
  
  const espCheckSql = ESPECIALIDADE_FILTER ? `AND especialidade = '${ESPECIALIDADE_FILTER.replace(/'/g, "''")}'` : '';

  const dupCheck = db.prepare(`
    SELECT COUNT(id) as c FROM questions 
    WHERE status_recategorizacao = 'SUBFOCO_RESOLVIDO_LLM' 
      AND LOWER(TRIM(novo_subfoco)) = LOWER(TRIM(novo_foco))
      ${espCheckSql}
  `).get().c;
  console.log(`  ${dupCheck === 0 ? '✅' : '❌'} Anti-Duplicação (novo_subfoco != novo_foco): ${dupCheck} inconsistências`);

  const sufixCheck = db.prepare(`
    SELECT COUNT(id) as c FROM questions 
    WHERE status_recategorizacao = 'SUBFOCO_RESOLVIDO_LLM' 
      AND novo_subfoco LIKE '%: Diagnóstico e Conduta%'
      ${espCheckSql}
  `).get().c;
  console.log(`  ${sufixCheck === 0 ? '✅' : '❌'} Zero Sufixos Artificiais: ${sufixCheck} inconsistências`);

  const histCheck = db.prepare(`
    SELECT COUNT(id) as c FROM questions 
    WHERE status_recategorizacao = 'SUBFOCO_RESOLVIDO_LLM' 
      AND (antigo_tema IS NULL OR antigo_foco IS NULL OR antigo_subfoco IS NULL)
      ${espCheckSql}
  `).get().c;
  console.log(`  ${histCheck === 0 ? '✅' : '❌'} Rastreabilidade Histórica (antigo_* 100% preservado): ${histCheck} inconsistências`);

  const subSubNullCheck = db.prepare(`
    SELECT COUNT(id) as c FROM questions 
    WHERE status_recategorizacao = 'SUBFOCO_RESOLVIDO_LLM' 
      AND motivo_regra LIKE '%Preceptor Gemini%'
      AND novo_sub_subfoco IS NOT NULL
      ${espCheckSql}
  `).get().c;
  console.log(`  ${subSubNullCheck === 0 ? '✅' : '❌'} Nível 5 Neutro (novo_sub_subfoco = NULL): ${subSubNullCheck} preenchidos incorretamente\n`);
}

// Verifica status atualizado da quarentena
const remQuar = db.prepare("SELECT COUNT(id) as c FROM questions WHERE status_recategorizacao = 'QUARENTENA_ANALISE_HUMANA'").get().c;
console.log(`📊 Questões Restantes na Quarentena: ${remQuar.toLocaleString('pt-BR')}`);

db.close();
console.log('🔒 Banco de dados SQLite preservado e fechado com segurança.');
