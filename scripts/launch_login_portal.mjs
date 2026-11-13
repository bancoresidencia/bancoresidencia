import { chromium } from 'playwright';

async function launch() {
  console.log('Iniciando janela visível do navegador para login do usuário...');

  const browser = await chromium.launch({
    headless: false,
    args: [
      '--start-maximized',
      '--no-sandbox',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  const context = await browser.newContext({
    viewport: null,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });

  // Tab 1: ABEM
  const p1 = await context.newPage();
  await p1.goto('https://admin.abem-nacional.com.br/teste-de-progresso/login');

  // Tab 2: Selecting Concursos (FUBOG)
  const p2 = await context.newPage();
  await p2.goto('https://candidato.concursos.selecting.com.br/login');

  // Tab 3: Objetivas Concursos (Mário Gatti)
  const p3 = await context.newPage();
  await p3.goto('https://www.objetivas.com.br/candidato/login');

  // Bring first tab to front
  await p1.bringToFront();

  console.log('✅ Janela do navegador aberta e visível na sua tela com as 3 abas de login!');
  console.log('👉 Tab 1: ABEM (Teste de Progresso Nacional)');
  console.log('👉 Tab 2: Selecting Concursos (FUBOG)');
  console.log('👉 Tab 3: Objetivas Concursos (Mário Gatti)');
  console.log('📌 A janela permanecerá aberta para você interagir e logar livremente.');

  // Keep alive until all pages are closed by user
  await new Promise((resolve) => {
    browser.on('disconnected', resolve);
  });
  console.log('Janela fechada pelo usuário.');
}

launch().catch(err => {
  console.error('Erro ao abrir navegador:', err.message);
});

