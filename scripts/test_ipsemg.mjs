import { chromium } from 'playwright';

async function testIpsemg() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const q = 'Paciente diabética apresentando pressão arterial de 150/90 mmHg. Exames laboratoriais com destaque para microalbuminúria de 100 mg/24 horas. Qual a melhor opção terapêutica? Betabloqueadores.';
  await page.goto('https://www.bing.com/search?q=' + encodeURIComponent(q), { waitUntil: 'networkidle' });

  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('li.b_algo h2 a')).map(a => a.href);
  });

  console.log(`Total links para IPSEMG: ${links.length}`);
  links.forEach(l => {
    if (l.includes('u=a1')) {
      const b64 = l.split('u=a1')[1].split('&')[0];
      const dec = Buffer.from(b64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
      console.log('  ->', dec);
    }
  });

  await browser.close();
}

testIpsemg();
