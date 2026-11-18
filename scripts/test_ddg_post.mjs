import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const stmt = 'Durante a avaliação de uma mamada, observa-se que: O bebê está de frente para a mama, com nariz em oposição ao mamilo; Corpo próximo ao da mãe, cabeça e tronco alinhados; Boca bem aberta, lábio inferior virado para fora, queixo tocando a mama; Aréola visível acima da boca. Qual a interpretação mais adequada desses achados?';
  const alt = 'Pega adequada, mas posicionamento inadequado, podendo causar dor materna.';

  try {
    await page.goto('https://html.duckduckgo.com/html/');
    await page.fill('input[name="q"]', `${stmt} ${alt}`);
    await page.click('input[type="submit"]');
    await page.waitForLoadState('domcontentloaded');
    
    const results = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.result__snippet, .result__url')).map(el => el.innerText.trim()).slice(0, 10);
    });
    console.log('Resultados DDG POST:', results.length, results);
  } catch (e) {
    console.log('Erro DDG POST:', e.message);
  }

  await browser.close();
})();
