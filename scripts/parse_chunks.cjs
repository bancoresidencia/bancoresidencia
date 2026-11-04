const fs = require('fs');

const content = fs.readFileSync('d:/bancoresidencia/scripts/resify_bundle.js', 'utf8');

// Find __vite__mapDeps
const match = content.match(/__vite__mapDeps,\s*d\s*=\s*\([a-zA-Z]\.f\|\|\([a-zA-Z]\.f\s*=\s*(\[[^\]]+\])/);
if (match) {
  const list = JSON.parse(match[1]);
  console.log(`Found ${list.length} mapped chunks!`);
  fs.writeFileSync('d:/bancoresidencia/scripts/all_chunks.json', JSON.stringify(list, null, 2));
} else {
  console.log('Not found by direct regex, searching for m.f');
  const m = content.indexOf('m.f=[');
  if (m !== -1) {
    const end = content.indexOf(']', m);
    const list = JSON.parse(content.slice(m + 4, end + 1));
    console.log(`Found ${list.length} mapped chunks!`);
    fs.writeFileSync('d:/bancoresidencia/scripts/all_chunks.json', JSON.stringify(list, null, 2));
  }
}

