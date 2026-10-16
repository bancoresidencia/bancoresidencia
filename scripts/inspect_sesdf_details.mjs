import fs from 'fs';

const gin = JSON.parse(fs.readFileSync('data/ginecologia_final_questions.json', 'utf8'));

const sesdf = gin.filter(q => ((q.code || '').startsWith('SESDF') || (q.institution || '').includes('Distrito Federal') || (q.institution || '').includes('SES-DF')) && [2025, 2024, 2023].includes(q.year));

console.log(`=== SES-DF 2023-2025 (${sesdf.length} questões) ===`);
sesdf.forEach(q => {
  console.log(`[${q.year}] Code: ${q.code} | Ans: ${q.correct_answer || q.correctAnswer || 'VAZIO'}`);
  console.log(`    Stmt: ${q.statement.slice(0, 90)}...`);
});
