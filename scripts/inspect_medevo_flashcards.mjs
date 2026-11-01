import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const SESSION_PATH = path.join(process.cwd(), 'scripts', 'medevo_session.json');

async function main() {
  console.log('🔍 Iniciando inspeção do MedEvo - Flashcards...');

  const sessionData = JSON.parse(fs.readFileSync(SESSION_PATH, 'utf8'));

  const CANDIDATE_CHROME = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(process.env.USERPROFILE || '', 'AppData', 'Local', 'ms-playwright', 'chromium-1243', 'chrome-win64', 'chrome.exe')
  ];
  const executablePath = CANDIDATE_CHROME.find(p => fs.existsSync(p));

  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ['--start-maximized', '--no-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  const apiLogs = [];
  page.on('response', async (res) => {
    const url = res.url();
    const contentType = res.headers()['content-type'] || '';
    if (contentType.includes('application/json')) {
      try {
        const text = await res.text();
        if (url.includes('flashcard') || url.includes('deck') || url.includes('card') || url.includes('review') || text.includes('flashcard')) {
          apiLogs.push({
            url,
            status: res.status(),
            payloadSnippet: text.slice(0, 1000)
          });
          console.log(`🎯 API relevante capturada: ${url}`);
        }
      } catch { }
    }
  });

  console.log('1. Acessando página inicial para injetar autenticação...');
  await page.goto('https://www.medevo.com.br/', { waitUntil: 'domcontentloaded', timeout: 30000 });

  await page.evaluate(({ key, value }) => {
    localStorage.setItem(key, value);
  }, sessionData);

  console.log('2. Recarregando página logada...');
  await page.goto('https://www.medevo.com.br/app', { waitUntil: 'networkidle', timeout: 30000 }).catch(async () => {
    await page.goto('https://www.medevo.com.br/dashboard', { timeout: 15000 }).catch(() => { });
  });

  await page.waitForTimeout(3000);
  console.log(`URL atual após login: ${page.url()}`);

  // Procura links com flashcards
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a, button')).map(el => ({
      text: el.innerText.trim(),
      href: el.getAttribute('href') || '',
      classes: el.className
    })).filter(item => item.text.toLowerCase().includes('flash') || item.href.toLowerCase().includes('flash'));
  });

  console.log('Links/botões de flashcards encontrados:', JSON.stringify(links, null, 2));

  // Tenta navegar para o link de flashcards se encontrado, ou para URLs candidatas
  let flashcardUrl = links.find(l => l.href)?.href;
  if (!flashcardUrl) {
    const candidates = ['https://www.medevo.com.br/flashcards', 'https://www.medevo.com.br/app/flashcards'];
    for (const c of candidates) {
      console.log(`Testando URL direta: ${c}`);
      await page.goto(c, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => { });
      await page.waitForTimeout(2000);
      if (!page.url().includes('login') && !page.url().endsWith('.br/')) {
        flashcardUrl = page.url();
        break;
      }
    }
  } else {
    if (!flashcardUrl.startsWith('http')) {
      flashcardUrl = new URL(flashcardUrl, page.url()).href;
    }
    console.log(`Navegando para o link encontrado: ${flashcardUrl}`);
    await page.goto(flashcardUrl, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => { });
  }

  await page.waitForTimeout(3000);
  console.log(`URL da área de flashcards: ${page.url()}`);

  const screenshotPath = path.join(process.cwd(), 'scripts', 'medevo_flashcards_screen.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`📸 Screenshot salvo em: ${screenshotPath}`);

  // Análise da estrutura DOM da tela de flashcards
  const domAnalysis = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[class*="card"], [class*="deck"], article, section')).map(c => ({
      tagName: c.tagName,
      className: c.className || '',
      text: (c.innerText || '').slice(0, 150)
    })).slice(0, 30);

    const interactiveElements = Array.from(document.querySelectorAll('button, input, [role="button"], a')).map(b => ({
      type: b.tagName,
      text: (b.innerText || b.getAttribute('aria-label') || b.getAttribute('placeholder') || '').trim(),
      className: b.className || '',
      href: b.getAttribute('href') || ''
    })).slice(0, 40);

    return {
      title: document.title,
      headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.innerText),
      cardsSample: cards,
      interactiveSample: interactiveElements,
      fullTextSnippet: document.body.innerText.slice(0, 2000)
    };
  });

  const report = {
    url: page.url(),
    linksFound: links,
    domAnalysis,
    apiLogs,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync('scripts/medevo_flashcards_analysis.json', JSON.stringify(report, null, 2), 'utf8');
  console.log('✅ Análise salva em scripts/medevo_flashcards_analysis.json');

  // Tenta abrir um deck ou iniciar estudo para ver o card ativo
  console.log('3. Tentando abrir um baralho ou card para inspeção do modo de estudo...');
  try {
    const studyButton = page.locator('button:has-text("Estudar"), button:has-text("Revisar"), button:has-text("Praticar"), [class*="deck-item"], [class*="deck_item"]').first();
    if (await studyButton.count() > 0) {
      await studyButton.click({ timeout: 5000 });
      await page.waitForTimeout(4000);
      const studyScreenshot = path.join(process.cwd(), 'scripts', 'medevo_flashcard_active_screen.png');
      await page.screenshot({ path: studyScreenshot, fullPage: true });
      console.log(`📸 Screenshot do modo ativo salvo em: ${studyScreenshot}`);

      const activeCardDom = await page.evaluate(() => {
        return {
          url: window.location.href,
          text: document.body.innerText.slice(0, 3000),
          html: document.querySelector('main')?.innerHTML?.slice(0, 5000) || document.body.innerHTML.slice(0, 5000)
        };
      });
      fs.writeFileSync('scripts/medevo_active_card_dom.json', JSON.stringify(activeCardDom, null, 2), 'utf8');
    }
  } catch (e) {
    console.log('Não foi possível clicar automaticamente no botão de estudo:', e.message);
  }

  await browser.close();
}

main().catch(err => {
  console.error('❌ Erro na inspeção:', err);
  process.exit(1);
});
