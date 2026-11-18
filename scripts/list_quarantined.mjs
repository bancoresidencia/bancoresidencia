import fs from 'fs';
const res = JSON.parse(fs.readFileSync('data/benchmark_consenso_100_resultado.json', 'utf8'));
const q = res.filter(r => !r.isApproved);
console.log(`Quarantined Count: ${q.length}\n`);
for (let i = 0; i < q.length; i++) {
  const r = q[i];
  console.log(`[Q#${i + 1}] ID: ${r.id} | Reason: ${r.confidenceReason}`);
  console.log(`   Text: ${r.statement.slice(0, 90).replace(/\s+/g, ' ')}...`);
  console.log(`   Gab: ${r.correctText}`);
  console.log('---');
}
