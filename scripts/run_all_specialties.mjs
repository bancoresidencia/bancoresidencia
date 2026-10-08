import fs from 'fs';
import path from 'path';
import { solveQuestionDeep, updateQuestionsInSupabase } from './solve_questions_engine.mjs';

const SPECIALTIES_ORDER = [
  { key: 'urologia', name: 'Urologia', file: 'data/urologia_final_questions.json' },
  { key: 'ginecologia', name: 'Ginecologia', file: 'data/ginecologia_final_questions.json' },
  { key: 'cirurgia', name: 'Cirurgia Geral', file: 'data/cirurgia_final_questions.json' },
  { key: 'obstetricia', name: 'Obstetrícia', file: 'data/obstetricia_final_questions.json' },
  { key: 'pediatria', name: 'Pediatria', file: 'data/pediatria_final_questions.json' },
  { key: 'preventiva', name: 'Medicina Preventiva', file: 'data/medicina_preventiva_final_questions.json' },
  { key: 'clinica', name: 'Clínica Médica', file: 'data/clinica_medica_final_questions.json' }
];

async function processSpecialty(spec) {
  console.log(`\n======================================================`);
  console.log(`🩺 INICIANDO ESPECIALIDADE: [ ${spec.name.toUpperCase()} ]`);
  console.log(`📂 Arquivo: ${spec.file}`);
  console.log(`======================================================`);

  if (!fs.existsSync(spec.file)) {
    console.warn(`⚠️ Arquivo não encontrado: ${spec.file}`);
    return;
  }

  const questions = JSON.parse(fs.readFileSync(spec.file, 'utf8'));
  const checkpointDir = path.resolve('data/checkpoints');
  if (!fs.existsSync(checkpointDir)) {
    fs.mkdirSync(checkpointDir, { recursive: true });
  }
  const checkpointPath = path.join(checkpointDir, `${spec.key}_deep_solved.json`);

  const solvedMap = new Map();
  if (fs.existsSync(checkpointPath)) {
    try {
      const saved = JSON.parse(fs.readFileSync(checkpointPath, 'utf8'));
      saved.forEach(q => {
        if (q && q.id && q.mainErrorReason) {
          solvedMap.set(q.id, q);
        }
      });
      console.log(`🔄 Checkpoint carregado: ${solvedMap.size} já resolvidas nesta área.`);
    } catch {}
  }

  const CONCURRENCY = 3;
  let batchBuffer = [];
  let processedThisSession = 0;
  const startTime = Date.now();

  while (true) {
    const pending = questions.filter(q => !solvedMap.has(q.id));
    if (pending.length === 0) {
      console.log(`\n🎉 ESPECIALIDADE ${spec.name.toUpperCase()} 100% CONCLUÍDA (${questions.length}/${questions.length})!`);
      break;
    }

    const chunk = pending.slice(0, CONCURRENCY);
    const results = await Promise.all(
      chunk.map(async q => {
        try {
          return await solveQuestionDeep(q);
        } catch (err) {
          console.error(`Erro ao resolver questão ${q.id}:`, err.message);
          return null;
        }
      })
    );

    let anySolved = false;
    for (const solved of results) {
      if (solved && solved.id) {
        anySolved = true;
        solvedMap.set(solved.id, solved);
        batchBuffer.push(solved);
        processedThisSession++;

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
    const rate = ((processedThisSession / (Date.now() - startTime)) * 1000).toFixed(2);
    console.log(
      `⚡ [${spec.name}] Progresso: ${solvedMap.size}/${questions.length} (${Math.round((solvedMap.size / questions.length) * 100)}%) | ${rate} q/s | Tempo: ${elapsed}s`
    );

    // Salva em disco e atualiza Supabase a cada 15 questões ou término
    if (batchBuffer.length >= 15 || solvedMap.size === questions.length) {
      fs.writeFileSync(checkpointPath, JSON.stringify(Array.from(solvedMap.values()), null, 2));
      fs.writeFileSync(spec.file, JSON.stringify(questions, null, 2));

      await updateQuestionsInSupabase(batchBuffer);
      batchBuffer = [];
    }

    // Se nenhum resolveu no chunk (ex: problema transitório), aguarda um pouco mais antes de retentar
    if (!anySolved) {
      console.warn(`⚠️ Lote sem resolução imediata, aguardando 2s antes do próximo ciclo...`);
      await new Promise(r => setTimeout(r, 2000));
    } else {
      await new Promise(r => setTimeout(r, 300));
    }
  }

  // Gravação final da especialidade
  fs.writeFileSync(checkpointPath, JSON.stringify(Array.from(solvedMap.values()), null, 2));
  fs.writeFileSync(spec.file, JSON.stringify(questions, null, 2));
  if (batchBuffer.length > 0) {
    await updateQuestionsInSupabase(batchBuffer);
  }
}

async function runAll() {
  console.log('\n======================================================');
  console.log('🚀 INICIANDO PROCESSAMENTO COMPLETO DE TODAS AS ÁREAS');
  console.log('======================================================\n');

  for (const spec of SPECIALTIES_ORDER) {
    await processSpecialty(spec);
  }

  console.log('\n======================================================');
  console.log('🏆 TODAS AS ESPECIALIDADES DO BANCO FORAM CONCLUÍDAS!');
  console.log('======================================================\n');
}

runAll().catch(console.error);
