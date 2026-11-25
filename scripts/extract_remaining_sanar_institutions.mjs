import fs from 'fs';

const currentScript = fs.readFileSync('scripts/harvest_fresh_candidates.mjs', 'utf8');
const processedIds = new Set();
const idRegex = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi;
let m;
while ((m = idRegex.exec(currentScript)) !== null) {
  processedIds.add(m[1].toLowerCase());
}

const res = await fetch('https://sanarmed.com/wp-content/plugins/sanar-questoes1.0.20/public/data/institutions.json');
const data = await res.json();
const allInsts = data.data || [];

const remainingInsts = allInsts.filter(i => !processedIds.has(i.id.toLowerCase()));
console.log(`Total institutions in Sanar: ${allInsts.length}`);
console.log(`Already in 134 run: ${processedIds.size}`);
console.log(`Remaining to run: ${remainingInsts.length}`);

// Gravar lista restante
fs.writeFileSync('data/sanar_remaining_institutions.json', JSON.stringify(remainingInsts, null, 2), 'utf8');
console.log('Saved data/sanar_remaining_institutions.json');
