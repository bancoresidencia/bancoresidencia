import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const SESSION_PATH = path.join(process.cwd(), 'scripts', 'medevo_session.json');
const TARGET_URL = process.argv[2] || 'https://www.medevo.com.br/';

const getChromiumPath = () => {
  try {
    const pwPath = chromium.executablePath();
    if (fs.existsSync(pwPath)) return pwPath;
  } catch {}
  const candidates = [
    path.join(process.env.USERPROFILE || '', 'AppData', 'Local', 'ms-playwright', 'chromium-1243', 'chrome-win64', 'chrome.exe'),
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ];
  return candidates.find(p => fs.existsSync(p));
};

async function main() {
  console.log('===============================================================');
  console.log('🌐 ABRINDO CHROMIUM DIRETAMENTE NO MEDEVO');
  console.log('===============================================================\n');

  const executablePath = getChromiumPath();
  console.log(`📌 Executável Chromium: ${executablePath || 'Playwright Padrão'}`);
  console.log(`📌 Destino: ${TARGET_URL}`);

  let sessionData = null;
  if (fs.existsSync(SESSION_PATH)) {
    try {
      sessionData = JSON.parse(fs.readFileSync(SESSION_PATH, 'utf8'));
      console.log('🔑 Sessão autenticada carregada de scripts/medevo_session.json');
    } catch (e) {
      console.warn('⚠️ Falha ao ler sessão:', e.message);
    }
  }

  const browser = await chromium.launch({
    executablePath: executablePath && fs.existsSync(executablePath) ? executablePath : undefined,
    headless: false,
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-dev-shm-usage'
    ]
  });

  const context = await browser.newContext({
    viewport: null,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  // Monitora alterações de sessão e sincroniza de volta se o token for renovado
  page.on('response', async (res) => {
    try {
      const url = res.url();
      if (url.includes('supabase.co/auth/v1/token') && res.status() === 200) {
        const body = await res.json();
        if (body.access_token && sessionData) {
          const currentVal = JSON.parse(sessionData.value);
          currentVal.access_token = body.access_token;
          if (body.refresh_token) currentVal.refresh_token = body.refresh_token;
          sessionData.value = JSON.stringify(currentVal);
          fs.writeFileSync(SESSION_PATH, JSON.stringify(sessionData, null, 2), 'utf8');
          console.log('🔄 Token da sessão atualizado automaticamente no medevo_session.json');
        }
      }
    } catch {}
  });

  console.log('🚀 Carregando MedEvo...');
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });

  if (sessionData && sessionData.key && sessionData.value) {
    console.log('💾 Injetando sessão autenticada no localStorage...');
    await page.evaluate(({ key, value }) => {
      localStorage.setItem(key, value);
    }, sessionData);

    console.log('🔄 Recarregando para aplicar sessão...');
    await page.reload({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  }

  const title = await page.title();
  console.log(`\n✅ Janela do Chromium pronta e VISÍVEL na tela!`);
  console.log(`   URL Atual: ${page.url()}`);
  console.log(`   Título: ${title}`);
  console.log('\n👉 Você já pode navegar diretamente pelo MedEvo com a sua conta ativa.');
  console.log('👉 A janela permanecerá aberta enquanto você a estiver utilizando.\n');

  // Mantém ativo até que o usuário feche a janela
  await new Promise((resolve) => {
    page.on('close', resolve);
    browser.on('disconnected', resolve);
  });

  console.log('🛑 Janela do Chromium fechada.');
}

main().catch((err) => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});

