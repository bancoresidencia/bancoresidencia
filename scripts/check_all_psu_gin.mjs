import fs from 'fs';

const gin = JSON.parse(fs.readFileSync('data/ginecologia_final_questions.json', 'utf8'));
const psuQuestions = gin.filter(q => (q.code || '').startsWith('PSUMG'));
console.log(`Total PSU-MG questions in Ginecologia: ${psuQuestions.length}`);

const byYear = {};
psuQuestions.forEach(q => {
  byYear[q.year] = (byYear[q.year] || 0) + 1;
});
console.log('By Year:', byYear);
