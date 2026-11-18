import fs from 'fs';
const res = JSON.parse(fs.readFileSync('data/benchmark_consenso_100_resultado.json', 'utf8'));
const approved = res.filter(r => r.isApproved);
console.log(`Total Approved: ${approved.length}\n`);
for (let i = 0; i < approved.length; i++) {
  const r = approved[i];
  console.log(`[#${i + 1}] ID: ${r.id} | [${r.targetEsp}] > [${r.targetTema}] > [${r.targetFoco}]`);
  console.log(`    Subfoco: ${r.targetSubfoco || 'null'}`);
  console.log(`    Q: ${r.statement.slice(0, 85).replace(/\s+/g, ' ')}...`);
  console.log(`    Gab: ${r.correctText.slice(0, 50)}`);
  console.log('---');
}
