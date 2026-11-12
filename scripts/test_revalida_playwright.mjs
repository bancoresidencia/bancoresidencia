import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/questoes', { waitUntil: 'networkidle' });

  const counterLocator = page.locator('span.tabular-nums.font-black, span.text-2xl.tabular-nums').first();
  console.log('1. Acesso Direto Counter:', await counterLocator.textContent());

  // Click Revalida
  console.log('2. Clicking Revalida...');
  const revalidaPill = page.locator('button:has-text("Revalida")').first();
  await revalidaPill.click();

  // Poll counter
  for (let i = 0; i < 15; i++) {
    await page.waitForTimeout(200);
    const val = await counterLocator.textContent();
    console.log(`   Revalida Counter tick ${i}: ${val}`);
    if (val === '4.358') break;
  }

  // Click Cirurgia Geral in Revalida
  console.log('3. Clicking Cirurgia Geral in Revalida...');
  const cirSpan = page.locator('span:has-text("Cirurgia Geral")').first();
  await cirSpan.click();

  for (let i = 0; i < 15; i++) {
    await page.waitForTimeout(200);
    const val = await counterLocator.textContent();
    console.log(`   Cirurgia Revalida Counter tick ${i}: ${val}`);
    if (val === '439') break;
  }

  const iniciarBtn = page.locator('button:has-text("Iniciar (")').first();
  const btnText = await iniciarBtn.innerText().catch(() => 'NOT FOUND');
  console.log('4. Iniciar Button Text:', btnText);

  await browser.close();
})();

