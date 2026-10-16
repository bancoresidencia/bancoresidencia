import fs from 'fs';

const gineco = JSON.parse(fs.readFileSync('data/ginecologia_final_questions.json', 'utf-8'));
const qs = gineco.filter(q => q.code && q.code.startsWith('PSUMG-2025-GIN-'));

console.log(`Found ${qs.length} questions for PSU-MG 2025 Ginecologia:`);
for (const q of qs) {
  console.log(`\n=== ${q.code} ===`);
  console.log('Enunciado:', q.statement);
  console.log('Opções:');
  for (const opt of q.options) {
    console.log(`  ${opt.letter}: ${opt.text}`);
  }
}
