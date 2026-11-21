import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
  const dir = path.resolve(process.cwd(), '.playwright_audit');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
  
  console.log('Navigating to http://localhost:3000/#onde-vem-as-provas...');
  await page.goto('http://localhost:3000/#onde-vem-as-provas', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  await page.waitForSelector('#onde-vem-as-provas');

  const states = ['ALL', 'SP', 'MG', 'RJ', 'CE', 'RS', 'PR', 'PE', 'BA', 'DF', 'GO', 'SC', 'PA', 'ES', 'RN', 'AM'];

  for (const uf of states) {
    if (uf !== 'ALL') {
      await page.selectOption('#uf-select', uf);
      await page.waitForTimeout(600);
    } else {
      await page.selectOption('#uf-select', 'ALL');
      await page.waitForTimeout(400);
    }
    const section = page.locator('#onde-vem-as-provas');
    const outPath = path.join(dir, `state_${uf}.png`);
    await section.screenshot({ path: outPath });
    console.log(`Captured ${uf} to ${outPath}`);
  }

  await browser.close();
  console.log('Done!');
})();
