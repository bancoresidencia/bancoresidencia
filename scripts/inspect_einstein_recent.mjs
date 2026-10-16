import fs from 'fs';

const gin = JSON.parse(fs.readFileSync('data/ginecologia_final_questions.json', 'utf8'));
const einstein = gin.filter(q => ((q.code || '').startsWith('HIAE') || (q.code || '').startsWith('EINSTEIN') || (q.institution || '').includes('Einstein')) && [2025, 2024, 2023].includes(q.year));

console.log(`=== ALBERT EINSTEIN 2023-2025 (${einstein.length} questões) ===`);
einstein.forEach(q => {
  console.log(`[${q.year}] Code: ${q.code} | Ans: ${q.correct_answer || q.correctAnswer || 'VAZIO'}`);
  console.log(`    Stmt: ${q.statement.slice(0, 90)}...`);
});
