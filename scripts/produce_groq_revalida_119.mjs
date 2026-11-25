import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@supabase/supabase-js';

// 1. Carrega variáveis de ambiente
const envPath = path.resolve('.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(l => {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
  });
}

const GROQ_KEY = process.env.GROQ_API_KEY || env.GROQ_API_KEY || '';
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!GROQ_KEY) {
  console.error('❌ GROQ_API_KEY não configurada no .env.local');
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Supabase não configurado no .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Conecta ao SQLite SSOT
const SQLITE_PATH = 'data/supabase_tables/supabase_tables.db';
const db = new DatabaseSync(SQLITE_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA busy_timeout = 10000;');
db.exec('PRAGMA synchronous = NORMAL;');

const MODELS = [
  'openai/gpt-oss-120b',
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-20b'
];
let modelIndex = 0;

// 3. Seleciona TODAS as questões do Revalida sem Padrão-Ouro (64 sem tag + 55 vazias = 119)
const pendingQuestions = db.prepare(`
  SELECT * FROM questions_curated_staging
  WHERE modalidade = 'Revalida'
    AND (commentary IS NULL OR commentary NOT LIKE '%Take-Home%')
  ORDER BY length(trim(COALESCE(commentary, ''))) DESC, id ASC
`).all();

const TARGET_TOTAL = pendingQuestions.length;
const CONCURRENCY = 2;
const STATE_PATH = 'data/pipeline_progress_state.json';

console.log(`================================================================================`);
console.log(`🚀 ESTEIRA GROQ GRATUITA — REVALIDA 100% OURO (SEMTAGOURO + VAZIAS)`);
console.log(`- Modelos Groq em rotação: ${MODELS.join(' & ')}`);
console.log(`- Total selecionado: ${TARGET_TOTAL} questões`);
console.log(`- Concorrência: ${CONCURRENCY} workers`);
console.log(`- Custo: R$ 0,00 (Groq API Gratuita)`);
console.log(`================================================================================\n`);

let processedCount = 0;
let successCount = 0;
let errorCount = 0;
let totalTokens = 0;
const startTime = Date.now();
const recentHistory = [];

function updateState(currentQ = null, overrideStatus = null) {
  const elapsedSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));
  const qpm = processedCount > 0 ? parseFloat(((processedCount / elapsedSec) * 60).toFixed(1)) : 0;
  const remaining = TARGET_TOTAL - processedCount;
  const etaMinutes = qpm > 0 ? Math.round((remaining / qpm)) : 0;

  const state = {
    status: overrideStatus || (processedCount >= TARGET_TOTAL ? 'COMPLETED' : 'RUNNING'),
    specialty: 'Revalida (Dissertativas — SemTagOuro + Vazias)',
    modalidade: 'Revalida',
    concurrency: CONCURRENCY,
    totalToProcess: TARGET_TOTAL,
    processedCount,
    successCount,
    errorCount,
    progressPercent: TARGET_TOTAL > 0 ? parseFloat(((processedCount / TARGET_TOTAL) * 100).toFixed(2)) : 100,
    velocity: {
      questionsPerMinute: qpm,
      elapsedSeconds: elapsedSec,
      estimatedSecondsRemaining: etaMinutes * 60,
      etaFormatted: `${etaMinutes}m`
    },
    tokens: {
      totalTokens,
      promptTokens: Math.round(totalTokens * 0.65),
      candidateTokens: Math.round(totalTokens * 0.35),
      pricing: { totalCostUSD: 0, totalCostBRL: 0, tier: 'Gratuito (Groq API)' }
    },
    currentQuestion: currentQ,
    recentHistory: recentHistory.slice(-15).reverse(),
    updatedAt: new Date().toISOString()
  };

  try {
    fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
  } catch {}
}

function sanitizePostgres(str) {
  if (!str) return '';
  return String(str).replace(/\u0000/g, '').replace(/\\u0000/g, '').replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '');
}

