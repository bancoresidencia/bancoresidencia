import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const AUTH_STATE_PATH = path.join(process.cwd(), 'scripts', 'drive_auth_state.json');
const TARGET_URL = 'https://drive.google.com/drive/u/1/folders/1_cgWHry1w_sJjQhrqIvW5ry0n7kv-slx';

async function main() {
  console.log('🌐 Abrindo janela visível com bypass anti-bloqueio do Google...');
  
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox'
    ]
  });

  const context = await browser.newContext({
    viewport: null,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();
  console.log('📌 Navegando para:', TARGET_URL);
  await page.goto(TARGET_URL);

  console.log('\n===============================================================');
  console.log('👀 A JANELA DO NAVEGADOR ESTÁ ABERTA E AGUARDANDO VOCÊ.');
  console.log('Procure pelo ícone azul do Chromium na sua barra de tarefas.');
  console.log('Faça o login ou acesse a pasta.');
  console.log('Quando terminar, feche a janela do navegador para salvar a sessão!');
  console.log('===============================================================\n');

  // Monitora e salva a cada 3 segundos se os cookies do Google estiverem presentes
  const timer = setInterval(async () => {
    try {
      const cookies = await context.cookies();
      const hasAuth = cookies.some(c => c.name.includes('SID') || c.name.includes('SSID') || c.name.includes('ACCOUNT_CHOOSER'));
      if (hasAuth) {
        await context.storageState({ path: AUTH_STATE_PATH });
      }
    } catch {}
  }, 3000);

  // Aguarda até o usuário fechar a janela
  await new Promise((resolve) => {
    page.on('close', resolve);
    browser.on('disconnected', resolve);
  });

  clearInterval(timer);
  try {
    await context.storageState({ path: AUTH_STATE_PATH });
    console.log('💾 Sessão salva com sucesso em scripts/drive_auth_state.json!');
  } catch {}

  console.log('🏁 Janela fechada pelo usuário.');
}

main().catch(console.error);
