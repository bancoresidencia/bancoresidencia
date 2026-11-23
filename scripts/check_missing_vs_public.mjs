import fs from 'fs';
import path from 'path';

const questions = JSON.parse(fs.readFileSync('data/broken_questions_list.json', 'utf8'));

let foundInPublic = 0;
let stillMissing = 0;
const foundList = [];
const missingList = [];

for (const q of questions) {
  const imgs = q.images || [];
  let allFound = true;
  const paths = [];

  for (const img of imgs) {
    if (typeof img !== 'string') continue;
    const cleanUrl = img.split('?')[0].replace(/^\/+/, '');
    const directPath = path.resolve('public', cleanUrl);
    const altPath = path.resolve(cleanUrl);
    const baseName = path.basename(cleanUrl);
    const ginecoPath = path.resolve('public/images/questoes/ginecologia', baseName);
    const uroPath = path.resolve('public/images/questoes/urologia', baseName);

    let resolved = null;
    if (fs.existsSync(directPath)) resolved = directPath;
    else if (fs.existsSync(altPath)) resolved = altPath;
    else if (fs.existsSync(ginecoPath)) resolved = ginecoPath;
    else if (fs.existsSync(uroPath)) resolved = uroPath;

    if (resolved) {
      paths.push(resolved);
    } else {
      allFound = false;
    }
  }

  if (allFound && paths.length > 0) {
    foundInPublic++;
    foundList.push({ id: q.id, statement: q.statement.substring(0, 80), images: q.images, resolved: paths });
  } else {
    stillMissing++;
    missingList.push({ id: q.id, statement: q.statement.substring(0, 80), images: q.images, paths });
  }
}

console.log(`\n=== AUDIT RESULTS ===`);
console.log(`Total checked: ${questions.length}`);
console.log(`FOUND in public/: ${foundInPublic}`);
console.log(`STILL MISSING: ${stillMissing}`);

console.log('\nSample FOUND (first 5):');
console.log(JSON.stringify(foundList.slice(0, 5), null, 2));

console.log('\nSample STILL MISSING (first 5):');
console.log(JSON.stringify(missingList.slice(0, 5), null, 2));

fs.writeFileSync('data/broken_still_missing.json', JSON.stringify(missingList, null, 2), 'utf8');
