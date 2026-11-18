import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  for (const year of ['2026', '2025', '2024', '2023']) {
    console.log(`\nConsultando ano ${year}...`);
    try {
      await page.goto('https://sistemas.institutoverbena.ufg.br/cms/home', { waitUntil: 'domcontentloaded' });
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }),
        page.selectOption('select', year)
      ]);
      const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a'))
          .map(a => ({ text: a.innerText.trim(), href: a.href }))
          .filter(l => l.text.length > 5);
      });
      console.log(`Ano ${year}: ${links.length} itens encontrados.`);
      for (const l of links) {
        if (l.text.toLowerCase().includes('ses') || l.text.toLowerCase().includes('resid') || l.text.toLowerCase().includes('médic') || l.text.toLowerCase().includes('coreme')) {
          console.log(`  🎯 ${l.text} -> ${l.href}`);
        }
      }
    } catch(e) {
      console.log(`Erro no ano ${year}: ${e.message}`);
    }
  }

  await browser.close();
}

main();
