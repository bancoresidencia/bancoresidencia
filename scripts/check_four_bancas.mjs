import fs from 'fs';

const pending = JSON.parse(fs.readFileSync('data/lote2_pending_index.json', 'utf8'));

function check(name, testFn) {
  const list = pending.filter(testFn);
  console.log(`\n=== ${name} (Pendentes: ${list.length}) ===`);
  const years = new Map();
  list.forEach(q => years.set(q.year, (years.get(q.year) || 0) + 1));
  console.log('Anos:', Array.from(years.entries()));
  if (list.length > 0) {
    console.log('Exemplo code:', list[0].code);
    console.log('Exemplo statement:', list[0].statement.slice(0, 140));
  }
}

check('SES-MA', q => (q.banca || '').includes('SES-MA') || (q.institution || '').includes('SES-MA'));
check('UFMA', q => (q.banca || '').includes('UFMA') || (q.institution || '').includes('UFMA'));
check('UFF', q => (q.banca || '').includes('UFF') || (q.institution || '').includes('UFF') || (q.institution || '').includes('Fluminense'));
check('HPP', q => (q.banca || '').includes('HPP') || (q.institution || '').includes('Pequeno Pr'));
