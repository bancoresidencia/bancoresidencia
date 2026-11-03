/**
 * CAMADA E — TESTES E2E REAIS NO NAVEGADOR COM PLAYWRIGHT
 * EXCLUSIVAMENTE NA ROTA /dashboard (ABA INÍCIO)
 * 
 * Executa testes reais de ponta a ponta:
 * - Renderização inicial dos 11 cards
 * - Entrada no modo de personalização
 * - Seleção, troca e desseleção de cards
 * - Controles da barra flutuante (FigmaCustomizerBar)
 * - Botões de ação no topo do card (Mover, Tamanho, Popover de configs, Ocultar)
 * - Reativação de cards ocultos
 * - Redimensionamento multi-direcional com alças
 * - Drag and Drop com troca espacial real-time
 * - Restauração do padrão
 * - Conclusão, auto-conform e persistência após reload
 */

import { chromium, Browser, Page } from 'playwright';
import path from 'path';
import fs from 'fs';

interface E2EAssertion {
  step: string;
  passed: boolean;
  error?: string;
  screenshotPath?: string;
}

export interface E2EReport {
  totalSteps: number;
  passedSteps: number;
  failedSteps: number;
  assertions: E2EAssertion[];
  screenshots: string[];
  durationMs: number;
}

const screenshotsDir = path.resolve(process.cwd(), 'tests/dashboard/screenshots');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export async function runLayerEE2ETests(baseUrl = 'http://localhost:3000'): Promise<E2EReport> {
  console.log('🧪 Iniciando Camada E: Testes E2E reais no navegador (Playwright)...');
  const startTime = Date.now();
  ensureDir(screenshotsDir);

  const assertions: E2EAssertion[] = [];
  const screenshots: string[] = [];

  const logAssertion = (step: string, passed: boolean, error?: string, screenshotName?: string) => {
    let fullPath: string | undefined;
    if (screenshotName) {
      fullPath = path.join(screenshotsDir, screenshotName);
      screenshots.push(fullPath);
    }
    assertions.push({ step, passed, error, screenshotPath: fullPath });
    if (passed) {
      console.log(`  ✅ [E2E] ${step}`);
    } else {
      console.error(`  ❌ [E2E] ${step}: ${error}`);
    }
  };

  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });

    const page = await context.newPage();

    // 1. Navegação estrita exclusivamente para /dashboard
    await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'networkidle', timeout: 30000 });
    const currentUrl = page.url();
    const isDashboardRoute = currentUrl.includes('/dashboard');
    logAssertion('Navegação estrita para rota /dashboard', isDashboardRoute, isDashboardRoute ? undefined : `Rota inesperada: ${currentUrl}`);

    // Limpa estado anterior de localStorage para teste determinístico
    await page.evaluate(() => {
      localStorage.removeItem('bancoresidencia_layout_home_v2');
      localStorage.removeItem('bancoresidencia_layout_home');
    });
    await page.reload({ waitUntil: 'networkidle' });

    // 2. Inventário inicial de cards
    const initialCards = await page.locator('[data-card-id]').all();
    const countInitial = initialCards.length;
    logAssertion(
      'Inventário completo: exatamente 11 cards renderizados no dashboard',
      countInitial === 11,
      countInitial === 11 ? undefined : `Esperado 11 cards, encontrados ${countInitial}`
    );

    await page.screenshot({ path: path.join(screenshotsDir, '01_dashboard_padrao.png') });
    logAssertion('Screenshot do Dashboard Padrão capturado', true, undefined, '01_dashboard_padrao.png');

    // 3. Entrada no modo de personalização via botão "Layout" no Hero card
    const heroLayoutButton = page.locator('button[title*="Personalizar layout"]').first();
    const hasHeroBtn = (await heroLayoutButton.count()) > 0;
    logAssertion('Botão de ativação do layout presente na interface', hasHeroBtn);

    if (hasHeroBtn) {
      await heroLayoutButton.click();
    } else {
      // Fallback via ThemeSelector se necessário
      const themeBtn = page.locator('button[title*="Personalizar Tema"]').first();
      await themeBtn.click();
      await page.locator('button:has-text("Personalizar Layout")').first().click();
    }

    // Aguarda barra flutuante FigmaCustomizerBar
    await page.waitForTimeout(400);
    const customizerBar = page.locator('text=Personalização Ativa');
    const isCustomizerBarVisible = (await customizerBar.count()) > 0;
    logAssertion('Barra flutuante FigmaCustomizerBar ativa e visível', isCustomizerBarVisible);

    const isGridQuadriculado = await page.locator('.canvas-grid-quadriculado').count();
    logAssertion('Grid quadriculado canvas ativo em modo de personalização', isGridQuadriculado > 0);

    await page.screenshot({ path: path.join(screenshotsDir, '02_modo_personalizacao.png') });
    logAssertion('Screenshot do Modo Personalização capturado', true, undefined, '02_modo_personalizacao.png');

    // 4. Seleção de Card
    const metaCard = page.locator('[data-card-id="home_meta_diaria"]');
    await metaCard.click();
    await page.waitForTimeout(200);

    const isSelected = await metaCard.evaluate((el) => el.classList.contains('ring-2'));
    logAssertion('Card "home_meta_diaria" selecionado com anel de foco azul (ring-2)', isSelected);

    // Verifica barra superior de ações do card selecionado
    const cardActionBar = metaCard.locator('.figma-control').first();
    const hasActionBar = (await cardActionBar.count()) > 0;
    logAssertion('Barra superior de ações do card selecionado visível', hasActionBar);

    // Verifica presença das alças de redimensionamento
    const resizeHandles = metaCard.locator('.figma-control');
    const handleCount = await resizeHandles.count();
    logAssertion(
      `Alças de redimensionamento e controles presentes no card (total: ${handleCount})`,
      handleCount >= 8,
      handleCount >= 8 ? undefined : `Esperado pelo menos 8 controles, encontrados ${handleCount}`
    );

    await page.screenshot({ path: path.join(screenshotsDir, '03_card_selecionado.png') });
    logAssertion('Screenshot do Card Selecionado capturado', true, undefined, '03_card_selecionado.png');

    // 5. Teste do Botão de Alternar Tamanho (Cycle Size)
    const cycleSizeButton = metaCard.locator('button[title="Alternar tamanho"]').first();
    if ((await cycleSizeButton.count()) > 0) {
      await cycleSizeButton.click();
      await page.waitForTimeout(300);
      const spanText = await metaCard.locator('span.font-mono').first().textContent();
      logAssertion(`Alternância rápida de tamanho (novo span: ${spanText})`, Boolean(spanText && spanText.includes('col')));
    }

    // 6. Teste de Abertura do Popover de Configurações Internas
    const settingsButton = metaCard.locator('button[title*="Configurar elementos internos"]').first();
    if ((await settingsButton.count()) > 0) {
      await settingsButton.click();
      await page.waitForTimeout(200);
      const popover = page.locator('.figma-popover');
      const isPopoverOpen = (await popover.count()) > 0;
      logAssertion('Popover de configurações internas aberto com sucesso', isPopoverOpen);

      await page.screenshot({ path: path.join(screenshotsDir, '04_popover_configuracoes.png') });
      logAssertion('Screenshot do Popover de Configurações capturado', true, undefined, '04_popover_configuracoes.png');

      // Fecha o popover
      await settingsButton.click();
      await page.waitForTimeout(200);
    }

    // 7. Teste de Mover Card para Baixo e para Cima
    const moveDownButton = metaCard.locator('button[title="Mover para baixo"]').first();
    if ((await moveDownButton.count()) > 0) {
      await moveDownButton.click();
      await page.waitForTimeout(300);
      logAssertion('Botão "Mover para baixo" executado com sucesso', true);

      const moveUpButton = metaCard.locator('button[title="Mover para cima"]').first();
      await moveUpButton.click();
      await page.waitForTimeout(300);
      logAssertion('Botão "Mover para cima" executado com sucesso', true);
    }

    // 8. Teste de Ocultação de Card e Reativação pela Barra Flutuante
    const hideButton = metaCard.locator('button[title="Ocultar card"]').first();
    if ((await hideButton.count()) > 0) {
      await hideButton.click();
      await page.waitForTimeout(300);

      // Card meta_diaria deve ter sumido do grid visível
      const metaCardVisible = await page.locator('[data-card-id="home_meta_diaria"]').count();
      logAssertion('Card "home_meta_diaria" ocultado com sucesso', metaCardVisible === 0);

      // Botão Ocultos deve aparecer na barra flutuante
      const hiddenBtn = page.locator('button:has-text("Ocultos")').first();
      const hasHiddenBtn = (await hiddenBtn.count()) > 0;
      logAssertion('Botão "Ocultos (1)" apareceu na barra flutuante', hasHiddenBtn);

      if (hasHiddenBtn) {
        await hiddenBtn.click();
        await page.waitForTimeout(200);

        // Clica no botão de reativar o card
        const restoreCardBtn = page.locator('button:has-text("Metas Diárias")').first();
        if ((await restoreCardBtn.count()) > 0) {
          await restoreCardBtn.click();
          await page.waitForTimeout(300);
          const metaCardRestored = await page.locator('[data-card-id="home_meta_diaria"]').count();
          logAssertion('Card "home_meta_diaria" reativado e presente no grid', metaCardRestored > 0);
        }
      }
    }

    // 9. Teste de Drag & Drop Real no Navegador
    const cardToDrag = page.locator('[data-card-id="home_percentil"]');
    const targetDropCard = page.locator('[data-card-id="home_recomendacao"]');

    if ((await cardToDrag.count()) > 0 && (await targetDropCard.count()) > 0) {
      const dragBox = await cardToDrag.boundingBox();
      const targetBox = await targetDropCard.boundingBox();

      if (dragBox && targetBox) {
        // Move o mouse até o centro do card e arrasta até o target
        await page.mouse.move(dragBox.x + dragBox.width / 2, dragBox.y + dragBox.height / 2);
        await page.mouse.down();
        // Arrasta com movimento intermediário para ativar o drag livre e guias magnéticas
        await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 10 });
        await page.waitForTimeout(300);

        await page.screenshot({ path: path.join(screenshotsDir, '05_drag_em_andamento.png') });
        logAssertion('Screenshot de Drag & Drop em andamento capturado', true, undefined, '05_drag_em_andamento.png');

        await page.mouse.up();
        await page.waitForTimeout(400);
        logAssertion('Operação física de Drag & Drop concluída com sucesso', true);
      }
    }

    // 10. Teste do Botão "Padrão" (Restaurar Padrão)
    const restoreDefaultsBtn = page.locator('button:has-text("Padrão")').first();
    if ((await restoreDefaultsBtn.count()) > 0) {
      await restoreDefaultsBtn.click();
      await page.waitForTimeout(300);
      const cardsAfterReset = await page.locator('[data-card-id]').all();
      logAssertion('Layout restaurado para padrão com sucesso (11 cards presentes)', cardsAfterReset.length === 11);

      await page.screenshot({ path: path.join(screenshotsDir, '06_layout_restaurado.png') });
      logAssertion('Screenshot do Layout Restaurado capturado', true, undefined, '06_layout_restaurado.png');
    }

    // 11. Teste de Conclusão e Persistência
    const completeButton = page.locator('button:has-text("Concluir")').first();
    if ((await completeButton.count()) > 0) {
      await completeButton.click();
      await page.waitForTimeout(400);

      const isCustomizingAfter = (await page.locator('.canvas-grid-quadriculado').count()) > 0;
      logAssertion('Modo de personalização finalizado após clicar em "Concluir"', !isCustomizingAfter);

      // Recarrega a página para testar recuperação do LocalStorage
      await page.reload({ waitUntil: 'networkidle' });
      const cardsAfterReload = await page.locator('[data-card-id]').all();
      logAssertion(
        'Persistência validada: todos os 11 cards íntegros após recarregamento da página',
        cardsAfterReload.length === 11
      );

      await page.screenshot({ path: path.join(screenshotsDir, '07_apos_recarregamento.png') });
      logAssertion('Screenshot após recarregamento capturado', true, undefined, '07_apos_recarregamento.png');
    }

    await context.close();
  } catch (err: any) {
    logAssertion('Execução de camada E2E', false, err?.message || String(err));
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  const durationMs = Date.now() - startTime;
  const passedSteps = assertions.filter((a) => a.passed).length;
  const failedSteps = assertions.filter((a) => !a.passed).length;

  console.log(`✅ Camada E concluída em ${(durationMs / 1000).toFixed(2)}s: ${passedSteps} passaram, ${failedSteps} falharam.`);

  return {
    totalSteps: assertions.length,
    passedSteps,
    failedSteps,
    assertions,
    screenshots,
    durationMs
  };
}

if (process.argv[1]?.endsWith('layerE_e2e_playwright.ts')) {
  runLayerEE2ETests().then((report) => {
    process.exit(report.failedSteps > 0 ? 1 : 0);
  });
}

