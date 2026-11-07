import fs from 'fs';
import path from 'path';
import { solveQuestionDeep, updateQuestionsInSupabase, PAID_KEY } from './solve_questions_engine.mjs';

const SPECIALTY_FILES = {
  cirurgia: 'data/cirurgia_final_questions.json',
  clinica: 'data/clinica_medica_final_questions.json',
  clinica_medica: 'data/clinica_medica_final_questions.json',
  ginecologia: 'data/ginecologia_final_questions.json',
  obstetricia: 'data/obstetricia_final_questions.json',
  pediatria: 'data/pediatria_final_questions.json',
  preventiva: 'data/medicina_preventiva_final_questions.json',
  urologia: 'data/urologia_final_questions.json',
  nefrologia: 'data/nefrologia_final_questions.json'
};

function hasImages(q) {
  if (q.imageUrl || q.image_url) return true;
  if (Array.isArray(q.images) && q.images.some(Boolean)) return true;
  const s = q.statement || '';
  if (/!\[.*?\]\((https?:\/\/[^\s\)]+|\/images\/[^\s\)]+|[^\s\)]+\.(?:png|jpe?g|webp|gif))/i.test(s)) return true;
  if (/<img[^>]+src=/i.test(s)) return true;
  if (Array.isArray(q.options) && q.options.some(o => o.imageUrl || o.image_url)) return true;
  return false;
}

function hasExistingComment(q) {
  return Boolean(
    q.mainErrorReason || 
    (q.commentary && q.commentary.length > 150) || 
    (Array.isArray(q.options) && q.options.some(o => o.explanation && o.explanation.length > 30))
  );
}

function safeWriteJson(destPath, data, spaces = 0) {
  const tmpPath = destPath + '.tmp';
  const str = spaces > 0 ? JSON.stringify(data, null, spaces) : JSON.stringify(data);
  fs.writeFileSync(tmpPath, str, 'utf8');
  if (fs.existsSync(destPath)) {
    try { fs.unlinkSync(destPath); } catch {}
  }
  fs.renameSync(tmpPath, destPath);
}

