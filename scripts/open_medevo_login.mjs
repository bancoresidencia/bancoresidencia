import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const CONFIG_PATH = path.join(process.cwd(), 'scripts', 'medevo_config.json');
const TARGET_URL = 'https://www.medevo.com.br/';

async function main() {
  console.log('===============================================================');
  console.log('🌐 ABRINDO JANELA PARA LOGIN NO MEDEVO');
  console.log('⚠️  REGRA DE SEGURANÇA: NENHUMA EXTRAÇÃO SERÁ INICIADA');
  console.log('===============================================================\n');

  const CANDIDATE_CHROME = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Users\\cnath\\AppData\\Local\\ms-playwright\\chromium-1243\\chrome-win64\\chrome.exe'
  ];
  const executablePath = CANDIDATE_CHROME.find(p => fs.existsSync(p));

  const browser = await chromium.launch({
    executablePath,
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

  let sessionCaptured = false;

  // Intercepta qualquer requisição com autenticação para api.medevo.com.br
  page.on('request', async (req) => {
    const url = req.url();
    if (url.includes('api.medevo.com.br') || url.includes('supabase.co')) {
      const headers = req.headers();
      const auth = headers['authorization'] || headers['Authorization'];
      const apikey = headers['apikey'] || headers['Apikey'];

      if (auth && auth.startsWith('Bearer ') && auth.length > 30) {
        const token = auth.replace('Bearer ', '').trim();
        
        let userId = null;
        try {
          // Extrai o sub/user_id do payload JWT se possível
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
            userId = payload.sub || payload.user_id || payload.id;
          }
        } catch {}

        const configData = {
          MEDEVO_ANON_KEY: apikey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          MEDEVO_USER_TOKEN: token,
          USER_ID: userId || 'active_user',
          captured_at: new Date().toISOString()
        };

        fs.writeFileSync(CONFIG_PATH, JSON.stringify(configData, null, 2), 'utf8');
        
        if (!sessionCaptured) {
          sessionCaptured = true;
          console.log('\n===============================================================');
          console.log('✅ SESSÃO DO MEDEVO CAPTURADA COM SUCESSO!');
          console.log(`📁 Credenciais salvas de forma segura em: ${CONFIG_PATH}`);
          console.log('🔒 Status: EM ESPERA (Nenhuma extração será realizada sem sua ordem).');
          console.log('===============================================================\n');
        }
      }
    }
  });

  console.log(`📌 Navegando para: ${TARGET_URL}`);
  try {
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
  } catch (err) {
    console.warn('ℹ️ Página em carregamento:', err.message);
  }

  console.log('\n👉 A janela está aberta na sua tela.');
  console.log('👉 Faça seu login normalmente no MedEvo.');
  console.log('👉 Assim que você acessar, a sessão será detectada automaticamente.');
  console.log('👉 Nenhuma ação de extração será feita.\n');

  // Mantém ativo monitorando o fechamento
  await new Promise((resolve) => {
    page.on('close', resolve);
    browser.on('disconnected', resolve);
  });

  console.log('🛑 Janela do navegador fechada.');
}

main().catch(err => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
