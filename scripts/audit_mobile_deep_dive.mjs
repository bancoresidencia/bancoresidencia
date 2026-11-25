import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const screenshotsDir = path.resolve('docs/audit_mobile_screenshots');

async function deepDiveAudit() {
  const browser = await chromium.launch({ headless: true });

  // Dispositivo de teste: iPhone 14 Pro (393 x 852)
  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2
  });
  const page = await context.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const deepFindings = {
    heroScrollStages: [],
    mapMobileBehavior: null,
    insidePlatformMobileToolbar: null,
    ecosystemGridOnMobile: null,
    pricingCardsLayout: null,
    bodyScrollLockOnMenu: null,
    zindexStacking: []
  };

  // 1. Analisar Estágios de Scroll do Hero (Hero 680svh track)
  console.log('--- Analisando Jornada Neuroanatômica no Scroll Mobile ---');
  const scrollTrackHeight = await page.evaluate(() => {
    const track = document.querySelector('#neuroanatomia div[class*="h-[680svh]"]');
    return track ? track.getBoundingClientRect().height : null;
  });

  const scrollOffsets = [0, 800, 1800, 3200, 4800, 5800];
  for (let i = 0; i < scrollOffsets.length; i++) {
    const y = scrollOffsets[i];
    await page.evaluate((topY) => window.scrollTo(0, topY), y);
    await page.waitForTimeout(400);

    const stageState = await page.evaluate(() => {
      const pillars = document.querySelector('#neuroanatomia [class*="pillarsStage"]') || document.querySelectorAll('#neuroanatomia > div > div > div > div')[0];
      const brain = document.querySelector('#neuroanatomia canvas') || document.querySelector('#neuroanatomia div[class*="brainStage"]');
      const introH2 = document.querySelector('#neuroanatomia h2');
      const cards = document.querySelector('#neuroanatomia [class*="cardsPanel"]') || document.querySelectorAll('#neuroanatomia > div > div > div > div')[3];

      const getVis = (el) => {
        if (!el) return null;
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          opacity: style.opacity,
          pointerEvents: style.pointerEvents,
          top: Math.round(rect.top),
          left: Math.round(rect.left),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          visible: style.opacity > 0.05 && rect.height > 0
        };
      };

      return {
        scrollY: window.scrollY,
        pillars: getVis(pillars),
        brain: getVis(brain),
        introH2: getVis(introH2),
        cards: getVis(cards)
      };
    });

    deepFindings.heroScrollStages.push(stageState);
    await page.screenshot({ path: path.join(screenshotsDir, `iphone14_scroll_stage_${i}.png`) });
  }

  // 2. Analisar Seção do Mapa do Brasil no Mobile
  console.log('--- Analisando Adaptação do Mapa do Brasil no Mobile ---');
  await page.locator('#onde-vem-as-provas').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  const mapAnalysis = await page.evaluate(() => {
    const svgMap = document.querySelector('#onde-vem-as-provas svg');
    const stateSelect = document.querySelector('#onde-vem-as-provas select');
    const instCards = document.querySelectorAll('#onde-vem-as-provas [class*="rounded-"]');
    
    return {
      svgPresent: !!svgMap,
      svgDisplay: svgMap ? window.getComputedStyle(svgMap).display : 'none',
      svgWidth: svgMap ? Math.round(svgMap.getBoundingClientRect().width) : 0,
      svgHeight: svgMap ? Math.round(svgMap.getBoundingClientRect().height) : 0,
      hasMobileSelect: !!stateSelect,
      stateSelectVisible: stateSelect ? window.getComputedStyle(stateSelect).display !== 'none' : false,
      instCardsCount: instCards.length
    };
  });
  deepFindings.mapMobileBehavior = mapAnalysis;

  // 3. Analisar Toolbar de Estudo dentro da Plataforma
  console.log('--- Analisando Toolbar de Estudo no Mobile ---');
  await page.locator('#dentro-da-plataforma').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  const toolbarAnalysis = await page.evaluate(() => {
    const toolbar = document.querySelector('#dentro-da-plataforma [class*="bg-[#10121"]');
    if (!toolbar) return null;
    const toolbarRect = toolbar.getBoundingClientRect();
    const buttons = toolbar.querySelectorAll('button');
    const buttonList = [];
    for (const b of buttons) {
      const r = b.getBoundingClientRect();
      buttonList.push({
        text: (b.textContent || '').trim().slice(0, 20),
        top: Math.round(r.top - toolbarRect.top),
        left: Math.round(r.left - toolbarRect.left),
        width: Math.round(r.width),
        height: Math.round(r.height)
      });
    }
    return {
      toolbarWidth: Math.round(toolbarRect.width),
      toolbarHeight: Math.round(toolbarRect.height),
      buttonsCount: buttons.length,
      buttonList: buttonList
    };
  });
  deepFindings.insidePlatformMobileToolbar = toolbarAnalysis;

  // 4. Analisar Menu Hamburguer e Scroll Lock
  console.log('--- Analisando Bloqueio de Scroll no Menu Aberto ---');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  const menuBtn = page.locator('header button[aria-label="Abrir menu"]');
  if (await menuBtn.isVisible()) {
    await menuBtn.click();
    await page.waitForTimeout(300);

    const bodyOverflow = await page.evaluate(() => {
      const bodyStyle = window.getComputedStyle(document.body);
      const htmlStyle = window.getComputedStyle(document.documentElement);
      return {
        bodyOverflow: bodyStyle.overflow,
        htmlOverflow: htmlStyle.overflow,
        isScrollLocked: bodyStyle.overflow === 'hidden' || htmlStyle.overflow === 'hidden'
      };
    });
    deepFindings.bodyScrollLockOnMenu = bodyOverflow;

    // Fechar menu
    await page.locator('header button[aria-label="Fechar menu"]').click();
  }

  // 5. Analisar Layout do Ecosistema
  console.log('--- Analisando Ecosistema Showcase no Mobile ---');
  await page.locator('#recursos-adicionais').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(screenshotsDir, 'iphone14_secao_ecosistema.png') });

  const ecoAnalysis = await page.evaluate(() => {
    const section = document.querySelector('#recursos-adicionais');
    if (!section) return null;
    const cards = section.querySelectorAll('div[class*="rounded-2xl"], div[class*="rounded-3xl"]');
    return {
      cardsCount: cards.length,
      rects: Array.from(cards).slice(0, 6).map(c => {
        const r = c.getBoundingClientRect();
        return { width: Math.round(r.width), height: Math.round(r.height), top: Math.round(r.top) };
      })
    };
  });
  deepFindings.ecosystemGridOnMobile = ecoAnalysis;

  await browser.close();

  fs.writeFileSync('docs/audit_deep_dive_results.json', JSON.stringify(deepFindings, null, 2), 'utf-8');
  console.log('✅ Deep dive concluído! Salvo em docs/audit_deep_dive_results.json');
}

deepDiveAudit().catch(err => {
  console.error('Falha no deep dive:', err);
  process.exit(1);
});
