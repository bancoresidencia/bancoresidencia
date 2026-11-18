import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  });
  const page = await ctx.newPage();
  
  const stmt = 'Durante a avaliação de uma mamada, observa-se que: O bebê está de frente para a mama, com nariz em oposição ao mamilo; Corpo próximo ao da mãe, cabeça e tronco alinhados; Boca bem aberta, lábio inferior virado para fora, queixo tocando a mama; Aréola visível acima da boca. Qual a interpretação mais adequada desses achados?';
  const alt = 'Pega adequada, mas posicionamento inadequado, podendo causar dor materna.';

  // 1. Enunciado completo + Alternativa completa
  const q1 = `${stmt} ${alt}`.replace(/\s+/g, ' ').trim();
  console.log('Query 1 (Length:', q1.length, '):', q1.slice(0, 80));
  try {
    const resp1 = await page.goto('https://search.yahoo.com/search?p=' + encodeURIComponent(q1), { waitUntil: 'domcontentloaded', timeout: 15000 });
    console.log('Status 1:', resp1.status(), 'Title 1:', await page.title());
    const links1 = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('#web a, .compText a, ol.searchCenterMiddle a, h3 a'))
        .map(a => a.href)
        .filter(h => h && h.startsWith('http') && !h.includes('yahoo.com'));
    });
    console.log('Links encontrados Query 1:', links1.length, links1.slice(0, 3));
  } catch (e) {
    console.log('Error 1:', e.message);
  }

  // 2. Apenas Enunciado completo
  const q2 = stmt.replace(/\s+/g, ' ').trim();
  console.log('\nQuery 2 (Length:', q2.length, '):', q2.slice(0, 80));
  try {
    const resp2 = await page.goto('https://search.yahoo.com/search?p=' + encodeURIComponent(q2), { waitUntil: 'domcontentloaded', timeout: 15000 });
    console.log('Status 2:', resp2.status(), 'Title 2:', await page.title());
    const links2 = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('#web a, .compText a, ol.searchCenterMiddle a, h3 a'))
        .map(a => a.href)
        .filter(h => h && h.startsWith('http') && !h.includes('yahoo.com'));
    });
    console.log('Links encontrados Query 2:', links2.length, links2.slice(0, 3));
  } catch (e) {
    console.log('Error 2:', e.message);
  }

  await browser.close();
})();
