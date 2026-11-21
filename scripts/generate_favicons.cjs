const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { execSync } = require('child_process');

const PATH_SYMBOL_1 =
  'M718.74 906.921 C882.704 405.986 1702.884 702.375 1543.416 1022.75 C1373.738 1363.638 1050.008 860.221 842.727 1632.282';
const PATH_SYMBOL_2 =
  'M854.033 1157.092 C673.215 1042.009 422.801 1191.281 298.333 1070.475 C184.287 959.785 362.047 674.876 362.047 674.876 C675.35 161.911 1357.793 222.808 1670.993 488.16 C2360.998 1072.751 1270.756 1971.842 1270.756 1336.094';

// Center and scale for 512x512 canvas
// Original bounding box: X [194, 1966], Y [221, 1650], center: (1080, 935.5)
// Target center: (256, 256)
// Radius in Google search: ~256 (circle of diameter 512). Safe zone: ~330px width.
// Scale: 320 / 1772 = ~0.1805
const targetWidth = 320;
const origWidth = 1772;
const scale = targetWidth / origWidth; // ~0.180587
const tx = 256 - 1080 * scale; // ~60.966
const ty = 256 - 935.5 * scale; // ~87.06

// To ensure maximum clarity in tiny 16x16 and 48x48 renderings, strokeWidth 156 gives a robust, elegant line
const strokeWidth = 156;

function generateMasterSvg(bgColor = '#09090b', strokeColor = '#ffffff') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${bgColor}" />
  <g transform="translate(${tx.toFixed(3)}, ${ty.toFixed(3)}) scale(${scale.toFixed(5)})">
    <path d="${PATH_SYMBOL_1}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="butt" stroke-miterlimit="10"/>
    <path d="${PATH_SYMBOL_2}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="butt" stroke-miterlimit="10"/>
  </g>
</svg>`;
}

async function run() {
  const masterSvg = generateMasterSvg('#09090b', '#ffffff');
  const masterBuffer = Buffer.from(masterSvg);

  // 1. Save master SVGs (1:1 square, exactly 512x512)
  fs.writeFileSync(path.join(__dirname, '../public/favicon.svg'), masterSvg);
  fs.writeFileSync(path.join(__dirname, '../public/icon.svg'), masterSvg);
  fs.writeFileSync(path.join(__dirname, '../src/app/icon.svg'), masterSvg);
  console.log('✓ SVGs updated (1:1 aspect ratio, 512x512, brand theme #09090b with white logo)');

  // 2. Generate PNG sizes
  const sizes = [
    { name: 'icon-512x512.png', size: 512, dest: 'public' },
    { name: 'icon-192x192.png', size: 192, dest: 'public' },
    { name: 'apple-touch-icon.png', size: 180, dest: 'public' },
    { name: 'favicon-96x96.png', size: 96, dest: 'public' },
    { name: 'favicon-48x48.png', size: 48, dest: 'public' },
    { name: 'favicon-32x32.png', size: 32, dest: 'public' },
    { name: 'favicon-16x16.png', size: 16, dest: 'public' },
    { name: 'logo-banco-residencia.png', size: 512, dest: 'public' },
    { name: 'logo-banco-residencia-120x120.png', size: 120, dest: 'public' },
    { name: 'icon.png', size: 512, dest: 'src/app' },
    { name: 'apple-icon.png', size: 180, dest: 'src/app' },
  ];

  for (const item of sizes) {
    const outPath = path.join(__dirname, '..', item.dest, item.name);
    await sharp(masterBuffer)
      .resize(item.size, item.size, { fit: 'contain' })
      .png({ compressionLevel: 9 })
      .toFile(outPath);
    console.log(`✓ Generated ${item.dest}/${item.name} (${item.size}x${item.size})`);
  }

  // 3. Generate preview of Google Search circular crop
  const circleMask = Buffer.from(
    '<svg width="512" height="512"><circle cx="256" cy="256" r="256" fill="#fff"/></svg>'
  );
  await sharp(masterBuffer)
    .composite([{ input: circleMask, blend: 'dest-in' }])
    .png()
    .toFile(path.join(__dirname, '../public/google-search-preview.png'));
  console.log('✓ Generated public/google-search-preview.png (simulating Google Search circular badge)');

  // 4. Generate multi-resolution ICO using Python PIL
  const pyScript = `
from PIL import Image
p48 = Image.open('public/favicon-48x48.png')
p32 = Image.open('public/favicon-32x32.png')
p16 = Image.open('public/favicon-16x16.png')

# Save multi-size favicon.ico with 48x48, 32x32, 16x16
p48.save('public/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)], append_images=[p32, p16])
p48.save('src/app/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)], append_images=[p32, p16])
print('✓ Successfully saved multi-resolution favicon.ico in public/ and src/app/')
`;
  fs.writeFileSync(path.join(__dirname, 'make_ico.py'), pyScript);
  execSync('python scripts/make_ico.py', { stdio: 'inherit' });
  fs.unlinkSync(path.join(__dirname, 'make_ico.py'));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
