import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const getLocalChromium = () => {
  try {
    const defaultPlaywright = chromium.executablePath();
    if (fs.existsSync(defaultPlaywright)) return defaultPlaywright;
  } catch {}
  const candidates = [
    path.join(process.env.USERPROFILE || '', 'AppData', 'Local', 'ms-playwright', 'chromium-1243', 'chrome-win64', 'chrome.exe'),
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ];
  return candidates.find(p => fs.existsSync(p));
};

const LOCAL_CHROMIUM = getLocalChromium();
const AUTH_STATE_PATH = path.join(process.cwd(), 'scripts', 'drive_auth_state.json');

const rawArgs = process.argv.slice(2);
const shouldKill = rawArgs.some(a => a === '--kill' || a === '-k' || a === '--force' || a === '-f');
const targetUrl = rawArgs.find(a => !a.startsWith('-')) || 'http://localhost:3000';

console.log('=====================================================');
console.log('🛡️  INICIALIZADOR BLINDADO DO CHROMIUM (VISÍVEL NO DESKTOP)');
console.log('=====================================================');

if (shouldKill) {
  console.log('⚡ Encerrando instâncias antigas em background...');
  try {
    execSync('taskkill /F /IM chrome.exe /T', { stdio: 'ignore' });
  } catch {}
}

async function main() {
  console.log('🚀 [1/2] Iniciando Chromium Playwright com interface gráfica visível...');
  console.log(`   URL: ${targetUrl}`);

  const browser = await chromium.launch({
    executablePath: fs.existsSync(LOCAL_CHROMIUM) ? LOCAL_CHROMIUM : undefined,
    headless: false,
    args: [
      '--start-maximized',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu-process-crash-limit',
      '--disable-crash-reporter',
      '--disable-breakpad'
    ]
  });

  const context = await browser.newContext({
    viewport: null,
    storageState: fs.existsSync(AUTH_STATE_PATH) ? AUTH_STATE_PATH : undefined,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();
  
  try {
    await page.goto(targetUrl, { timeout: 30000 });
  } catch (err) {
    console.warn('⚠️ Alerta na navegação inicial:', err.message);
  }

  console.log('✅ [2/2] Chromium aberto e VISÍVEL na sua tela!');
  console.log('👀 A janela está ativa na sua barra de tarefas.');
  console.log('👉 A janela permanecerá aberta. Quando terminar de usar, basta fechar o navegador.');
  console.log('=====================================================\n');

  // Mantém ativo até o usuário fechar a janela do Chromium
  await new Promise((resolve) => {
    page.on('close', resolve);
    browser.on('disconnected', resolve);
  });

  console.log('🏁 Janela do Chromium fechada pelo usuário.');
}

main().catch((err) => {
  console.error('❌ Erro ao abrir Chromium:', err.message);
  process.exit(1);
});
