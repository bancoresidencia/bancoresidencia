import fs from 'fs';

const gin = JSON.parse(fs.readFileSync('data/ginecologia_final_questions.json', 'utf8'));

const amp = gin.filter(q => (q.institution || '').includes('AMP') || (q.code || '').startsWith('AMP'));
const hcpa = gin.filter(q => (q.institution || '').includes('HCPA') || (q.institution || '').includes('UFRGS') || (q.code || '').startsWith('HCPA') || (q.code || '').startsWith('UFRGS'));
const amrigs = gin.filter(q => (q.institution || '').includes('AMRIGS') || (q.code || '').startsWith('AMRIGS'));

console.log(`AMP questions in Ginecologia: ${amp.length}`);
const ampYears = {};
amp.forEach(q => ampYears[q.year] = (ampYears[q.year] || 0) + 1);
console.log('AMP by year:', ampYears);
console.log('AMP sem gabarito:', amp.filter(q => !q.correct_answer && !q.correctAnswer).length);

console.log(`\nHCPA/UFRGS questions in Ginecologia: ${hcpa.length}`);
const hcpaYears = {};
hcpa.forEach(q => hcpaYears[q.year] = (hcpaYears[q.year] || 0) + 1);
console.log('HCPA by year:', hcpaYears);
console.log('HCPA sem gabarito:', hcpa.filter(q => !q.correct_answer && !q.correctAnswer).length);

console.log(`\nAMRIGS questions in Ginecologia: ${amrigs.length}`);
const amrigsYears = {};
amrigs.forEach(q => amrigsYears[q.year] = (amrigsYears[q.year] || 0) + 1);
console.log('AMRIGS by year:', amrigsYears);
console.log('AMRIGS sem gabarito:', amrigs.filter(q => !q.correct_answer && !q.correctAnswer).length);
