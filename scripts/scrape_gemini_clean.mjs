import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  page.on('console', msg => console.log('LOG:', msg.type(), msg.text()));

  console.log('Navigating to Gemini share...');
  await page.goto('https://share.gemini.google/NpwDIY8cQMXc', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  console.log('Finding Continue button...');
  // The continue button in the modal
  const continueBtn = page.locator('button:has-text("Continue"), [role="button"]:has-text("Continue")').first();
  if (await continueBtn.isVisible()) {
    console.log('Found Continue button, clicking...');
    await continueBtn.click();
    console.log('Waiting 8 seconds for content/canvas/app to load...');
    await page.waitForTimeout(8000);
  } else {
    console.log('Continue button not visible');
  }

  // Let's capture the page after clicking Continue
  await page.screenshot({ path: 'scripts/gemini_after_continue.png', fullPage: true });

  // Let's also check for iframes or canvas
  const frames = page.frames();
  console.log('Total frames:', frames.length);

  const frameData = [];
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    try {
      const fTitle = await f.title();
      const fUrl = f.url();
      const fText = await f.evaluate(() => document.body ? document.body.innerText : '');
      frameData.push({ index: i, title: fTitle, url: fUrl, textSnippet: fText.slice(0, 1000) });
    } catch (e) {
      frameData.push({ index: i, error: e.message });
    }
  }

  const mainPageText = await page.evaluate(() => document.body ? document.body.innerText : '');
  console.log('Main page text length:', mainPageText.length);
  console.log('Snippet:\n', mainPageText.slice(0, 1500));

  // Extract all computed styles, fonts, colors, and HTML
  const extracted = await page.evaluate(() => {
    const fontFaces = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule instanceof CSSFontFaceRule) {
            fontFaces.push({
              family: rule.style.fontFamily,
              weight: rule.style.fontWeight,
              style: rule.style.fontStyle,
              src: rule.style.src
            });
          }
        }
      } catch (e) {}
    }

    const elements = [];
    const all = Array.from(document.querySelectorAll('*'));
    for (const el of all) {
      const s = window.getComputedStyle(el);
      const text = el.innerText ? el.innerText.trim() : '';
      if (text && text.length > 0 && text.length < 200) {
        if (elements.length < 100) {
          elements.push({
            tagName: el.tagName,
            text: text.slice(0, 100),
            className: el.className,
            fontFamily: s.fontFamily,
            fontSize: s.fontSize,
            fontWeight: s.fontWeight,
            lineHeight: s.lineHeight,
            color: s.color,
            backgroundColor: s.backgroundColor,
            borderRadius: s.borderRadius,
            border: s.border,
            boxShadow: s.boxShadow
          });
        }
      }
    }

    return {
      title: document.title,
      fontFaces,
      elements
    };
  });

  fs.writeFileSync('scripts/gemini_extracted_clean.json', JSON.stringify({
    mainPageText,
    frames: frameData,
    extracted
  }, null, 2));

  console.log('Saved to scripts/gemini_extracted_clean.json and scripts/gemini_after_continue.png');
  await browser.close();
}

main().catch(e => console.error('Error:', e));
