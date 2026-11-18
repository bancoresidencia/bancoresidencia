import { chromium } from 'playwright';

async function testSiteEstrategia() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // 1. Testa a questao que acertou
  const q1 = 'site:med.estrategia.com "Criança do sexo masculino com 7 meses de idade é levada em consulta"';
  await page.goto('https://www.bing.com/search?q=' + encodeURIComponent(q1), { waitUntil: 'networkidle' });
  const count1 = await page.evaluate(() => document.querySelectorAll('li.b_algo').length);
  console.log('HPEV-2023 no Estrategia MED:', count1 > 0 ? 'SIM! ENCONTRADA' : 'NÃO');

  // 2. Testa a questao que falhou (HAS-2025)
  const q2 = 'site:med.estrategia.com "Paciente masculino 23 anos, com história de febre reumática na infância"';
  await page.goto('https://www.bing.com/search?q=' + encodeURIComponent(q2), { waitUntil: 'networkidle' });
  const count2 = await page.evaluate(() => document.querySelectorAll('li.b_algo').length);
  console.log('HAS-2025 no Estrategia MED:', count2 > 0 ? 'SIM! ENCONTRADA' : 'NÃO');

  // 3. Testa HSC-2023
  const q3 = 'site:med.estrategia.com "São Camilo" 2023 "gabarito"';
  await page.goto('https://www.bing.com/search?q=' + encodeURIComponent(q3), { waitUntil: 'networkidle' });
  const count3 = await page.evaluate(() => document.querySelectorAll('li.b_algo').length);
  console.log('Sao Camilo 2023 no Estrategia MED:', count3 > 0 ? 'SIM' : 'NÃO');

  await browser.close();
}

testSiteEstrategia();
