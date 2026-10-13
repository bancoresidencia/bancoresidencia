import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto('https://enare2026.conhecimento.fgv.br/provas/', { waitUntil: 'networkidle' });
    const content = await page.content();
    
    // Find all links matching .pdf or enare
    const matches = content.match(/https?:\/\/[^\s"'<>]+\.pdf/gi) || [];
    console.log(`Found ${matches.length} absolute PDF URLs in raw page content:`);
    matches.forEach(m => console.log(' - ' + m));

    // Look for Acesso Direto
    const hasAcessoDireto = content.toLowerCase().includes('acesso direto');
    console.log('Contains "acesso direto"?', hasAcessoDireto);
    
    // If there are buttons, let's click each accordion button and see what links appear
    const buttons = await page.$$('button');
    console.log(`Found ${buttons.length} buttons.`);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].innerText();
      console.log(`Clicking button [${text.replace(/\n/g, ' ')}]...`);
      try {
        await buttons[i].click();
        await page.waitForTimeout(500);
      } catch (e) {}
    }
    
    const afterLinks = await page.$$eval('a', els => els.map(a => ({ text: a.innerText.trim(), href: a.href })));
    const pdfLinks = afterLinks.filter(l => l.href.includes('.pdf'));
    console.log(`After expanding accordions, found ${pdfLinks.length} PDF links:`);
    pdfLinks.forEach(l => console.log(` * [${l.text}] -> ${l.href}`));

    const medLinks = afterLinks.filter(l => /direto|médic|residencia|clínic|cirurg|pediat|ginec|prevent/i.test(l.text));
    console.log(`Matching Medical/Direct Access links: ${medLinks.length}`);
    medLinks.forEach(l => console.log(` >> [${l.text}] -> ${l.href}`));

  } finally {
    await browser.close();
  }
}

main();
