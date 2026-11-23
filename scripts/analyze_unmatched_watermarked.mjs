import fs from 'fs';

const cat = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8'));
const queueMatches = JSON.parse(fs.readFileSync('data/sanar_queue_matches.json', 'utf8'));
const matchedIds = new Set(queueMatches.map(m => m.qId));

const unmatched = (cat.catalog || []).filter(c => !matchedIds.has(c.id));
console.log(`Total unmatched in catalog: ${unmatched.length}`);

// Group by banca
const byBanca = {};
const byYear = {};
for (const u of unmatched) {
  const b = u.banca || 'DESCONHECIDA';
  byBanca[b] = (byBanca[b] || 0) + 1;
  const y = u.year || 'SEM_ANO';
  byYear[y] = (byYear[y] || 0) + 1;
}

const sortedBancas = Object.entries(byBanca).sort((a, b) => b[1] - a[1]);
console.log('\nTop 15 Bancas among unmatched:');
sortedBancas.slice(0, 15).forEach(([b, count]) => console.log(`  ${b.padEnd(35)}: ${count}`));

const sortedYears = Object.entries(byYear).sort((a, b) => b[1] - a[1]);
console.log('\nYears distribution:');
sortedYears.forEach(([y, count]) => console.log(`  ${y}: ${count}`));
