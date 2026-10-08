import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ storageState: 'scripts/drive_auth_state.json' });
  const page = await ctx.newPage();

  const folders = [
    { name: 'Hematologia', id: '11Dp1Z2RYYBN9xEunEk92wCiUyRhiNcq1' },
    { name: 'Obstetrícia', id: '1_JKB42seqMnepKKb6cTUzv8zN-9d6xj7' },
    { name: 'Obstetrícia-2', id: '1gj7yn_BrmCtHAeDLBMptsVoviKWsdl_W' }
  ];

  for (const f of folders) {
    await page.goto(`https://drive.google.com/drive/folders/${f.id}`, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(3000);
    const items = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr[role="row"][data-id]'));
      return rows.map(r => {
        const strong = r.querySelector('strong, span.WQJtxb');
        return {
          id: r.getAttribute('data-id'),
          name: strong ? strong.textContent.trim() : r.innerText.split('\t')[0].trim()
        };
      });
    });
    console.log(`\n📂 ${f.name} (Total: ${items.length} itens):`);
    items.slice(0, 8).forEach(i => console.log('  -', i.name, `(${i.id})`));
  }

  await browser.close();
}

run().catch(console.error);
