import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const stmt = 'Durante a avaliação de uma mamada, observa-se que: O bebê está de frente para a mama, com nariz em oposição ao mamilo; Corpo próximo ao da mãe, cabeça e tronco alinhados; Boca bem aberta, lábio inferior virado para fora, queixo tocando a mama; Aréola visível acima da boca. Qual a interpretação mais adequada desses achados?';
  const alt = 'Pega adequada, mas posicionamento inadequado, podendo causar dor materna.';

  try {
    const url = 'https://search.yahoo.com/search?p=' + encodeURIComponent(stmt);
    console.log('Navigating to Yahoo URL...');
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    console.log('Status:', resp.status());
    console.log('Title:', await page.title());
    const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 500));
    console.log('Body:', bodyText);
  } catch (e) {
    console.log('Error:', e.message);
  }

  await browser.close();
})();
