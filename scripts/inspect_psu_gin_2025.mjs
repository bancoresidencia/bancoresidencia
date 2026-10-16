import fs from 'fs';

const gin = JSON.parse(fs.readFileSync('data/ginecologia_final_questions.json', 'utf8'));
const psuGin = gin.filter(q => (q.code || '').startsWith('PSUMG-2025'));
console.log(`Total PSU-MG 2025 in Ginecologia: ${psuGin.length}`);
psuGin.forEach((q, idx) => {
  console.log(`[${idx+1}] Code: ${q.code} | Stmt: ${(q.statement||'').slice(0, 90)}`);
});
