import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const SESSION_PATH = path.join(process.cwd(), 'scripts', 'medevo_session.json');

async function main() {
  console.log('===============================================================');
  console.log('👀 INICIANDO DEMO VISUAL AO VIVO DO PLAYWRIGHT NA SUA TELA');
  console.log('🛡️ REGRA ATIVA: NENHUMA EXTRAÇÃO SERÁ EXECUTADA AINDA');
  console.log('===============================================================\n');

  if (!fs.existsSync(SESSION_PATH)) {
    console.error('❌ Arquivo de sessão scripts/medevo_session.json não encontrado.');
    process.exit(1);
  }

  const sessionData = JSON.parse(fs.readFileSync(SESSION_PATH, 'utf8'));

  const CANDIDATE_CHROME = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Users\\cnath\\AppData\\Local\\ms-playwright\\chromium-1243\\chrome-win64\\chrome.exe'
  ];
  const executablePath = CANDIDATE_CHROME.find(p => fs.existsSync(p));

  console.log('🚀 1. Abrindo navegador visível na sua área de trabalho...');
  const browser = await chromium.launch({
    executablePath,
    headless: false,
    slowMo: 600, // Deixa cada ação lenta e visível aos olhos do usuário
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  const context = await browser.newContext({
    viewport: null,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  console.log('🌐 2. Acessando https://www.medevo.com.br/ ...');
  await page.goto('https://www.medevo.com.br/', { waitUntil: 'domcontentloaded', timeout: 45000 });

  console.log('🔑 3. Injetando sua sessão autenticada (Carlos Nathan)...');
  await page.evaluate(({ key, value }) => {
    localStorage.setItem(key, value);
  }, sessionData);

  console.log('🔄 4. Recarregando página autenticada na sua tela...');
  await page.reload({ waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(2000);

  // Insere um aviso visual flutuante elegante no topo da tela do usuário
  await page.evaluate(() => {
    const banner = document.createElement('div');
    banner.id = 'agent-safety-banner';
    banner.style.position = 'fixed';
    banner.style.top = '12px';
    banner.style.left = '50%';
    banner.style.transform = 'translateX(-50%)';
    banner.style.zIndex = '999999';
    banner.style.background = 'linear-gradient(135deg, #0ea5e9, #3b82f6)';
    banner.style.color = '#ffffff';
    banner.style.padding = '10px 24px';
    banner.style.borderRadius = '9999px';
    banner.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 20px rgba(14, 165, 233, 0.4)';
    banner.style.fontFamily = 'system-ui, sans-serif';
    banner.style.fontSize = '14px';
    banner.style.fontWeight = '700';
    banner.style.display = 'flex';
    banner.style.alignItems = 'center';
    banner.style.gap = '10px';
    banner.style.border = '1px solid rgba(255, 255, 255, 0.3)';
    banner.innerHTML = '🟢 <span>PLAYWRIGHT CONECTADO AO VIVO | <b>MODO DEMO: NENHUMA EXTRAÇÃO SENDO EXECUTADA</b></span>';
    document.body.appendChild(banner);
  });

  console.log('🖱️ 5. Realizando movimentos suaves de demonstração visual na tela...');
  // Rola suavemente para baixo para mostrar a interface carregada
  await page.evaluate(() => {
    window.scrollBy({ top: 350, behavior: 'smooth' });
  });
  await page.waitForTimeout(1500);

  // Rola suavemente de volta para o topo
  await page.evaluate(() => {
    window.scrollBy({ top: -350, behavior: 'smooth' });
  });
  await page.waitForTimeout(1500);

  console.log('\n===============================================================');
  console.log('✅ A janela está aberta e ativa na sua frente!');
  console.log('🛡️ Conforme solicitado: nenhuma extração foi ou será iniciada.');
  console.log('⏳ A janela permanecerá aberta para você ver.');
  console.log('===============================================================\n');

  // Mantém a janela aberta por bastante tempo para o usuário acompanhar à vontade
  // ou até o usuário fechar a aba
  await new Promise((resolve) => {
    browser.on('disconnected', resolve);
  });
}

main().catch(err => {
  console.error('❌ Erro na demo:', err);
  process.exit(1);
});
