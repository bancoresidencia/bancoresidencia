import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  const btn = page.locator('button:has-text("Experimentar Demonstração")').first();
  await btn.click();
  await page.waitForTimeout(3000);

  // Take screenshot of filter panel
  await page.screenshot({ path: 'scripts/app_filters_screen.png' });
  console.log('Saved scripts/app_filters_screen.png');

  // Also click on "Ver todas por UF >" to open the modal
  const ufBtn = page.locator('button:has-text("Ver todas por UF"), text="Ver todas por UF"').first();
  if (await ufBtn.isVisible()) {
    await ufBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'scripts/app_uf_modal_screen.png' });
    console.log('Saved scripts/app_uf_modal_screen.png');
  }

  await browser.close();
}

main().catch(console.error);
