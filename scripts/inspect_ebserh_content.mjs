import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    const urls = [
      'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2023-2024/provas',
      'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2024-2025'
    ];

    for (const u of urls) {
      console.log(`\nNavigating to ${u}...`);
      await page.goto(u, { waitUntil: 'domcontentloaded' });
      const mainText = await page.$eval('#content', el => el.innerText).catch(() => 'No #content');
      console.log('MAIN TEXT SNIPPET:\n', mainText.slice(0, 1500));
      const links = await page.$$eval('#content a', els => els.map(a => ({ text: a.innerText.trim(), href: a.href })));
      console.log('LINKS IN CONTENT:', links);
    }
  } finally {
    await browser.close();
  }
}

main();
