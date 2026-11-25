import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// 1. Configurações da Chave Groq e Modelos
const GROQ_KEY = process.env.GROQ_API_KEY || env.GROQ_API_KEY || '';
const MODELS = [
  'openai/gpt-oss-120b',
  'qwen/qwen3.8-27b'
];

// 2. Carrega variáveis de ambiente para o Supabase
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

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Supabase não configurado no .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 3. Conecta ao SQLite SSOT
const SQLITE_PATH = 'data/supabase_tables/supabase_tables.db';
const db = new DatabaseSync(SQLITE_PATH);

// 4. Carrega arquivo de pediatria se existir para manter sincronizado
const JSON_PATH = 'data/pediatria_direto_questions.json';
let pediatriaJson = [];
if (fs.existsSync(JSON_PATH)) {
  try {
    pediatriaJson = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  } catch { }
}

// 5. Seleciona exatamente 100 questões pendentes de Pediatria
const pendingQuestions = db.prepare(`
  SELECT * FROM questions_curated_staging
  WHERE modalidade = 'Acesso Direto'
    AND especialidade = 'Pediatria'
    AND ((UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E')) OR is_anulada = 1)
    AND (commentary IS NULL OR commentary NOT LIKE '%Take-Home%')
    AND (has_images = 0 OR has_images IS NULL)
    AND (images IS NULL OR images = '[]' OR images = '')
  LIMIT 100
`).all();

const TARGET_TOTAL = pendingQuestions.length;
console.log(`================================================================================`);
console.log(`🚀 ESTEIRA GROQ DEDICADA — PEDIATRIA (100 QUESTÕES TEXTO PURO)`);
console.log(`- Modelos em rotação: ${MODELS.join(' & ')}`);
console.log(`- Chave Groq: ...${GROQ_KEY ? GROQ_KEY.slice(-6) : 'não configurada'} (100% Gratuita)`);
console.log(`- Total selecionado para produção: ${TARGET_TOTAL}`);
console.log(`- Supabase: questions_direto & questions`);
console.log(`- SQLite: questions_curated_staging`);
console.log(`================================================================================\n`);

let processedCount = 0;
let successCount = 0;
let errorCount = 0;
let modelIndex = 0;
const startTime = Date.now();
const STATE_PATH = 'data/pipeline_groq_state.json';
const SIGNAL_PATH = 'data/pipeline.signal';

function updateState(currentQ = null) {
  const elapsedSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));
  const qpm = processedCount > 0 ? parseFloat(((processedCount / elapsedSec) * 60).toFixed(1)) : 0;
  const remaining = TARGET_TOTAL - processedCount;
  const etaMinutes = qpm > 0 ? Math.round((remaining / qpm)) : 0;

  const state = {
    status: processedCount >= TARGET_TOTAL ? 'COMPLETED' : 'RUNNING',
    specialty: 'Pediatria',
    provider: 'Groq',
    models: MODELS,
    target: TARGET_TOTAL,
    processed: processedCount,
    success: successCount,
    errors: errorCount,
    qpm,
    etaMinutes,
    currentQuestion: currentQ,
    updatedAt: new Date().toISOString()
  };

  try {
    fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
  } catch { }
}

function sanitizePostgres(str) {
  if (!str) return '';
  return String(str).replace(/\u0000/g, '').replace(/\\u0000/g, '').replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '');
}

async function callGroqWithFallback(prompt, attempt = 1) {
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
        model: model,
        messages: [
          {
            role: 'system',
            content: 'Você é um Pediatra e Preceptor de Residência Médica de elite (SBP / Nelson Tratado de Pediatria / Ministério da Saúde). Responda estritamente em JSON válido.'
          },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 1500
      })
    });

    if (res.status === 429) {
      console.warn(`⏳ Rate limit 429 no modelo ${model}. Aguardando 4s e tentando próximo modelo...`);
      await new Promise(r => setTimeout(r, 4000));
      if (attempt < 5) return callGroqWithFallback(prompt, attempt + 1);
      throw new Error('Rate limit 429 excedido no Groq');
    }

    if (!res.ok) {
      const errText = await res.text();
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, 2000));
        return callGroqWithFallback(prompt, attempt + 1);
      }
      throw new Error(`Groq HTTP ${res.status}: ${errText.slice(0, 150)}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Resposta vazia da API do Groq');

    let parsed = null;
    try {
      parsed = JSON.parse(content);
    } catch {
      const clean = content.replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ');
      parsed = JSON.parse(clean);
    }

    return { parsed, model, usage: data.usage };
  } catch (err) {
    if (attempt < 4) {
      await new Promise(r => setTimeout(r, 2000));
      return callGroqWithFallback(prompt, attempt + 1);
    }
    throw err;
  }
}

async function solveQuestion(q) {
  const startQ = Date.now();
  updateState({ code: q.code, id: q.id, tema: q.tema });

  let options = q.options;
  if (typeof options === 'string') {
    try { options = JSON.parse(options); } catch { options = []; }
  }
  if (!Array.isArray(options)) options = [];

  const goldAnswer = (q.correct_answer || '').toUpperCase().trim();
  const isAnulada = q.is_anulada === 1;
  const optLetters = options.map(o => o.letter).join(', ');
  const formattedOptions = options.map(o => `${o.letter}) ${o.text}`).join('\n');

  const prompt = `Você é um Pediatra e Preceptor de Residência Médica (SBP / Ministério da Saúde / Nelson Tratado de Pediatria).
Fundamente com rigor acadêmico, concisão e exatidão clínica o gabarito oficial da banca examinadora.

