import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('medevo.com.br'));

  if (!page) {
    console.log('Página não encontrada');
    process.exit(1);
  }

  const interceptedCalls = [];

  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('api.medevo.com.br') || url.includes('supabase.co')) {
      const status = res.status();
      const contentType = res.headers()['content-type'] || '';
      let bodyPreview = null;
      if (contentType.includes('application/json')) {
        try {
          const json = await res.json();
          bodyPreview = Array.isArray(json) ? `Array[${json.length}]` : Object.keys(json);
          interceptedCalls.push({
            url,
            status,
            method: res.request().method(),
            postData: res.request().postData(),
            responseType: bodyPreview,
            fullData: json
          });
          console.log(`📡 [API]: ${res.request().method()} ${url.split('?')[0].split('/').pop()} -> ${status}`);
        } catch {}
      }
    }
  });

  console.log('🔍 Clicando em "Ginecologia" para inspecionar chamada de backend...');
  const ginBtn = await page.getByRole('button', { name: 'Ginecologia', exact: true }).first();
  if (ginBtn) {
    await ginBtn.click();
    await page.waitForTimeout(3000);
  }

  console.log(`Total de chamadas de API interceptadas: ${interceptedCalls.length}`);
  fs.writeFileSync('scripts/medevo_intercepted_materials.json', JSON.stringify(interceptedCalls, null, 2), 'utf8');

  // Volta para a visualização principal
  await page.goBack().catch(() => {});
}

main().catch(err => {
  console.error('Erro:', err);
});
