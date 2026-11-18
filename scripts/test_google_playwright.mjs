import { chromium } from 'playwright';

async function testGooglePlaywright() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });

  const q = 'Mulher de 45 anos procura atendimento relatando tonturas rotatórias há quinze dias Hospital São Camilo';
  const url = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
  console.log('Navigating to Google:', url);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);

  const title = await page.title();
  console.log('Page Title:', title);

  const results = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('div.g a').forEach(a => {
      const h3 = a.querySelector('h3');
      if (h3 && a.href && !a.href.includes('google.com')) {
        list.push({ title: h3.innerText, url: a.href });
      }
    });
    return list;
  });

  console.log(`Google extracted ${results.length} results:`);
  results.slice(0, 5).forEach((r, i) => console.log(`[${i+1}] ${r.title} -> ${r.url}`));

  await browser.close();
}
testGooglePlaywright();