async function callGroq(prompt, specialty, attempt = 1) {
  const model = MODELS[modelIndex % MODELS.length];
  modelIndex++;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + GROQ_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: `Você é um Preceptor Sênior de Residência Médica e Revalida (INEP) especialista em ${specialty || 'Medicina'}. Responda estritamente em JSON válido conforme solicitado.`
          },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.15,
        max_tokens: 2600
      })
    });

    if (res.status === 429) {
      const waitMs = 6000 + attempt * 2000;
      console.warn(`⏳ Rate limit 429 no Groq (${model}). Aguardando ${(waitMs / 1000).toFixed(0)}s...`);
      await new Promise(r => setTimeout(r, waitMs));
      if (attempt < 7) return callGroq(prompt, specialty, attempt + 1);
      throw new Error('Rate limit 429 excedido no Groq');
    }

    if (!res.ok) {
      const errText = await res.text();
      if (attempt < 4) {
        await new Promise(r => setTimeout(r, 2500));
        return callGroq(prompt, specialty, attempt + 1);
      }
      throw new Error(`Groq HTTP ${res.status}: ${errText.slice(0, 150)}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Resposta vazia do Groq');

    let parsed = null;
    try {
      parsed = JSON.parse(content);
    } catch {
      const clean = content.replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ');
      parsed = JSON.parse(clean);
    }

    return { parsed, model, usage: data.usage };
  } catch (err) {
    if (attempt < 5) {
      await new Promise(r => setTimeout(r, 2500));
      return callGroq(prompt, specialty, attempt + 1);
    }
    throw err;
  }
}

async function processQuestion(q) {
  const startQ = Date.now();
  updateState({ code: q.code, id: q.id, especialidade: q.especialidade, tema: q.tema });

  const oldComm = (q.commentary || '').trim();
  const hasOfficialAnchor = oldComm.length > 50 && !oldComm.toUpperCase().includes('GABARITO NÃO DISPONIBILIZADO') && !oldComm.toUpperCase().includes('PADRÃO DE RESPOSTA NÃO DISPONÍVEL');

  const prompt = `Elabore a resolução comentada **Padrão-Ouro** para esta questão dissertativa oficial do Revalida (INEP).

Dados da Questão:
- Código: ${q.code || q.id}
- Instituição/Banca: ${q.institution || q.banca || 'INEP / Revalida'} (${q.year || 'Oficial'})
- Especialidade: ${q.especialidade || 'Medicina'} | Tema: ${q.tema || 'Geral'}

Enunciado:
${q.statement}

${hasOfficialAnchor
  ? `🔒 ESPELHO / PADRÃO DE RESPOSTA OFICIAL DA BANCA (ÂNCORA OBRIGATÓRIA):\n${oldComm}\n\nVocê DEVE incorporar integralmente os pontos exigidos no espelho oficial acima, organizando-os com clareza didática e fundamentação médica atualizada.`
  : `ℹ️ Questão dissertativa sem espelho prévio cadastrado. Elabore a resposta esperada item a item (a, b, c, etc., conforme os comandos do enunciado) com rigor clínico baseado nas diretrizes oficiais do Ministério da Saúde, SBC, SBP, FEBRASGO e ATLS.`}

REGRAS OBRIGATÓRIAS DO PADRÃO-OURO:
1. "itemByItem": Resolução clara de cada subitem pedido no enunciado (ex: **Item a)** ..., **Item b)** ...), destacando os diagnósticos, critérios e condutas obrigatórias em **negrito**.
2. "finalCommentary": Texto corrido único (90 a 140 palavras) integrando a fisiopatologia/diagnóstico à conduta padrão-ouro e eventuais armadilhas de prova, com termos-chave em **negrito**.
3. "takeHomeMessage": Uma regra de ouro direta e memorável em 1 frase.

