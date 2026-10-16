import fs from 'fs';

const pending = JSON.parse(fs.readFileSync('data/lote2_pending_index.json', 'utf8'));

function check(name, testFn) {
  const list = pending.filter(testFn);
  console.log(`\n=== ${name} (Pendentes: ${list.length}) ===`);
  const years = new Map();
  list.forEach(q => years.set(q.year, (years.get(q.year) || 0) + 1));
  console.log('Anos:', Array.from(years.entries()));
}

check('UFPR', q => (q.banca || '').includes('UFPR') || (q.institution || '').includes('UFPR'));
check('UESPI', q => (q.banca || '').includes('UESPI') || (q.institution || '').includes('UESPI') || (q.institution || '').includes('Piauí'));
check('PSU-GO', q => (q.banca || '').includes('PSU-GO') || (q.institution || '').includes('PSU-GO'));
check('CMC', q => (q.banca || '').includes('CMC') || (q.institution || '').includes('Centro Médico de Campinas'));
check('UERN', q => (q.banca || '').includes('UERN') || (q.institution || '').includes('UERN'));
