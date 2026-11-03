import fs from 'fs';

const txt = fs.readFileSync('src/data/studyMaterialsData.ts', 'utf8');
const ids = ['mat-gem-01', 'mat-gem-02', 'mat-gem-03', 'mat-gem-04'];

ids.forEach(id => {
  const pos = txt.indexOf(`"${id}"`);
  if (pos === -1) {
    console.log(id, 'NOT FOUND');
    return;
  }
  const nextPos = ids.indexOf(id) < ids.length - 1 ? txt.indexOf(`"${ids[ids.indexOf(id) + 1]}"`) : txt.lastIndexOf('];');
  const chunk = txt.slice(pos, nextPos);
  
  // Extract title
  const titleMatch = chunk.match(/title:\s*"([^"]+)"/);
  // Extract lines of markdownContent
  const mdStart = chunk.indexOf('markdownContent: "');
  if (mdStart !== -1) {
    const mdEnd = chunk.lastIndexOf('"\n  }');
    const rawMd = chunk.slice(mdStart + 'markdownContent: "'.length, mdEnd);
    const unescaped = rawMd.replace(/\\n/g, '\n').replace(/\\"/g, '"');
    const lines = unescaped.split('\n');
    const h2s = lines.filter(l => l.startsWith('## '));
    console.log(`\n📌 ${id}: ${titleMatch ? titleMatch[1] : ''}`);
    console.log(`   Linhas: ${lines.length} | Seções H2 (${h2s.length}):`);
    h2s.forEach(h => console.log(`     - ${h.replace('## ', '')}`));
  }
});

