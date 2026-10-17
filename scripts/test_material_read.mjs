import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('medevo.com.br'));

  console.log('Clicando em Candidíase Vulvovaginal...');
  await page.locator('button.material-library-item').filter({ hasText: 'Candidíase Vulvovaginal' }).first().click();
  await page.waitForTimeout(2500);

  console.log('Nova URL:', page.url());

  const readingAnalysis = await page.evaluate(() => {
    // Busca conteúdo do leitor: títulos, referências, links externos
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(h => h.innerText.trim());
    const refs = [];
    
    // Busca blocos que contenham "Referência", "Diretriz", "Bibliografia" ou links externos
    document.querySelectorAll('section, div, footer, li, p').forEach(el => {
      const text = el.innerText || '';
      if ((text.includes('Referência') || text.includes('Fonte') || text.includes('Diretriz') || text.includes('Bibliografia')) && text.length < 500) {
        refs.push(text.trim());
      }
    });

    const externalLinks = Array.from(document.querySelectorAll('a[href^="http"]')).map(a => ({
      text: a.innerText.trim(),
      url: a.href
    }));

    return {
      title: document.title,
      url: window.location.href,
      headings,
      refsSample: refs.slice(0, 10),
      externalLinks: externalLinks.slice(0, 15)
    };
  });

  console.log('Resultado da leitura:', readingAnalysis);
}

main().catch(console.error);
