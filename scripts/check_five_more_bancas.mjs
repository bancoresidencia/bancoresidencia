import fs from 'fs';

const pending = JSON.parse(fs.readFileSync('data/lote2_pending_index.json', 'utf8'));

function check(name, testFn) {
  const list = pending.filter(testFn);
  console.log(`\n=== ${name} (Pendentes: ${list.length}) ===`);
  const years = new Map();
  list.forEach(q => years.set(q.year, (years.get(q.year) || 0) + 1));
  console.log('Anos:', Array.from(years.entries()));
}

check('FAMEMA', q => (q.banca || '').includes('FAMEMA') || (q.institution || '').includes('FAMEMA') || (q.institution || '').includes('Marília'));
check('UNAERP', q => (q.banca || '').includes('UNAERP') || (q.institution || '').includes('UNAERP') || (q.institution || '').includes('Ribeirão Preto'));
check('PUC-SP', q => (q.banca || '').includes('PUC-SP') || (q.institution || '').includes('PUC-SP') || (q.institution || '').includes('Sorocaba'));
check('UFCSPA', q => (q.banca || '').includes('UFCSPA') || (q.institution || '').includes('UFCSPA'));
check('INTO', q => (q.banca || '').includes('INTO') || (q.institution || '').includes('INTO') || (q.institution || '').includes('Traumatologia'));
