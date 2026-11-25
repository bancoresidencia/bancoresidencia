import fs from 'fs';

const data = JSON.parse(fs.readFileSync('data/sanar_matches_round2.json', 'utf8'));
const withDbImgs = data.matches.filter(m => m.dbImagesCount > 0);

console.log(`Checking local files for the ${withDbImgs.length} matches with images...`);

let allFilesExist = 0;
let missingFiles = 0;

for (const m of withDbImgs) {
  let ok = true;
  for (const img of m.dbImages) {
    if (!fs.existsSync(img.local_webp_path)) {
      ok = false;
      console.log(`Missing file: ${img.local_webp_path} for Sanar ID ${m.sanarId}`);
    }
  }
  if (ok) allFilesExist++;
  else missingFiles++;
}

console.log(`Existing local webp files: ${allFilesExist} / ${withDbImgs.length}`);
console.log(`Missing local webp files: ${missingFiles}`);

// Check sample of 175 questions where dbImagesCount === 0
const noImgs = data.matches.filter(m => m.dbImagesCount === 0);
console.log(`\nSample of questions matched in Sanar but no images in DB (${noImgs.length} total):`);
for (const m of noImgs.slice(0, 5)) {
  console.log(`Staging: ${m.stagingId} -> Sanar: ${m.sanarId}`);
}
