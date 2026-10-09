import { chromium } from 'playwright';
import path from 'path';

const AUTH_STATE_PATH = path.join(process.cwd(), 'scripts', 'drive_auth_state.json');

async function inspectFolder() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: AUTH_STATE_PATH });
  const page = await context.newPage();

  const folderUrl = 'https://drive.google.com/drive/folders/1_cgWHry1w_sJjQhrqIvW5ry0n7kv-slx';
  console.log('Navegando para:', folderUrl);
  await page.goto(folderUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(4000);

  const title = await page.title();
  console.log('Título da página:', title);

  const items = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr[role="row"][data-id]'));
    return rows.map(r => {
      const strong = r.querySelector('strong, span.WQJtxb');
      const text = strong ? strong.textContent.trim() : (r.innerText || '').split('\n')[0].trim();
      return { id: r.getAttribute('data-id'), text };
    }).filter(x => x.id && x.text);
  });

  console.log('Total de itens na raiz da pasta:', items.length);
  for (const item of items) {
    console.log(` - [${item.id}] ${item.text}`);
  }

  await browser.close();
}

inspectFolder().catch(console.error);
