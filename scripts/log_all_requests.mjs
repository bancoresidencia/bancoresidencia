import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('medevo.com.br'));

  const requests = [];
  page.on('request', req => {
    const url = req.url();
    if (!url.endsWith('.png') && !url.endsWith('.svg') && !url.endsWith('.woff2') && !url.endsWith('.css')) {
      requests.push({
        url,
        method: req.method(),
        resourceType: req.resourceType()
      });
    }
  });

  await page.goto('https://www.medevo.com.br/material-apoio/ler/26cf8a5e-d5ad-4d07-98bd-5b6dd3e773b2', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  console.log('Total de requisições capturadas:', requests.length);
  console.log(requests);
  fs.writeFileSync('scripts/material_all_requests.json', JSON.stringify(requests, null, 2), 'utf8');

  // Volta
  await page.goto('https://www.medevo.com.br/material-apoio', { waitUntil: 'domcontentloaded' });
}

main().catch(console.error);
