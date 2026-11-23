import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const questions = JSON.parse(fs.readFileSync('data/broken_questions_list.json', 'utf8'));

async function audit() {
  console.log(`Auditing ${questions.length} images in public/images/questoes/...`);

  let validCount = 0;
  let corruptedCount = 0;
  const sizes = [];

  for (const q of questions) {
    for (const img of q.images) {
      const cleanUrl = img.split('?')[0].replace(/^\/+/, '');
      const filePath = path.resolve('public', cleanUrl);

      if (!fs.existsSync(filePath)) {
        console.error(`Missing: ${filePath}`);
        corruptedCount++;
        continue;
      }

      try {
        const metadata = await sharp(filePath).metadata();
        if (metadata.format === 'webp') {
          validCount++;
          const stat = fs.statSync(filePath);
          sizes.push(stat.size);
        } else {
          console.warn(`Format is ${metadata.format}, not webp: ${filePath}`);
        }
      } catch (err) {
        console.error(`Corrupt image (${err.message}): ${filePath}`);
        corruptedCount++;
      }
    }
  }

  const avgSizeKb = Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length / 1024);
  console.log(`\n=== AUDIT FINISHED ===`);
  console.log(`Valid WebP images: ${validCount}`);
  console.log(`Corrupted/Failed: ${corruptedCount}`);
  console.log(`Average file size: ${avgSizeKb} KB`);
}

audit().catch(console.error);
