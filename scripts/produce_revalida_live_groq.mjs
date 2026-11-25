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

if (!GROQ_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ GROQ_API_KEY ou Supabase não configurados.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// SQLite SSOT para manter espelhado quando o ID existir localmente
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

const CONCURRENCY = 2;
const STATE_PATH = 'data/pipeline_revalida_state.json';
const SIGNAL_PATH = 'data/pipeline.signal';

const argYear = process.argv.find(a => a.startsWith('--year='));
const ONLY_YEAR = argYear ? parseInt(argYear.split('=')[1], 10) : null;

function sanitizePostgres(str) {
  if (!str) return '';
  return String(str).replace(/\u0000/g, '').replace(/\\u0000/g, '').replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '');
}

async function fetchPendingFromSupabase() {
  let all = [];
  let from = 0;
  while (true) {
    let q = supabase
      .from('questions_revalida')
      .select('id, code, institution, banca, year, especialidade, tema, type, is_anulada, correct_answer, statement, options, commentary, images')
      .eq('has_gabarito', true)
      .order('year', { ascending: false })
      .order('id', { ascending: true })
      .range(from, from + 999);
    if (ONLY_YEAR) q = q.eq('year', ONLY_YEAR);

    const { data, error } = await q;
    if (error) throw new Error(`Supabase fetch error: ${error.message}`);
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < 1000) break;
    from += 1000;
  }

  return all.filter(r => {
    const comm = (r.commentary || '').trim();
    const needsOuro = !comm.includes('Take-Home');
    const hasImg = Array.isArray(r.images) && r.images.length > 0;
    return needsOuro && !hasImg;
  });
}

async function callGroq(systemPrompt, userPrompt, attempt = 1) {
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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.12,
        max_tokens: 2400
      })
    });

    if (res.status === 429) {
      const waitMs = 7000 + attempt * 2500;
      console.warn(`⏳ Rate limit 429 no Groq (${model}). Aguardando ${(waitMs / 1000).toFixed(0)}s...`);
      await new Promise(r => setTimeout(r, waitMs));
      if (attempt < 7) return callGroq(systemPrompt, userPrompt, attempt + 1);
      throw new Error('Rate limit 429 excedido no Groq');
    }

    if (!res.ok) {
      const errText = await res.text();
      if (attempt < 4) {
        await new Promise(r => setTimeout(r, 2500));
        return callGroq(systemPrompt, userPrompt, attempt + 1);
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
      return callGroq(systemPrompt, userPrompt, attempt + 1);
    }
    throw err;
  }
}

