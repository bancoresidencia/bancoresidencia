const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/cnath/.gemini/antigravity/brain/c4e40b5e-6e59-4150-be44-140d5423a837';

async function scrollToProgress(page, targetP) {
  await page.evaluate((p) => {
    const track = document.querySelector('.relative.h-\\[640vh\\]');
    if (!track) return;
    const winH = window.innerHeight;
    const scrollable = track.offsetHeight - winH;
    const trackTop = track.getBoundingClientRect().top + window.scrollY;
    const targetY = trackTop + p * scrollable;
    window.scrollTo({ top: targetY, behavior: 'instant' });
  }, targetP);
  // Aguardar a convergência da interpolação smoothScroll
  await page.waitForTimeout(2800);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 }
  });
  const page = await context.newPage();

  console.log('Navegando para http://localhost:3000/ ...');
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2500);

  // 1. Dobra 1 / Hero Inicial (p = 0.0)
  await scrollToProgress(page, 0.0);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'hero_dobra1_clean.png') });
  console.log('Capturado hero_dobra1_clean.png');

  // 2. Card 1 - Console Executivo / Córtex Pré-Frontal (p = 0.28)
  await scrollToProgress(page, 0.28);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'hero_card1_executive_pfc.png') });
  console.log('Capturado hero_card1_executive_pfc.png');

  // 3. Card 2 - Circuito Panorâmico Límbico (p = 0.62)
  await scrollToProgress(page, 0.62);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'hero_card2_circuit_papez.png') });
  console.log('Capturado hero_card2_circuit_papez.png');

  // 4. Card 3 - Monolito de Retenção Definitiva (p = 0.86)
  await scrollToProgress(page, 0.86);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'hero_card3_monolith_hippo.png') });
  console.log('Capturado hero_card3_monolith_hippo.png');

  await browser.close();
  console.log('Finalizado com sucesso!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
