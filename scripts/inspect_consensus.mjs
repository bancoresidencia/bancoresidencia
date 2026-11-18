import fs from 'fs';
const res = JSON.parse(fs.readFileSync('data/benchmark_consenso_100_resultado.json', 'utf8'));

console.log('=== CASES WITH >= 3 NEIGHBORS AGREEING ON FOCO ===');
const cases3 = res.filter(r => r.topFocoCount >= 3);
console.log(`Total: ${cases3.length}`);
for (let i = 0; i < cases3.length; i++) {
  const r = cases3[i];
  console.log(`[#${i + 1}] ID: ${r.id} | Approved: ${r.isApproved ? 'YES' : 'NO'} | Foco: ${r.targetFoco} (${r.topFocoCount}/5) | Reason: ${r.confidenceReason}`);
  console.log(`   Text: ${r.statement.slice(0, 90).replace(/\s+/g, ' ')}...`);
}

console.log('\n=== CASES WITH EXACTLY 2 NEIGHBORS AGREEING ON FOCO ===');
const cases2 = res.filter(r => r.topFocoCount === 2);
console.log(`Total: ${cases2.length}`);
for (let i = 0; i < cases2.length; i++) {
  const r = cases2[i];
  console.log(`[#${i + 1}] ID: ${r.id} | Approved: ${r.isApproved ? 'YES' : 'NO'} | Foco: ${r.targetFoco} (${r.topFocoCount}/5) | Reason: ${r.confidenceReason}`);
  console.log(`   Text: ${r.statement.slice(0, 90).replace(/\s+/g, ' ')}...`);
}
