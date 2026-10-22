import fs from 'fs';
import path from 'path';

const BASE_DIR = process.cwd();
const DATA_DIR = path.join(BASE_DIR, 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups_pre_correcao');

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

console.log('='.repeat(90));
console.log('🚀 INICIANDO EXECUÇÃO: FASE 1 & FASE 2');
console.log('='.repeat(90));

// 1. Carregar Urologia (Referência Blindada 100%)
console.log('\n📦 [1/4] Carregando Urologia 100% blindada...');
const uroPath = path.join(DATA_DIR, 'urologia_final_questions.json');
const uroQuestions = JSON.parse(fs.readFileSync(uroPath, 'utf8'));
const uroMap = new Map();
for (const u of uroQuestions) {
  if (u.id) uroMap.set(u.id, u);
}
console.log(`• Urologia carregada: ${uroQuestions.length} questões.`);

// 2. Executar Fase 1: Alinhamento Urologia -> Cirurgia Geral
console.log('\n📦 [2/4] Executando FASE 1: Alinhamento Cirurgia Geral com Urologia...');
const cirPath = path.join(DATA_DIR, 'cirurgia_final_questions.json');
const cirBackupPath = path.join(BACKUP_DIR, 'cirurgia_final_questions.json.bak_phase1');
fs.copyFileSync(cirPath, cirBackupPath);
console.log(`  Backup criado em: ${cirBackupPath}`);

const cirQuestions = JSON.parse(fs.readFileSync(cirPath, 'utf8'));
let phase1UpdatedCount = 0;
const phase1Log = [];

for (const q of cirQuestions) {
  const uro = uroMap.get(q.id);
  if (!uro) continue;

  const uroAns = (uro.correct_answer || uro.correctAnswer || '').trim().toUpperCase();
  const cirAns = (q.correct_answer || q.correctAnswer || '').trim().toUpperCase();

  // Se houver qualquer divergência ou falta de comentário
  const needsAnswerUpdate = uroAns && uroAns !== cirAns;
  const needsCommentaryUpdate = (!q.commentary || q.commentary.length < 50) && (uro.commentary && uro.commentary.length > 50);

  if (needsAnswerUpdate || needsCommentaryUpdate) {
    const oldAns = cirAns;
    if (needsAnswerUpdate) {
      q.correct_answer = uroAns;
      q.correctAnswer = uroAns;
    }
    if (needsCommentaryUpdate) {
      q.commentary = uro.commentary;
    }
    if (uro.options && Array.isArray(uro.options) && uro.options.some(o => o.explanation)) {
      q.options = uro.options.map(uo => ({ ...uo }));
    }
    phase1UpdatedCount++;
    phase1Log.push({
      id: q.id,
      code: q.code,
      oldAns,
      newAns: uroAns,
      commentaryUpdated: needsCommentaryUpdate
    });
  }
}

fs.writeFileSync(cirPath, JSON.stringify(cirQuestions, null, 2), 'utf8');
console.log(`✅ FASE 1 CONCLUÍDA: ${phase1UpdatedCount} questões de Cirurgia Geral alinhadas com Urologia Blindada.`);

// 3. Executar Fase 2: Normalização das Anuladas em Todas as Especialidades
console.log('\n📦 [3/4] Executando FASE 2: Normalização de Anulações...');

const rep = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'relatorio_auditoria_integral_gabaritos.json'), 'utf8'));
const anulada11 = rep.details.commentaryMentionAnuladaActiveKey || [];
const anulada11Ids = new Set(anulada11.map(a => a.id));
console.log(`• Questões com anulação atestada em comentário para converter: ${anulada11Ids.size}`);

const QUESTION_FILES = [
  'cirurgia_final_questions.json',
  'clinica_medica_final_questions.json',
  'ginecologia_final_questions.json',
  'medicina_preventiva_final_questions.json',
  'obstetricia_final_questions.json',
  'pediatria_final_questions.json',
  'urologia_final_questions.json'
];

let phase2FlagTrueWithLetterFixed = 0;
let phase2CommentaryAnuladaFixed = 0;
const phase2Log = [];

for (const filename of QUESTION_FILES) {
  const fpath = path.join(DATA_DIR, filename);
  const bpath = path.join(BACKUP_DIR, `${filename}.bak_phase2`);
  fs.copyFileSync(fpath, bpath);

  const questions = JSON.parse(fs.readFileSync(fpath, 'utf8'));
  let modifiedInFile = false;

  for (const q of questions) {
    const rawAns = (q.correct_answer || q.correctAnswer || '').trim().toUpperCase();
    const isAnul = Boolean(q.is_anulada || q.isAnulada);

    // Caso A: is_anulada = true, mas correct_answer ainda tem letra ativa 'A'-'E'
    if (isAnul && ['A', 'B', 'C', 'D', 'E'].includes(rawAns)) {
      q.original_key = rawAns;
      q.correct_answer = 'ANULADA';
      q.correctAnswer = 'ANULADA';
      q.is_anulada = true;
      q.isAnulada = true;
      phase2FlagTrueWithLetterFixed++;
      modifiedInFile = true;
      phase2Log.push({ id: q.id, code: q.code, type: 'FLAG_TRUE_PRESERVED_ORIGINAL_KEY', original_key: rawAns });
    }

    // Caso B: Comentário oficial cita anulação pela banca, mas questão estava ativa
    if (anulada11Ids.has(q.id) && !isAnul) {
      q.original_key = rawAns;
      q.correct_answer = 'ANULADA';
      q.correctAnswer = 'ANULADA';
      q.is_anulada = true;
      q.isAnulada = true;
      phase2CommentaryAnuladaFixed++;
      modifiedInFile = true;
      phase2Log.push({ id: q.id, code: q.code, type: 'CONVERTED_TO_ANULADA_BY_COMMENTARY', original_key: rawAns });
    }
  }

  if (modifiedInFile) {
    fs.writeFileSync(fpath, JSON.stringify(questions, null, 2), 'utf8');
  }
}

console.log(`✅ FASE 2 CONCLUÍDA:`);
console.log(`   • ${phase2FlagTrueWithLetterFixed} questões com flag is_anulada=true normalizadas para 'ANULADA' (com original_key preservada).`);
console.log(`   • ${phase2CommentaryAnuladaFixed} questões ativas convertidas para 'ANULADA' conforme gabarito oficial da banca.`);

// 4. Salvar log de execução
const logPath = path.join(DATA_DIR, 'log_execucao_fase1_fase2.json');
fs.writeFileSync(logPath, JSON.stringify({
  executed_at: new Date().toISOString(),
  phase1: { totalUpdated: phase1UpdatedCount, log: phase1Log },
  phase2: {
    flagTrueWithLetterFixed: phase2FlagTrueWithLetterFixed,
    commentaryAnuladaFixed: phase2CommentaryAnuladaFixed,
    log: phase2Log
  }
}, null, 2));

console.log(`\n📄 Log detalhado das Fases 1 & 2 salvo em: ${logPath}`);
