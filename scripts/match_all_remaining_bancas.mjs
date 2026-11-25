import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const cat = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8'));
const list = cat.catalog || cat;
const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

const instRes = await fetch('https://sanarmed.com/wp-content/plugins/sanar-questoes1.0.20/public/data/institutions.json');
const instData = (await instRes.json()).data || [];

console.log(`Remaining watermarked questions: ${list.length}`);

// Get distinct institutions from our staging DB
const ourInstitutions = new Set();
for (const item of list) {
  const row = db.prepare('SELECT institution FROM questions_curated_staging WHERE id = ?').get(item.id);
  if (row && row.institution) ourInstitutions.add(row.institution);
}

console.log(`Distinct bancas in our remaining catalog: ${ourInstitutions.size}`);

function cleanStr(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
}

const matchedSanarInsts = [];
for (const ourInst of ourInstitutions) {
  const cOur = cleanStr(ourInst);
  const found = instData.find(si => {
    const cSi = cleanStr(si.name);
    return cSi.includes(cOur) || cOur.includes(cSi);
  });
  if (found) {
    matchedSanarInsts.push({ our: ourInst, sanarId: found.id, sanarName: found.name });
  }
}

console.log(`Matched ${matchedSanarInsts.length} / ${ourInstitutions.size} bancas directly to Sanar IDs:`);
matchedSanarInsts.slice(0, 15).forEach(m => console.log(`  ${m.our} -> ${m.sanarName} (${m.sanarId})`));

fs.writeFileSync('data/sanar_matched_bancas.json', JSON.stringify(matchedSanarInsts, null, 2), 'utf8');
