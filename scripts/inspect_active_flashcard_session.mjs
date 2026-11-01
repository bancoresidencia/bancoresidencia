import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const SESSION_PATH = path.join(process.cwd(), 'scripts', 'medevo_session.json');

async function main() {
  console.log('🔍 Iniciando inspeção detalhada do Flashcard ativo...');

  const sessionData = JSON.parse(fs.readFileSync(SESSION_PATH, 'utf8'));

  const browser = await chromium.launch({
    headless: true,
    args: ['--start-maximized', '--no-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  const flashcardDataIntercepted = [];

  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('data.medevo.com.br') || url.includes('/flashcard') || url.includes('/rpc/')) {
      const ct = res.headers()['content-type'] || '';
      if (ct.includes('application/json')) {
        try {
          const json = await res.json();
          flashcardDataIntercepted.push({
            url,
            status: res.status(),
            data: json
          });
        } catch { }
      }
    }
  });

  await page.goto('https://www.medevo.com.br/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), sessionData);

  console.log('Navegando para https://www.medevo.com.br/flashcards/study ...');
  await page.goto('https://www.medevo.com.br/flashcards/study', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Clica na primeira categoria (ex: Cirurgia ou Clínica Médica)
  console.log('Selecionando categoria de estudo...');
  const categoryBtn = page.locator('button:has-text("Cirurgia"), button:has-text("Clínica Médica"), [class*="category-card"]').first();
  if (await categoryBtn.count() > 0) {
    console.log('Clicando na categoria...');
    await categoryBtn.click();
    await page.waitForTimeout(2000);
  }

  // Tira print antes de iniciar
  await page.screenshot({ path: 'scripts/medevo_study_selection.png', fullPage: true });

  // Clica no botão 'Escolher quantidade e estudar' ou 'platform-flashcards-start'
  console.log('Clicando em Escolher quantidade e estudar...');
  const chooseQtyBtn = page.locator('button.platform-flashcards-start, button:has-text("Escolher quantidade e estudar")').first();
  if (await chooseQtyBtn.count() > 0) {
    await chooseQtyBtn.click();
    await page.waitForTimeout(2000);

    // Se abrir um modal com opções de quantidade (ex: 5, 10, 20 cards), clica em uma opção ou confirmar
    await page.screenshot({ path: 'scripts/medevo_qty_modal.png', fullPage: true });

    // Procura botões de confirmação no modal
    const confirmBtn = page.locator('button:has-text("Iniciar estudo"), button:has-text("Começar"), button:has-text("Estudar"), [class*="modal"] button, [role="dialog"] button').last();
    if (await confirmBtn.count() > 0) {
      console.log('Confirmando início da sessão no modal...');
      await confirmBtn.click();
      await page.waitForTimeout(3000);
    }
  }

  // Tira print do card na tela (Frente)
  await page.screenshot({ path: 'scripts/medevo_card_front.png', fullPage: true });

  // Inspeciona o DOM da Frente do card
  const frontDom = await page.evaluate(() => {
    return {
      title: document.title,
      url: window.location.href,
      bodyText: document.body.innerText,
      cardHtml: document.querySelector('[class*="flashcard"], [class*="card-content"], main')?.outerHTML || document.body.innerHTML.slice(0, 5000)
    };
  });
  fs.writeFileSync('scripts/medevo_card_front_dom.json', JSON.stringify(frontDom, null, 2), 'utf8');

  // Procura botão para virar o card (ex: "Mostrar resposta", "Virar card", Barra de Espaço)
  console.log('Virando o card...');
  const flipBtn = page.locator('button:has-text("Mostrar resposta"), button:has-text("Virar"), button:has-text("Ver resposta")').first();
  if (await flipBtn.count() > 0) {
    await flipBtn.click();
  } else {
    // Tenta tecla Espaço
    await page.keyboard.press('Space');
  }

  await page.waitForTimeout(2000);

  // Tira print do card no Verso
  await page.screenshot({ path: 'scripts/medevo_card_back.png', fullPage: true });

  // Inspeciona o DOM do Verso do card
  const backDom = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.innerText.trim(),
      className: b.className
    }));
    return {
      buttons,
      bodyText: document.body.innerText,
      cardHtml: document.querySelector('[class*="flashcard"], [class*="card-content"], main')?.outerHTML || document.body.innerHTML.slice(0, 5000)
    };
  });
  fs.writeFileSync('scripts/medevo_card_back_dom.json', JSON.stringify(backDom, null, 2), 'utf8');

  // Salva dados interceptados
  fs.writeFileSync('scripts/medevo_all_intercepted_flashcard_data.json', JSON.stringify(flashcardDataIntercepted, null, 2), 'utf8');
  console.log('✅ Sessão de Flashcard inspecionada com sucesso!');

  await browser.close();
}

main().catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
