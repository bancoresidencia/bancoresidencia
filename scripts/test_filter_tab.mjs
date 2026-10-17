import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  // Click Experimentar Demonstração
  const demoBtn = page.locator('button:has-text("Experimentar Demonstração")').first();
  await demoBtn.click();
  await page.waitForTimeout(2000);

  // Click on Banco de Questões (button[aria-label="Banco de Questões"])
  const bancoBtn = page.locator('button[aria-label="Banco de Questões"]').first();
  await bancoBtn.click();
  await page.waitForTimeout(2000);

  // Screenshot filter page
  await page.screenshot({ path: 'scripts/filters_page_live.png' });
  console.log('Saved scripts/filters_page_live.png');

  // Open modal "Ver todas por UF"
  const ufBtn = page.locator('button:has-text("Ver todas por UF")').first();
  if (await ufBtn.isVisible()) {
    await ufBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'scripts/modal_uf_live.png' });
    console.log('Saved scripts/modal_uf_live.png');
  }

  await browser.close();
}

main().catch(console.error);
