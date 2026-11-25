import fs from 'fs';

const currentTargets = JSON.parse(fs.readFileSync('data/sanar_fresh_targets.json', 'utf8'));
const currentIds = new Set(currentTargets.map(t => t.sanarId.toLowerCase()));

const res = await fetch('https://sanarmed.com/wp-content/plugins/sanar-questoes1.0.20/public/data/institutions.json');
const data = await res.json();
const allInsts = data.data || [];

const batch2 = [];
for (const inst of allInsts) {
  if (!currentIds.has(inst.id.toLowerCase())) {
    batch2.push({
      sanarId: inst.id,
      sanarName: inst.name,
      count: 5 // placeholder
    });
  }
}

console.log(`Current batch had: ${currentTargets.length} institutions`);
console.log(`Batch 2 will have: ${batch2.length} institutions`);

// Top priority aliases to place at the very top of Batch 2:
const priorityKeywords = ['EDMUNDO', 'MACAÉ', 'MACAE', 'AERONÁUTICA', 'AERONAUTICA', 'ONOFRE', 'TOCANTINS', 'CAMPINAS', 'BARRETOS', 'SÍRIO', 'SIRIO', 'DANTE', 'FRAGA', 'EVANGÉLICO', 'EVANGELICO', 'MATERNIDADE'];

batch2.sort((a, b) => {
  const aNorm = a.sanarName.toUpperCase();
  const bNorm = b.sanarName.toUpperCase();
  const aHas = priorityKeywords.some(k => aNorm.includes(k));
  const bHas = priorityKeywords.some(k => bNorm.includes(k));
  if (aHas && !bHas) return -1;
  if (!aHas && bHas) return 1;
  return a.sanarName.localeCompare(b.sanarName);
});

fs.writeFileSync('data/sanar_batch2_targets.json', JSON.stringify(batch2, null, 2), 'utf8');
console.log('Saved data/sanar_batch2_targets.json');
console.log('Top 15 priority institutions in Batch 2:');
for (const b of batch2.slice(0, 15)) {
  console.log(`- ${b.sanarName} (${b.sanarId})`);
}
