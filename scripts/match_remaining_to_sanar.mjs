import fs from 'fs';

const rawCat = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8'));
const list = Array.isArray(rawCat) ? rawCat : (rawCat.catalog || rawCat.items || []);

const res = await fetch('https://sanarmed.com/wp-content/plugins/sanar-questoes1.0.20/public/data/institutions.json');
const instData = await res.json();
const sanarInsts = instData.data || [];

const bancaCounts = {};
for (const q of list) {
  const b = q.banca || 'SEM_BANCA';
  bancaCounts[b] = (bancaCounts[b] || 0) + 1;
}

console.log(`Total remaining in catalog: ${list.length}`);
console.log(`Distinct bancas in catalog: ${Object.keys(bancaCounts).length}`);

// Normalização para match
function norm(s) {
  return (s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const sanarNorm = sanarInsts.map(i => ({
  id: i.id,
  name: i.name,
  normName: norm(i.name),
  tokens: new Set(norm(i.name).split(' ').filter(x => x.length > 2))
}));

const matchesFound = [];
const unmappedBancas = [];

for (const [banca, count] of Object.entries(bancaCounts)) {
  const bNorm = norm(banca);
  const bTokens = bNorm.split(' ').filter(x => x.length > 2);
  
  let bestMatch = null;
  let maxScore = 0;

  for (const s of sanarNorm) {
    if (s.normName.includes(bNorm) || bNorm.includes(s.normName)) {
      bestMatch = s;
      maxScore = 100;
      break;
    }
    let common = 0;
    for (const t of bTokens) {
      if (s.tokens.has(t)) common++;
    }
    const score = common / Math.max(1, bTokens.length);
    if (score > maxScore && score >= 0.5) {
      maxScore = score;
      bestMatch = s;
    }
  }

  if (bestMatch) {
    matchesFound.push({ banca, count, sanar: bestMatch.name, sanarId: bestMatch.id, score: maxScore });
  } else {
    unmappedBancas.push({ banca, count });
  }
}

matchesFound.sort((a,b) => b.count - a.count);
unmappedBancas.sort((a,b) => b.count - a.count);

console.log('\n--- TOP MATCHES WITH SANAR ---');
for (const m of matchesFound.slice(0, 25)) {
  console.log(`[${m.count} q] ${m.banca} -> ${m.sanar} (${m.sanarId})`);
}

console.log('\n--- TOP UNMAPPED BANCAS ---');
for (const u of unmappedBancas.slice(0, 25)) {
  console.log(`[${u.count} q] ${u.banca}`);
}
