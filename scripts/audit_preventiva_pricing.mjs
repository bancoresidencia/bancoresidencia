import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const SQLITE_PATH = 'data/supabase_tables/supabase_tables.db';
const db = new DatabaseSync(SQLITE_PATH);

const prevStats = db.prepare(`
  SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN commentary LIKE '%Take-Home%' THEN 1 ELSE 0 END) as padrao_ouro,
    SUM(CASE WHEN commentary IS NOT NULL AND length(trim(commentary)) > 50 THEN 1 ELSE 0 END) as total_comentado
  FROM questions_curated_staging
  WHERE LOWER(especialidade) LIKE '%preventiva%'
    AND (modalidade = 'Acesso Direto' OR modalidade IS NULL)
`).get();

console.log('Medicina Preventiva (SQLite):', prevStats);

const JSON_PATH = 'data/medicina_preventiva_final_questions.json';
if (fs.existsSync(JSON_PATH)) {
  const json = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  console.log('Total no JSON:', json.length);

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

  let pendingTextPure = 0;
  let hasImage = 0;
  let invalidAns = 0;
  let alreadyGold = 0;

  json.forEach(q => {
    const ans = (q.correctAnswer || q.correct_answer || q.gabarito || '').toUpperCase().trim();
    const hasValidAns = validAnswers.includes(ans) || q.is_anulada;
    const comm = q.commentary || '';
    const hasTH = comm.includes('Take-Home Message:') || comm.includes('Take-Home');
    const img = checkHasImage(q);

    if (hasTH) alreadyGold++;
    if (img) hasImage++;
    if (!hasValidAns) invalidAns++;

    if (hasValidAns && !hasTH && !img) {
      pendingTextPure++;
    }
  });

  console.log('Classificação no JSON:', {
    total: json.length,
    alreadyGold,
    hasImage,
    invalidAns,
    pendingTextPure
  });
}
