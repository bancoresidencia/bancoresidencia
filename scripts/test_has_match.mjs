import { chromium } from 'playwright';
import { parseUniversalMedicalHtml } from './universal_medical_web_parser.mjs';

async function testHas2025() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const q = 'site:med.estrategia.com "Paciente masculino 23 anos, com história de febre reumática na infância"';
  await page.goto('https://www.bing.com/search?q=' + encodeURIComponent(q), { waitUntil: 'networkidle' });

  const link = await page.evaluate(() => {
    let a = document.querySelector('li.b_algo h2 a');
    return a ? a.href : null;
  });

  console.log('Link encontrado no Bing:', link);

  // Decode Bing link
  let destUrl = link;
  if (link && link.includes('u=a1')) {
    const b64 = link.split('u=a1')[1].split('&')[0];
    destUrl = Buffer.from(b64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
  }
  console.log('Destino decodificado:', destUrl);

  if (destUrl && destUrl.startsWith('http')) {
    const res = await fetch(destUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    console.log('HTML baixado:', html.length, 'bytes');

    const parsed = parseUniversalMedicalHtml(html, destUrl);
    console.log('Resultado do parseUniversalMedicalHtml:', parsed);
  }

  await browser.close();
}

testHas2025();
