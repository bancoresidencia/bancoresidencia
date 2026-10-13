import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Monitora requisições AJAX
  page.on('response', async res => {
    const url = res.url();
    if (url.includes('provas-e-gabaritos') || url.includes('revalida') || url.includes('.json') || url.includes('view')) {
      console.log(`[HTTP ${res.status()}] -> ${url}`);
    }
  });

  console.log('Navegando para o portal do INEP...');
  await page.goto('https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/revalida/provas-e-gabaritos', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  console.log('Clicando na aba 2017...');
  await page.click('text="2017"');
  await page.waitForTimeout(4000);

  const text = await page.evaluate(() => {
    const el = document.querySelector('.govbr-tabs, .tabs, [class*="tab-content"]');
    return el ? el.innerText : document.body.innerText.slice(0, 1000);
  });

  console.log('\nConteúdo exibido após clique na aba 2017:');
  console.log(text.slice(0, 1500));

  await browser.close();
}

main().catch(console.error);
