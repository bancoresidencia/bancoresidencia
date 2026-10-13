import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto('https://enare2026.conhecimento.fgv.br/provas/', { waitUntil: 'networkidle' });
    
    const elements = await page.$$eval('button, [role="tab"], [role="button"], li', els => 
      els.map(e => ({ tag: e.tagName, role: e.getAttribute('role'), text: e.innerText.trim(), class: e.className }))
    );
    console.log('Interactive / List items:');
    elements.filter(e => e.text.length > 0 && e.text.length < 50).forEach(e => console.log(e));
  } finally {
    await browser.close();
  }
}

main();
