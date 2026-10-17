import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const AUTH_STATE_PATH = path.join(process.cwd(), 'scripts', 'drive_auth_state.json');
const TARGET_URL = 'https://share.gemini.google/NpwDIY8cQMXc';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: fs.existsSync(AUTH_STATE_PATH) ? AUTH_STATE_PATH : undefined,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('response', resp => {
    if (resp.status() >= 400) {
      console.log('HTTP ERROR:', resp.status(), resp.url());
    }
  });

  console.log('Navigating to Gemini share URL...');
  await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(4000);

  const url = page.url();
  const title = await page.title();
  console.log(`URL: ${url}`);
  console.log(`Title: ${title}`);

  // Check for the "Continue" or "Try Gemini" interstitial modal
  const continueBtn = page.locator('button:has-text("Continue"), [role="button"]:has-text("Continue")').first();
  if (await continueBtn.isVisible()) {
    console.log('Clicking Continue button on disclaimer modal...');
    await continueBtn.click();
    await page.waitForTimeout(5000);
  }

  // Also check if there's any other confirmation or if canvas/app loaded
  await page.screenshot({ path: 'scripts/gemini_share_screen.png', fullPage: true });

  const data = await page.evaluate(() => {
    const fontsUsed = new Set();
    const colorsUsed = new Set();
    const bgColorsUsed = new Set();
    const elementsSample = [];

    // Collect fonts from stylesheets
    const fontFaces = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule instanceof CSSFontFaceRule) {
            fontFaces.push({
              family: rule.style.fontFamily,
              src: rule.style.src,
              weight: rule.style.fontWeight,
              style: rule.style.fontStyle
            });
          }
        }
      } catch (e) {}
    }

    // Inspect elements
    const allEls = Array.from(document.querySelectorAll('*'));
    for (const el of allEls) {
      const s = window.getComputedStyle(el);
      if (s.fontFamily) fontsUsed.add(s.fontFamily);
      if (s.color && s.color !== 'rgba(0, 0, 0, 0)') colorsUsed.add(s.color);
      if (s.backgroundColor && s.backgroundColor !== 'rgba(0, 0, 0, 0)') bgColorsUsed.add(s.backgroundColor);

      if (['H1', 'H2', 'H3', 'BUTTON', 'P', 'SPAN', 'DIV', 'INPUT'].includes(el.tagName) && el.innerText && el.innerText.trim().length > 0 && el.innerText.length < 100) {
        if (elementsSample.length < 60) {
          elementsSample.push({
            tag: el.tagName,
            text: el.innerText.trim().slice(0, 80),
            className: el.className,
            fontFamily: s.fontFamily,
            fontSize: s.fontSize,
            fontWeight: s.fontWeight,
            lineHeight: s.lineHeight,
            color: s.color,
            backgroundColor: s.backgroundColor,
            borderRadius: s.borderRadius,
            border: s.border,
            boxShadow: s.boxShadow,
            padding: s.padding
          });
        }
      }
    }

    return {
      title: document.title,
      bodyText: document.body.innerText.slice(0, 2000),
      fontFaces,
      fonts: Array.from(fontsUsed),
      colors: Array.from(colorsUsed).slice(0, 30),
      bgColors: Array.from(bgColorsUsed).slice(0, 30),
      elementsSample
    };
  });

  fs.writeFileSync('scripts/gemini_share_extracted.json', JSON.stringify(data, null, 2));
  console.log('Saved to scripts/gemini_share_extracted.json');
  await browser.close();
}

main().catch(err => console.error('Error:', err));
