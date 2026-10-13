import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto('https://enare2026.conhecimento.fgv.br/provas/', { waitUntil: 'networkidle' });
    
    // Click the profile filter
    const filterBtn = await page.$('button:has-text("Público Geral")');
    if (filterBtn) {
      await filterBtn.click();
      await page.waitForTimeout(500);
      
      // Click 'Méd. Acesso Direto'
      const option = await page.$('text="Méd. Pré-Requisito"');
      if (option) {
        console.log('Clicking "Méd. Pré-Requisito"...');
        await option.click();
        await page.waitForTimeout(1000);
        console.log('--- PAGE TEXT AFTER SELECTING Méd. Pré-Requisito ---');
        console.log(await page.innerText('body'));
      }
    }

    // Expand all accordion triggers
    const triggers = await page.$$('button[class*="accordion-trigger"]');
    console.log(`Found ${triggers.length} accordion triggers in Acesso Direto:`);
    for (const t of triggers) {
      console.log('Trigger:', await t.innerText());
      await t.click();
      await page.waitForTimeout(300);
    }

    const links = await page.$$eval('a', els => els.map(a => ({ text: a.innerText.trim(), href: a.href })));
    const pdfs = links.filter(l => l.href.includes('.pdf'));
    console.log(`Found ${pdfs.length} PDFs for Méd. Acesso Direto:`);
    pdfs.forEach(p => console.log(` * [${p.text}] -> ${p.href}`));

  } finally {
    await browser.close();
  }
}

main();
