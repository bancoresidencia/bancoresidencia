import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto('https://enare2026.conhecimento.fgv.br/provas/', { waitUntil: 'networkidle' });
    
    // Find button containing 'Público Geral'
    const filterBtn = await page.$('button:has-text("Público Geral")');
    if (filterBtn) {
      console.log('Found filter button, clicking it...');
      await filterBtn.click();
      await page.waitForTimeout(1000);
      
      const menuItems = await page.$$eval('[role="menuitem"], [role="option"], div[role="dialog"] *, [data-radix-popper-content-wrapper] *', els => 
        els.map(e => ({ tag: e.tagName, text: (e.textContent || '').trim() })).filter(e => e.text.length > 0 && e.text.length < 50)
      );
      console.log('Options revealed:', menuItems);
    } else {
      console.log('No filter button found');
    }

  } finally {
    await browser.close();
  }
}

main();
