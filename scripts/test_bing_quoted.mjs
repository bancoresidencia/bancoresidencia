import { chromium } from 'playwright';

async function testBingQuoted() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const q = '"Em um ECG de superfície, qual evento elétrico corresponde à onda P?"';
  const url = 'https://www.bing.com/search?q=' + encodeURIComponent(q);

  await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);

  const results = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('li.b_algo').forEach(li => {
      const a = li.querySelector('h2 a');
      const cite = li.querySelector('cite');
      let href = a?.href || '';
      let citeText = cite?.innerText || '';
      list.push({ title: a?.innerText, href, citeText });
    });
    return list;
  });

  console.log(`Resultados no Bing (${results.length}):`);
  results.forEach((r, i) => {
    console.log(`\n[${i+1}] ${r.title}`);
    console.log(`    Href: ${r.href}`);
    console.log(`    Cite: ${r.citeText}`);
  });

  await browser.close();
}

testBingQuoted();
