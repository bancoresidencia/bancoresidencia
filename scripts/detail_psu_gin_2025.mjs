import fs from 'fs';

const gin = JSON.parse(fs.readFileSync('data/ginecologia_final_questions.json', 'utf8'));
const psu2025 = gin.filter(q => (q.code || '').startsWith('PSUMG-2025'));

console.log(`Found ${psu2025.length} questions for PSUMG-2025 in Ginecologia.`);
for (const q of psu2025) {
  console.log(`\nCode: ${q.code}`);
  console.log(`Current Ans: ${q.correct_answer || q.correctAnswer || 'VAZIO'}`);
  console.log(`Statement: ${q.statement.slice(0, 120)}...`);
  console.log('Options:');
  q.options.forEach(o => console.log(`  ${o.letter}) ${o.text.slice(0, 70)}`));
}
