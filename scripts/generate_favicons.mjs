import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Sincroniza SVG original hippotalamus
const sourceSvg = path.join(rootDir, 'design-system', 'LOGO', 'hippotalamus.svg');
const publicOriginalSvg = path.join(rootDir, 'public', 'logoinicial.svg');
const docsOriginalSvg = path.join(rootDir, 'docs', 'design', 'logoinicial.svg');

if (fs.existsSync(sourceSvg)) {
  fs.copyFileSync(sourceSvg, publicOriginalSvg);
  if (!fs.existsSync(path.dirname(docsOriginalSvg))) {
    fs.mkdirSync(path.dirname(docsOriginalSvg), { recursive: true });
  }
  fs.copyFileSync(sourceSvg, docsOriginalSvg);
  console.log('Copied hippotalamus.svg to public/logoinicial.svg and docs/design/logoinicial.svg');
}

// 2. Símbolo puro oficial (sem círculo, traço original 132 miterlimit 10)
const PATH_SYMBOL_1 =
  'M718.74 906.921 C882.704 405.986 1702.884 702.375 1543.416 1022.75 C1373.738 1363.638 1050.008 860.221 842.727 1632.282';
const PATH_SYMBOL_2 =
  'M854.033 1157.092 C673.215 1042.009 422.801 1191.281 298.333 1070.475 C184.287 959.785 362.047 674.876 362.047 674.876 C675.35 161.911 1357.793 222.808 1670.993 488.16 C2360.998 1072.751 1270.756 1971.842 1270.756 1336.094';

const symbolSvgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2160 1920">
  <defs>
    <style>
      .cls-1 {
        fill: none;
        stroke: #000000;
        stroke-width: 132;
        stroke-miterlimit: 10;
      }
      @media (prefers-color-scheme: dark) {
        .cls-1 {
          stroke: #ffffff;
        }
      }
    </style>
  </defs>
  <g id="Layer_1" data-name="Layer 1">
    <path d="${PATH_SYMBOL_1}" class="cls-1"/>
    <path d="${PATH_SYMBOL_2}" class="cls-1"/>
  </g>
</svg>`;

fs.writeFileSync(path.join(rootDir, 'public', 'favicon.svg'), symbolSvgContent);
fs.writeFileSync(path.join(rootDir, 'public', 'icon.svg'), symbolSvgContent);
fs.writeFileSync(path.join(rootDir, 'src', 'app', 'icon.svg'), symbolSvgContent);
console.log('Created public/favicon.svg, public/icon.svg, and src/app/icon.svg (sem círculo)');

// 3. Render Master PNG via Playwright (fundo transparente, traço preto nítido)
async function renderPngs() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1024, height: 1024 });

  const html = `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body, html { margin: 0; padding: 0; background: transparent; overflow: hidden; width: 100%; height: 100%; }
        svg { width: 100%; height: 100%; display: block; }
      </style>
    </head>
    <body>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2160 1920">
        <g id="Layer_1" data-name="Layer 1">
          <path d="${PATH_SYMBOL_1}" fill="none" stroke="#000000" stroke-width="132" stroke-miterlimit="10"/>
          <path d="${PATH_SYMBOL_2}" fill="none" stroke="#000000" stroke-width="132" stroke-miterlimit="10"/>
        </g>
      </svg>
    </body>
  </html>`;

  await page.setContent(html);

  const tempDir = path.join(rootDir, 'scripts', '.temp_icons');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const masterPng = path.join(tempDir, 'master_1024.png');
  await page.screenshot({ path: masterPng, omitBackground: true });
  await browser.close();
  console.log('Rendered master 1024x1024 PNG via Playwright');

  // 4. Run Python PIL to produce icons with Lanczos
  const pythonScript = `
from PIL import Image
import os

master_path = r'${masterPng.replace(/\\/g, '/')}'
img = Image.open(master_path).convert('RGBA')

# 1. Salvar ícone Apple (192x192)
apple_icon = img.resize((192, 192), Image.Resampling.LANCZOS)
apple_icon.save(r'public/apple-touch-icon.png', format='PNG')
apple_icon.save(r'public/logo-banco-residencia.png', format='PNG')
print('Generated public/apple-touch-icon.png & public/logo-banco-residencia.png')

# 2. Salvar logo 120x120
logo_120 = img.resize((120, 120), Image.Resampling.LANCZOS)
logo_120.save(r'public/logo-banco-residencia-120x120.png', format='PNG')
print('Generated public/logo-banco-residencia-120x120.png')

# 3. Salvar favicon.ico multi-resolução (16, 32, 48)
ico_sizes = [(16, 16), (32, 32), (48, 48)]
img.save(r'public/favicon.ico', format='ICO', sizes=ico_sizes)
print('Generated public/favicon.ico with multi-sizes (16, 32, 48)')
`;

  const tempPy = path.join(rootDir, 'scripts', 'make_ico.py');
  fs.writeFileSync(tempPy, pythonScript.trim());
  execSync(`python scripts/make_ico.py`, { stdio: 'inherit', cwd: rootDir });

  // Clean up temp dir & script
  fs.rmSync(tempDir, { recursive: true, force: true });
  fs.unlinkSync(tempPy);
  console.log('Favicon generation completed successfully!');
}

renderPngs().catch(console.error);
