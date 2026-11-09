import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

/**
 * ========================================================================
 * RESOLVEDOR DE QUARENTENA COM LLAMA 3.3 70B (GROQ CLOUD FREE TIER)
 * ========================================================================
 * 
 * Funcionalidade:
 *   Resolve as questões da quarentena utilizando o modelo de 70 Bilhões
 *   de parâmetros da Meta (llama-3.3-70b-versatile) via Groq Cloud.
 *   Utiliza inferência de altíssimo raciocínio clínico com validação
 *   estrita de Quality Gates e gravação atômica no SQLite local.
 * 
 * Opções:
 *   --execute              Grava as decisões no SQLite local (Padrão: simulação auditada)
 *   --batch <n>            Tamanho do lote por requisição (Padrão: 3)
 *   --limit <n>            Processa no máximo N questões
 *   --especialidade <nome> Filtra apenas uma especialidade
 *   --model <nome>         Modelo Groq (Padrão: llama-3.3-70b-versatile)
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

const GROQ_API_KEY = env.GROQ_API_KEY || process.env.GROQ_API_KEY;

// 2. Argumentos CLI
const args = process.argv.slice(2);
const getArg = (flag, defaultVal = null) => {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : defaultVal;
};
const hasFlag = (flag) => args.includes(flag);

const IS_EXECUTE           = hasFlag('--execute');
const BATCH_SIZE           = getArg('--batch') ? Math.max(1, parseInt(getArg('--batch'), 10)) : 3;
const RUN_LIMIT            = getArg('--limit') ? parseInt(getArg('--limit'), 10) : null;
const DEFAULT_TREE         = fs.existsSync('data/catalogo_arvore_canonica_completa.json')
  ? 'data/catalogo_arvore_canonica_completa.json'
  : (fs.existsSync('src/data/hierarquiaCompletaFiltros.json')
      ? 'src/data/hierarquiaCompletaFiltros.json'
      : 'docs/hierarquia_completa_filtros_recategorizada.json');
const TREE_PATH            = getArg('--tree', DEFAULT_TREE);
const ESPECIALIDADE_FILTER = getArg('--especialidade', null);
const MODEL_NAME           = getArg('--model', 'openai/gpt-oss-120b');
const DB_PATH              = path.resolve('data/questoes_132k.db');

if (!fs.existsSync(DB_PATH)) {
  console.error(`❌ Banco de dados SQLite não encontrado em: ${DB_PATH}`);
  process.exit(1);
}
if (!fs.existsSync(TREE_PATH)) {
  console.error(`❌ Árvore canônica não encontrada em: ${TREE_PATH}`);
  process.exit(1);
}

if (!GROQ_API_KEY) {
  console.error('\n❌ Chave GROQ_API_KEY não encontrada em .env.local!');
  console.error('👉 Adicione sua chave gratuita em .env.local: GROQ_API_KEY=gsk_...\n');
  process.exit(1);
}

// Pre-flight check da Groq API
console.log('🔍 Executando Pre-Flight Check de Conexão com Groq Cloud...');
try {
  const pingRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages: [{ role: 'user', content: 'Ping' }],
      max_tokens: 5
    }),
    signal: AbortSignal.timeout(12000)
  });

  if (!pingRes.ok) {
    const pingErr = await pingRes.text();
    console.error(`❌ Falha de autenticação na Groq API (HTTP ${pingRes.status}):`, pingErr);
    process.exit(1);
  }
  console.log(`  ✅ Groq API Conectada com Sucesso! Modelo: ${MODEL_NAME}\n`);
} catch (e) {
  console.error('❌ Erro de rede conectando à Groq API:', e.message);
  process.exit(1);
}

console.log('========================================================================');
console.log('⚡ RESOLVEDOR DE QUARENTENA — LLAMA 3.3 70B (GROQ CLOUD FREE)');
console.log(`🛡️  Modo: ${IS_EXECUTE ? '⚡ EXECUÇÃO ATIVA NO SQLITE LOCAL' : '🧪 SIMULAÇÃO AUDITADA (--dry-run)'}`);
console.log(`🧠 Modelo: ${MODEL_NAME} (70 Bilhões de Parâmetros)`);
console.log(`📦 Lotes: ${BATCH_SIZE} questões/requisição agrupadas por Foco`);
console.log(`🌲 Árvore: ${TREE_PATH}`);
console.log(`🔒 Custo: R$ 0,00 (Free Tier Groq)`);
console.log('========================================================================\n');

// 3. Indexa Árvore Canônica
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

        for (const s of subfocosList) {
          canonicalTuples.add(`${esp}|||${tema}|||${foco}|||${s}`);
          const subSubs = subSubfocosMap.get(s.toLowerCase().trim()) || [];
          for (const ss of subSubs) {
            canonicalTuples.add(`${esp}|||${tema}|||${foco}|||${s}|||${ss}`);
          }
        }
      }
    }
  }

  return { specialties, compositeFocoMap, focoFallbackMap, canonicalTuples };
}

const canonicalIndex = buildCanonicalFocoIndex(rawTreeData);

// 4. Rate Limiter Inteligente para Groq Free Tier (6.000 TPM / 30 RPM)
class GroqRateLimiter {
  constructor(minDelayMs = 8000) {
    this.minDelayMs = minDelayMs;
    this.lastCallTime = 0;
  }

  async waitTurn() {
    const now = Date.now();
    const elapsed = now - this.lastCallTime;
    if (elapsed < this.minDelayMs) {
      await new Promise(r => setTimeout(r, this.minDelayMs - elapsed));
    }
    this.lastCallTime = Date.now();
  }
}

const rateLimiter = new GroqRateLimiter(8500); // ~7 requisições/minuto = 100% sob os 6k TPM

// 5. Chamada de Inferência Médica Estruturada para o Lote
async function callGroqBatch(items, canonicalFoco) {
  const candidatesStructure = canonicalFoco.subfocosList.map(sub => {
    const subSubs = canonicalFoco.subSubfocosMap.get(sub.toLowerCase().trim()) || [];
    return {
      subfoco: sub,
      possui_sub_subfocos: subSubs.length > 0,
      sub_subfocos: subSubs
    };
  });

  const questionsPayload = items.map(item => {
    const q = item.question;
    let optsText = '';
    try {
      const opts = typeof q.options === 'string' ? JSON.parse(q.options || '[]') : (q.options || []);
      optsText = opts.map(o => `${o.letter}) ${o.text}`).join(' | ');
    } catch (_) {}

    return {
      id: q.id,
      enunciado: (q.statement || '').slice(0, 800),
      alternativas: optsText.slice(0, 600),
      gabarito_oficial: `Alternativa ${q.correct_answer || ''}`
    };
  });

  const systemPrompt = `Você é um Professor e Preceptor Médico de Residência Médica da plataforma Banco Residência.
Classifique o LOTE DE QUESTÕES na árvore taxonômica oficial.

ESPECIALIDADE: ${canonicalFoco.especialidade}
TEMA: ${canonicalFoco.tema}
FOCO: ${canonicalFoco.foco}

SUBFOCOS E SUB-SUBFOCOS VÁLIDOS (Escolha estritamente UM da lista abaixo):
${JSON.stringify(candidatesStructure, null, 2)}

REGRAS:
1. Escolha OBRIGATORIAMENTE um dos "subfoco" válidos da lista acima.
2. Se o subfoco possuir "sub_subfocos", escolha também o "sub_subfoco" correspondente (senão defina null).
3. Responda ESTRITAMENTE em formato JSON como um objeto contendo a propriedade "decisoes":
{
  "decisoes": [
    {
      "id": "ID_EXATO",
      "subfoco_escolhido": "NOME_DO_SUBFOCO",
      "sub_subfoco_escolhido": "NOME_DO_SUB_SUBFOCO ou null",
      "justificativa_clinica": "Explicação médica concisa em 1 frase."
    }
  ]
}`;

  let totalAttempts = 0;
  const maxAttempts = 5;

  while (totalAttempts < maxAttempts) {
    totalAttempts++;

    try {
      await rateLimiter.waitTurn();

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
            { role: 'user', content: JSON.stringify(questionsPayload) }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
          max_tokens: 1000
        }),
        signal: AbortSignal.timeout(20000)
      });

      if (res.status === 429) {
        const errorBody = await res.text();
        let waitSec = 15;
        const match = errorBody.match(/try again in ([\d\.]+)s/i) || errorBody.match(/retry in ([\d\.]+)s/i);
        if (match) {
          waitSec = Math.ceil(parseFloat(match[1])) + 2;
        }
        console.log(`\n  ⏳ Rate limit transitório Groq. Aguardando ${waitSec}s antes de tentar novamente...`);
        await new Promise(r => setTimeout(r, waitSec * 1000));
        continue;
      }

      if (!res.ok) {
        continue;
      }

      const jsonRes = await res.json();
      const rawContent = jsonRes?.choices?.[0]?.message?.content;
      if (!rawContent) continue;

      const parsed = JSON.parse(rawContent.trim());
      const decisionsArray = Array.isArray(parsed) ? parsed : (parsed.decisoes || parsed.decisions || []);

      if (Array.isArray(decisionsArray) && decisionsArray.length > 0) {
        return {
          status: 'SUCCESS',
          decisions: decisionsArray,
          model: MODEL_NAME
        };
      }

    } catch (e) {
      // Timeout ou oscilação de rede
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
if (ESPECIALIDADE_FILTER) {
  quarantineQuery += ` AND especialidade = '${ESPECIALIDADE_FILTER.replace(/'/g, "''")}'`;
}
quarantineQuery += ` ORDER BY id ASC;`;

const allQuarantine = db.prepare(quarantineQuery).all();
console.log(`📋 Total de Questões na Quarentena: ${allQuarantine.length.toLocaleString('pt-BR')}`);

if (allQuarantine.length === 0) {
  console.log('🎉 Quarentena zerada! Todas as questões já estão devidamente homologadas.');
  db.close();
  process.exit(0);
}

// Agrupamento por Foco Canônico
const focusGroups = new Map();
let unmappedCount = 0;

for (const q of allQuarantine) {
  const espLower  = (q.especialidade || '').toLowerCase().trim();
  const focoLower = (q.novo_foco || q.foco || '').toLowerCase().trim();

  let canonicalEntry = canonicalIndex.compositeFocoMap.get(`${espLower}|||${focoLower}`);
  if (!canonicalEntry) {
    const fallbacks = canonicalIndex.focoFallbackMap.get(focoLower);
    if (fallbacks && fallbacks.length === 1) canonicalEntry = fallbacks[0];
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
  focusGroups.get(groupKey).items.push({ question: q });
}

// Montagem dos Lotes
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
      items: chunk
    });
    scheduled += chunk.length;
  }
}

console.log(`📦 Fila Montada: ${batchQueue.length.toLocaleString('pt-BR')} lotes para ${scheduled.toLocaleString('pt-BR')} questões agendadas\n`);

// Update Statement
const updateStmt = IS_EXECUTE ? db.prepare(`
  UPDATE questions
  SET novo_tema             = ?,
      novo_foco             = ?,
      novo_subfoco          = ?,
      novo_sub_subfoco      = ?,
      status_recategorizacao = ?,
      motivo_regra          = ?
  WHERE id = ?;
`) : null;

// 7. Loop de Execução
let resolvedCount  = 0;
let subSubResolved = 0;
let skippedCount   = 0;
const startTime    = Date.now();

for (let bIdx = 0; bIdx < batchQueue.length; bIdx++) {
  const batch = batchQueue[bIdx];
  const result = await callGroqBatch(batch.items, batch.canonicalFoco);

  if (result.status === 'SUCCESS' && Array.isArray(result.decisions)) {
    for (const item of batch.items) {
      const q = item.question;
      const decision = result.decisions.find(d => String(d.id).trim() === String(q.id).trim()) ||
                       result.decisions[batch.items.indexOf(item)];

      if (!decision || !decision.subfoco_escolhido) {
        skippedCount++;
        continue;
      }

      let chosenSubfoco = String(decision.subfoco_escolhido).trim();

      // Invariante: Zero Sufixos Artificiais
      if (chosenSubfoco.includes(': Diagnóstico e Conduta')) {
        chosenSubfoco = chosenSubfoco.replace(': Diagnóstico e Conduta', '').trim();
      }

      // Validação do Subfoco
      let matchedSubfoco = batch.canonicalFoco.subfocosList.find(s => s === chosenSubfoco) ||
                           batch.canonicalFoco.subfocosList.find(s => s.toLowerCase().trim() === chosenSubfoco.toLowerCase());

      if (!matchedSubfoco) {
        skippedCount++;
        continue;
      }

      // Invariante: Anti-Duplicação
      if (matchedSubfoco.toLowerCase().trim() === batch.canonicalFoco.foco.toLowerCase().trim()) {
        skippedCount++;
        continue;
      }

      // Invariante: Tupla Fechada
      const tuple4 = `${batch.canonicalFoco.especialidade}|||${batch.canonicalFoco.tema}|||${batch.canonicalFoco.foco}|||${matchedSubfoco}`;
      if (!canonicalIndex.canonicalTuples.has(tuple4)) {
        skippedCount++;
        continue;
      }

      // 5º Nível (Sub-subfoco, se aplicável)
      let matchedSubSubfoco = null;
      const availableSubSubs = batch.canonicalFoco.subSubfocosMap.get(matchedSubfoco.toLowerCase().trim()) || [];

      if (availableSubSubs.length > 0 && decision.sub_subfoco_escolhido) {
        const rawSubSub = String(decision.sub_subfoco_escolhido).trim();
        matchedSubSubfoco = availableSubSubs.find(ss => ss === rawSubSub) ||
                            availableSubSubs.find(ss => ss.toLowerCase().trim() === rawSubSub.toLowerCase());

        if (matchedSubSubfoco) {
          const tuple5 = `${batch.canonicalFoco.especialidade}|||${batch.canonicalFoco.tema}|||${batch.canonicalFoco.foco}|||${matchedSubfoco}|||${matchedSubSubfoco}`;
          if (!canonicalIndex.canonicalTuples.has(tuple5)) {
            matchedSubSubfoco = null;
          }
        }
      }

      const novoStatus = 'SUBFOCO_RESOLVIDO_LLM';
      let motivoFinal = `[Preceptor Llama 3.3 70B] ${decision.justificativa_clinica || 'Classificado via Llama 3.3 70B'}`;
      if (matchedSubSubfoco) {
        motivoFinal += ` | Sub-subfoco: '${matchedSubSubfoco}'`;
      }

      if (IS_EXECUTE && updateStmt) {
        updateStmt.run(
          batch.canonicalFoco.tema,
          batch.canonicalFoco.foco,
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
  } else {
    skippedCount += batch.items.length;
  }

  const remaining = scheduled - resolvedCount;
  process.stdout.write(`\r   ⚡ [Groq 70B] Resolvidas: ${resolvedCount.toLocaleString('pt-BR')} | Restantes: ${remaining.toLocaleString('pt-BR')} | Lote: ${bIdx + 1}/${batchQueue.length} `);
}

const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);

console.log('\n\n========================================================================');
console.log('📊 RELATÓRIO DE RESOLUÇÃO (LLAMA 3.3 70B GROQ CLOUD):');
console.log('========================================================================');
console.log(`  • Questões Agendadas:           ${scheduled.toLocaleString('pt-BR')}`);
console.log(`  • Resolvidas com Sucesso:       ${resolvedCount.toLocaleString('pt-BR')} (${((resolvedCount / Math.max(1, scheduled)) * 100).toFixed(1)}%)`);
console.log(`  • Promovidas até Sub-subfoco:   ${subSubResolved.toLocaleString('pt-BR')} (5º nível hierárquico)`);
console.log(`  • Falhas / Pulos no Lote:       ${skippedCount.toLocaleString('pt-BR')}`);
if (unmappedCount > 0) {
  console.log(`  • Focos Não Mapeáveis na Base:  ${unmappedCount.toLocaleString('pt-BR')}`);
}
console.log(`  • Tempo Total de Execução:      ${elapsedSec}s`);
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
