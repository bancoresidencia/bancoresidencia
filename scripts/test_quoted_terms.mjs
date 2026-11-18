import { chromium } from 'playwright';

async function testQuoted() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const q = '"diabetes mellitus" "uso crônico de prednisona" prostração intensa';
  await page.goto('https://www.bing.com/search?q=' + encodeURIComponent(q), { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('li.b_algo h2 a', { timeout: 5000 }).catch(() => {});
  
  const items = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('li.b_algo')).map(li => ({
      title: li.querySelector('h2 a')?.innerText?.trim(),
      href: li.querySelector('h2 a')?.href,
      cite: li.querySelector('cite')?.innerText?.trim()
    }));
  });

  console.log('Resultados com termos médicos específicos:', items.length);
  items.slice(0, 6).forEach((it, i) => {
    console.log(`  [${i+1}] ${it.title} | ${it.cite}`);
  });

  await browser.close();
}

testQuoted();
