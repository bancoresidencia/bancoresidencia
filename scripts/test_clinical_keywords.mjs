import { chromium } from 'playwright';

async function testClinicalKeywords() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const q = '"febre reumática" infância cansaço esforços palpitações dispneia';
  await page.goto('https://www.bing.com/search?q=' + encodeURIComponent(q), { waitUntil: 'networkidle' });

  const data = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('li.b_algo')).map(li => ({
      title: li.querySelector('h2 a')?.innerText,
      cite: li.querySelector('cite')?.innerText
    }));
  });

  console.log(`Resultados com termos clínicos específicos (${data.length}):`);
  data.slice(0, 8).forEach((d, i) => console.log(`  [${i+1}] ${d.title} | ${d.cite}`));

  await browser.close();
}

testClinicalKeywords();
