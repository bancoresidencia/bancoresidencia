/**
 * Sincronização Progressiva de Comentários Padrão-Ouro no Supabase
 * 
 * Atualiza exclusivamente as colunas 'commentary' e 'options' das questões
 * que possuem comentários padrão-ouro locais gerados e que estão pendentes no Supabase.
 * 
 * Políticas de Segurança e Estabilidade:
 * - Concorrência controlada (6 workers simultâneos)
 * - Pacing de 25ms entre requisições para manter CPU do Supabase em níveis baixos (< 5%)
 * - Sanitização de caracteres nulos (\u0000) e bytes inválidos
 * - Retry automático com backoff exponencial para resiliência a oscilações de rede
 * - Idempotente: se reexecutado, pula questões já sincronizadas
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: Credenciais do Supabase ausentes.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Sanitizador Postgres
function sanitizePostgres(str) {
  if (!str) return '';
  return String(str)
    .replace(/\u0000/g, '')
    .replace(/\\u0000/g, '')
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '');
}

// Arquivos das especialidades com comentários padrão-ouro locais
const SOURCES = [
  { name: 'Obstetrícia', path: 'data/obstetricia_final_questions.json' },
  { name: 'Ginecologia', path: 'data/ginecologia_final_questions.json' },
  { name: 'Urologia', path: 'data/urologia_final_questions.json' },
  { name: 'Clínica Médica', path: 'data/clinica_medica_final_questions.json' },
  { name: 'Cirurgia', path: 'data/cirurgia_final_questions.json' }
];

async function collectPendingTasks() {
  console.log('='.repeat(70));
  console.log('🔍 MAPEANDO QUESTÕES PENDENTES DE COMENTÁRIO PADRÃO-OURO...');
  console.log('='.repeat(70));

  const allPending = [];

  for (const src of SOURCES) {
    if (!fs.existsSync(src.path)) continue;
    console.log(`\n📂 Lendo ${src.name} (${src.path})...`);
    const list = JSON.parse(fs.readFileSync(src.path, 'utf8'));
    
    // Filtra questões que têm padrão-ouro gerado
    const goldList = list.filter(q => !!q.finalCommentary || (q.commentary && q.commentary.includes('Take-Home Message:')));
    console.log(`   - Encontradas ${goldList.length} questões com Padrão-Ouro local.`);

    // Checa no Supabase em lotes de 100 quais ainda precisam ser atualizadas
    const BATCH_SIZE = 100;
    let pendingCount = 0;

    for (let i = 0; i < goldList.length; i += BATCH_SIZE) {
      const batch = goldList.slice(i, i + BATCH_SIZE);
      const batchIds = batch.map(q => q.id);

      const { data, error } = await supabase
        .from('questions')
        .select('id, commentary')
        .in('id', batchIds);

      if (error) {
        console.error(`   ⚠️ Erro ao consultar lote no Supabase:`, error.message);
        continue;
      }

      const supaMap = new Map(data.map(d => [d.id, d.commentary || '']));

      for (const q of batch) {
        if (!supaMap.has(q.id)) {
          // Questão não existe no banco ativo (staged/fora da base ativa)
          continue;
        }

        const supaComm = supaMap.get(q.id);
        const needsUpdate = !supaComm || !supaComm.includes('Take-Home Message:');

        if (needsUpdate) {
          pendingCount++;
          allPending.push({
            id: q.id,
            code: q.code || q.id,
            especialidade: src.name,
            commentary: sanitizePostgres(q.commentary || q.finalCommentary || ''),
            options: (q.options || []).map(o => ({
              letter: o.letter || '',
              text: sanitizePostgres(o.text || ''),
              explanation: sanitizePostgres(o.explanation || '')
            }))
          });
        }
      }
    }

    console.log(`   - Pendentes confirmadas para sincronização: ${pendingCount}`);
  }

  return allPending;
}

async function executeProgressiveSync(tasks) {
  const total = tasks.length;
  console.log('\n' + '='.repeat(70));
  console.log(`🚀 INICIANDO SINCRONIZAÇÃO PROGRESSIVA: ${total} QUESTÕES`);
  console.log(`- Concorrência: 6 workers paralelos`);
  console.log(`- Pacing entre requisições: 25ms (Carga suave de CPU no Postgres)`);
  console.log('='.repeat(70) + '\n');

  let successCount = 0;
  let failCount = 0;
  const startTime = Date.now();
  let currentIndex = 0;

  async function updateSingle(task) {
    let attempts = 0;
    while (attempts < 3) {
      attempts++;
      try {
        const { error } = await supabase
          .from('questions')
          .update({
            commentary: task.commentary,
            options: task.options
          })
          .eq('id', task.id);

        if (error) throw error;
        successCount++;
        return true;
      } catch (err) {
        if (attempts >= 3) {
          failCount++;
          console.error(`❌ Falha na questão ${task.code} (${task.id}): ${err.message}`);
          return false;
        }
        await new Promise(r => setTimeout(r, attempts * 500));
      }
    }
  }

  const CONCURRENCY = 6;
  const activeWorkers = [];

  for (let i = 0; i < CONCURRENCY; i++) {
    activeWorkers.push(
      (async function worker() {
        while (currentIndex < tasks.length) {
          const idx = currentIndex++;
          const task = tasks[idx];
          if (!task) break;

          await updateSingle(task);

          // Pacing de 25ms para não sobrecarregar I/O do Supabase
          await new Promise(r => setTimeout(r, 25));

          const processed = successCount + failCount;
          if (processed % 100 === 0 || processed === total) {
            const elapsedSec = Math.max(1, (Date.now() - startTime) / 1000);
            const qps = (processed / elapsedSec).toFixed(1);
            const remaining = total - processed;
            const etaSec = qps > 0 ? Math.round(remaining / qps) : 0;
            const etaMin = (etaSec / 60).toFixed(1);

            console.log(
              `[PROGRESSO] ${processed}/${total} (${((processed / total) * 100).toFixed(1)}%) | ` +
              `Sucessos: ${successCount} | Falhas: ${failCount} | ` +
              `Velocidade: ${qps} q/s | ETA: ~${etaMin} min`
            );
          }
        }
      })()
    );
  }

  await Promise.all(activeWorkers);

  const totalSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n' + '='.repeat(70));
  console.log('🏁 SINCRONIZAÇÃO CONCLUÍDA!');
  console.log(`- Duração Total: ${totalSec}s`);
  console.log(`- Questões Atualizadas com Sucesso: ${successCount}`);
  console.log(`- Falhas: ${failCount}`);
  console.log('='.repeat(70));
}

async function verifyFinalStatus(tasks) {
  console.log('\n🔍 CONFERÊNCIA FINAL NO SUPABASE (Amostra e Totais)...');
  const sampleIds = tasks.slice(0, 50).map(t => t.id);
  const { data, error } = await supabase
    .from('questions')
    .select('id, code, commentary, options')
    .in('id', sampleIds);

  if (error) {
    console.error('Erro na verificação final:', error);
    return;
  }

  const verified = data.filter(d => d.commentary && d.commentary.includes('Take-Home Message:'));
  console.log(`✅ Amostra de 50 questões: ${verified.length}/50 confirmadas com Take-Home Message no Supabase.`);
}

async function run() {
  const pending = await collectPendingTasks();
  console.log(`\n📋 TOTAL GERAL IDENTIFICADO PARA SINCRONIZAÇÃO: ${pending.length} questões.`);
  
  if (pending.length === 0) {
    console.log('✨ Todas as questões já estão sincronizadas com o Padrão-Ouro!');
    return;
  }

  await executeProgressiveSync(pending);
  await verifyFinalStatus(pending);
}

run().catch(console.error);

