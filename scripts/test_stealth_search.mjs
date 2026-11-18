import { chromium } from 'playwright';

async function testStealth() {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1366, height: 768 },
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo'
  });

  const page = await context.newPage();
  
  // Remove webdriver flag
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  const q = 'Mulher de 45 anos procura atendimento relatando tonturas rotatórias há quinze dias Hospital São Camilo';
  console.log('Testing Yahoo with Playwright...');
  try {
    await page.goto(`https://search.yahoo.com/search?p=${encodeURIComponent(q)}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(3000);
    const title = await page.title();
    console.log('Yahoo title:', title);
    const bodyText = await page.innerText('body');
    console.log('Body preview:', bodyText.slice(0, 300));
    const results = await page.evaluate(() => {
      const links = [];
      document.querySelectorAll('#web a, #results a, .compText a, ol.searchCenterMiddle a').forEach(a => {
        const href = a.href || '';
        const text = (a.innerText || '').trim();
        if (href.startsWith('http') && !href.includes('yahoo.com') && text.length > 5) {
          links.push({ title: text, url: href });
        }
      });
      return links;
    });
    console.log(`Yahoo results: ${results.length}`);
    results.slice(0, 5).forEach(r => console.log('  ->', r.title, r.url));
  } catch (e) {
    console.log('Yahoo err:', e.message);
  }

  await browser.close();
}
testStealth();
