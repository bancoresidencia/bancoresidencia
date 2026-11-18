import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.bing.com/search?q=residencia+medica+sanar+estrategia', { waitUntil: 'networkidle' });

  const aData = await page.evaluate(() => {
    const items = [];
    document.querySelectorAll('li.b_algo h2 a').forEach(a => {
      const attrs = {};
      for (const attr of a.attributes) {
        attrs[attr.name] = attr.value;
      }
      // Also check cite or span inside or adjacent
      const parent = a.closest('li.b_algo');
      const cite = parent ? parent.querySelector('cite')?.innerText : '';
      items.push({
        text: a.innerText,
        href: a.href,
        attrs,
        cite
      });
    });
    return items;
  });

  console.log('Total links encontrados:', aData.length);
  aData.slice(0, 5).forEach((item, i) => {
    console.log(`\nLink ${i+1}:`);
    console.log('Text:', item.text);
    console.log('Href:', item.href);
    console.log('Cite:', item.cite);
    console.log('Attrs:', JSON.stringify(item.attrs));
  });

  await browser.close();
}

main();
