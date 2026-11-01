import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const SESSION_PATH = path.join(process.cwd(), 'scripts', 'medevo_session.json');

async function main() {
  const sessionData = JSON.parse(fs.readFileSync(SESSION_PATH, 'utf8'));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  let capturedMaterialFull = null;

  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('study_materials') && (url.includes('id=eq') || !url.includes('offset='))) {
      try {
        const json = await res.json();
        capturedMaterialFull = { url, json };
      } catch {}
    }
  });

  await page.goto('https://www.medevo.com.br/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), sessionData);

  // Navega para a área de materiais ou biblioteca
  console.log('Navegando para biblioteca / materiais...');
  await page.goto('https://www.medevo.com.br/materiais', { waitUntil: 'networkidle', timeout: 30000 }).catch(async () => {
    await page.goto('https://www.medevo.com.br/app/materiais', { timeout: 15000 }).catch(() => {});
  });

  await page.waitForTimeout(2000);
  console.log('URL atual:', page.url());

  // Se a URL não for de materiais, vamos clicar no menu lateral em "Material de Apoio"
  if (!page.url().includes('materiais')) {
    const matLink = page.locator('a:has-text("Material de Apoio"), a[href*="material"], button:has-text("Material de Apoio")').first();
    if (await matLink.count() > 0) {
      console.log('Clicando no menu Material de Apoio...');
      await matLink.click();
      await page.waitForTimeout(3000);
    }
  }

  // Tira print da listagem de materiais
  await page.screenshot({ path: 'scripts/medevo_materiais_list.png', fullPage: true });

  // Clica no primeiro material de estudo da lista
  const firstMaterial = page.locator('a[href*="/materiais/"], [class*="material-item"], [class*="study-material"], h3, h4').first();
  if (await firstMaterial.count() > 0) {
    console.log('Abrindo primeiro material de estudo...');
    await firstMaterial.click();
    await page.waitForTimeout(4000);

    await page.screenshot({ path: 'scripts/medevo_material_detail.png', fullPage: true });
    
    const detailContent = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        headings: Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(h => h.innerText),
        bodyTextSnippet: document.body.innerText.slice(0, 4000),
        htmlSample: document.querySelector('article, main, .content')?.outerHTML.slice(0, 5000) || document.body.innerHTML.slice(0, 5000)
      };
    });
    fs.writeFileSync('scripts/medevo_material_content_sample.json', JSON.stringify(detailContent, null, 2), 'utf8');
  }

  if (capturedMaterialFull) {
    fs.writeFileSync('scripts/medevo_captured_material_api.json', JSON.stringify(capturedMaterialFull, null, 2), 'utf8');
  }

  console.log('✅ Concluído!');
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

