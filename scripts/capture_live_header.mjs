import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  // Set demo mode in local storage
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('medevo_demo_mode', 'true');
    localStorage.setItem('medevo_theme_accent', 'red');
  });
  
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // If landing page is shown, click demo button
  const demoBtn = page.locator('button:has-text("Experimentar Demonstração"), button:has-text("Modo Demo")').first();
  if (await demoBtn.isVisible()) {
    await demoBtn.click();
    await page.waitForTimeout(1500);
  }

  // Click on Banco de Questões
  const bancoBtn = page.locator('button[aria-label="Banco de Questões"]').first();
  if (await bancoBtn.isVisible()) {
    await bancoBtn.click();
    await page.waitForTimeout(1500);
  }

  // Take screenshot
  await page.screenshot({ path: 'scripts/filters_header_live.png' });
  console.log('Saved scripts/filters_header_live.png');

  await browser.close();
}

main().catch(console.error);
