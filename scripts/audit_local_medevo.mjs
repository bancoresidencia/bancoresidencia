import fs from 'fs';
import path from 'path';

function searchDirectory(dir, pattern, results = []) {
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', '.next', '.chromium_profile'].includes(entry.name)) continue;
      searchDirectory(fullPath, pattern, results);
    } else if (/\.(ts|tsx|json|js|mjs)$/i.test(entry.name)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (pattern.test(content)) {
          const lines = content.split('\n');
          lines.forEach((line, idx) => {
            if (pattern.test(line)) {
              results.push({
                file: fullPath.replace(/\\/g, '/'),
                line: idx + 1,
                snippet: line.trim().slice(0, 200)
              });
            }
          });
        }
      } catch (err) {
        // ignore read error
      }
    }
  }
  return results;
}

console.log('--- SCANNING LOCAL DATA FILES FOR "MEDEVO" ---');
const pattern = /medevo/i;
const hits = [];
searchDirectory('src/data', pattern, hits);
searchDirectory('src/services', pattern, hits);

console.log(`Total occurrences found in src/data and src/services: ${hits.length}`);
hits.forEach((h, i) => {
  console.log(`[${i+1}] ${h.file}:${h.line} -> ${h.snippet}`);
});

fs.writeFileSync('scripts/medevo_local_hits.json', JSON.stringify(hits, null, 2));
console.log('Saved to scripts/medevo_local_hits.json');
