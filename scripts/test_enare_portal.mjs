import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  console.log('Navegando para enare.ebserh.gov.br...');
  await page.goto('https://enare.ebserh.gov.br', { timeout: 30000 });
  await page.waitForTimeout(3000);

  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a'))
      .map(a => ({ text: a.textContent.trim().replace(/\s+/g, ' '), href: a.href }))
      .filter(a => a.href && (a.href.includes('fgv') || a.href.includes('pdf') || a.href.includes('edital') || a.href.includes('prova')));
  });

  console.log(`Links encontrados no portal do ENARE: ${links.length}`);
  links.forEach(l => console.log(`   • [${l.text}] -> ${l.href}`));

  await browser.close();
}

main().catch(console.error);
