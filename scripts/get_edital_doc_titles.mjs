import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (const ed of [35, 41, 42, 43]) {
    const url = `https://concursos.selecting.com.br/informacoes/${ed}/`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const docs = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll('tr').forEach(tr => {
        const a = tr.querySelector('a');
        if (a && a.href && a.href.includes('arquivo.php')) {
          items.push({ text: tr.innerText.replace(/\s+/g, ' ').trim(), href: a.href });
        }
      });
      return items;
    });

    console.log(`\n=== EDITAL ${ed} (${docs.length} docs) ===`);
    docs.forEach(d => console.log(`  ${d.text} -> ${d.href}`));
  }

  await browser.close();
}

main();
