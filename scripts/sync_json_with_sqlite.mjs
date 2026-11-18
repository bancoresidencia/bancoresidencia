import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const DB_PATH = 'data/cirurgia_direto_questions.json';
const SQLITE_PATH = 'data/supabase_tables/supabase_tables.db';

if (!fs.existsSync(DB_PATH) || !fs.existsSync(SQLITE_PATH)) {
  console.log('Arquivos não encontrados.');
  process.exit(1);
}

const db = new DatabaseSync(SQLITE_PATH);
const allQuestions = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

let syncedFromSqlite = 0;
const getComm = db.prepare(`
  SELECT commentary, options
  FROM questions_curated_staging
  WHERE id = ? OR id = ? OR code = ?
`);

allQuestions.forEach((q, idx) => {
  const hasTH = (q.commentary || '').includes('Take-Home');
  if (!hasTH) {
    const cleanId = (q.id || '').replace(/^(questions_|questions_expansion_direto_|expansion_direto_)/, '');
    const row = getComm.get(`questions_${cleanId}`, `questions_expansion_direto_${cleanId}`, q.code);
    if (row && row.commentary && (row.commentary.includes('Take-Home') || row.commentary.length > 200)) {
      allQuestions[idx].commentary = row.commentary;
      if (row.options) {
        try {
          allQuestions[idx].options = typeof row.options === 'string' ? JSON.parse(row.options) : row.options;
        } catch {}
      }
      syncedFromSqlite++;
    }
  }
});

console.log(`Sincronizados do SQLite para o JSON: ${syncedFromSqlite}`);
if (syncedFromSqlite > 0) {
  fs.writeFileSync(DB_PATH, JSON.stringify(allQuestions, null, 2), 'utf8');
  console.log(`Arquivo ${DB_PATH} atualizado.`);
}

let remainingPending = 0;
const validAnswers = ['A', 'B', 'C', 'D', 'E', 'ANULADA'];

function checkHasImage(q) {
  if (q.imageUrl && q.imageUrl.trim() !== '') return true;
  if (q.image_url && q.image_url.trim() !== '') return true;
  if (Array.isArray(q.images) && q.images.length > 0) return true;
  const stmt = q.statement || '';
  if (/!\[.*?\]\((https?:\/\/[^\s\)]+|\/images\/[^\s\)]+|[^\s\)]+\.(?:png|jpe?g|webp|gif))/i.test(stmt)) return true;
  if (Array.isArray(q.options)) {
    for (const opt of q.options) {
      if (opt.imageUrl || opt.image_url) return true;
      if (/!\[.*?\]\((https?:\/\/[^\s\)]+|\/images\/[^\s\)]+|[^\s\)]+\.(?:png|jpe?g|webp|gif))/i.test(opt.text || '')) return true;
    }
  }
  return false;
}

allQuestions.forEach(q => {
  const ans = (q.correctAnswer || q.correct_answer || q.gabarito || '').toUpperCase().trim();
  const hasValidAns = validAnswers.includes(ans) || q.is_anulada;
  const comm = q.commentary || '';
  const needsComm = !comm.includes('Take-Home Message:') && !comm.includes('Take-Home');
  const noImg = !checkHasImage(q);
  if (hasValidAns && needsComm && noImg) remainingPending++;
});

console.log(`Total de pendentes agora para processar: ${remainingPending}`);
