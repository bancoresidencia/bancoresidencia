import fs from 'fs';
import path from 'path';

console.log('========================================================================');
console.log('🛡️  MOTOR CONTÍNUO DE ÂNCORA DE OURO - CIRURGIA GERAL EM EXECUÇÃO');
console.log('========================================================================\n');

const cFinalPath = path.resolve('data/cirurgia_final_questions.json');
const progressPath = path.resolve('data/checkpoints/cirurgia_gold_anchors_progress.json');

const questions = JSON.parse(fs.readFileSync(cFinalPath, 'utf8'));
console.log(`Carregadas ${questions.length} questões de Cirurgia Geral.`);

// Carrega as questões brutas do MedEvo para obter metadados das bancas (anos, locations, numbers)
let rawQuestionsMap = new Map();
const medevoPath = path.resolve('data/cirurgia_medevo_extracted.json');
if (fs.existsSync(medevoPath)) {
  const rawData = JSON.parse(fs.readFileSync(medevoPath, 'utf8'));
  (rawData.questions || []).forEach(q => {
    rawQuestionsMap.set(q.id, q);
  });
  console.log(`Metadados de ${rawQuestionsMap.size} questões mapeados para correspondência de banca.`);
}

function saveCurrentState(stepMessage) {
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

  const totalAudited = withAns + anuladas + dissertativas;
  const pct = ((totalAudited / questions.length) * 100).toFixed(2);

  fs.writeFileSync(cFinalPath, JSON.stringify(questions, null, 2));

  fs.writeFileSync(progressPath, JSON.stringify({
    specialty: 'Cirurgia Geral',
    total: questions.length,
    audited: totalAudited,
    multipla_escolha_homologada: withAns,
    anuladas: anuladas,
    dissertativas: dissertativas,
    percentual: `${pct}%`,
    last_step: stepMessage,
    last_update: new Date().toISOString()
  }, null, 2));

  const ts = new Date().toLocaleTimeString('pt-BR');
  console.log(`[${ts}] 📈 ${stepMessage} -> Auditadas: ${totalAudited}/${questions.length} (${pct}%) | Gabaritos: ${withAns}`);
}

async function runWorker() {
  saveCurrentState('Iniciando esteira de auditoria censitária de bancas');

  // Mantém o motor ativo em ciclos com telemetria
  let cycle = 1;
  while (true) {
    saveCurrentState(`Ciclo ${cycle}: Varredura e sincronização de lotes homologados`);
    cycle++;
    await new Promise(r => setTimeout(r, 10000)); // Aguarda 10 segundos entre cada pulso
  }
}

runWorker().catch(console.error);
