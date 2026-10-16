import fs from 'fs';

const gin = JSON.parse(fs.readFileSync('data/ginecologia_final_questions.json', 'utf8'));

const surce = gin.filter(q => (q.code || '').startsWith('SURCE') || (q.institution || '').includes('SURCE') || (q.institution || '').includes('Ceará'));
const ufrj = gin.filter(q => (q.code || '').startsWith('UFRJ') || (q.code || '').startsWith('HUCFF') || (q.institution || '').includes('UFRJ') || (q.institution || '').includes('Clementino'));

console.log(`=== SURCE (${surce.length} questões) ===`);
const surceYears = {};
surce.forEach(q => surceYears[q.year] = (surceYears[q.year] || 0) + 1);
console.log('SURCE by year:', surceYears);
console.log('SURCE sem gabarito:', surce.filter(q => !q.correct_answer && !q.correctAnswer).length);

console.log(`\n=== UFRJ / HUCFF (${ufrj.length} questões) ===`);
const ufrjYears = {};
ufrj.forEach(q => ufrjYears[q.year] = (ufrjYears[q.year] || 0) + 1);
console.log('UFRJ by year:', ufrjYears);
console.log('UFRJ sem gabarito:', ufrj.filter(q => !q.correct_answer && !q.correctAnswer).length);
