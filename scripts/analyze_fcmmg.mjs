import fs from 'fs';

const pending = JSON.parse(fs.readFileSync('data/lote2_pending_index.json', 'utf8'));
const fcmmg = pending.filter(q => (q.banca || '').includes('FCMMG') || (q.institution || '').includes('Ciências Médicas'));

console.log(`FCMMG (Pendentes: ${fcmmg.length})`);
fcmmg.forEach(q => {
  console.log(`[${q.year}] ${q.code}: ${q.statement.slice(0, 100)}...`);
});
