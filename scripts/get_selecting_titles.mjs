import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log("Mapeando títulos de Editais 10 a 47...");

  for (let id = 10; id <= 47; id++) {
    const url = `https://portal.concursos.selecting.com.br/edital/ver/${id}`;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 8000 });
      const info = await page.evaluate(() => {
        const h = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, strong, b, .card-title, .title, .header'))
          .map(el => el.innerText.trim())
          .filter(t => t.length > 5 && !t.includes('Selecting') && !t.includes('Menu') && !t.includes('Área do Candidato'));
        return h.length > 0 ? h[0] : '';
      });
      if (info) {
        console.log(`Edital ${id}: ${info}`);
      }
    } catch (e) {}
  }

  await browser.close();
}

main();
