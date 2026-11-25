import fs from 'fs';
import path from 'path';

const allMatches = JSON.parse(fs.readFileSync('data/sanar_all_matches_complete.json', 'utf8'));
const watermarkedMatches = JSON.parse(fs.readFileSync('data/sanar_direct_matches_watermarked.json', 'utf8'));

console.log('Total de matches gerais:', allMatches.length);
console.log('Total de matches nas que tinham marca dágua:', watermarkedMatches.length);

let existsCountAll = 0;
let missingFilesAll = 0;

for (const m of allMatches) {
  for (const img of m.sanar_images) {
    if (img.local_webp && fs.existsSync(img.local_webp)) {
      existsCountAll++;
    } else {
      missingFilesAll++;
    }
  }
}

let existsCountW = 0;
let missingFilesW = 0;

for (const m of watermarkedMatches) {
  for (const img of m.sanar_images) {
    if (img.local_webp && fs.existsSync(img.local_webp)) {
      existsCountW++;
    } else {
      missingFilesW++;
    }
  }
}

console.log(`Geral: ${existsCountAll} arquivos locais encontrados, ${missingFilesAll} ausentes`);
console.log(`Nas com marca: ${existsCountW} arquivos locais encontrados, ${missingFilesW} ausentes`);
