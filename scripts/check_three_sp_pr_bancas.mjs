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

check('HAC', q => (q.banca || '').includes('HAC') || (q.institution || '').includes('Angelina Caron') || (q.banca || '').includes('Angelina'));
check('Mário Gatti', q => (q.banca || '').includes('Mário Gatti') || (q.institution || '').includes('Mário Gatti') || (q.banca || '').includes('Mario Gatti') || (q.institution || '').includes('Mario Gatti'));
check('UNITAU', q => (q.banca || '').includes('UNITAU') || (q.institution || '').includes('UNITAU') || (q.institution || '').includes('Taubaté'));
