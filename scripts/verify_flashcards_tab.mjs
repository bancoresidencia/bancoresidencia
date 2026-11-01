import { chromium } from 'playwright';
import path from 'path';

async function main() {
  console.log('🚀 Iniciando verificação completa...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto('http://localhost:3000/');
  await page.waitForTimeout(1000);

  // Clica no botão "Modo Demo"
  const demoBtn = page.locator('button:has-text("Modo Demo")').first();
  if (await demoBtn.count() > 0) {
    console.log('Clicando em Modo Demo...');
    await demoBtn.click();
    await page.waitForTimeout(2000);
  }

  // Clica no item de menu "Flashcards" na Sidebar
  console.log('Clicando no botão de Flashcards na Sidebar...');
  const flashcardMenu = page.locator('aside button[aria-label*="Flashcards"]').first();
  if (await flashcardMenu.count() > 0) {
    await flashcardMenu.click();
    await page.waitForTimeout(2000);
  } else {
    console.log('Tentando via quickNavCards na Home...');
    const homeCard = page.locator('button:has-text("Flashcards & Resumos")').first();
    if (await homeCard.count() > 0) {
      await homeCard.click();
      await page.waitForTimeout(2000);
    }
  }

  const h1 = await page.locator('h1').allInnerTexts();
  console.log('H1 na tela:', h1);

  // 1. Screenshot da tela principal da aba Flashcards
  const p1 = path.join(process.cwd(), 'scripts', 'flashcards_tab_main.png');
  await page.screenshot({ path: p1, fullPage: true });
  console.log(`📸 Screenshot salvo: ${p1}`);

  // 2. Clica no botão "Estudar Agora"
  const studyBtn = page.locator('button:has-text("Estudar Agora")').first();
  if (await studyBtn.count() > 0) {
    console.log('Iniciando sessão ativa de estudo...');
    await studyBtn.click();
    await page.waitForTimeout(1500);

    const p2 = path.join(process.cwd(), 'scripts', 'flashcards_study_front.png');
    await page.screenshot({ path: p2, fullPage: true });
    console.log(`📸 Screenshot frente: ${p2}`);

    // Vira o card
    console.log('Virando o card...');
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);

    const p3 = path.join(process.cwd(), 'scripts', 'flashcards_study_back.png');
    await page.screenshot({ path: p3, fullPage: true });
    console.log(`📸 Screenshot verso: ${p3}`);

    // Sai da sessão
    const exitBtn = page.locator('button:has-text("Sair")').first();
    if (await exitBtn.count() > 0) {
      await exitBtn.click();
      await page.waitForTimeout(1000);
    }
  }

  // 3. Testa a sub-aba "Resumos Clínicos"
  console.log('Acessando sub-aba Resumos Clínicos...');
  const resumosTab = page.locator('button:has-text("Resumos Clínicos")').first();
  if (await resumosTab.count() > 0) {
    await resumosTab.click();
    await page.waitForTimeout(1500);

    const p4 = path.join(process.cwd(), 'scripts', 'study_materials_list.png');
    await page.screenshot({ path: p4, fullPage: true });
    console.log(`📸 Screenshot lista de resumos: ${p4}`);

    // Abre o primeiro resumo
    const readBtn = page.locator('button:has-text("Ler Resumo")').first();
    if (await readBtn.count() > 0) {
      console.log('Abrindo leitor de resumo...');
      await readBtn.click();
      await page.waitForTimeout(2000);

      const p5 = path.join(process.cwd(), 'scripts', 'study_material_reader.png');
      await page.screenshot({ path: p5, fullPage: true });
      console.log(`📸 Screenshot leitor de resumo clínico: ${p5}`);
    }
  }

  console.log('🎉 Verificação visual completa com sucesso!');
  await browser.close();
}

main().catch(err => {
  console.error('Erro na verificação:', err);
  process.exit(1);
});
