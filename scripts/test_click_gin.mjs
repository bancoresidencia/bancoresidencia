import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('medevo.com.br'));

  console.log('Clicando em Ginecologia...');
  await page.click('button.material-library-item:has-text("Ginecologia")');
  await page.waitForTimeout(2500);

  console.log('Nova URL:', page.url());
  const details = await page.evaluate(() => {
    const title = document.title;
    const h1s = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.innerText);
    const textSample = document.body.innerText.slice(0, 1500);
    const items = Array.from(document.querySelectorAll('a, button, li')).map(el => el.innerText.trim()).filter(t => t.length > 5 && t.length < 100);
    return { title, h1s, textSample, itemsSample: items.slice(0, 20) };
  });

  console.log('Detalhes pós-clique:', details);
}

main().catch(console.error);
