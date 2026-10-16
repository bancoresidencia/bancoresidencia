import fs from 'fs';

const files = fs.readdirSync('data').filter(f => f.endsWith('_final_questions.json')).map(f => 'data/' + f);

for (const file of files) {
  const qs = JSON.parse(fs.readFileSync(file, 'utf-8'));
  for (const q of qs) {
    const inst = q.institution || '';
    const banca = q.banca || '';
    const year = parseInt(q.year, 10);
    if ((inst.toLowerCase().includes('uerj') || banca.toLowerCase().includes('uerj')) && (year === 2024 || year === 2023)) {
      if (!q.correct_answer && !q.correctAnswer) {
        console.log(`[PENDENTE ${year}] Code: ${q.code} | Inst: ${inst} | Spec: ${q.specialty || file}`);
        console.log(`  Enunciado: ${q.statement.slice(0, 150)}...\n`);
      }
    }
  }
}
