import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const USER_DATA_DIR = path.join(process.cwd(), 'scripts', '.chrome_profile');
const TARGET_URL = 'https://drive.google.com/drive/u/1/folders/1_cgWHry1w_sJjQhrqIvW5ry0n7kv-slx';
const AUTH_STATE_PATH = path.join(process.cwd(), 'scripts', 'drive_auth_state.json');

async function main() {
  console.log('🚀 Iniciando navegador com perfil persistente...');
  console.log('📁 Perfil salvo em:', USER_DATA_DIR);

  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    args: ['--start-maximized'],
    viewport: null
  });

  const page = context.pages()[0] || await context.newPage();
  console.log('🌐 Navegando para a pasta de Gineco...');
  await page.goto(TARGET_URL);

  // Intervalo para capturar e exportar cookies continuamente
  const timer = setInterval(async () => {
    try {
      const cookies = await context.cookies();
      const hasGoogleAuth = cookies.some(c => c.name === 'SID' || c.name === 'SSID' || c.name === 'HSID');
      if (hasGoogleAuth) {
        await context.storageState({ path: AUTH_STATE_PATH });
      }
    } catch {}
  }, 2000);

  // Monitora quando a pasta for aberta
  console.log('\n======================================================');
  console.log('👀 A janela está aberta! Se já fez login ou ao terminar,');
  console.log('o script salvará os cookies automaticamente.');
  console.log('Quando a pasta abrir com os arquivos, pode me avisar aqui!');
  console.log('======================================================\n');

  // Mantém ativo até fechar
  await new Promise((resolve) => {
    context.on('close', resolve);
  });

  clearInterval(timer);
  try {
    await context.storageState({ path: AUTH_STATE_PATH });
    console.log('💾 Sessão salva em scripts/drive_auth_state.json');
  } catch {}
}

main().catch(console.error);
