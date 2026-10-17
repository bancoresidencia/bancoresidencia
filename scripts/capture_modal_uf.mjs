import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('medevo_demo_mode', 'true');
    localStorage.setItem('medevo_theme_accent', 'red');
  });
  
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const demoBtn = page.locator('button:has-text("Experimentar Demonstração"), button:has-text("Modo Demo")').first();
  if (await demoBtn.isVisible()) {
    await demoBtn.click();
    await page.waitForTimeout(1000);
  }

  const bancoBtn = page.locator('button[aria-label="Banco de Questões"]').first();
  if (await bancoBtn.isVisible()) {
    await bancoBtn.click();
    await page.waitForTimeout(1000);
  }

  const openModalBtn = page.locator('button:has-text("Ver todas por UF")').first();
  if (await openModalBtn.isVisible()) {
    await openModalBtn.click();
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: 'scripts/modal_uf_live.png' });
  console.log('Saved scripts/modal_uf_live.png');
  await browser.close();
}

main().catch(console.error);
