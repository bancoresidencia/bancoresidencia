import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SESSION_PATH = path.join(process.cwd(), 'scripts', 'medevo_session.json');

async function main() {
  console.log('===============================================================');
  console.log('🎮 CONECTANDO PLAYWRIGHT À SUA JANELA VISÍVEL DO CHROME');
  console.log('🛡️ REGRA ATIVA: NENHUMA EXTRAÇÃO SERÁ EXECUTADA');
  console.log('===============================================================\n');

  let browser;
  try {
    browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  } catch (err) {
    console.error('❌ Não foi possível conectar ao Chrome na porta 9222.');
    console.log('👉 Certifique-se de ter rodado: npm run open:medevo');
    process.exit(1);
  }

  const context = browser.contexts()[0];
  let page = context.pages().find(p => p.url().includes('medevo.com.br'));

  if (!page) {
    page = context.pages()[0] || await context.newPage();
    await page.goto('https://www.medevo.com.br/', { waitUntil: 'domcontentloaded' });
  }

  console.log('🟢 Conectado com sucesso à aba:', page.url());

  // Injeta banner visual flutuante na tela do usuário
  await page.evaluate(() => {
    let banner = document.getElementById('playwright-live-badge');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'playwright-live-badge';
      banner.style.position = 'fixed';
      banner.style.top = '14px';
      banner.style.left = '50%';
      banner.style.transform = 'translateX(-50%)';
      banner.style.zIndex = '2147483647';
      banner.style.background = 'linear-gradient(135deg, #2563eb, #06b6d4)';
      banner.style.color = '#ffffff';
      banner.style.padding = '12px 26px';
      banner.style.borderRadius = '9999px';
      banner.style.boxShadow = '0 10px 25px rgba(0,0,0,0.4), 0 0 25px rgba(6,182,212,0.5)';
      banner.style.fontFamily = 'system-ui, sans-serif';
      banner.style.fontSize = '15px';
      banner.style.fontWeight = '700';
      banner.style.border = '2px solid rgba(255,255,255,0.4)';
      banner.innerHTML = '🟢 <span>PLAYWRIGHT CONECTADO AO VIVO NA SUA TELA | <b>MODO VISUALIZAÇÃO: SEM EXTRAÇÃO</b></span>';
      document.body.appendChild(banner);
    }
  });

  console.log('🖱️ Executando rolagem de demonstração na tela...');
  await page.evaluate(() => {
    window.scrollBy({ top: 380, behavior: 'smooth' });
  });
  await page.waitForTimeout(2000);

  await page.evaluate(() => {
    window.scrollBy({ top: -380, behavior: 'smooth' });
  });

  console.log('\n===============================================================');
  console.log('✅ DEMO CONCLUÍDA NA SUA TELA!');
  console.log('🛡️ Nenhuma extração foi ou será realizada sem sua autorização.');
  console.log('===============================================================\n');
}

main().catch(err => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
