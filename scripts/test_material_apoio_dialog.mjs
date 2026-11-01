import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
  const session = JSON.parse(fs.readFileSync('scripts/medevo_session.json', 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  page.on('response', async res => {
    const u = res.url();
    if (u.includes('get_study_material_content_secure')) {
      try {
        const json = await res.json();
        console.log('🎯 get_study_material_content_secure:', typeof json === 'object' ? Object.keys(json) : json);
        fs.writeFileSync('scripts/medevo_material_content.json', JSON.stringify(json, null, 2), 'utf8');
      } catch (e) {
        console.error('Erro json:', e);
      }
    }
  });

  await page.goto('https://www.medevo.com.br/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(s => localStorage.setItem(s.key, s.value), session);
  await page.goto('https://www.medevo.com.br/flashcards/study', { waitUntil: 'networkidle' });
  await page.locator('button:has-text("Cirurgia")').first().click();
  await page.locator('button.platform-flashcards-start').first().click();
  await page.waitForTimeout(1000);
  await page.locator('button:has-text("Iniciar estudo"), [role="dialog"] button').last().click();
  await page.waitForTimeout(3000);

  // Click Material de Apoio
  await page.locator('button[title="Material de Apoio"]').click();
  await page.waitForTimeout(2000);

  const info = await page.evaluate(() => {
    const dialogs = Array.from(document.querySelectorAll('[role="dialog"], [data-state="open"], [class*="sheet"], [class*="drawer"]')).map(d => ({
      tagName: d.tagName,
      className: d.className,
      text: d.innerText
    }));
    return {
      dialogs,
      allText: document.body.innerText
    };
  });

  fs.writeFileSync('scripts/medevo_dialog_result.json', JSON.stringify(info, null, 2), 'utf8');
  console.log('Dialog count:', info.dialogs.length);
  if (info.dialogs.length > 0) {
    console.log('Dialog text preview:', info.dialogs[0].text.slice(0, 500));
  }

  await browser.close();
}

main().catch(console.error);