Dados da Questão:
- Instituição/Banca: ${q.institution || q.banca || 'Oficial'} (${q.year || 2024})
- Tema: Pediatria - ${q.tema || 'Geral'}

Enunciado:
${q.statement}

Alternativas:
${formattedOptions}

${isAnulada
      ? '🔒 ATENÇÃO: QUESTÃO OFICIALMENTE ANULADA PELA BANCA. Justifique tecnicamente o motivo da anulação e as falhas nas assertivas.'
      : `🔒 GABARITO OFICIAL IMUTÁVEL (ÂNCORA DE OURO): ALTERNATIVA ${goldAnswer}.
Fundamente tecnicamente por que a alternativa ${goldAnswer} é a correta e aponte o erro dos demais distratores. Proibido divergir do gabarito oficial.`}

REGRAS OBRIGATÓRIAS:
1. Justificativas das Opções (${optLetters}):
   - Letra correta (${isAnulada ? 'ou assertivas' : goldAnswer}): Destaque o conceito padrão-ouro ou conduta mandatória em **negrito**.
   - Distratores incorretos: Seja conciso (1 a 2 frases curtas). Destaque em **negrito** o trecho ou conceito errôneo e indique a correção médica.
2. Comentário Integrado (finalCommentary):
   - Apresente um texto corrido único, coeso, direto e completo (cerca de 100 a 140 palavras), unindo o diagnóstico à conduta segundo consensos vigentes da SBP/MS. Destaque termos diagnósticos e condutas em **negrito**.
3. Take-Home Message:
   - Uma regra de ouro ou pérola clínica direta e inesquecível em 1 período.

RESPONDA EXCLUSIVAMENTE EM JSON VÁLIDO no seguinte formato:
{
  "options": {
    ${options.map(o => `"${o.letter}": "..."`).join(',\n    ')}
  },
  "finalCommentary": "...",
  "takeHomeMessage": "..."
}`;

  try {
    const { parsed, model, usage } = await callGroqWithFallback(prompt);

    const cleanFinal = sanitizePostgres(parsed.finalCommentary || '');
    const cleanTakeHome = sanitizePostgres(parsed.takeHomeMessage || '');
    const fullCommentary = `${cleanFinal}\n\n**Take-Home Message:** ${cleanTakeHome}`;

    const cleanedOptions = options.map(opt => ({
      ...opt,
      text: sanitizePostgres(opt.text),
      explanation: sanitizePostgres(parsed.options?.[opt.letter] || '')
    }));

    const uuidMatch = q.id.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    const plainId = uuidMatch ? uuidMatch[0] : q.id.replace(/^(questions_expansion_direto_|expansion_direto_|questions_)/, '');

    // 1. Atualiza Supabase questions_direto
    const { error: errDireto } = await supabase
      .from('questions_direto')
      .update({
        commentary: fullCommentary,
        options: cleanedOptions
      })
      .eq('id', plainId);

    // 2. Atualiza Supabase questions (se existir)
    supabase
      .from('questions')
      .update({
        commentary: fullCommentary,
        options: cleanedOptions
      })
      .eq('id', plainId)
      .then(() => { })
      .catch(() => { });

    // 3. Atualiza SQLite local SSOT
    db.prepare(`
      UPDATE questions_curated_staging
      SET commentary = ?, options = ?
      WHERE id = ?
    `).run(fullCommentary, JSON.stringify(cleanedOptions), q.id);

    // 4. Se existir no JSON de Pediatria, atualiza
    if (pediatriaJson.length > 0) {
      const idx = pediatriaJson.findIndex(j => j.id === plainId || j.code === q.code);
      if (idx !== -1) {
        pediatriaJson[idx].commentary = fullCommentary;
        pediatriaJson[idx].options = cleanedOptions;
      }
    }

    processedCount++;
    successCount++;
    const duration = ((Date.now() - startQ) / 1000).toFixed(2);
    console.log(`[${processedCount}/${TARGET_TOTAL}] ${q.code || plainId} | 🤖 ${model} | ⚡ ${duration}s | ${errDireto ? '❌ ' + errDireto.message : '✅ Supabase OK'}`);

    if (processedCount % 20 === 0 && pediatriaJson.length > 0) {
      try {
        fs.writeFileSync(JSON_PATH, JSON.stringify(pediatriaJson, null, 2), 'utf8');
      } catch { }
    }

    updateState();
  } catch (err) {
    processedCount++;
    errorCount++;
    console.error(`❌ [${processedCount}/${TARGET_TOTAL}] Falha na questão ${q.code || q.id}: ${err.message}`);
    updateState();
  }
}

async function main() {
  for (const q of pendingQuestions) {
    if (fs.existsSync(SIGNAL_PATH)) {
      const sig = fs.readFileSync(SIGNAL_PATH, 'utf8').trim().toLowerCase();
      if (sig === 'stop') {
        console.log('🛑 Sinal de parada detectado.');
        break;
      }
    }

    await solveQuestion(q);
    // Intervalo de segurança para não estourar os 8.000 tokens por minuto do Groq
    await new Promise(r => setTimeout(r, 600));
  }

  if (pediatriaJson.length > 0) {
    try {
      fs.writeFileSync(JSON_PATH, JSON.stringify(pediatriaJson, null, 2), 'utf8');
    } catch { }
  }

  updateState();
  console.log(`\n🎉 PROCESSO CONCLUÍDO!`);
  console.log(`- Sucessos: ${successCount}`);
  console.log(`- Falhas: ${errorCount}`);
  console.log(`- Total processado: ${processedCount}/${TARGET_TOTAL}`);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
