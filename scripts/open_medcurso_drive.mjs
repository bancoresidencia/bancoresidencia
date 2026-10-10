import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const LOCAL_CHROMIUM = 'C:\\Users\\cnath\\AppData\\Local\\ms-playwright\\chromium-1243\\chrome-win64\\chrome.exe';
const AUTH_STATE_PATH = path.join(process.cwd(), 'scripts', 'drive_auth_state.json');
const TARGET_URL = 'https://drive.google.com/drive/u/3/folders/1ssJVFdvRGZN8g4l6NoMwHiKrQhhLpNse';

async function main() {
  console.log('🌐 Abrindo Chromium visível para MEDCURSO 2026...');
  
  const browser = await chromium.launch({
    executablePath: fs.existsSync(LOCAL_CHROMIUM) ? LOCAL_CHROMIUM : undefined,
    headless: false,
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox'
    ]
  });

  const context = await browser.newContext({
    viewport: null,
    storageState: fs.existsSync(AUTH_STATE_PATH) ? AUTH_STATE_PATH : undefined,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();
  console.log('📌 Navegando para:', TARGET_URL);
  await page.goto(TARGET_URL);

  console.log('\n===============================================================');
  console.log('👀 A JANELA DO CHROMIUM ESTÁ ABERTA E AGUARDANDO VOCÊ.');
  console.log('Acesse a pasta do MEDCURSO 2026.');
  console.log('Quando terminar, feche a janela do navegador para salvar a sessão!');
  console.log('===============================================================\n');

  // Monitora e salva a cada 3 segundos se houver novos cookies
  const timer = setInterval(async () => {
    try {
      await context.storageState({ path: AUTH_STATE_PATH });
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
