import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const TARGET_URL = 'https://hippocampusresidencia.com.br';
const OUTPUT_DIR = path.resolve('docs/audit_results');

async function testButtonsAndThemes() {
  console.log('🚀 Executando Testes Interativos de Botões, Rotas e Temas...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const clickResults = [];
  const themeVisualResults = [];

  await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 45000 });

  // 1. TESTE DOS BOTÕES DE PLANOS & CHECKOUT
  console.log('\n--- TESTANDO BOTÕES DE PLANOS (CHECKOUT / STORAGE) ---');
  const planButtons = [
    { name: 'Plano Mensal', selector: 'button:has-text("Assinar Plano Mensal")' },
    { name: 'Plano Semestral', selector: 'button:has-text("Assinar Plano Semestral")' },
    { name: 'Plano Anual', selector: 'button:has-text("Assinar Plano Anual")' },
    { name: 'Plano Bienal', selector: 'button:has-text("Assinar Plano Bienal")' },
    { name: 'CTA Topo - Testar Grátis Agora', selector: 'button:has-text("Testar Grátis Agora")' },
    { name: 'Header - Entrar', selector: 'header button:has-text("Entrar")' },
    { name: 'Header - Testar Grátis', selector: 'header button:has-text("Testar Grátis")' },
  ];

  for (const btn of planButtons) {
    try {
      const el = page.locator(btn.selector).first();
      const count = await el.count();
      if (count === 0) {
        clickResults.push({ name: btn.name, status: 'NOT_FOUND' });
        continue;
      }
      
      // Limpar storage antes de clicar
      await page.evaluate(() => {
        sessionStorage.clear();
        localStorage.removeItem('pending_checkout_plan');
      });

      await el.click({ timeout: 5000 });
      await page.waitForTimeout(600);

      const state = await page.evaluate(() => {
        return {
          url: window.location.href,
          sessionPlan: sessionStorage.getItem('pending_checkout_plan'),
          localPlan: localStorage.getItem('pending_checkout_plan'),
          authModalVisible: !!document.querySelector('[data-auth-modal], [role="dialog"], form'),
          bodyClasses: document.body.className
        };
      });

      clickResults.push({
        name: btn.name,
        status: 'SUCCESS',
        state
      });
      console.log(`✅ [${btn.name}] Clicado com sucesso:`, state);

      // Fechar modal de auth se abriu
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
    } catch (e) {
      console.error(`❌ [${btn.name}] Erro ao clicar:`, e.message);
      clickResults.push({ name: btn.name, status: 'ERROR', error: e.message });
    }
  }

  // 2. TESTE DE ABAS DENTRO DA PLATAFORMA
  console.log('\n--- TESTANDO ABAS DA SEÇÃO "DENTRO DA PLATAFORMA" ---');
  const platformTabs = [
    { name: 'Flashcards FSRS', selector: 'button:has-text("Flashcards FSRS")' },
    { name: 'Resumos com Raio-X', selector: 'button:has-text("Resumos com Raio-X")' },
    { name: 'Painel de Desempenho & TRI', selector: 'button:has-text("Painel de Desempenho & TRI")' },
    { name: 'Questões na Prática', selector: 'button:has-text("Questões na Prática")' },
  ];

  for (const tab of platformTabs) {
    try {
      const el = page.locator(tab.selector).first();
      await el.click({ timeout: 4000 });
      await page.waitForTimeout(400);
      const isVisible = await el.isVisible();
      clickResults.push({ name: `Aba ${tab.name}`, status: isVisible ? 'SWITCHED' : 'FAIL' });
      console.log(`✅ [Aba ${tab.name}] Alternada`);
    } catch (e) {
      console.error(`❌ [Aba ${tab.name}] Erro:`, e.message);
      clickResults.push({ name: `Aba ${tab.name}`, status: 'ERROR', error: e.message });
    }
  }

  // 3. TESTE EXAUSTIVO DE TEMAS COM A CHAVE REAL DO SISTEMA (banco_theme_mode / banco_accent_color)
  console.log('\n--- TESTANDO TEMAS (LIGHT / DARK E ACENTOS) ---');
  const modes = ['dark', 'light'];
  const accents = ['neutral', 'blue', 'green', 'rose', 'purple', 'orange', 'red'];

  for (const mode of modes) {
    for (const accent of accents) {
      const result = await page.evaluate(({ mode, accent }) => {
        localStorage.setItem('banco_theme_mode', mode);
        localStorage.setItem('banco_accent_color', accent);
        if (mode === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
        }
        if (accent === 'neutral') {
          document.documentElement.classList.add('theme-monochrome');
        } else {
          document.documentElement.classList.remove('theme-monochrome');
        }

        const bodyComputed = window.getComputedStyle(document.body);
        const headerComputed = window.getComputedStyle(document.querySelector('header') || document.body);
        const insideSection = document.getElementById('dentro-da-plataforma');
        const insideComputed = insideSection ? window.getComputedStyle(insideSection) : null;
        const mainH1 = document.querySelector('h1, h2');
        const h1Computed = mainH1 ? window.getComputedStyle(mainH1) : null;

        return {
          mode,
          accent,
          bodyBg: bodyComputed.backgroundColor,
          headerBg: headerComputed.backgroundColor,
          insideBg: insideComputed ? insideComputed.backgroundColor : null,
          insideColor: insideComputed ? insideComputed.color : null,
          titleColor: h1Computed ? h1Computed.color : null,
        };
      }, { mode, accent });

      themeVisualResults.push(result);
    }
  }

  const detailedFile = path.join(OUTPUT_DIR, 'buttons_and_themes_detailed.json');
  fs.writeFileSync(detailedFile, JSON.stringify({ clickResults, themeVisualResults }, null, 2), 'utf8');
  console.log(`\n💾 Resultados detalhados salvos em: ${detailedFile}`);

  await browser.close();
  return { clickResults, themeVisualResults };
}

testButtonsAndThemes()
  .then(() => {
    console.log('🎉 Testes de botões e temas concluídos com sucesso!');
    process.exit(0);
  })
  .catch((e) => {
    console.error('❌ Falha:', e);
    process.exit(1);
  });
