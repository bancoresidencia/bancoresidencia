import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const stmt = 'Durante a avaliação de uma mamada, observa-se que: O bebê está de frente para a mama, com nariz em oposição ao mamilo; Corpo próximo ao da mãe, cabeça e tronco alinhados; Boca bem aberta, lábio inferior virado para fora, queixo tocando a mama; Aréola visível acima da boca. Qual a interpretação mais adequada desses achados?';
  const alt = 'Pega adequada, mas posicionamento inadequado, podendo causar dor materna.';
  
  // Teste 1: Enunciado completo + Alternativa (sem aspas)
  console.log('--- Teste 1: Bing (Enunciado completo + Alternativa) ---');
  await page.goto('https://www.bing.com/search?q=' + encodeURIComponent(stmt + ' ' + alt), { waitUntil: 'domcontentloaded' });
  let links1 = await page.evaluate(() => Array.from(document.querySelectorAll('li.b_algo h2 a')).map(a => a.href));
  console.log('Links 1:', links1.slice(0, 3));

  // Teste 2: Apenas Enunciado completo (sem aspas)
  console.log('--- Teste 2: Bing (Apenas Enunciado completo) ---');
  await page.goto('https://www.bing.com/search?q=' + encodeURIComponent(stmt), { waitUntil: 'domcontentloaded' });
  let links2 = await page.evaluate(() => Array.from(document.querySelectorAll('li.b_algo h2 a')).map(a => a.href));
  console.log('Links 2:', links2.slice(0, 3));

  // Teste 3: Aspas no trecho do enunciado + trecho da alternativa
  console.log('--- Teste 3: Bing com aspas precisas ---');
  const q3 = `"${stmt.slice(0, 80)}" "${alt.slice(0, 40)}"`;
  await page.goto('https://www.bing.com/search?q=' + encodeURIComponent(q3), { waitUntil: 'domcontentloaded' });
  let links3 = await page.evaluate(() => Array.from(document.querySelectorAll('li.b_algo h2 a')).map(a => a.href));
  console.log('Links 3:', links3.slice(0, 3));

  await browser.close();
})();
