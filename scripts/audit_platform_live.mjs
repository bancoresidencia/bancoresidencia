import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = path.resolve('tests/platform_audit_screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const mockUser = {
  id: '00000000-0000-4000-a000-000000000001',
  email: 'aluno.auditoria@bancoresidencia.med.br',
  name: 'Dr. Aluno Auditor',
  role: 'student',
  targetExamName: 'ENARE',
  targetExamDate: '2026-11-15',
  createdAt: '2026-01-01T00:00:00.000Z'
};

async function runLiveAudit() {
  console.log('========================================================================');
  console.log('🔍 INICIANDO PLAYWRIGHT COM DEVTOOLS CONSOLE ATIVO NA PLATAFORMA REAL');
  console.log('========================================================================\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 }
  });

  // Injetar sessão de usuário autenticado antes de qualquer script da página
  await context.addInitScript((user) => {
    localStorage.setItem('bancoresidencia_cached_user_session', JSON.stringify(user));
    localStorage.setItem('bancoresidencia_current_user', JSON.stringify(user));
    localStorage.setItem('banco_theme_mode', 'dark');
    localStorage.setItem('banco_accent_color', 'crimson');
  }, mockUser);

  const page = await context.newPage();

  // Monitoramento de Console do DevTools
  page.on('console', (msg) => {
    const text = msg.text();
    // Filtra ruídos excessivos de telemetry se houver
    console.log(`[DevTools Console][${msg.type().toUpperCase()}] ${text}`);
  });

  page.on('pageerror', (err) => {
    console.error(`[DevTools Uncaught PageError] ❌ ${err.message}`);
  });

  const auditReport = {
    questoes: {},
    flashcards: {},
    resumos: {},
    desempenho: {}
  };

  try {
    // =========================================================================
    // 1. AUDITORIA: RESOLUÇÃO DE QUESTÕES (/questoes)
    // =========================================================================
    console.log('\n--- [1/4] AUDITANDO: RESOLUÇÃO DE QUESTÕES (/questoes) ---');
    await page.goto('http://localhost:3000/questoes', { waitUntil: 'networkidle', timeout: 35000 });
    await page.waitForTimeout(3000);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_questoes_inicial.png'), fullPage: false });
    console.log('📸 Screenshot salvo: 01_questoes_inicial.png');

    // Inspecionar ferramentas disponíveis
    const toolButtons = await page.$$eval('button', (btns) =>
      btns.map((b) => ({
        text: b.innerText.trim(),
        title: b.getAttribute('title') || '',
        ariaLabel: b.getAttribute('aria-label') || '',
        classes: b.className
      }))
    );
    console.log(`Botões detectados na página de questões: ${toolButtons.length}`);
    const inkButtons = toolButtons.filter((b) => b.text.includes('Anotar') || b.title.includes('Anotar') || b.title.includes('caneta') || b.text.includes('Riscar') || b.title.includes('Riscar'));
    console.log('Ferramentas de Estudo / Anotação detectadas:', inkButtons);

    // Testar seletor de alternativa
    const optionElements = await page.$$('.cursor-pointer, [data-testid="option"], button');
    console.log(`Elementos clicáveis encontrados na tela: ${optionElements.length}`);

    // Procurar por alternativas (A, B, C, D)
    const alternativeButtons = await page.$$('button:has-text("A"), [role="button"]:has-text("A")');
    console.log(`Possíveis botões de alternativas encontrados: ${alternativeButtons.length}`);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02_questoes_interacao.png') });

    // =========================================================================
    // 2. AUDITORIA: FLASHCARDS FSRS (/flashcards)
    // =========================================================================
    console.log('\n--- [2/4] AUDITANDO: FLASHCARDS FSRS (/flashcards) ---');
    await page.goto('http://localhost:3000/flashcards', { waitUntil: 'networkidle', timeout: 35000 });
    await page.waitForTimeout(2500);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_flashcards_inicial.png') });
    console.log('📸 Screenshot salvo: 03_flashcards_inicial.png');

    // Procurar botão para iniciar estudo
    const studyStartBtn = await page.$('button:has-text("Estudar"), button:has-text("Praticar"), button[title*="Estudar"]');
    if (studyStartBtn) {
      console.log('Botão de iniciar estudo de flashcard encontrado. Clicando...');
      await studyStartBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04_flashcards_sessao_ativa.png') });
      console.log('📸 Screenshot salvo: 04_flashcards_sessao_ativa.png');

      // Tentar virar o cartão
      const flipBtn = await page.$('button:has-text("Virar"), button:has-text("revelar"), button:has-text("Resposta")');
      if (flipBtn) {
        console.log('Virando cartão via botão...');
        await flipBtn.click();
      } else {
        console.log('Tentando virar cartão pressionando tecla Espaço...');
        await page.keyboard.press('Space');
      }
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05_flashcards_verso_fsrs.png') });
      console.log('📸 Screenshot salvo: 05_flashcards_verso_fsrs.png');
    }

    // =========================================================================
    // 3. AUDITORIA: RESUMOS CLÍNICOS (/resumos) - INFECÇÃO PUERPERAL
    // =========================================================================
    console.log('\n--- [3/4] AUDITANDO: RESUMOS CLÍNICOS (/resumos) ---');
    await page.goto('http://localhost:3000/resumos', { waitUntil: 'networkidle', timeout: 35000 });
    await page.waitForTimeout(2500);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06_resumos_catalogo.png') });
    console.log('📸 Screenshot salvo: 06_resumos_catalogo.png');

    // Tentar localizar e abrir o resumo de Infecção Puerperal ou Puerpério ou Ginecologia
    const puerperalLink = await page.$('text=/Puerp|Infecç|Endometrite|Ginecologia/i');
    if (puerperalLink) {
      console.log('Encontrado card de Puerpério/Ginecologia. Clicando...');
      await puerperalLink.click();
      await page.waitForTimeout(2500);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07_resumos_infeccao_puerperal.png') });
      console.log('📸 Screenshot salvo: 07_resumos_infeccao_puerperal.png');
    }

    // =========================================================================
    // 4. AUDITORIA: MEU DESEMPENHO (/desempenho)
    // =========================================================================
    console.log('\n--- [4/4] AUDITANDO: MEU DESEMPENHO (/desempenho) ---');
    await page.goto('http://localhost:3000/desempenho', { waitUntil: 'networkidle', timeout: 35000 });
    await page.waitForTimeout(3000);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08_desempenho_stats.png'), fullPage: true });
    console.log('📸 Screenshot salvo: 08_desempenho_stats.png');

    console.log('\n✅ Auditoria Playwright com DevTools concluída com sucesso!');
  } catch (err) {
    console.error('❌ Erro durante a auditoria Playwright:', err);
  } finally {
    await browser.close();
  }
}

runLiveAudit();
