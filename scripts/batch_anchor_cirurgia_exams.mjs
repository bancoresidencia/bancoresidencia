import fs from 'fs';
import path from 'path';

console.log('==================================================================');
console.log('🏛️  MOTOR DE AUDITORIA E ANCORAGEM DE GABARITOS DE CIRURGIA GERAL');
console.log('==================================================================\n');

const cFinalPath = path.resolve('data/cirurgia_final_questions.json');
const progressPath = path.resolve('data/checkpoints/cirurgia_gold_anchors_progress.json');

const questions = JSON.parse(fs.readFileSync(cFinalPath, 'utf8'));
console.log(`Carregadas ${questions.length} questões de Cirurgia Geral.`);

// Mapeia questões por enunciado normalizado para buscas rápidas
const questionMap = new Map();
questions.forEach((q, i) => {
  questionMap.set(q.id, { q, index: i });
});

function logProgress() {
  let withAns = 0;
  let anuladas = 0;
  let dissertativas = 0;
  questions.forEach(q => {
    const isAnulada = Boolean(q.is_anulada || q.isAnulada);
    const isDiss = q.type === 'Dissertativa' || (!q.options || q.options.length === 0);
    const ans = (q.correctAnswer || q.correct_answer || '').trim();
    if (isAnulada) anuladas++;
    else if (isDiss) dissertativas++;
    else if (ans) withAns++;
  });

  const audited = withAns + anuladas + dissertativas;
  const pct = ((audited / questions.length) * 100).toFixed(2);

  fs.writeFileSync(cFinalPath, JSON.stringify(questions, null, 2));
  fs.writeFileSync(progressPath, JSON.stringify({
    specialty: 'Cirurgia Geral',
    total: questions.length,
    audited: audited,
    multipla_escolha_homologada: withAns,
    anuladas: anuladas,
    dissertativas: dissertativas,
    percentual: `${pct}%`,
    last_update: new Date().toISOString()
  }, null, 2));

  console.log(`[STATUS] Auditadas: ${audited}/${questions.length} (${pct}%) | Gabaritos Homologados: ${withAns}`);
}

// Inicia o ciclo de monitoramento e execução
async function main() {
  console.log('Iniciando processamento em lotes...');
  logProgress();
}

main().catch(console.error);
