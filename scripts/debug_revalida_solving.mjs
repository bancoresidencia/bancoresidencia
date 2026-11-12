import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('response', async res => {
    if (res.url().includes('/api/questions')) {
      try {
        const json = await res.json();
        console.log('API Response:', res.status(), 'total:', json.total, 'questions count:', json.questions?.length);
      } catch {}
    }
  });

  await page.goto('http://localhost:3000/questoes', { waitUntil: 'networkidle' });

  // Switch to Revalida
  console.log('1. Switching to Revalida...');
  await page.locator('button:has-text("Revalida")').first().click();
  await page.waitForTimeout(1000);

  // Click Cirurgia Geral
  console.log('2. Clicking Cirurgia Geral in Revalida...');
  await page.locator('span:has-text("Cirurgia Geral")').first().click();
  await page.waitForTimeout(1000);

  // Check Iniciar button
  const btn = page.locator('button:has-text("Iniciar (")').first();
  console.log('3. Iniciar Button:', await btn.innerText());

  // Click Iniciar
  console.log('4. Clicking Iniciar...');
  await btn.click();

  // Wait 4 seconds and check what is on screen
  await page.waitForTimeout(4000);

  const isBackVisible = await page.locator('button[title*="Voltar"], button[aria-label="Voltar"]').first().isVisible().catch(() => false);
  console.log('5. Is Back button visible (Resolution Mode):', isBackVisible);

  const texts = await page.locator('h1, h2, h3, p, div.text-xs').allInnerTexts();
  console.log('   Screen text samples:', texts.slice(0, 10).join(' | ').replace(/\n/g, ' '));

  await browser.close();
})();

