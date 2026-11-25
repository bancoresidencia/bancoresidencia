import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8'));
const list = Array.isArray(raw) ? raw : (raw.catalog || raw.items || []);
console.log('Total in catalog:', list.length);

const targets = list.filter(q => {
  const b = (q.banca || '').toUpperCase();
  return b.includes('USP') || b.includes('UNICAMP') || b.includes('HVC') || b.includes('HCOR') || b.includes('HPEV');
});

console.log('Total matching key targets (USP, UNICAMP, HVC, HCOR, HPEV):', targets.length);

const byBancaYear = {};
for (const t of targets) {
  const key = `${t.banca} (${t.year})`;
  byBancaYear[key] = (byBancaYear[key] || 0) + 1;
}

console.log('By Banca & Year:');
console.log(byBancaYear);

console.log('\nSample questions:');
for (const t of targets.slice(0, 15)) {
  console.log(`ID: ${t.id} | ${t.banca} ${t.year} | ${t.statement_snippet?.slice(0, 60)}`);
}
