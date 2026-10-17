import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('medevo.com.br'));

  const apiCalls = [];
  page.on('response', async res => {
    const url = res.url();
    if (url.includes('api.medevo.com.br') || url.includes('supabase.co')) {
      try {
        const json = await res.json();
        apiCalls.push({
          url,
          status: res.status(),
          method: res.request().method(),
          keys: Array.isArray(json) ? `Array[${json.length}]` : Object.keys(json),
          dataPreview: Array.isArray(json) ? json.slice(0, 2) : json
        });
      } catch {}
    }
  });

  console.log('Navegando para um material de leitura exemplo...');
  await page.goto('https://www.medevo.com.br/material-apoio/ler/26cf8a5e-d5ad-4d07-98bd-5b6dd3e773b2', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  console.log(`Chamadas interceptadas: ${apiCalls.length}`);
  fs.writeFileSync('scripts/sample_material_backend_api.json', JSON.stringify(apiCalls, null, 2), 'utf8');

  // Retorna para a página inicial
  await page.goto('https://www.medevo.com.br/material-apoio', { waitUntil: 'domcontentloaded' });
}

main().catch(console.error);
