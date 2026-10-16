import fs from 'fs';

const gin = JSON.parse(fs.readFileSync('data/ginecologia_final_questions.json', 'utf8'));
const amp2025 = gin.filter(q => ((q.institution || '').includes('AMP') || (q.code || '').startsWith('AMP')) && q.year === 2025);

console.log(`AMP 2025 in Ginecologia: ${amp2025.length}`);
amp2025.forEach((q, idx) => {
  console.log(`[${idx+1}] Code: ${q.code} | Ans: ${q.correct_answer || q.correctAnswer || 'VAZIO'}`);
  console.log(`    Stmt: ${q.statement.slice(0, 90)}...`);
});
