import fs from 'fs';

const pending = JSON.parse(fs.readFileSync('data/lote2_pending_index.json', 'utf8'));
const counts = new Map();
pending.forEach(q => {
  const b = q.banca || q.institution || 'Desconhecida';
  counts.set(b, (counts.get(b) || 0) + 1);
});
const sorted = Array.from(counts.entries()).sort((a,b) => b[1] - a[1]);
console.log('Top 20 bancas com pendências REAIS no índice:');
for (const [b, c] of sorted.slice(0, 20)) {
  console.log(`- ${b}: ${c}`);
}
