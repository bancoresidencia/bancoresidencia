import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const file = 'data/ginecologia_direto_questions.json';

if (!fs.existsSync(file)) {
  console.log(`Arquivo ${file} não existe!`);
  process.exit(1);
}

const all = JSON.parse(fs.readFileSync(file, 'utf8'));

let alreadyInDb = 0;
const getComm = db.prepare("SELECT commentary FROM questions_curated_staging WHERE (id = ? OR id = ? OR code = ?) AND commentary LIKE '%Take-Home%' LIMIT 1");

for (const q of all) {
  const comm = q.commentary || '';
  if (!comm.includes('Take-Home')) {
    const row = getComm.get(q.id, 'questions_expansion_direto_' + q.id, q.code);
    if (row && row.commentary) {
      alreadyInDb++;
      q.commentary = row.commentary;
    }
  }
}

console.log('Ginecologia - Questões sincronizadas do SQLite para o JSON:', alreadyInDb);
if (alreadyInDb > 0) {
  fs.writeFileSync(file, JSON.stringify(all, null, 2), 'utf8');
}

const valid = ['A', 'B', 'C', 'D', 'E', 'ANULADA'];
const pending = all.filter(q => {
  const ans = (q.correctAnswer || q.correct_answer || q.gabarito || '').toUpperCase().trim();
  const hasValid = valid.includes(ans) || q.is_anulada;
  const comm = q.commentary || '';
  const needs = !comm.includes('Take-Home Message:') && !comm.includes('Take-Home');
  const hasImg = q.images && q.images.length > 0;
  return hasValid && needs && !hasImg;
});

console.log('Ginecologia - Total no arquivo:', all.length);
console.log('Ginecologia - Pendentes texto puro com gabarito:', pending.length);
