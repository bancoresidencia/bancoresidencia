import fs from 'fs';
import path from 'path';
import { solveQuestionDeep, updateQuestionsInSupabase } from './solve_questions_engine.mjs';

// Carrega variáveis de ambiente
const env = { ...process.env };
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ ERRO CRÍTICO: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios.');
  process.exit(1);
}

// Configurações de execução
const args = process.argv.slice(2);
const targetSpec = (args[0] || env.TARGET_SPECIALTY || 'cirurgia').toLowerCase();
const concurrency = parseInt(env.CONCURRENCY || '6', 10);
const limit = parseInt(env.BATCH_LIMIT || '0', 10) || Infinity;

console.log('\n======================================================');
console.log('☁️  CLOUD RUN JOB — RESOLUÇÃO DE QUESTÕES EM NUVEM');
console.log(`🎯 Especialidade Alvo: [ ${targetSpec.toUpperCase()} ]`);
console.log(`⚡ Fluxos Paralelos (Concurrency): ${concurrency}`);
console.log(`🔢 Limite desta Rodada: ${limit === Infinity ? 'Sem limite (até teto de cota)' : limit}`);
console.log('======================================================\n');

/**
 * Busca lote de questões pendentes diretamente do Supabase
 */
async function fetchPendingFromSupabase(spec, pageSize = 100) {
  const specFilter = spec.charAt(0).toUpperCase() + spec.slice(1);
  const url = `${SUPABASE_URL}/rest/v1/questions?select=id,statement,options,correct_answer,institution,banca,year,especialidade,tema,foco,subfoco,commentary&especialidade=ilike.*${specFilter}*&correct_answer=not.is.null&commentary=not.ilike.*Principal%20Motivo*&limit=${pageSize}`;

  try {
    const res = await fetch(url, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Erro ao buscar questões no Supabase: ${res.status} - ${err}`);
    }

    const data = await res.json();
    return (data || []).filter(q => {
      const ans = (q.correct_answer || '').trim().toUpperCase();
      return ['A', 'B', 'C', 'D', 'E'].includes(ans) && Array.isArray(q.options) && q.options.length >= 2;
    });
  } catch (err) {
    console.error('Falha na busca remota do Supabase:', err.message);
    return [];
  }
}

async function main() {
  let shouldAbort = false;
  let totalProcessed = 0;
  const startTime = Date.now();

  // Tratamento de desligamento suave (Cloud Run SIGTERM)
  process.on('SIGTERM', () => {
    console.log('⚠️ Sinal SIGTERM recebido do Cloud Run. Finalizando lote atual...');
    shouldAbort = true;
  });

  process.on('SIGINT', () => {
    console.log('⚠️ Interrupção manual recebida. Finalizando lote atual...');
    shouldAbort = true;
  });

  let batchBuffer = [];

  while (!shouldAbort && totalProcessed < limit) {
    console.log(`📡 Consultando Supabase por questões pendentes de [${targetSpec}]...`);
    const pendingQuestions = await fetchPendingFromSupabase(targetSpec, 100);

    if (pendingQuestions.length === 0) {
      console.log(`✨ Nenhuma questão pendente encontrada no Supabase para [${targetSpec}].`);
      break;
    }

    console.log(`📋 Lote de ${pendingQuestions.length} questões pendentes carregado da nuvem.`);

    let queueIdx = 0;
    const workers = Array.from({ length: concurrency }, async (_, workerId) => {
      await new Promise(r => setTimeout(r, workerId * 400));

      while (queueIdx < pendingQuestions.length && !shouldAbort && totalProcessed < limit) {
        const currentIdx = queueIdx++;
        const q = pendingQuestions[currentIdx];
        if (!q) break;

        try {
          const solved = await solveQuestionDeep({
            ...q,
            correctAnswer: q.correct_answer
          });

          if (solved && solved.id) {
            batchBuffer.push(solved);
            totalProcessed++;

            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            const rate = ((totalProcessed / (Date.now() - startTime)) * 1000).toFixed(2);
            console.log(`⚡ Progresso Cloud: ${totalProcessed} resolvidas | ${rate} q/s | [${solved.id.slice(0, 8)}]`);

            if (batchBuffer.length >= 15) {
              const toSync = [...batchBuffer];
              batchBuffer = [];
              const ok = await updateQuestionsInSupabase(toSync);
              if (ok) {
                console.log(`💾 Lote de 15 questões sincronizado com sucesso no Supabase.`);
              }
            }
          }
        } catch (err) {
          console.error(`Erro na questão ${q.id}:`, err.message);
          if (err.message && err.message.includes('esgotaram suas cotas diárias')) {
            console.error('🛑 TODAS AS CHAVES ESGOTARAM COTA. Finalizando execução do Job.');
            shouldAbort = true;
            break;
          }
        }
      }
    });

    await Promise.all(workers);

    // Flush residual do buffer
    if (batchBuffer.length > 0) {
      const toSync = [...batchBuffer];
      batchBuffer = [];
      await updateQuestionsInSupabase(toSync);
      console.log(`💾 Buffer final de ${toSync.length} questões sincronizado no Supabase.`);
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n======================================================');
  console.log('🎉 EXECUÇÃO DO CLOUD RUN JOB CONCLUÍDA!');
  console.log(`✅ Total de questões resolvidas nesta sessão: ${totalProcessed}`);
  console.log(`⏱️ Tempo total de execução: ${totalTime}s`);
  console.log('======================================================\n');

  process.exit(0);
}

main().catch(err => {
  console.error('❌ Erro fatal no job:', err);
  process.exit(1);
});