async function main() {
  const pendingQuestions = await fetchPendingFromSupabase();
  const TARGET_TOTAL = pendingQuestions.length;

  console.log(`================================================================================`);
  console.log(`🚀 ESTEIRA GROQ REVALIDA REAL (FONTE DIRETA: SUPABASE questions_revalida)`);
  console.log(`- Filtro: has_gabarito=true, sem Take-Home, texto puro (2026 -> anteriores)`);
  console.log(`- Modelos Groq: ${MODELS.join(' & ')}`);
  console.log(`- Total selecionado no site: ${TARGET_TOTAL} questões`);
  console.log(`- Concorrência: ${CONCURRENCY} workers | Custo: R$ 0,00`);
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
      specialty: `Revalida Real (${ONLY_YEAR || '2026 ➔ 2011'} — Supabase Live)`,
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
        etaFormatted: etaMinutes > 60 ? `${Math.floor(etaMinutes / 60)}h ${etaMinutes % 60}m` : `${etaMinutes}m`
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

    try { fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8'); } catch {}
  }

  async function processQuestion(q) {
    const startQ = Date.now();
    updateState({ code: q.code, id: q.id, especialidade: q.especialidade, tema: q.tema });

    let options = Array.isArray(q.options) ? q.options : [];
    const isDiss = (q.type || '').toLowerCase().includes('dissert') || options.length === 0;
    const goldAnswer = (q.correct_answer || '').toUpperCase().trim();
    const isAnulada = Boolean(q.is_anulada);

    const systemPrompt = `Você é um Preceptor Sênior de Residência Médica e Revalida (INEP) especialista em ${q.especialidade || 'Medicina'}. Responda estritamente em JSON válido.`;

    let userPrompt = '';
    if (isDiss) {
      userPrompt = `Elabore a resolução comentada **Padrão-Ouro** para esta questão dissertativa do Revalida.
Dados: ${q.institution || q.banca || 'INEP Revalida'} (${q.year || 'Oficial'}) | ${q.especialidade || 'Medicina'} - ${q.tema || 'Geral'}

Enunciado:
${q.statement}

REGRAS:
1. "itemByItem": Resolução clara de cada item pedido (ex: **Item a)** ..., **Item b)** ...), com conceitos críticos em **negrito**.
2. "finalCommentary": Texto corrido único (90-140 palavras) integrando diagnóstico e conduta segundo diretrizes brasileiras (MS/SBC/SBP/FEBRASGO/ATLS), termos em **negrito**.
3. "takeHomeMessage": 1 frase direta e memorável.

JSON obrigatório:
{ "itemByItem": "...", "finalCommentary": "...", "takeHomeMessage": "..." }`;
    } else {
      const optLetters = options.map(o => o.letter).join(', ');
      const formattedOptions = options.map(o => `${o.letter}) ${o.text}`).join('\n');
      userPrompt = `Fundamente com rigor acadêmico e exatidão clínica o gabarito oficial desta questão do Revalida.

Dados: ${q.institution || q.banca || 'INEP Revalida'} (${q.year || 'Oficial'}) | ${q.especialidade || 'Medicina'} - ${q.tema || 'Geral'}

Enunciado:
${q.statement}

Alternativas:
${formattedOptions}

${isAnulada
  ? '🔒 ATENÇÃO: QUESTÃO OFICIALMENTE ANULADA PELA BANCA. Explique tecnicamente o motivo da anulação e as falhas de cada assertiva.'
  : `🔒 GABARITO OFICIAL IMUTÁVEL (ÂNCORA DE OURO): ALTERNATIVA ${goldAnswer}. Fundamente por que a ${goldAnswer} é a correta e aponte objetivamente o erro dos distratores. Proibido divergir do gabarito oficial.`}

REGRAS OBRIGATÓRIAS:
1. "options" (${optLetters}):
   - Alternativa correta (${isAnulada ? 'ou assertivas' : goldAnswer}): Destaque o critério/conduta padrão-ouro em **negrito**.
   - Distratores: 1 a 2 frases curtas destacando o erro em **negrito** e a correção médica.
2. "finalCommentary": Texto corrido único (90 a 140 palavras) integrando diagnóstico e conduta segundo consensos vigentes (MS/SBC/SBP/FEBRASGO/ATLS), termos-chave em **negrito**.
3. "takeHomeMessage": Uma pérola clínica direta em 1 frase.

RESPONDA EXCLUSIVAMENTE EM JSON VÁLIDO:
{
  "options": {
    ${options.map(o => `"${o.letter}": "..."`).join(',\n    ')}
  },
  "finalCommentary": "...",
  "takeHomeMessage": "..."
}`;
    }

    try {
      const { parsed, model, usage } = await callGroq(systemPrompt, userPrompt);
      if (!parsed || !parsed.finalCommentary) throw new Error('JSON incompleto do Groq');

      const takeHome = sanitizePostgres(parsed.takeHomeMessage || 'Domine os critérios diagnósticos e conduta prioritária cobrados pelo INEP.');
      let fullCommentary = '';
      let updatedOptions = options;

      if (isDiss) {
        fullCommentary = sanitizePostgres([
          parsed.itemByItem ? `**Padrão de Resposta Comentado:**\n${parsed.itemByItem.trim()}` : '',
          `**Síntese Clínica:**\n${parsed.finalCommentary.trim()}`,
          `💡 **Take-Home Message:** ${takeHome}`
        ].filter(Boolean).join('\n\n'));
      } else {
        updatedOptions = options.map(opt => ({
          ...opt,
          text: sanitizePostgres(opt.text),
          explanation: sanitizePostgres(parsed.options?.[opt.letter] || '')
        }));
        fullCommentary = sanitizePostgres(`${parsed.finalCommentary.trim()}\n\n💡 **Take-Home Message:** ${takeHome}`);
      }

      const updatePayload = isDiss ? { commentary: fullCommentary } : { commentary: fullCommentary, options: updatedOptions };
      const { data: updatedRows, error: errRev } = await supabase
        .from('questions_revalida')
        .update(updatePayload)
        .eq('id', q.id)
        .select('id');

      if (errRev || !updatedRows || updatedRows.length === 0) {
        throw new Error(errRev?.message || '0 linhas atualizadas em questions_revalida');
      }

      // Atualiza também expansion_revalida e SQLite se existirem
      supabase.from('questions_expansion_revalida').update(updatePayload).eq('id', q.id).then(() => {}).catch(() => {});
      try {
        db.prepare(`UPDATE questions_curated_staging SET commentary = ?, options = ? WHERE id = ? OR id = ?`)
          .run(fullCommentary, JSON.stringify(updatedOptions), `questions_expansion_revalida_${q.id}`, `questions_${q.id}`);
      } catch {}

      totalTokens += (usage?.total_tokens || 1400);
      processedCount++;
      successCount++;
      const duration = ((Date.now() - startQ) / 1000).toFixed(2);
      console.log(`[${processedCount}/${TARGET_TOTAL}] ${q.code} (${q.year}) | ${model} | ⚡ ${duration}s | ✅ Site OK`);

      recentHistory.push({
        code: q.code || q.id,
        tema: `${q.year} • ${q.especialidade || 'Revalida'}`,
        duration,
        tokens: usage?.total_tokens || 1400,
        status: 'OK',
        timestamp: new Date().toLocaleTimeString('pt-BR')
      });
      updateState();
    } catch (err) {
      processedCount++;
      errorCount++;
      console.error(`❌ [${processedCount}/${TARGET_TOTAL}] Falha em ${q.code || q.id}: ${err.message}`);
      recentHistory.push({
        code: q.code || q.id,
        tema: `${q.year} • ${q.especialidade || 'Revalida'}`,
        duration: 0,
        tokens: 0,
        status: 'ERRO: ' + err.message.slice(0, 30),
        timestamp: new Date().toLocaleTimeString('pt-BR')
      });
      updateState();
    }
  }

  if (TARGET_TOTAL === 0) {
    console.log('🎉 Nenhuma questão de texto puro pendente em questions_revalida!');
    updateState(null, 'COMPLETED');
    return;
  }

  updateState(null, 'RUNNING');
  let idx = 0;
  const active = new Set();

  while (idx < pendingQuestions.length || active.size > 0) {
    if (fs.existsSync(SIGNAL_PATH) && fs.readFileSync(SIGNAL_PATH, 'utf8').trim().toLowerCase() === 'stop') {
      updateState(null, 'STOPPED');
      console.log('🛑 Sinal de parada detectado.');
      break;
    }

    while (active.size < CONCURRENCY && idx < pendingQuestions.length) {
      const q = pendingQuestions[idx++];
      const p = processQuestion(q).then(() => active.delete(p));
      active.add(p);
    }
    if (active.size > 0) await Promise.race(active);
  }

  updateState(null, 'COMPLETED');
  console.log(`\n🏆 ESTEIRA GROQ REVALIDA LIVE CONCLUÍDA! Sucessos: ${successCount} | Falhas: ${errorCount}`);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
