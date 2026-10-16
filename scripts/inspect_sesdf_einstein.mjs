import fs from 'fs';

const gin = JSON.parse(fs.readFileSync('data/ginecologia_final_questions.json', 'utf8'));

const sesdf = gin.filter(q => (q.code || '').startsWith('SESDF') || (q.institution || '').includes('Distrito Federal') || (q.institution || '').includes('SES-DF'));
const einstein = gin.filter(q => (q.code || '').startsWith('HIAE') || (q.code || '').startsWith('EINSTEIN') || (q.institution || '').includes('Einstein'));

console.log(`=== SES-DF (${sesdf.length} questões) ===`);
const sesdfYears = {};
sesdf.forEach(q => sesdfYears[q.year] = (sesdfYears[q.year] || 0) + 1);
console.log('SES-DF by year:', sesdfYears);
console.log('SES-DF sem gabarito:', sesdf.filter(q => !q.correct_answer && !q.correctAnswer).length);

console.log(`\n=== ALBERT EINSTEIN (${einstein.length} questões) ===`);
const einsteinYears = {};
einstein.forEach(q => einsteinYears[q.year] = (einsteinYears[q.year] || 0) + 1);
console.log('Einstein by year:', einsteinYears);
console.log('Einstein sem gabarito:', einstein.filter(q => !q.correct_answer && !q.correctAnswer).length);
