import fs from 'fs';

const files = fs.readdirSync('data').filter(f => f.endsWith('_final_questions.json'));
const q2027 = [];

for (const f of files) {
  const list = JSON.parse(fs.readFileSync('data/' + f, 'utf8'));
  for (const q of list) {
    const text = ((q.institution || '') + ' ' + (q.banca || '')).toLowerCase();
    if ((text.includes('hsl') || text.includes('sírio') || text.includes('sirio')) && q.year === 2027) {
      q2027.push({ ...q, file: f });
    }
  }
}

console.log('Total 2027 HSL:', q2027.length);
q2027.forEach((q, idx) => {
  console.log(`\n[${idx + 1}] Code: ${q.code} | Gabarito: ${q.correct_answer || q.correctAnswer || 'SEM GABARITO'} | Especialidade: ${q.especialidade || q.specialty}`);
  console.log(`Enunciado: ${(q.statement || '').slice(0, 200)}...`);
  if (q.official_audit) {
    console.log(`Audit:`, q.official_audit);
  }
});
