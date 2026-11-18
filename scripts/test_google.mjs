import { chromium } from 'playwright';

async function testGoogle() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    locale: 'pt-BR',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });

  const q = 'Paciente masculino 23 anos, com história de febre reumática na infância sem acompanhamento médico';
  await page.goto('https://www.google.com/search?q=' + encodeURIComponent(q), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Clica em aceitar se existir botão de consent
  try {
    const btn = await page.$('button:has-text("Aceitar tudo"), button:has-text("Aceito"), button:has-text("Concordo"), #L2AGLb');
    if (btn) await btn.click();
    await page.waitForTimeout(1000);
  } catch(e) {}

  const results = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div.g a, #search a, .yuRUbf a')).map(a => ({
      title: a.innerText.trim(),
      href: a.href
    })).filter(r => r.href.startsWith('http') && !r.href.includes('google.com'));
  });

  console.log(`Resultados no Google (${results.length}):`);
  results.slice(0, 8).forEach((r, i) => {
    console.log(`  [${i+1}] ${r.title.slice(0, 60)} -> ${r.href}`);
  });

  await browser.close();
}

testGoogle();
