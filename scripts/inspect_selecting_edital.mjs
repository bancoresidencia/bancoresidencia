import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  for (const id of [43, 44, 37, 36]) {
    console.log(`\n=================== EDITAL ${id} ===================`);
    await page.goto(`https://portal.concursos.selecting.com.br/edital/ver/${id}`, { waitUntil: 'domcontentloaded' });
    const title = await page.evaluate(() => document.querySelector('h1, h2, .edital-title, .title')?.innerText || '');
    console.log('Titulo:', title.replace(/\s+/g, ' ').trim());
    
    const files = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a')).filter(a => a.href.includes('arquivo.php'));
      return links.map(a => {
        let el = a.parentElement;
        while (el && el.innerText.length < 15 && el.parentElement) el = el.parentElement;
        return {
          title: el ? el.innerText.replace(/\s+/g, ' ').trim() : a.innerText.trim(),
          url: a.href
        };
      });
    });
    
    console.log(`Arquivos (${files.length}):`);
    files.filter(f => f.title.toLowerCase().includes('gabarito') || f.title.toLowerCase().includes('caderno') || f.title.toLowerCase().includes('prova')).forEach(f => {
      console.log('   📄', f.title.slice(0, 100), '->', f.url);
    });
  }
  
  await browser.close();
})();
