import { chromium } from 'playwright';
import path from 'path';

const CHROME_USER_DATA = 'C:\\Users\\cnath\\AppData\\Local\\Google\\Chrome\\User Data';
const TARGET_URL = 'https://drive.google.com/drive/folders/1_cgWHry1w_sJjQhrqIvW5ry0n7kv-slx';
const profiles = ['Profile 1', 'Profile 8', 'Profile 9', 'Default'];

async function checkProfile(profileName) {
  console.log(`\n🔍 Testando perfil do Chrome: [${profileName}]...`);
  try {
    const context = await chromium.launchPersistentContext(CHROME_USER_DATA, {
      channel: 'chrome',
      headless: true,
      args: [`--profile-directory=${profileName}`]
    });

    const page = context.pages()[0] || await context.newPage();
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(3500);

    const title = await page.title();
    const url = page.url();
    console.log(`   📌 Título: ${title}`);
    console.log(`   📌 URL: ${url}`);

    const isLogin = url.includes('signin') || url.includes('ServiceLogin');
    if (!isLogin && !title.includes('Sign-in')) {
      console.log(`   🎉 SUCESSO! Perfil [${profileName}] está autenticado no Google Drive!`);
      const items = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('tr[role="row"][data-id]'));
        return rows.map(r => {
          const strong = r.querySelector('strong, span.WQJtxb');
          const text = strong ? strong.textContent.trim() : (r.innerText || '').split('\n')[0].trim();
          return { id: r.getAttribute('data-id'), text };
        }).filter(x => x.id && x.text);
      });

      console.log(`   📦 Itens encontrados na pasta: ${items.length}`);
      for (const it of items) {
        console.log(`      - [${it.id}] ${it.text}`);
      }

      await context.storageState({ path: path.join(process.cwd(), 'scripts', 'drive_auth_state.json') });
      await context.close();
      return { success: true, profile: profileName, items };
    }

    await context.close();
  } catch (err) {
    console.log(`   ⚠️ Erro no perfil ${profileName}: ${err.message}`);
  }
  return { success: false };
}

async function main() {
  for (const prof of profiles) {
    const res = await checkProfile(prof);
    if (res.success) {
      console.log(`\n🏆 Pasta mapeada com sucesso usando o perfil ${prof}!`);
      return;
    }
  }
  console.log('\n❌ Nenhum perfil direto abriu sem login.');
}

main().catch(console.error);
