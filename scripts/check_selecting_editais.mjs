import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (const id of [12, 13, 14, 18, 19, 20, 31, 35, 41, 42, 43]) {
    const url = `https://portal.concursos.selecting.com.br/edital/ver/${id}`;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 12000 });
      await page.waitForTimeout(1000);
      const data = await page.evaluate(() => {
        const title = document.querySelector('h1, h2, h3, .title, .card-title')?.innerText?.trim() || document.title;
        const pdfLinks = Array.from(document.querySelectorAll('a'))
          .filter(a => a.href && (a.href.includes('.pdf') || a.innerText.toLowerCase().includes('prova') || a.innerText.toLowerCase().includes('gabarito')))
          .map(a => ({ text: a.innerText.trim(), href: a.href }));
        return { title, pdfLinks };
      });
      console.log(`\n📌 [Edital ${id}] Title: ${data.title}`);
      console.log(`   Links (${data.pdfLinks.length}):`);
      data.pdfLinks.forEach(l => console.log(`     [${l.text}] -> ${l.href}`));
    } catch (e) {
      console.log(`Edital ${id}: erro ou não encontrado`);
    }
  }

  await browser.close();
}

main();
