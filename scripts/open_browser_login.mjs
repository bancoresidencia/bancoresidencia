import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const AUTH_STATE_PATH = path.join(process.cwd(), 'scripts', 'drive_auth_state.json');
const TARGET_URL = 'https://drive.google.com/drive/u/1/folders/1_cgWHry1w_sJjQhrqIvW5ry0n7kv-slx';

async function main() {
  console.log('🌐 Abrindo janela visual do Chromium no seu computador...');
  console.log(`🔗 Alvo: ${TARGET_URL}`);
  console.log('📌 Faça seu login se necessário. A sessão será salva automaticamente!');

  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    viewport: null,
    storageState: fs.existsSync(AUTH_STATE_PATH) ? AUTH_STATE_PATH : undefined
  });

  const page = await context.newPage();

  try {
    await page.goto(TARGET_URL);
  } catch (err) {
    console.log('Navegando...', err.message);
  }

  console.log('\n======================================================');
  console.log('👀 Navegador aberto na tela! Faça login na sua conta.');
  console.log('Pressione Ctrl+C neste terminal quando terminar ou feche a janela.');
  console.log('======================================================\n');

  // Monitora continuamente para salvar o estado da autenticação quando estiver logado no drive
  const interval = setInterval(async () => {
    try {
      const url = page.url();
      if (url.includes('drive.google.com') && !url.includes('signin') && !url.includes('ServiceLogin')) {
        await context.storageState({ path: AUTH_STATE_PATH });
        // Salva silenciosamente
      }
    } catch {}
  }, 3000);

  // Aguarda até o usuário fechar a página ou o navegador
  await new Promise((resolve) => {
    page.on('close', resolve);
    browser.on('disconnected', resolve);
  });

  clearInterval(interval);
  try {
    await context.storageState({ path: AUTH_STATE_PATH });
    console.log('💾 Sessão atualizada e salva com sucesso em scripts/drive_auth_state.json!');
  } catch {}

  console.log('🏁 Janela fechada.');
}

main().catch(console.error);
