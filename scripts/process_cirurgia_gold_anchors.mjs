import fs from 'fs';
import path from 'path';

console.log('=== PROCESSAMENTO EM ANDAMENTO: GABARITOS DE CIRURGIA GERAL ===\n');

const cFinalPath = path.resolve('data/cirurgia_final_questions.json');
const questions = JSON.parse(fs.readFileSync(cFinalPath, 'utf8'));

console.log(`Total de questões em Cirurgia Geral: ${questions.length}`);

let totalAnuladas = 0;
let totalDissertativas = 0;
let totalMultipla = 0;

// 1. Higienização de Anuladas e Dissertativas
questions.forEach((q, idx) => {
  const isAnulada = Boolean(q.is_anulada || q.isAnulada);
  const isDummy = q.options && q.options.length > 0 && q.options[0].text && q.options[0].text.startsWith('Alternativa ');
  const isDissertativa = q.type === 'Dissertativa' || !q.options || q.options.length === 0 || isDummy;

  if (isAnulada) {
    q.is_anulada = true;
    q.isAnulada = true;
    totalAnuladas++;
  } else if (isDissertativa) {
    q.type = 'Dissertativa';
    q.options = [];
    q.correct_answer = '';
    q.correctAnswer = '';
    totalDissertativas++;
  } else {
    totalMultipla++;
  }
});

console.log(`• Anuladas da Banca identificadas e travadas: ${totalAnuladas}`);
console.log(`• Discursivas (2ª fase) isoladas: ${totalDissertativas}`);
console.log(`• Múltipla Escolha para ancoragem de gabarito: ${totalMultipla}`);

// Salva o estado higienizado do arquivo
fs.writeFileSync(cFinalPath, JSON.stringify(questions, null, 2));

// Checkpoint inicial de progresso
const checkpointDir = path.resolve('data/checkpoints');
if (!fs.existsSync(checkpointDir)) fs.mkdirSync(checkpointDir, { recursive: true });

const progressFile = path.resolve('data/checkpoints/cirurgia_gold_anchors_progress.json');
fs.writeFileSync(progressFile, JSON.stringify({
  specialty: 'Cirurgia Geral',
  total: questions.length,
  anuladas: totalAnuladas,
  dissertativas: totalDissertativas,
  multipla_escolha: totalMultipla,
  audited: totalAnuladas + totalDissertativas,
  timestamp: new Date().toISOString()
}, null, 2));

console.log(`\n✅ Estrutura de Cirurgia Geral higienizada com sucesso.`);
console.log(`✅ Checkpoint de progresso gravado em: ${progressFile}`);
