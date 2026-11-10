import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const CONFIG_PATH = path.join(process.cwd(), 'scripts', 'coletor_provaderesidencia', 'config.py');
const TARGET_URL = 'https://provaderesidencia.com.br/premium/login';

async function main() {
  console.log('===============================================================');
  console.log('🏥 COLETOR PROVA DE RESIDÊNCIA — CAPTURA DE SESSÃO DO GOOGLE CHROME');
  console.log('===============================================================\n');

  const CANDIDATE_CHROME = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ];
  const executablePath = CANDIDATE_CHROME.find(p => fs.existsSync(p));

  const browser = await chromium.launch({
    executablePath,
    headless: false,
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox'
    ]
  });

  const context = await browser.newContext({
    viewport: null,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();
  let captured = false;

  const checkAndSaveCookies = async () => {
    try {
      const cookies = await context.cookies(['https://provaderesidencia.com.br']);
      const sessionid = cookies.find(c => c.name === 'sessionid')?.value;
      const csrftoken = cookies.find(c => c.name === 'csrftoken')?.value;
      const cf_clearance = cookies.find(c => c.name === 'cf_clearance')?.value;

      if (sessionid && !captured) {
        captured = true;
        console.log('\n===============================================================');
        console.log('🎉 SESSÃO AUTENTICADA DETECTADA COM SUCESSO!');
        console.log(`🔑 sessionid: ${sessionid.slice(0, 20)}... (len=${sessionid.length})`);
        if (csrftoken) console.log(`🛡️ csrftoken: ${csrftoken.slice(0, 15)}...`);
        if (cf_clearance) console.log(`☁️ cf_clearance: ${cf_clearance.slice(0, 15)}...`);
        console.log('===============================================================\n');

        // Atualizar config.py
        let cfg = fs.readFileSync(CONFIG_PATH, 'utf8');
        cfg = cfg.replace(/'sessionid':\s*'.*?'/, `'sessionid': '${sessionid}'`);
        if (csrftoken) cfg = cfg.replace(/'csrftoken':\s*'.*?'/, `'csrftoken': '${csrftoken}'`);
        if (cf_clearance) cfg = cfg.replace(/'cf_clearance':\s*'.*?'/, `'cf_clearance': '${cf_clearance}'`);
        fs.writeFileSync(CONFIG_PATH, cfg, 'utf8');
        console.log('✅ Arquivo scripts/coletor_provaderesidencia/config.py atualizado automaticamente!');
        console.log('👉 Você já pode fechar a janela do navegador.\n');
      }
    } catch (e) {
      // Ignora erros temporários durante o ciclo
    }
  };

  // Monitora requisições
  page.on('response', async (res) => {
    if (res.url().includes('provaderesidencia.com.br')) {
      await checkAndSaveCookies();
    }
  });

  console.log(`📌 Abrindo navegador em: ${TARGET_URL}`);
  try {
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (err) {
    console.warn('ℹ️ Carregando página inicial...');
  }

  console.log('\n👉 A janela do navegador está aberta.');
  console.log('👉 Entre na sua conta no site Prova de Residência (roger.rocha.contato@gmail.com).');
  console.log('👉 Assim que o login for concluído, os cookies serão gravados automaticamente.\n');

  const intervalId = setInterval(checkAndSaveCookies, 1500);

  await new Promise((resolve) => {
    page.on('close', resolve);
    browser.on('disconnected', resolve);
  });

  clearInterval(intervalId);
  console.log('🏁 Janela fechada.');
}

main().catch((err) => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
