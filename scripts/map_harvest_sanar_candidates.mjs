import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const stagingDb = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const cat = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8'));
const list = cat.catalog || [];

const matchedBancas = JSON.parse(fs.readFileSync('data/sanar_matched_bancas.json', 'utf8'));
const allMatchedInst = fs.existsSync('data/sanar_all_matched_institutions.json') 
  ? JSON.parse(fs.readFileSync('data/sanar_all_matched_institutions.json', 'utf8')) 
  : [];

// Map local banca name variants to sanarId
const bancaToSanar = new Map();

for (const b of matchedBancas) {
  if (b.our) bancaToSanar.set(b.our.toLowerCase().trim(), { id: b.sanarId, name: b.sanarName });
  if (b.sanarName) bancaToSanar.set(b.sanarName.toLowerCase().trim(), { id: b.sanarId, name: b.sanarName });
}

// Add known aliases
bancaToSanar.set('usp/hcfmusp', { id: '438e2592-cecd-4b9c-8c66-701f0464b120', name: 'USP - SP' });
bancaToSanar.set('usp-sp', { id: '438e2592-cecd-4b9c-8c66-701f0464b120', name: 'USP - SP' });
bancaToSanar.set('usp/hcrp', { id: 'a2153355-9681-48dd-8e71-108709f62709', name: 'USP - RP' });
bancaToSanar.set('usp-rp', { id: 'a2153355-9681-48dd-8e71-108709f62709', name: 'USP - RP' });
bancaToSanar.set('unicamp/hc', { id: '4b4d516b-7bb3-459e-9740-62a44813a501', name: 'UNICAMP' });
bancaToSanar.set('unicamp', { id: '4b4d516b-7bb3-459e-9740-62a44813a501', name: 'UNICAMP' });
bancaToSanar.set('ufrgs/hcpa', { id: 'abd041af-b585-4fcf-8792-7805682ff08a', name: 'HCPA' });
bancaToSanar.set('ufrgs', { id: 'abd041af-b585-4fcf-8792-7805682ff08a', name: 'HCPA' });
bancaToSanar.set('unesp/hcfmb', { id: '150cb8d4-1b1b-4b97-ae98-ba2a3f1c5993', name: 'UNESP' });
bancaToSanar.set('unesp', { id: '150cb8d4-1b1b-4b97-ae98-ba2a3f1c5993', name: 'UNESP' });

for (const item of allMatchedInst) {
  if (item.matchedBanca && item.sanarId) {
    bancaToSanar.set(item.matchedBanca.toLowerCase().trim(), { id: item.sanarId, name: item.sanarName });
  }
}

const harvestTargets = new Map();

for (const item of list) {
  const q = stagingDb.prepare('SELECT id, banca, year, statement FROM questions_curated_staging WHERE id = ?').get(item.id);
  const b = (q?.banca || '').toLowerCase().trim();
  
  let target = bancaToSanar.get(b);
  if (!target) {
    for (const [k, v] of bancaToSanar.entries()) {
      if (b.includes(k) || k.includes(b)) {
        target = v;
        break;
      }
    }
  }

  if (target) {
    if (!harvestTargets.has(target.id)) {
      harvestTargets.set(target.id, {
        sanarId: target.id,
        name: target.name,
        questionCount: 0,
        questions: []
      });
    }
    const t = harvestTargets.get(target.id);
    t.questionCount++;
    t.questions.push(item.id);
  }
}

console.log(`Identified ${harvestTargets.size} distinct Sanar institutions covering remaining watermarked questions:`);
const sortedTargets = [...harvestTargets.values()].sort((a,b) => b.questionCount - a.questionCount);
for (const t of sortedTargets) {
  console.log(`  - ${t.name} (${t.sanarId}): ${t.questionCount} questões na nossa base`);
}

fs.writeFileSync('data/sanar_harvest_targets_remaining.json', JSON.stringify(sortedTargets, null, 2));
