import fs from 'fs';

const files = fs.readdirSync('data').filter(f => f.endsWith('_final_questions.json')).map(f => 'data/' + f);
const pending = [];

for (const file of files) {
  const qs = JSON.parse(fs.readFileSync(file, 'utf-8'));
  for (const q of qs) {
    const inst = q.institution || '';
    const banca = q.banca || '';
    if (inst.toLowerCase().includes('psu-mg') || banca.toLowerCase().includes('psu-mg')) {
      if (!q.correct_answer && !q.correctAnswer) {
        pending.push({
          id: q.id,
          code: q.code,
          year: q.year,
          file: file.replace('data/', ''),
          statement: q.statement
        });
      }
    }
  }
}

console.log(`Total PSU-MG pendentes: ${pending.length}`);
for (const p of pending) {
  console.log(`\n[${p.year}] Code: ${p.code} (${p.file})`);
  console.log(`  ${p.statement.slice(0, 160)}...`);
}
