import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('medevo.com.br'));

  await page.goto('https://www.medevo.com.br/material-apoio', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.click('button.material-library-item:has-text("Ginecologia")');
  await page.waitForTimeout(1500);

  // Intercepta chamadas de API
  const calls = [];
  page.on('response', async res => {
    if (res.url().includes('study_materials') || res.url().includes('rpc')) {
      try {
        const json = await res.json();
        calls.push({ url: res.url(), status: res.status(), count: Array.isArray(json) ? json.length : 1 });
      } catch {}
    }
  });

  console.log('Clicando no tema Climatério e Menopausa...');
  const themeCard = page.locator('div, button').filter({ hasText: 'Climatério e Menopausa' }).first();
  await themeCard.click();
  await page.waitForTimeout(2500);

  const materials = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href*="/material-apoio/ler/"]')).map(a => ({
      title: a.innerText.trim(),
      href: a.href,
      id: a.href.split('/').pop()
    }));
  });

  console.log('Materiais encontrados:', materials);
  console.log('Chamadas interceptadas:', calls);
}

main().catch(console.error);
