import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const cat = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8')).catalog || [];

const instRes = await fetch('https://sanarmed.com/wp-content/plugins/sanar-questoes1.0.20/public/data/institutions.json');
const instData = (await instRes.json()).data || [];

console.log(`Remaining in catalog: ${cat.length}`);

function cleanStr(s) {
  return (s || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

const remainingBancas = new Map();
for (const item of cat) {
  const row = db.prepare('SELECT institution, banca FROM questions_curated_staging WHERE id = ?').get(item.id);
  const b = (row ? (row.banca || row.institution) : item.banca) || 'UNKNOWN';
  remainingBancas.set(b, (remainingBancas.get(b) || 0) + 1);
}

// Find every Sanar institution that matches ANY keyword in remainingBancas
const targetMap = new Map();

for (const [banca, count] of remainingBancas.entries()) {
  const cBanca = cleanStr(banca);

  for (const inst of instData) {
    const cInst = cleanStr(inst.name);
    // If institution acronym matches (e.g. "SURCE", "UFRN", "IAMSPE", "HCPA", etc.)
    const acronym = (inst.name.split('-')[0] || '').trim();
    const cAcr = cleanStr(acronym);

    let isMatch = false;
    if (cAcr.length >= 3 && (cBanca.includes(cAcr) || cBanca.startsWith(cAcr))) {
      isMatch = true;
    } else if (cInst.length > 6 && (cBanca.includes(cInst) || cInst.includes(cBanca))) {
      isMatch = true;
    }

    if (isMatch) {
      if (!targetMap.has(inst.id)) {
        targetMap.set(inst.id, {
          sanarId: inst.id,
          sanarName: inst.name,
          matchedBanca: banca,
          count: count
        });
      } else {
        targetMap.get(inst.id).count += count;
      }
    }
  }
}

const list = [...targetMap.values()].sort((a,b) => b.count - a.count);
console.log(`Total Sanar institutions matched: ${list.length}`);
list.slice(0, 25).forEach(m => console.log(`  [${m.count} remaining questions] ${m.sanarName} (${m.sanarId})`));

fs.writeFileSync('data/sanar_all_matched_institutions.json', JSON.stringify(list, null, 2), 'utf8');
