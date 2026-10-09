import { chromium } from 'playwright';
import path from 'path';

const USER_DATA_DIR = path.join(process.cwd(), 'scripts', '.chrome_profile');
const TARGET_URL = 'https://drive.google.com/drive/u/1/folders/1_cgWHry1w_sJjQhrqIvW5ry0n7kv-slx';
const AUTH_STATE_PATH = path.join(process.cwd(), 'scripts', 'drive_auth_state.json');

async function testHeadless() {
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: true
  });
  const page = context.pages()[0] || await context.newPage();
  console.log('Navegando...');
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(4000);
  console.log('Title:', await page.title());
  console.log('URL:', page.url());

  try {
    await context.storageState({ path: AUTH_STATE_PATH });
    console.log('✅ Storage state exportado com sucesso para scripts/drive_auth_state.json!');
  } catch (e) {
    console.warn('Erro ao salvar storageState:', e.message);
  }

  const items = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr[role="row"][data-id]'));
    return rows.map(r => {
      const strong = r.querySelector('strong, span.WQJtxb');
      const text = strong ? strong.textContent.trim() : (r.innerText || '').split('\n')[0].trim();
      return { id: r.getAttribute('data-id'), text };
    }).filter(x => x.id && x.text);
  });

  console.log('Total de itens listados na pasta:', items.length);
  for (const it of items) {
    console.log(` - [${it.id}] ${it.text}`);
  }

  await context.close();
}

testHeadless().catch(console.error);
