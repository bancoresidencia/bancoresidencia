import fs from 'fs';

const pending = JSON.parse(fs.readFileSync('data/lote2_pending_index.json', 'utf8'));

function check(name, testFn) {
  const list = pending.filter(testFn);
  console.log(`\n=== ${name} (Pendentes: ${list.length}) ===`);
  const years = new Map();
  list.forEach(q => years.set(q.year, (years.get(q.year) || 0) + 1));
  console.log('Anos:', Array.from(years.entries()));
}

check('IPSEMG', q => (q.banca || '').includes('IPSEMG') || (q.institution || '').includes('IPSEMG'));
check('FCMMG', q => (q.banca || '').includes('FCMMG') || (q.institution || '').includes('Ciências Médicas'));
check('HSL-PUCRS', q => (q.banca || '').includes('PUCRS') || (q.institution || '').includes('PUCRS'));
check('UFS', q => (q.banca || '').includes('UFS') || (q.institution || '').includes('Sergipe'));
