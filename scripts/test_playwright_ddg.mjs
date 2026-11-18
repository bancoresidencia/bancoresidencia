import { chromium } from 'playwright';

async function testPlaywrightDDG() {
  console.log('Launching headless Chromium...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const query = 'Além da triagem específica por meio do M-CHAT-R/F';
  const url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
  console.log('Navigating to:', url);
  
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(3000);
  
  const title = await page.title();
  console.log('Page Title:', title);
  
  // Extract search results
  const results = await page.evaluate(() => {
    const items = [];
    const elements = document.querySelectorAll('article, [data-testid="result"]');
    elements.forEach(el => {
      const a = el.querySelector('a[data-testid="result-title-a"], h2 a');
      if (a) {
        items.push({
          title: a.innerText,
          href: a.href
        });
      }
    });
    return items;
  });
  
  console.log(`Extracted ${results.length} results:`);
  results.slice(0, 5).forEach((r, i) => console.log(`[${i+1}] ${r.title} -> ${r.href}`));
  
  await browser.close();
}
testPlaywrightDDG();
