import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log("Varrendo editais de 1 a 50 em portal.concursos.selecting.com.br/edital/ver/...");

  for (let id = 1; id <= 50; id++) {
    const url = `https://portal.concursos.selecting.com.br/edital/ver/${id}`;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 8000 });
      const text = await page.evaluate(() => document.body.innerText);
      if (text.includes('Não foi possível') || text.includes('Página não encontrada') || text.length < 200) {
        continue;
      }
      const title = await page.evaluate(() => {
        const el = document.querySelector('h1, h2, h3, .panel-title, .title');
        return el ? el.innerText.trim() : document.title;
      });
      console.log(`✅ Edital ${id}: ${title.slice(0, 80)}`);
    } catch (e) {}
  }

  await browser.close();
}

main();
