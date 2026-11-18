import fs from 'fs';
const res = JSON.parse(fs.readFileSync('data/benchmark_consenso_100_resultado.json', 'utf8'));
const q = res.filter(r => !r.isApproved);

console.log(`Total Quarantined: ${q.length}\n`);

let cat_solid_precedent = 0;   // >= 3 votes with reasonable cosSim (0.30 - 0.41)
let cat_moderate_precedent = 0; // 2 votes with solid cosSim (0.42 - 0.54)
let cat_dispersed = 0;          // < 2 votes or true ambiguity

for (const r of q) {
  const cosMatch = r.confidenceReason.match(/Cosseno:? (\d+\.\d+)/);
  const cosSim = cosMatch ? parseFloat(cosMatch[1]) : 0;
  
  if (r.topFocoCount >= 3) {
    cat_solid_precedent++;
    console.log(`[SOLID PRECEDENT] ID: ${r.id} | Votes: ${r.topFocoCount}/5 | Cos: ${cosSim.toFixed(3)} | Foco: ${r.targetFoco}`);
    console.log(`   Text: ${r.statement.slice(0, 90).replace(/\s+/g, ' ')}...`);
    console.log(`   Gab: ${r.correctText}`);
    console.log('---');
  } else if (r.topFocoCount === 2 && cosSim >= 0.40) {
    cat_moderate_precedent++;
    console.log(`[MODERATE PRECEDENT] ID: ${r.id} | Votes: ${r.topFocoCount}/5 | Cos: ${cosSim.toFixed(3)} | Foco: ${r.targetFoco}`);
    console.log(`   Text: ${r.statement.slice(0, 90).replace(/\s+/g, ' ')}...`);
    console.log(`   Gab: ${r.correctText}`);
    console.log('---');
  } else {
    cat_dispersed++;
  }
}

console.log('\n=======================================');
console.log(`Solid Precedent (>=3 votes, cos >= 0.30): ${cat_solid_precedent}`);
console.log(`Moderate Precedent (2 votes, cos >= 0.40): ${cat_moderate_precedent}`);
console.log(`Dispersed / Low confidence: ${cat_dispersed}`);
console.log(`Potential Total Approved: ${54 + cat_solid_precedent + cat_moderate_precedent} (${54 + cat_solid_precedent + cat_moderate_precedent}%)`);
console.log('=======================================');
