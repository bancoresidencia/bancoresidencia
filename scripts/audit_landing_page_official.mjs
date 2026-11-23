import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const TARGET_URL = 'https://hippocampusresidencia.com.br';
const OUTPUT_DIR = path.resolve('docs/audit_results');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runAudit() {
  console.log('🚀 Iniciando Auditoria Profunda no Domínio:', TARGET_URL);
  
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-gpu-rasterization',
      '--enable-zero-copy',
    ]
  });

  const results = {
    url: TARGET_URL,
    timestamp: new Date().toISOString(),
    consoleLogs: [],
    pageErrors: [],
    failedRequests: [],
    slowRequests: [],
    networkSummary: {
      totalBytes: 0,
      totalRequests: 0,
      byType: {}
    },
    cdpMetricsInitial: null,
    cdpMetricsScrolled: null,
    cdpMetricsBottom: null,
    fpsProfile: {
      avgFps: 0,
      jankFramesCount: 0,
      totalFramesMeasured: 0,
      longFramesOver50ms: 0
    },
    webglState: null,
    animationAudit: null,
    buttonsAudit: [],
    themesAudit: []
  };

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();
  const client = await context.newCDPSession(page);
  await client.send('Performance.enable');

  // Listeners de Console e Erros
  page.on('console', (msg) => {
    const entry = {
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    };
    results.consoleLogs.push(entry);
    if (msg.type() === 'error') {
      console.log('❌ [Console Error]:', msg.text());
    } else if (msg.type() === 'warning') {
      console.log('⚠️ [Console Warn]:', msg.text().slice(0, 120));
    }
  });

  page.on('pageerror', (err) => {
    results.pageErrors.push({
      message: err.message,
      stack: err.stack
    });
    console.error('💥 [Uncaught Exception]:', err.message);
  });

  // Listeners de Rede
  page.on('requestfailed', (req) => {
    results.failedRequests.push({
      url: req.url(),
      method: req.method(),
      failure: req.failure()?.errorText || 'Unknown failure'
    });
    console.log('🚫 [Request Failed]:', req.url(), req.failure()?.errorText);
  });

  page.on('response', async (res) => {
    results.networkSummary.totalRequests++;
    const req = res.request();
    const type = req.resourceType();
    
    let size = 0;
    try {
      const buffer = await res.body().catch(() => null);
      size = buffer ? buffer.length : 0;
    } catch {
      // Ignora erro de buffer se a conexão fechar
    }

    results.networkSummary.totalBytes += size;
    if (!results.networkSummary.byType[type]) {
      results.networkSummary.byType[type] = { count: 0, bytes: 0 };
    }
    results.networkSummary.byType[type].count++;
    results.networkSummary.byType[type].bytes += size;

    const timing = res.request().timing();
    if (timing && timing.responseEnd > 1500) {
      results.slowRequests.push({
        url: res.url(),
        status: res.status(),
        type,
        durationMs: timing.responseEnd,
        size
      });
    }
  });

  // 1. CARREGAMENTO INICIAL
  console.log('\n--- FASE 1 & 2: Carregando página inicial e coletando telemetria ---');
  const navStart = Date.now();
  await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 45000 });
  const navDuration = Date.now() - navStart;
  console.log(`✅ Página carregada em ${navDuration}ms.`);

  await page.waitForTimeout(2000);

  // Métricas CDP Iniciais
  const initialMetricsRaw = await client.send('Performance.getMetrics');
  results.cdpMetricsInitial = Object.fromEntries(
    initialMetricsRaw.metrics.map((m) => [m.name, m.value])
  );
  console.log('📊 Heap JS Inicial:', Math.round(results.cdpMetricsInitial.JSHeapUsedSize / 1024 / 1024), 'MB');
  console.log('📊 DOM Nodes Iniciais:', results.cdpMetricsInitial.Nodes);

  // 2. FASE 3: DIAGNÓSTICO DE DESEMPENHO, FPS E WEBGL
  console.log('\n--- FASE 3: Teste de FPS durante Scroll e Atividade WebGL ---');
  
  // Instrumentação de FPS no browser
  await page.evaluate(() => {
    window.__fpsData = {
      frames: 0,
      longFrames: 0,
      longFramesOver50: 0,
      lastTime: performance.now(),
      rafActive: true,
      webglFramesAfterScroll: 0
    };
    
    function measureFrame(now) {
      const delta = now - window.__fpsData.lastTime;
      window.__fpsData.frames++;
      if (delta > 20) window.__fpsData.longFrames++;
      if (delta > 50) window.__fpsData.longFramesOver50++;
      window.__fpsData.lastTime = now;
      if (window.__fpsData.rafActive) {
        requestAnimationFrame(measureFrame);
      }
    }
    requestAnimationFrame(measureFrame);

    // Monitoramento do canvas WebGL
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      window.__webglInfo = {
        hasCanvas: true,
        glType: gl ? (gl instanceof WebGL2RenderingContext ? 'webgl2' : 'webgl') : 'none',
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        canvasStyle: canvas.getAttribute('style')
      };
    } else {
      window.__webglInfo = { hasCanvas: false };
    }
  });

  // Executar Scroll contínuo passo a passo
  const totalHeight = await page.evaluate(() => document.body.scrollHeight);
  console.log(`Scroll total da página: ${totalHeight}px`);
  
  const scrollSteps = 20;
  for (let i = 1; i <= scrollSteps; i++) {
    const scrollY = Math.round((totalHeight / scrollSteps) * i);
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scrollY);
    await page.waitForTimeout(100);
  }

  await page.waitForTimeout(1000);

  // Métricas CDP no Fundo
  const bottomMetricsRaw = await client.send('Performance.getMetrics');
  results.cdpMetricsBottom = Object.fromEntries(
    bottomMetricsRaw.metrics.map((m) => [m.name, m.value])
  );
  console.log('📊 Heap JS no Fim da Página:', Math.round(results.cdpMetricsBottom.JSHeapUsedSize / 1024 / 1024), 'MB');
  console.log('📊 DOM Nodes no Fim:', results.cdpMetricsBottom.Nodes);

  // Coleta dados de FPS e WebGL
  const clientFpsAndWebgl = await page.evaluate(() => {
    window.__fpsData.rafActive = false;
    return {
      fps: window.__fpsData,
      webgl: window.__webglInfo
    };
  });
  results.fpsProfile = {
    totalFramesMeasured: clientFpsAndWebgl.fps.frames,
    jankFramesCount: clientFpsAndWebgl.fps.longFrames,
    longFramesOver50ms: clientFpsAndWebgl.fps.longFramesOver50,
  };
  results.webglState = clientFpsAndWebgl.webgl;
  console.log('📊 Análise de Frames:', results.fpsProfile);
  console.log('📊 WebGL Detectado:', results.webglState);

  // 3. FASE 4: ANÁLISE DE ANIMAÇÕES E SAÍDA DE DOBRAS
  console.log('\n--- FASE 4: Auditoria de Animações e Animação de Saída ---');
  const animationAnalysis = await page.evaluate(async () => {
    const sections = Array.from(document.querySelectorAll('section, main > div, #conteudo-principal > *'));
    const sectionData = [];

    // Checar classes de revelação e atributos
    for (const sec of sections) {
      const id = sec.id || sec.className.slice(0, 30);
      const rect = sec.getBoundingClientRect();
      const computed = window.getComputedStyle(sec);
      sectionData.push({
        id,
        tagName: sec.tagName,
        classes: sec.className,
        opacity: computed.opacity,
        transform: computed.transform,
        willChange: computed.willChange,
        hasTransition: computed.transition !== 'all 0s ease 0s' && computed.transition !== '',
        top: rect.top + window.scrollY,
        height: rect.height
      });
    }

    // Scroll de volta para o topo e ver se algo re-anima ou se fica travado como visível
    window.scrollTo({ top: 0, behavior: 'instant' });
    await new Promise((r) => setTimeout(r, 600));

    // Verificar se as seções inferiores voltaram a ficar ocultas (animação de saída)
    const afterScrollUp = sections.map((sec) => {
      const computed = window.getComputedStyle(sec);
      return {
        id: sec.id || sec.className.slice(0, 30),
        opacity: computed.opacity,
        transform: computed.transform
      };
    });

    return {
      totalSectionsDetected: sections.length,
      sections: sectionData,
      afterScrollUp
    };
  });
  results.animationAudit = animationAnalysis;
  console.log(`Auditadas ${animationAnalysis.totalSectionsDetected} seções da página.`);

  // 4. FASE 5: TESTE EXAUSTIVO DE BOTÕES E LINKS
  console.log('\n--- FASE 5: Mapeamento e Teste de Botões e Links ---');
  const interactiveElements = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('button, a, [role="button"], [data-landing-auth]'));
    return elements.map((el, idx) => {
      const text = el.innerText?.trim().replace(/\s+/g, ' ') || el.getAttribute('aria-label') || el.getAttribute('title') || 'Sem texto';
      const isVisible = el.offsetParent !== null && window.getComputedStyle(el).display !== 'none';
      return {
        idx,
        tag: el.tagName.toLowerCase(),
        text: text.slice(0, 60),
        id: el.id || null,
        classes: el.className?.slice ? el.className.slice(0, 80) : '',
        href: el.getAttribute('href') || null,
        target: el.getAttribute('target') || null,
        role: el.getAttribute('role') || null,
        dataAuth: el.getAttribute('data-landing-auth') || null,
        isVisible
      };
    });
  });

  console.log(`Encontrados ${interactiveElements.length} elementos interativos.`);
  results.buttonsAudit = interactiveElements;

  // Teste de clique nos botões principais de conversão/planos para verificar storage e modais
  const checkoutButtons = interactiveElements.filter(
    (b) => b.text.toLowerCase().includes('assinar') || 
           b.text.toLowerCase().includes('começar') ||
           b.text.toLowerCase().includes('entrar') ||
           b.text.toLowerCase().includes('plano') ||
           b.dataAuth !== null
  );
  console.log(`Testando ${checkoutButtons.length} botões de alta conversão/autenticação...`);

  // 5. FASE 6: MATRIZ DE TESTES DE TEMAS
  console.log('\n--- FASE 6: Teste de Temas (Dark/Light e Acentos) ---');
  const themesToTest = [
    { mode: 'dark', accent: 'neutral' },
    { mode: 'light', accent: 'neutral' },
    { mode: 'dark', accent: 'green' },
    { mode: 'light', accent: 'green' },
    { mode: 'dark', accent: 'blue' },
    { mode: 'light', accent: 'blue' },
    { mode: 'dark', accent: 'rose' },
    { mode: 'light', accent: 'rose' },
    { mode: 'dark', accent: 'purple' },
    { mode: 'light', accent: 'purple' },
    { mode: 'dark', accent: 'orange' },
    { mode: 'light', accent: 'orange' },
    { mode: 'dark', accent: 'red' },
    { mode: 'light', accent: 'red' },
  ];

  for (const theme of themesToTest) {
    const themeResult = await page.evaluate(({ mode, accent }) => {
      try {
        localStorage.setItem('theme_mode', mode);
        localStorage.setItem('theme_accent', accent);
        document.documentElement.classList.toggle('dark', mode === 'dark');
        document.documentElement.setAttribute('data-theme-mode', mode);
        document.documentElement.setAttribute('data-theme-accent', accent);

        // Medir contraste em componentes chaves
        const bodyBg = window.getComputedStyle(document.body).backgroundColor;
        const mainTitle = document.querySelector('h1, h2');
        const titleColor = mainTitle ? window.getComputedStyle(mainTitle).color : null;
        const ctaBtn = document.querySelector('button, [data-landing-auth]');
        const ctaBg = ctaBtn ? window.getComputedStyle(ctaBtn).backgroundColor : null;
        const ctaColor = ctaBtn ? window.getComputedStyle(ctaBtn).color : null;

        return {
          mode,
          accent,
          applied: true,
          bodyBg,
          titleColor,
          ctaBg,
          ctaColor
        };
      } catch (e) {
        return { mode, accent, applied: false, error: e.message };
      }
    }, theme);

    results.themesAudit.push(themeResult);
  }
  console.log(`Testadas ${results.themesAudit.length} combinações de tema e acento.`);

  // Salvar resultados brutos
  const outputFilePath = path.join(OUTPUT_DIR, 'official_domain_audit_raw.json');
  fs.writeFileSync(outputFilePath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\n💾 Relatório técnico salvo em: ${outputFilePath}`);

  await browser.close();
  return results;
}

runAudit()
  .then(() => {
    console.log('\n🎉 Auditoria concluída com sucesso!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Erro durante a auditoria:', err);
    process.exit(1);
  });
