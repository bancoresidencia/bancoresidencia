import fs from 'fs';

const pending = JSON.parse(fs.readFileSync('data/lote2_pending_index.json', 'utf8'));

function analyze(name, filterFn) {
  const list = pending.filter(filterFn);
  console.log(`\n=== ${name} (Pendentes: ${list.length}) ===`);
  const years = new Map();
  list.forEach(q => years.set(q.year, (years.get(q.year) || 0) + 1));
  console.log('Anos:', Array.from(years.entries()));
  if (list.length > 0) {
    console.log('Exemplo code:', list[0].code);
    console.log('Exemplo statement:', list[0].statement.slice(0, 150));
  }
}

analyze('UFRJ', q => (q.banca || '').includes('UFRJ') || (q.institution || '').includes('UFRJ'));
analyze('HU-FMJ', q => (q.banca || '').includes('FMJ') || (q.institution || '').includes('FMJ') || (q.institution || '').includes('Jundiaí'));
analyze('CERMAM', q => (q.banca || '').includes('CERMAM') || (q.institution || '').includes('CERMAM'));
