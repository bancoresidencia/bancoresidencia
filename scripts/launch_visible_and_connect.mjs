import { chromium } from 'playwright';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = path.join(process.cwd(), 'scripts', '.chrome_test');
const SESSION_PATH = path.join(process.cwd(), 'scripts', 'medevo_session.json');
const DEBUG_PORT = 9222;

async function checkPortOpen(port) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/json/version`);
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  console.log('===============================================================');
  console.log('📺 FORÇANDO ABERTURA VISÍVEL DO CHROME NA SUA TELA');
  console.log('🎮 PLAYWRIGHT CONTROLARÁ A JANELA QUE VOCÊ ESTÁ VENDO');
  console.log('🛡️ REGRA ATIVA: NENHUMA EXTRAÇÃO SERÁ INICIADA');
  console.log('===============================================================\n');

  let isOpen = await checkPortOpen(DEBUG_PORT);

  if (!isOpen) {
    console.log('🚀 Disparando Chrome visível via Shell do Windows (start)...');
    const cmd = `start "" "${CHROME_PATH}" --remote-debugging-port=${DEBUG_PORT} --user-data-dir="${USER_DATA_DIR}" --start-maximized --no-first-run --no-default-browser-check "https://www.medevo.com.br/"`;
    exec(cmd, { shell: 'cmd.exe' });

    console.log('⏳ Aguardando Chrome inicializar a porta de depuração...');
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 1000));
      isOpen = await checkPortOpen(DEBUG_PORT);
      if (isOpen) break;
    }
  }

  if (!isOpen) {
    console.error('❌ Não foi possível conectar na porta 9222 do Chrome.');
    process.exit(1);
  }

  console.log('🔗 Conectando Playwright diretamente à janela visível na sua tela...');
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${DEBUG_PORT}`);
  const defaultContext = browser.contexts()[0];
  let page = defaultContext.pages().find(p => p.url().includes('medevo.com.br'));

  if (!page) {
    page = defaultContext.pages()[0] || await defaultContext.newPage();
    await page.goto('https://www.medevo.com.br/', { waitUntil: 'domcontentloaded' });
  }

  console.log('👀 Janela identificada:', page.url());

  // Injeta sessão se necessário
  if (fs.existsSync(SESSION_PATH)) {
    const sessionData = JSON.parse(fs.readFileSync(SESSION_PATH, 'utf8'));
    await page.evaluate(({ key, value }) => {
      const existing = localStorage.getItem(key);
      if (!existing) {
        localStorage.setItem(key, value);
        location.reload();
      }
    }, sessionData);
  }

  await page.waitForTimeout(2000);

  // Injeta banner visual no topo da janela do usuário
  console.log('✨ Injetando banner visual de controle ao vivo...');
  await page.evaluate(() => {
    let banner = document.getElementById('playwright-live-controller-badge');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'playwright-live-controller-badge';
      banner.style.position = 'fixed';
      banner.style.top = '16px';
      banner.style.left = '50%';
      banner.style.transform = 'translateX(-50%)';
      banner.style.zIndex = '2147483647';
      banner.style.background = 'linear-gradient(135deg, #059669, #10b981)';
      banner.style.color = '#ffffff';
      banner.style.padding = '12px 28px';
      banner.style.borderRadius = '9999px';
      banner.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5), 0 0 30px rgba(16,185,129,0.5)';
      banner.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      banner.style.fontSize = '15px';
      banner.style.fontWeight = 'bold';
      banner.style.display = 'flex';
      banner.style.alignItems = 'center';
      banner.style.gap = '12px';
      banner.style.border = '2px solid rgba(255,255,255,0.4)';
      banner.innerHTML = '🟢 <span>PLAYWRIGHT CONECTADO NA SUA TELA | <b>NENHUMA EXTRAÇÃO EM ANDAMENTO</b></span>';
      document.body.appendChild(banner);
    }
  });

  console.log('🖱️ Executando rolagem suave para você ver a automação operando...');
  await page.evaluate(() => {
    window.scrollBy({ top: 350, behavior: 'smooth' });
  });
  await page.waitForTimeout(2000);

  await page.evaluate(() => {
    window.scrollBy({ top: -350, behavior: 'smooth' });
  });
  await page.waitForTimeout(1500);

  console.log('\n===============================================================');
  console.log('🎉 SUCESSO! A janela agora está 100% visível na sua tela.');
  console.log('🛡️ Nenhuma extração foi realizada.');
  console.log('===============================================================\n');
}

main().catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
