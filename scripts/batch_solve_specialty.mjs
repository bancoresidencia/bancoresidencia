import fs from 'fs';
import path from 'path';
import { solveQuestionDeep, updateQuestionsInSupabase } from './solve_questions_engine.mjs';

// Mapeamento de arquivos por especialidade
const SPECIALTY_FILES = {
  urologia: 'data/urologia_final_questions.json',
  nefrologia: 'data/nefrologia_final_questions.json',
  ginecologia: 'data/ginecologia_final_questions.json',
  obstetricia: 'data/obstetricia_final_questions.json',
  pediatria: 'data/pediatria_final_questions.json',
  cirurgia: 'data/cirurgia_final_questions.json',
  preventiva: 'data/medicina_preventiva_final_questions.json',
  clinica: 'data/clinica_medica_final_questions.json'
};

async function main() {
  const args = process.argv.slice(2);
  const targetSpec = (args[0] || 'urologia').toLowerCase();
  const filePath = SPECIALTY_FILES[targetSpec];

  if (!filePath || !fs.existsSync(filePath)) {
    console.error(`❌ Especialidade inválida ou arquivo não encontrado: ${targetSpec}`);
    console.log(`Disponíveis: ${Object.keys(SPECIALTY_FILES).join(', ')}`);
    process.exit(1);
  }

  // Parse de flags adicionais
  let limit = Infinity;
  const limitIdx = args.indexOf('--limit');
  if (limitIdx !== -1 && args[limitIdx + 1]) {
    limit = parseInt(args[limitIdx + 1], 10);
  }

  const syncSupabase = !args.includes('--no-supabase');

  console.log('\n======================================================');
  console.log(`🚀 PROCESSADOR SISTEMÁTICO DE GABARITOS & JUSTIFICATIVAS`);
  console.log(`🎯 Especialidade: [ ${targetSpec.toUpperCase()} ]`);
  console.log(`📂 Arquivo: ${filePath}`);
  console.log(`🔢 Limite de execução: ${limit === Infinity ? 'Todas' : limit}`);
  console.log(`☁️ Sincronizar Supabase: ${syncSupabase ? 'Sim' : 'Não'}`);
  console.log('======================================================\n');

  const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`📊 Total de questões no arquivo: ${questions.length}`);

  // Arquivo de checkpoint
  const checkpointDir = path.resolve('data/checkpoints');
  if (!fs.existsSync(checkpointDir)) {
    fs.mkdirSync(checkpointDir, { recursive: true });
  }
  const checkpointPath = path.join(checkpointDir, `${targetSpec}_deep_solved.json`);

  const solvedMap = new Map();
  if (fs.existsSync(checkpointPath)) {
    try {
      const saved = JSON.parse(fs.readFileSync(checkpointPath, 'utf8'));
      saved.forEach(q => {
        if (q && q.id && q.mainErrorReason) {
          solvedMap.set(q.id, q);
        }
      });
      console.log(`🔄 Checkpoint recuperado: ${solvedMap.size} questões já possuem padrão aprofundado.`);
    } catch {}
  }

  // Filtra ESTRITAMENTE questões com gabarito oficial homologado (A, B, C, D, E) e não anuladas
  const VALID_ANSWERS = new Set(['A', 'B', 'C', 'D', 'E']);
  const pending = questions
    .filter(q => {
      const ans = (q.correctAnswer || q.correct_answer || '').toUpperCase().trim();
      return VALID_ANSWERS.has(ans) && !q.isAnulada && !solvedMap.has(q.id);
    })
    .slice(0, limit);
  console.log(`⏳ Questões homologadas a processar nesta rodada: ${pending.length}\n`);

  if (pending.length === 0) {
    console.log('✨ Todas as questões desta especialidade já estão 100% resolvidas e justificadas!');
    return;
  }

  const CONCURRENCY = 4; // 4 contas paralelas simultâneas configuradas no pool de 7 chaves
  let processedCount = 0;
  let batchBuffer = [];
  const startTime = Date.now();

  let consecutiveFailures = 0;
  for (let i = 0; i < pending.length; i += CONCURRENCY) {
    const chunk = pending.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      chunk.map(async (q, idx) => {
        try {
          if (idx > 0) {
            await new Promise(r => setTimeout(r, idx * 400));
          }
          return await solveQuestionDeep(q);
        } catch (err) {
          console.error(`Erro ao resolver ${q.id}:`, err.message);
          return null;
        }
      })
    );

    const successfulThisChunk = results.filter(Boolean);
    if (successfulThisChunk.length === 0) {
      consecutiveFailures++;
      if (consecutiveFailures >= 5) {
        console.log('\n🛑 Atenção: Múltiplas falhas consecutivas em todas as contas.');
        console.log('📌 Provável esgotamento da cota diária do Google AI Studio nas chaves.');
        console.log('💾 Salvando o estado com segurança no checkpoint antes de parar...');
        break;
      }
    } else {
      consecutiveFailures = 0;
    }

    for (const solved of results) {
      if (solved && solved.id) {
        solvedMap.set(solved.id, solved);
        batchBuffer.push(solved);
        processedCount++;

        // Atualiza em memória a questão no array principal
        const originalIndex = questions.findIndex(q => q.id === solved.id);
        if (originalIndex !== -1) {
          questions[originalIndex] = {
            ...questions[originalIndex],
            correctAnswer: solved.correctAnswer,
            commentary: solved.commentary,
            mainErrorReason: solved.mainErrorReason,
            takeHomeMessage: solved.takeHomeMessage,
            guidelineEvolution: solved.guidelineEvolution,
            references: solved.references,
            options: solved.options
          };
        }
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const rate = (processedCount / (Date.now() - startTime) * 1000).toFixed(2);
    console.log(`⚡ Progresso: ${processedCount}/${pending.length} (${Math.round((processedCount / pending.length) * 100)}%) | ${rate} q/s | Tempo: ${elapsed}s`);

    // Sincroniza em disco e Supabase a cada 10 questões
    if (batchBuffer.length >= 10) {
      fs.writeFileSync(checkpointPath, JSON.stringify(Array.from(solvedMap.values()), null, 2));
      fs.writeFileSync(filePath, JSON.stringify(questions, null, 2));
      if (syncSupabase && batchBuffer.length > 0) {
        await updateQuestionsInSupabase(batchBuffer);
      }
      batchBuffer = [];
      console.log(`💾 Checkpoint salvo em disco e sincronizado no Supabase.`);
    }

    // Pausa balanceada para estabilidade das 5 conexões
    await new Promise(r => setTimeout(r, 800));
  }

  // Flush final do buffer residual
  if (batchBuffer.length > 0) {
    fs.writeFileSync(checkpointPath, JSON.stringify(Array.from(solvedMap.values()), null, 2));
    fs.writeFileSync(filePath, JSON.stringify(questions, null, 2));
    if (syncSupabase) {
      await updateQuestionsInSupabase(batchBuffer);
    }
    console.log(`💾 Buffer final sincronizado.`);
  }

  if (consecutiveFailures >= 5) {
    console.log('❌ Processamento interrompido devido a falhas consecutivas de cota.');
    process.exit(1);
  }

  console.log('\n======================================================');
  console.log(`🎉 RODADA FINALIZADA COM SUCESSO!`);
  console.log(`✅ Questões processadas: ${processedCount}`);
  console.log(`📚 Total no checkpoint da especialidade: ${solvedMap.size}`);
  console.log('======================================================\n');
}

main().catch(console.error);
