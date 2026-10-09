import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const LOCAL_CHROMIUM = 'C:\\Users\\cnath\\AppData\\Local\\ms-playwright\\chromium-1243\\chrome-win64\\chrome.exe';
const AUTH_STATE_PATH = path.join(process.cwd(), 'scripts', 'drive_auth_state.json');
const TARGET_URL = 'https://drive.google.com/drive/folders/1oBzyu-XuHJPEFpf3M_MLxI5auHHHRk-3?hl=pt_BR';

async function main() {
  const browser = await chromium.launch({
    executablePath: fs.existsSync(LOCAL_CHROMIUM) ? LOCAL_CHROMIUM : undefined,
    headless: true
  });
  const context = await browser.newContext({
    storageState: fs.existsSync(AUTH_STATE_PATH) ? AUTH_STATE_PATH : undefined
  });
  const page = await context.newPage();
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(4000);

  const items = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('[data-id]'));
    const map = new Map();
    for (const r of rows) {
      const id = r.getAttribute('data-id');
      const text = (r.innerText || '').split('\n')[0].trim();
      if (id && text && text.length > 1 && !map.has(id)) {
        map.set(id, text);
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  });

  console.log(`TOTAL ITENS: ${items.length}`);
  fs.writeFileSync('scripts/drive_folder_items.json', JSON.stringify(items, null, 2), 'utf8');
  console.log(items);
  await browser.close();
}

main().catch(console.error);
