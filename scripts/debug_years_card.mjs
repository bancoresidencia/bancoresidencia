import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/questoes', { waitUntil: 'networkidle' });

  const counterLocator = page.locator('span.tabular-nums.font-black, span.text-2xl.tabular-nums').first();
  console.log('1. Initial Counter:', await counterLocator.textContent());

  // Click Medicina Preventiva
  console.log('2. Clicking Medicina Preventiva...');
  const prevSpan = page.locator('span:has-text("Medicina Preventiva e Social")').first();
  await prevSpan.click();
  await page.waitForTimeout(600);
  console.log('   Preventiva Counter:', await counterLocator.textContent());

  // Expand Anos
  console.log('3. Clicking Anos da Prova...');
  await page.locator('text="Anos da Prova"').first().click();
  await page.waitForTimeout(400);

  // Click 2024
  console.log('4. Clicking 2024...');
  const btn2024 = page.locator('button:has-text("2024")').first();
  await btn2024.click();
  await page.waitForTimeout(1000);

  console.log('   Preventiva + 2024 Counter:', await counterLocator.textContent());

  // Click Iniciar
  const iniciarBtn = page.locator('button:has-text("Iniciar (")').first();
  console.log('5. Iniciar Button Text:', await iniciarBtn.innerText());
  await iniciarBtn.click();

  await page.waitForSelector('button[title*="Voltar"], button[aria-label="Voltar"]', { timeout: 15000 });
  console.log('6. Entered Resolution Mode successfully!');

  // Check question content on screen
  const questionHeader = await page.locator('div.text-xs, span.font-sans').allInnerTexts();
  console.log('   Question text sample:', questionHeader.slice(0, 10).join(' | ').replace(/\n/g, ' '));

  await browser.close();
})();
