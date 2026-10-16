import fs from 'fs';

const gin = JSON.parse(fs.readFileSync('data/ginecologia_final_questions.json', 'utf8'));

const hcpa = gin.filter(q => (q.code || '').startsWith('UFRGS') || (q.code || '').startsWith('HCPA') || (q.institution || '').includes('HCPA'));
const amrigs = gin.filter(q => (q.code || '').startsWith('AMRIGS') || (q.institution || '').includes('AMRIGS'));

console.log(`=== HCPA / UFRGS (${hcpa.length} questões) ===`);
for (const q of hcpa.filter(x => [2025, 2024, 2023].includes(x.year))) {
  console.log(`[${q.year}] Code: ${q.code} | Ans: ${q.correct_answer || q.correctAnswer || 'VAZIO'}`);
  console.log(`    Stmt: ${q.statement.slice(0, 90)}...`);
}

console.log(`\n=== AMRIGS (${amrigs.length} questões) ===`);
for (const q of amrigs.filter(x => [2025, 2024, 2023].includes(x.year))) {
  console.log(`[${q.year}] Code: ${q.code} | Ans: ${q.correct_answer || q.correctAnswer || 'VAZIO'}`);
  console.log(`    Stmt: ${q.statement.slice(0, 90)}...`);
}
