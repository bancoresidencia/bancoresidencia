import fs from 'fs';

const matches = JSON.parse(fs.readFileSync('data/sanar_all_matches_complete.json', 'utf8'));
console.log(`Checking local files for ${matches.length} matches...`);

let existingCount = 0;
let missingCount = 0;
const missingUrls = [];

for (const m of matches) {
  let ok = true;
  for (const img of m.sanar_images) {
    if (!img.local_webp || !fs.existsSync(img.local_webp)) {
      ok = false;
      missingUrls.push(img.original_url);
    }
  }
  if (ok) existingCount++;
  else missingCount++;
}

console.log(`Matches where ALL local files exist: ${existingCount} / ${matches.length}`);
console.log(`Matches with missing local files: ${missingCount}`);
console.log(`Unique missing URLs: ${[...new Set(missingUrls)].length}`);
