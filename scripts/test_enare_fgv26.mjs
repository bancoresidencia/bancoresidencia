import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  console.log('Acessando https://enare2026.conhecimento.fgv.br/provas/ ...');
  await page.goto('https://enare2026.conhecimento.fgv.br/provas/', { timeout: 30000 });
  await page.waitForTimeout(3000);

  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a'))
      .map(a => ({ text: a.textContent.trim().replace(/\s+/g, ' '), href: a.href }))
      .filter(a => a.href && (a.href.includes('.pdf') || /prova|gabarito|caderno|med/i.test(a.text)));
  });

  console.log(`Documentos encontrados na seção de provas: ${links.length}`);
  links.forEach(l => console.log(`   • [${l.text}] -> ${l.href}`));

  await browser.close();
}

main().catch(console.error);
