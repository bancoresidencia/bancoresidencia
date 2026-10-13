import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    console.log('Navigating to https://enare2026.conhecimento.fgv.br/provas/...');
    await page.goto('https://enare2026.conhecimento.fgv.br/provas/', { waitUntil: 'networkidle', timeout: 30000 });
    
    const links = await page.$$eval('a', els => els.map(a => ({ href: a.href, text: a.innerText.trim() })));
    console.log(`Found ${links.length} rendered links:`);
    links.forEach(l => {
      console.log(`- [${l.text}] -> ${l.href}`);
    });

    const bodyText = await page.innerText('body');
    console.log('\n--- BODY TEXT ---\n');
    console.log(bodyText);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

main();
