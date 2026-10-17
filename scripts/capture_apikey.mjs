import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('medevo.com.br'));

  let apikey = null;
  page.on('request', req => {
    if (req.url().includes('data.medevo.com.br') || req.url().includes('api.medevo.com.br')) {
      const h = req.headers();
      if (h['apikey']) {
        apikey = h['apikey'];
      }
    }
  });

  await page.evaluate(() => {
    // Dispara uma chamada qualquer que usa o client do supabase
    window.location.hash = '#ping' + Date.now();
  });
  
  // Rola um pouco para acionar qualquer lazy fetch
  await page.evaluate(() => window.scrollBy(0, 100));
  await page.waitForTimeout(2000);

  if (!apikey) {
    // Faz um reload rápido da página para interceptar todos os headers
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
  }

  console.log('APIKEY encontrada:', apikey ? `${apikey.slice(0, 20)}...${apikey.slice(-10)}` : 'não encontrada');
  if (apikey) {
    console.log('FULL_APIKEY:', apikey);
  }
}

main().catch(console.error);
