import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { solveQuestionDeep } from './solve_questions_engine.mjs';

// Carrega variáveis do .env.local
const env = { ...process.env };
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) {
      let val = v.join('=').trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      env[k.trim()] = val;
    }
  });
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const PAID_KEY = env.GEMINI_API_KEY_PAID || process.env.GEMINI_API_KEY_PAID;

if (!SUPABASE_URL || !SUPABASE_KEY || !PAID_KEY) {
  console.error('❌ ERRO: Supabase ou Chave Paga (GEMINI_API_KEY_PAID) não configurados.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const DB_PATH = 'data/clinica_medica_final_questions.json';

const allQuestions = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

// Identifica questões que precisam de reparo (terminam em reticências ou sem pontuação terminal)
const targetQuestions = allQuestions.filter(q => {
  const fc = (q.finalCommentary || q.commentary?.finalCommentary || '').trim();
  if (!fc) return false;
  if (fc.endsWith('...') || fc.endsWith('…')) return true;
  if (!/[.!?:"')\]]$/.test(fc)) return true;
  return false;
});

console.log('================================================================================');
console.log('🔧 REPARO CIRÚRGICO DE COMENTÁRIOS TRUNCADOS / RETICÊNCIAS');
console.log(`- Total de questões afetadas para reparo: ${targetQuestions.length}`);
console.log(`- Concorrência: 15 workers paralelos`);
console.log('================================================================================\n');

if (targetQuestions.length === 0) {
  console.log('✅ Nenhuma questão com truncamento encontrada! Base 100% íntegra.');
  process.exit(0);
}

const CONCURRENCY = 15;
let currentIndex = 0;
let successCount = 0;
let errorCount = 0;
let totalTokensIn = 0;
let totalTokensOut = 0;
const runningPromises = new Set();
const startTime = Date.now();

const sanitizePostgres = (str) => {
  if (!str) return '';
  return String(str).replace(/\u0000/g, '').replace(/\\u0000/g, '').replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '');
};

function saveDb() {
  fs.writeFileSync(DB_PATH, JSON.stringify(allQuestions, null, 2), 'utf8');
}

async function repairOneQuestion(q, idx) {
  const t0 = Date.now();
  try {
    const res = await solveQuestionDeep(q);
    if (!res || !res.finalCommentary) {
      throw new Error('Falha ao gerar comentário reparado');
    }

    const duration = ((Date.now() - t0) / 1000).toFixed(2);
    const pTokens = res.usageMetadata?.promptTokenCount || 0;
    const cTokens = res.usageMetadata?.candidatesTokenCount || 0;
    totalTokensIn += pTokens;
    totalTokensOut += cTokens;
    successCount++;

    const cleanedOptions = (res.options || []).map(o => ({
      ...o,
      text: sanitizePostgres(o.text),
      explanation: sanitizePostgres(o.explanation)
    }));

    // Sincroniza Supabase
    const { error: supaErr } = await supabase
      .from('questions')
      .update({
        commentary: sanitizePostgres(res.commentary),
        options: cleanedOptions
      })
      .eq('id', q.id);

    const supaStatus = supaErr ? `❌ Supabase: ${supaErr.message.slice(0, 40)}` : `⚡ Supabase OK`;

    // Atualiza base local em memória
    const idxInAll = allQuestions.findIndex(item => item.id === q.id);
    if (idxInAll !== -1) {
      allQuestions[idxInAll] = {
        ...allQuestions[idxInAll],
        options: res.options,
        commentary: res.commentary,
        finalCommentary: res.finalCommentary,
        mainErrorReason: res.mainErrorReason,
        takeHomeMessage: res.takeHomeMessage,
        guidelineEvolution: res.guidelineEvolution,
        references: res.references,
        updatedAt: new Date().toISOString()
      };
    }

    console.log(`[${idx + 1}/${targetQuestions.length}] ${q.code} | ⏱️ ${duration}s | Tam: ${res.finalCommentary.length} carac | Reticências: ${res.finalCommentary.endsWith('...') ? 'SIM' : 'NÃO'} | ${supaStatus}`);

    // Salva a cada 25 questões
    if (successCount % 25 === 0) {
      saveDb();
    }
  } catch (err) {
    errorCount++;
    console.error(`❌ Erro no reparo de ${q.code}: ${err.message}`);
  }
}

// Loop de execução paralela
while (currentIndex < targetQuestions.length || runningPromises.size > 0) {
  while (runningPromises.size < CONCURRENCY && currentIndex < targetQuestions.length) {
    const q = targetQuestions[currentIndex];
    const taskIdx = currentIndex;
    const p = repairOneQuestion(q, taskIdx).finally(() => {
      runningPromises.delete(p);
    });
    runningPromises.add(p);
    currentIndex++;
  }

  if (runningPromises.size > 0) {
    await Promise.race(runningPromises);
  }
}

// Salva resultado final
saveDb();

const totalSec = ((Date.now() - startTime) / 1000).toFixed(1);
console.log('\n================================================================================');
console.log('🎉 REPARO CIRÚRGICO CONCLUÍDO!');
console.log(`- Total reparado com sucesso: ${successCount} questões`);
console.log(`- Falhas: ${errorCount}`);
console.log(`- Tempo decorrido: ${totalSec}s (~${(totalSec / 60).toFixed(1)} min)`);
console.log(`- Tokens consumidos: In=${totalTokensIn.toLocaleString('pt-BR')} | Out=${totalTokensOut.toLocaleString('pt-BR')}`);
console.log('================================================================================\n');

