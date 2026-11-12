import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/questoes', { waitUntil: 'networkidle' });

  const counterLocator = page.locator('span.tabular-nums.font-black, span.text-2xl.tabular-nums').first();
  console.log('1. Initial Counter:', await counterLocator.textContent());

  // Click Pediatria
  console.log('2. Clicking Pediatria...');
  const pedSpan = page.locator('span:has-text("Pediatria")').first();
  await pedSpan.click();
  await page.waitForTimeout(600);
  console.log('   Pediatria Counter:', await counterLocator.textContent());

  // Click Cirurgia Geral
  console.log('3. Clicking Cirurgia Geral...');
  const cirSpan = page.locator('span:has-text("Cirurgia Geral")').first();
  await cirSpan.click();
  await page.waitForTimeout(600);
  console.log('   Pediatria + Cirurgia Counter:', await counterLocator.textContent());

  const iniciarBtn = page.locator('button:has-text("Iniciar (")').first();
  const btnText = await iniciarBtn.innerText().catch(() => 'NOT FOUND');
  console.log('4. Iniciar Button Text:', btnText);

  // Click Iniciar
  await iniciarBtn.click();
  await page.waitForSelector('button[title*="Voltar"], button[aria-label="Voltar"]', { timeout: 15000 });
  console.log('5. Entered Resolution Mode successfully!');

  // Check question content on screen
  const questionHeader = await page.locator('div.text-xs, span.font-sans').allInnerTexts();
  console.log('   Question text sample:', questionHeader.slice(0, 10).join(' | ').replace(/\n/g, ' '));

  await browser.close();
})();

