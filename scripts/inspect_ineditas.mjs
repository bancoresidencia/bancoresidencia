import fs from 'fs';

const data = JSON.parse(fs.readFileSync('data/questoes_ineditas_livros_drive_7822.json', 'utf8'));
console.log('Total items in questoes_ineditas_livros_drive_7822.json:', data.length);
const hsc = data.filter(q => (q.code && q.code.includes('HSC')) || (q.institution && q.institution.includes('Camilo')) || (q.statement && q.statement.includes('São Camilo')));
console.log('HSC matches:', hsc.length);
if (hsc.length > 0) {
  console.log('Sample:', {
    code: hsc[0].code,
    year: hsc[0].year,
    correct_answer: hsc[0].correct_answer,
    statement: hsc[0].statement?.slice(0, 100),
    commentary: hsc[0].commentary?.slice(0, 100)
  });
}