async function main() {
  const args = process.argv.slice(2);
  const targetSpec = (args[0] || 'todas').toLowerCase();
  
  let mode = 'all'; // 'remake', 'pending', 'all'
  const modeIdx = args.indexOf('--mode');
  if (modeIdx !== -1 && args[modeIdx + 1]) {
    mode = args[modeIdx + 1].toLowerCase();
  }

  let limit = Infinity;
  const limitIdx = args.indexOf('--limit');
  if (limitIdx !== -1 && args[limitIdx + 1]) {
    limit = parseInt(args[limitIdx + 1], 10);
  }

  const syncSupabase = !args.includes('--no-supabase');

  console.log('\n======================================================');
  console.log('👁️  PIPELINE DE VISÃO COMPUTACIONAL — GEMINI 3.5 FLASH-LITE');
  console.log(`🔑 Chave PAGA: ${PAID_KEY ? 'Sim (Alta Performance)' : 'Não (Chaves Gratuitas)'}`);
  console.log(`🎯 Modo: [ ${mode.toUpperCase()} ] (remake = reescrever já comentadas | pending = novas)`);
  console.log(`📚 Especialidade: [ ${targetSpec.toUpperCase()} ]`);
  console.log(`🔢 Limite de execução: ${limit === Infinity ? 'Sem limite' : limit}`);
  console.log(`☁️ Sincronizar Supabase: ${syncSupabase ? 'Sim' : 'Não'}`);
  console.log('======================================================\n');

  const specsToProcess = (targetSpec === 'todas' || targetSpec === 'all')
    ? ['cirurgia', 'clinica_medica', 'ginecologia', 'obstetricia', 'pediatria', 'preventiva']
    : [targetSpec];

  let totalProcessed = 0;

  for (const specKey of specsToProcess) {
    const filePath = SPECIALTY_FILES[specKey];
    if (!filePath || !fs.existsSync(filePath)) continue;

    console.log(`\n📂 Carregando ${specKey.toUpperCase()} de ${filePath}...`);
    const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const checkpointDir = path.resolve('data/checkpoints');
    if (!fs.existsSync(checkpointDir)) fs.mkdirSync(checkpointDir, { recursive: true });
    const checkpointPath = path.join(checkpointDir, `vision_${specKey}.json`);

    const checkpointMap = new Map();
    if (fs.existsSync(checkpointPath)) {
      try {
        const saved = JSON.parse(fs.readFileSync(checkpointPath, 'utf8'));
        saved.forEach(q => q && q.id && checkpointMap.set(q.id, q));
        console.log(`🔄 Checkpoint de visão carregado: ${checkpointMap.size} questões salvas.`);
      } catch {}
    }

    const VALID_ANSWERS = new Set(['A', 'B', 'C', 'D', 'E']);
    const eligible = questions.filter(q => {
      const ans = (q.correctAnswer || q.correct_answer || '').toUpperCase().trim();
      if (!VALID_ANSWERS.has(ans) || q.isAnulada || q.is_anulada) return false;
      if (!hasImages(q)) return false;
      if (checkpointMap.has(q.id)) return false;

      const commented = hasExistingComment(q);
      if (mode === 'remake' && !commented) return false;
      if (mode === 'pending' && commented) return false;

      return true;
    }).slice(0, limit - totalProcessed);

    console.log(`⏳ Questões com imagem a processar em ${specKey.toUpperCase()}: ${eligible.length}`);
    if (eligible.length === 0) continue;

    const CONCURRENCY = 4;
    let queueIdx = 0;
    let batchBuffer = [];
    const startTime = Date.now();

    const workers = Array.from({ length: CONCURRENCY }, async (_, workerId) => {
      await new Promise(r => setTimeout(r, workerId * 400));
      while (queueIdx < eligible.length) {
        const currentIdx = queueIdx++;
        const q = eligible[currentIdx];
        if (!q) break;

        try {
          const solved = await solveQuestionDeep(q);
          if (solved && solved.id) {
            checkpointMap.set(solved.id, solved);
            batchBuffer.push(solved);
            totalProcessed++;

            const origIdx = questions.findIndex(item => item.id === solved.id);
            if (origIdx !== -1) {
              questions[origIdx] = {
                ...questions[origIdx],
                correctAnswer: solved.correctAnswer,
                commentary: solved.commentary,
                finalCommentary: solved.finalCommentary,
                mainErrorReason: solved.mainErrorReason,
                takeHomeMessage: solved.takeHomeMessage,
                guidelineEvolution: solved.guidelineEvolution,
                references: solved.references,
                options: solved.options
              };
            }

            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            const rate = ((checkpointMap.size / (Date.now() - startTime)) * 1000).toFixed(2);
            console.log(`👁️ Progresso [${specKey}]: ${checkpointMap.size}/${eligible.length} | ${rate} q/s | [${solved.id.slice(0, 8)}]`);

            if (batchBuffer.length >= 10) {
              safeWriteJson(checkpointPath, Array.from(checkpointMap.values()));
              safeWriteJson(filePath, questions, 2);
              if (syncSupabase && batchBuffer.length > 0) {
                const toSync = [...batchBuffer];
                updateQuestionsInSupabase(toSync).catch(e => console.error('Erro sync Supabase:', e.message));
              }
              batchBuffer = [];
            }
          }
        } catch (err) {
          console.error(`Erro ao resolver questão com imagem ${q.id}:`, err.message);
        }
      }
    });

    await Promise.all(workers);

    if (batchBuffer.length > 0) {
      if (syncSupabase) await updateQuestionsInSupabase(batchBuffer);
      batchBuffer = [];
    }
    safeWriteJson(checkpointPath, Array.from(checkpointMap.values()));
    safeWriteJson(filePath, questions, 2);
    console.log(`💾 Checkpoint e arquivo ${filePath} salvos.`);

    if (totalProcessed >= limit) break;
  }

  console.log('\n======================================================');
  console.log('🎉 PIPELINE DE VISÃO FINALIZADO COM SUCESSO!');
  console.log(`✅ Total de questões com imagem processadas: ${totalProcessed}`);
  console.log('======================================================\n');
}

main().catch(console.error);

