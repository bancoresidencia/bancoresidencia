import fs from 'fs';

const matchedBancas = JSON.parse(fs.readFileSync('data/sanar_matched_bancas.json', 'utf8'));

const targets = ['unicamp', 'usp', 'puc-pr', 'ufrgs', 'fmabc', 'scmrp', 'hcor', 'haoc', 'hsc', 'surce', 'unesp'];

for (const t of targets) {
  const found = matchedBancas.filter(b => 
    (b.our && b.our.toLowerCase().includes(t)) || 
    (b.sanarName && b.sanarName.toLowerCase().includes(t))
  );
  console.log(`Target ${t}: found ${found.length} bancas`);
  found.forEach(f => console.log(`  -> our: "${f.our}", sanarId: "${f.sanarId}", sanarName: "${f.sanarName}"`));
}
