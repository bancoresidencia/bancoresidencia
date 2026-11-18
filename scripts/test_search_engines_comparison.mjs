import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const stmt = 'Durante a avaliação de uma mamada, observa-se que: O bebê está de frente para a mama, com nariz em oposição ao mamilo; Corpo próximo ao da mãe, cabeça e tronco alinhados; Boca bem aberta, lábio inferior virado para fora, queixo tocando a mama; Aréola visível acima da boca. Qual a interpretação mais adequada desses achados?';
  const alt = 'Pega adequada, mas posicionamento inadequado, podendo causar dor materna.';
  
  const fullQuery = `${stmt} ${alt}`.replace(/\s+/g, ' ').trim();
  const stmtOnlyQuery = stmt.replace(/\s+/g, ' ').trim();

  console.log('--- Testando Yahoo com Enunciado Completo + Alternativa ---');
  try {
    await page.goto('https://search.yahoo.com/search?p=' + encodeURIComponent(fullQuery), { waitUntil: 'domcontentloaded', timeout: 15000 });
    const linksYahoo = await page.evaluate(() => Array.from(document.querySelectorAll('ol.searchCenterMiddle a, #web a')).map(a => a.href).filter(h => h.startsWith('http')));
    console.log('Yahoo Links (Full):', linksYahoo.length, linksYahoo.slice(0, 3));
  } catch (e) {
    console.log('Yahoo Error:', e.message);
  }

  console.log('--- Testando DuckDuckGo com Enunciado Completo + Alternativa ---');
  try {
    await page.goto('https://html.duckduckgo.com/html/?q=' + encodeURIComponent(fullQuery), { waitUntil: 'domcontentloaded', timeout: 15000 });
    const linksDDG = await page.evaluate(() => Array.from(document.querySelectorAll('.result__url')).map(a => a.innerText.trim()));
    console.log('DDG Links (Full):', linksDDG.length, linksDDG.slice(0, 3));
  } catch (e) {
    console.log('DDG Error:', e.message);
  }

  await browser.close();
})();