RESPONDA EXCLUSIVAMENTE EM JSON VÁLIDO:
{
  "itemByItem": "...",
  "finalCommentary": "...",
  "takeHomeMessage": "..."
}`;

  try {
    const { parsed, model, usage } = await callGroq(prompt, q.especialidade);
    if (!parsed || (!parsed.itemByItem && !parsed.finalCommentary)) {
      throw new Error('JSON incompleto retornado pelo Groq');
    }

    const itemText = (parsed.itemByItem || '').trim();
    const finalText = (parsed.finalCommentary || '').trim();
    const takeHome = (parsed.takeHomeMessage || '').trim();

    const fullCommentary = sanitizePostgres([
      itemText ? `**Padrão de Resposta Comentado:**\n${itemText}` : '',
      finalText ? `**Síntese Clínica:**\n${finalText}` : '',
      `💡 **Take-Home Message:** ${takeHome || 'Domine os critérios diagnósticos e a conduta prioritária exigida pelo INEP.'}`
    ].filter(Boolean).join('\n\n'));

    const uuidMatch = q.id.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    const plainUuid = uuidMatch ? uuidMatch[0] : q.id;

    // Atualiza Supabase em todas as tabelas do Revalida
    const { error: errRev } = await supabase
      .from('questions_revalida')
      .update({ commentary: fullCommentary })
      .eq('id', plainUuid);

    await supabase
      .from('questions_expansion_revalida')
      .update({ commentary: fullCommentary })
      .eq('id', plainUuid);

    // Atualiza SQLite SSOT com retentativa
    let dbUpdated = false;
    for (let retry = 0; retry < 5 && !dbUpdated; retry++) {
      try {
        db.prepare(`
          UPDATE questions_curated_staging
          SET commentary = ?
          WHERE id = ?
        `).run(fullCommentary, q.id);
        dbUpdated = true;
      } catch {
        await new Promise(r => setTimeout(r, 200 * (retry + 1)));
      }
    }

    totalTokens += (usage?.total_tokens || 1400);
    processedCount++;
    successCount++;
    const duration = ((Date.now() - startQ) / 1000).toFixed(2);
    const tipoTag = hasOfficialAnchor ? 'SemTagOuro->Ouro' : 'Vazia->Ouro';
    console.log(`[${processedCount}/${TARGET_TOTAL}] ${q.code || plainUuid} (${tipoTag}) | ${model} | ⚡ ${duration}s | ${errRev ? '⚠️ Supa: ' + errRev.message : '✅ Supabase OK'}`);

    recentHistory.push({
      code: q.code || plainUuid,
      tema: `${q.especialidade} (${tipoTag})`,
      duration,
      tokens: usage?.total_tokens || 1400,
      status: errRev ? 'AVISO_SUPA' : 'OK',
      timestamp: new Date().toLocaleTimeString('pt-BR')
    });

    updateState();
  } catch (err) {
    processedCount++;
    errorCount++;
    console.error(`❌ [${processedCount}/${TARGET_TOTAL}] Falha em ${q.code || q.id}: ${err.message}`);
    recentHistory.push({
      code: q.code || q.id,
      tema: q.especialidade || 'Revalida',
      duration: 0,
      tokens: 0,
      status: 'ERRO: ' + err.message.slice(0, 30),
      timestamp: new Date().toLocaleTimeString('pt-BR')
    });
    updateState();
  }
}

async function run() {
  if (TARGET_TOTAL === 0) {
    console.log('🎉 Nenhuma questão pendente no Revalida! 100% já possui Take-Home.');
    updateState(null, 'COMPLETED');
    return;
  }

  updateState(null, 'RUNNING');
  let idx = 0;
  const active = new Set();

  while (idx < pendingQuestions.length || active.size > 0) {
    while (active.size < CONCURRENCY && idx < pendingQuestions.length) {
      const q = pendingQuestions[idx++];
      const p = processQuestion(q).then(() => active.delete(p));
      active.add(p);
    }
    if (active.size > 0) {
      await Promise.race(active);
    }
  }

  updateState(null, 'COMPLETED');
  console.log(`\n🏆 ESTEIRA GROQ REVALIDA CONCLUÍDA!`);
  console.log(`- Sucessos: ${successCount} | Falhas: ${errorCount}`);

  // Auditoria final imediata
  const remaining = db.prepare(`
    SELECT COUNT(*) as cnt FROM questions_curated_staging
    WHERE modalidade = 'Revalida' AND (commentary IS NULL OR commentary NOT LIKE '%Take-Home%')
  `).get();
  console.log(`🔍 Verificação Final SQLite Revalida sem Take-Home: ${remaining.cnt}`);
}

run().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
