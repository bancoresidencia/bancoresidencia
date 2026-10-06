import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('d:/bancoresidencia/data/ginecologia_medevo_extracted.json', 'utf8'));

// Filter out autorais
const official = raw.questions.filter(q => {
  const loc = (q.location?.name || '').toLowerCase();
  const stmt = (q.question_content || '').toLowerCase();
  if (loc.includes('medevo') || loc.includes('simulado medevo') || stmt.includes('medevo autoral')) {
    return false;
  }
  return true;
});

console.log('Total de questões oficiais:', official.length);

let withCorrectChoice = 0;
let withCommentsArray = 0;

official.forEach(q => {
  if (q.correct_choice !== undefined && q.correct_choice !== null) withCorrectChoice++;
  if (Array.isArray(q.comments) && q.comments.length > 0) withCommentsArray++;
});

console.log('Com correct_choice:', withCorrectChoice);
console.log('Com comments array:', withCommentsArray);
