import { chromium } from 'playwright';

async function testBingExtraction() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const q = 'Paciente masculino 23 anos, com história de febre reumática na infância sem acompanhamento médico';
  await page.goto('https://www.bing.com/search?q=' + encodeURIComponent(q), { waitUntil: 'networkidle' });

  const data = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('li.b_algo')).map(li => {
      const a = li.querySelector('h2 a');
      const cite = li.querySelector('cite');
      return {
        title: a?.innerText,
        href: a?.href,
        cite: cite?.innerText
      };
    });
  });

  console.log(`Encontrados ${data.length} itens:`);
  data.forEach((d, i) => {
    console.log(`\nItem ${i+1}:`);
    console.log('Title:', d.title);
    console.log('Href:', d.href);
    console.log('Cite:', d.cite);
  });

  await browser.close();
}

testBingExtraction();
