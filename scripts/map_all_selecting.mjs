import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log("Mapeando todos os editais de 1 a 50 no portal da Selecting...");

  const results = [];

  for (let id = 1; id <= 50; id++) {
    const url = `https://portal.concursos.selecting.com.br/edital/ver/${id}`;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 8000 });
      const text = await page.evaluate(() => document.body.innerText);
      if (text.includes('INFORMAÇÕES')) {
        const parts = text.split('INFORMAÇÕES');
        const after = parts[1].split('INSCRIÇÕES')[0].replace(/\n+/g, ' -- ').trim();
        console.log(`🎯 Edital ${id}: ${after.slice(0, 100)}`);
        results.push({ id, title: after });
      }
    } catch (e) {}
  }

  await browser.close();
}

main();
