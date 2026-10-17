import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('medevo.com.br'));

  const buttons = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.map(b => ({
      text: b.innerText.trim(),
      className: b.className,
      outerHTML: b.outerHTML.slice(0, 150)
    }));
  });

  console.log('Buttons:', buttons.filter(b => b.text.includes('Ginecologia') || b.text.includes('Pediatria') || b.text.includes('Clínica')));
}

main().catch(console.error);
