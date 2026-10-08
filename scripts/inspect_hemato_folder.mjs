import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ storageState: 'scripts/drive_auth_state.json' });
  const page = await ctx.newPage();

  console.log('Navegando para 01 - Introdução ao Estudo das Anemias...');
  await page.goto('https://drive.google.com/drive/folders/13T3TFf_wKLFlqWXMOGVxG6eHaNat6eyC', {
    waitUntil: 'domcontentloaded',
    timeout: 35000
  });
  await page.waitForTimeout(3000);

  const items = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr[role="row"][data-id]'));
    return rows.map(r => ({
      id: r.getAttribute('data-id'),
      text: r.innerText.replace(/\n+/g, ' ')
    }));
  });

  console.log('Itens encontrados:', items);
  await browser.close();
}

run().catch(console.error);
