import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (const url of [
    'https://selecting.com.br/residencia-medica-em-oftalmologia/',
    'https://selecting.com.br/residencia-medica-em-psiquiatria/'
  ]) {
    console.log(`\n=== Varrendo página: ${url} ===`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);
      const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a')).map(a => ({
          text: a.innerText.trim(),
          href: a.href
        })).filter(l => l.href.includes('.pdf') || l.href.includes('concursos.selecting') || l.href.includes('edital') || l.text.toLowerCase().includes('prova') || l.text.toLowerCase().includes('gabarito'));
      });
      console.log(`Encontrados ${links.length} links relevantes.`);
      links.forEach(l => console.log(`  [${l.text}] -> ${l.href}`));
    } catch (e) {
      console.error('Erro:', e.message);
    }
  }

  await browser.close();
}

main();
