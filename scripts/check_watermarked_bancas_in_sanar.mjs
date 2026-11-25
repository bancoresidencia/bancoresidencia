import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const stagingDb = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const catData = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8'));
const watermarkedList = catData.catalog || [];

let matchedInst = [];
if (fs.existsSync('data/sanar_matched_bancas.json')) {
  matchedInst = JSON.parse(fs.readFileSync('data/sanar_matched_bancas.json', 'utf8'));
}

const bancaMap = new Map();
for (const b of matchedInst) {
  if (b.our) bancaMap.set(b.our.toLowerCase().trim(), b.sanarId);
  if (b.sanarName) bancaMap.set(b.sanarName.toLowerCase().trim(), b.sanarId);
}

// Also check data/sanar_all_matched_institutions.json
if (fs.existsSync('data/sanar_all_matched_institutions.json')) {
  const allM = JSON.parse(fs.readFileSync('data/sanar_all_matched_institutions.json', 'utf8'));
  for (const item of allM) {
    if (item.name) bancaMap.set(item.name.toLowerCase().trim(), item.id);
    if (item.sigla) bancaMap.set(item.sigla.toLowerCase().trim(), item.id);
  }
}

let withKnownSanarId = 0;
let withoutKnownSanarId = 0;
const missingBancas = new Map();
const knownBancaDistribution = new Map();

for (const w of watermarkedList) {
  const row = stagingDb.prepare('SELECT banca, year FROM questions_curated_staging WHERE id = ?').get(w.id);
  const b = (row?.banca || '').toLowerCase().trim();
  
  // Try exact or partial match
  let foundId = bancaMap.get(b);
  if (!foundId) {
    for (const [k, id] of bancaMap.entries()) {
      if (b.includes(k) || k.includes(b)) {
        foundId = id;
        break;
      }
    }
  }

  if (foundId) {
    withKnownSanarId++;
    knownBancaDistribution.set(row?.banca || 'UNKNOWN', (knownBancaDistribution.get(row?.banca || 'UNKNOWN') || 0) + 1);
  } else {
    withoutKnownSanarId++;
    missingBancas.set(row?.banca || 'UNKNOWN', (missingBancas.get(row?.banca || 'UNKNOWN') || 0) + 1);
  }
}

console.log(`\nOf 598 watermarked:`);
console.log(`With known Sanar institution ID: ${withKnownSanarId}`);
console.log(`Without known Sanar institution ID: ${withoutKnownSanarId}`);
console.log('\nTop known bancas in watermarked:');
console.log([...knownBancaDistribution.entries()].sort((a,b) => b[1] - a[1]).slice(0, 15));
console.log('\nTop missing bancas in watermarked:');
console.log([...missingBancas.entries()].sort((a,b) => b[1] - a[1]).slice(0, 15));
