import fs from 'fs';

const pending = JSON.parse(fs.readFileSync('data/lote2_pending_index.json', 'utf8'));
const amp = pending.filter(q => {
  const b = (q.banca || '').toUpperCase();
  const inst = (q.institution || '').toUpperCase();
  if (b.includes('UNICAMP') || inst.includes('UNICAMP')) return false;
  return b === 'AMP' || b.startsWith('AMP/') || b.includes('ASSOCIAÇÃO MÉDICA DO PARANÁ') || inst.includes('ASSOCIAÇÃO MÉDICA DO PARANÁ');
});

console.log(`AMP Paraná (Pendentes Reais: ${amp.length})`);
const years = new Map();
const specs = new Map();

amp.forEach(q => {
  years.set(q.year, (years.get(q.year) || 0) + 1);
  const sp = q.code ? q.code.split('-')[2] : 'UNKNOWN';
  specs.set(sp, (specs.get(sp) || 0) + 1);
});

console.log('Anos:', Array.from(years.entries()));
console.log('Especialidades:', Array.from(specs.entries()));
if (amp.length > 0) {
  console.log('Exemplo code:', amp[0].code);
  console.log('Exemplo statement:', amp[0].statement.slice(0, 150));
}
