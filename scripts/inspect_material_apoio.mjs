import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const SESSION_PATH = path.join(process.cwd(), 'scripts', 'medevo_session.json');

async function main() {
  console.log('🔍 Inspecionando Material de Apoio no MedEvo...');

  const sessionData = JSON.parse(fs.readFileSync(SESSION_PATH, 'utf8'));

  const browser = await chromium.launch({
    headless: true,
    args: ['--start-maximized', '--no-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  const interceptedMaterialApis = [];
  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('data.medevo.com.br') || url.includes('/material') || url.includes('/apoio') || url.includes('/rpc/')) {
      const ct = res.headers()['content-type'] || '';
      if (ct.includes('application/json')) {
        try {
          const json = await res.json();
          interceptedMaterialApis.push({
            url,
            status: res.status(),
            data: json
          });
        } catch {}
      }
    }
  });

  await page.goto('https://www.medevo.com.br/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), sessionData);

  // Acessa uma sessão de flashcard
  console.log('Navegando para flashcards/study...');
  await page.goto('https://www.medevo.com.br/flashcards/study', { waitUntil: 'networkidle', timeout: 30000 });
  
  // Clica em Cirurgia
  const categoryBtn = page.locator('button:has-text("Cirurgia")').first();
  if (await categoryBtn.count() > 0) {
    await categoryBtn.click();
    await page.waitForTimeout(1500);
  }

  // Clica em Escolher quantidade e estudar
  const startBtn = page.locator('button.platform-flashcards-start').first();
  if (await startBtn.count() > 0) {
    await startBtn.click();
    await page.waitForTimeout(1500);

    const confirmBtn = page.locator('button:has-text("Iniciar estudo"), [role="dialog"] button').last();
    if (await confirmBtn.count() > 0) {
      await confirmBtn.click();
      await page.waitForTimeout(3000);
    }
  }

  console.log('Procurando e clicando no botão Material de Apoio...');
  const materialBtn = page.locator('button[title="Material de Apoio"], button[aria-label="Material de Apoio"], .lucide-graduation-cap').first();
  if (await materialBtn.count() > 0) {
    await materialBtn.click();
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'scripts/medevo_material_apoio_modal.png', fullPage: true });
    console.log('📸 Screenshot do Material de Apoio salvo!');

    const materialDom = await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"], [class*="modal"], [class*="drawer"], [class*="sheet"]');
      return {
        modalText: modal ? modal.innerText : 'Modal não encontrado diretamente',
        modalHtml: modal ? modal.outerHTML.slice(0, 5000) : '',
        bodyTextSnippet: document.body.innerText.slice(0, 3000)
      };
    });

    fs.writeFileSync('scripts/medevo_material_apoio_dom.json', JSON.stringify(materialDom, null, 2), 'utf8');
  } else {
    console.log('Botão de material de apoio não encontrado na tela atual.');
  }

  fs.writeFileSync('scripts/medevo_material_apoio_apis.json', JSON.stringify(interceptedMaterialApis, null, 2), 'utf8');
  console.log('✅ Inspeção de Material de Apoio concluída!');

  await browser.close();
}

main().catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});

