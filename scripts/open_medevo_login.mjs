import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const CONFIG_PATH = path.join(process.cwd(), 'scripts', 'medevo_config.json');
const TARGET_URL = 'https://app.medbrave.com.br/';

async function main() {
  console.log('===============================================================');
  console.log('🌐 ABRINDO JANELA PARA LOGIN NO MEDBRAVE');
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

  // Intercepta qualquer requisição com autenticação para api.medevo.com.br ou api.medbrave.com.br
  page.on('request', async (req) => {
    const url = req.url();
    if (url.includes('medevo.com.br') || url.includes('medbrave.com.br') || url.includes('supabase.co')) {
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
  console.log('👉 Faça seu login normalmente no MedBrave.');
  console.log('👉 Assim que você acessar, a sessão será detectada automaticamente.');
  console.log('👉 Nenhuma ação de extração será feita.\n');

  // Monitora continuamente localStorage e cookies a cada 1,5s
  const intervalId = setInterval(async () => {
    try {
      if (page.isClosed()) return;
      
      const storageData = await page.evaluate(() => {
        const token = localStorage.getItem('auth_token') || 
                      localStorage.getItem('authToken') || 
                      localStorage.getItem('access_token');
        
        let supaToken = null;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.includes('auth-token')) {
            try {
              const parsed = JSON.parse(localStorage.getItem(key));
              if (parsed?.access_token) supaToken = parsed.access_token;
            } catch {}
          }
        }

        const allKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
          allKeys.push(localStorage.key(i));
        }

        return { token, supaToken, allKeys };
      });

      const effectiveToken = storageData.token || storageData.supaToken;

      if (effectiveToken && effectiveToken.length > 20 && effectiveToken !== 'Kdh5WODAhURGFD3u8VKMDn5z8tMRmEFT') {
        const cookies = await context.cookies();
        
        let userId = 'active_user';
        try {
          const parts = effectiveToken.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
            userId = payload.sub || payload.user_id || payload.id || userId;
          }
        } catch {}

        const configData = {
          MEDEVO_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZWRwZG1ndmdhdGpkZnhneGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNzk3MTgsImV4cCI6MjA0Nzg1NTcxOH0.cjoaggOXt1kY9WmVNbAipCOQ2dP4PWLP43KMf8cO8Wo',
          MEDEVO_USER_TOKEN: effectiveToken,
          USER_ID: userId,
          cookies: cookies.map(c => ({ name: c.name, value: c.value, domain: c.domain })),
          captured_at: new Date().toISOString()
        };

        fs.writeFileSync(CONFIG_PATH, JSON.stringify(configData, null, 2), 'utf8');

        if (!sessionCaptured) {
          sessionCaptured = true;
          console.log('\n===============================================================');
          console.log('🎉 SESSÃO AUTENTICADA DO MEDBRAVE CAPTURADA VIA LOCALSTORAGE!');
          console.log(`📁 Credenciais salvas em: ${CONFIG_PATH}`);
          console.log(`🔑 Token: ${effectiveToken.slice(0, 30)}... (Tamanho: ${effectiveToken.length})`);
          console.log(`👤 Usuário ID: ${userId}`);
          console.log('✅ Pode fechar o navegador agora ou continuar usando.');
          console.log('===============================================================\n');
        }
      }
    } catch {}
  }, 1500);

  // Mantém ativo monitorando o fechamento
  await new Promise((resolve) => {
    page.on('close', () => { clearInterval(intervalId); resolve(); });
    browser.on('disconnected', () => { clearInterval(intervalId); resolve(); });
  });

  clearInterval(intervalId);
  console.log('🛑 Janela do navegador fechada.');
}

main().catch(err => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
