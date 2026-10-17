import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('Navigating to Gemini share...');
  await page.goto('https://share.gemini.google/NpwDIY8cQMXc', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  const continueBtn = page.locator('button:has-text("Continue"), [role="button"]:has-text("Continue")').first();
  if (await continueBtn.isVisible()) {
    console.log('Clicking Continue...');
    await continueBtn.click();
    console.log('Waiting 10 seconds for iframe / canvas...');
    await page.waitForTimeout(10000);
  }

  // Find canvas or usercontent iframe
  console.log('Looking for frames...');
  const frames = page.frames();
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    console.log(`Frame ${i}: ${f.url()}`);
  }

  const canvasFrame = frames.find(f => f.url().includes('scf.usercontent.goog') || f.url().includes('blob:'));
  if (canvasFrame) {
    console.log('Found Canvas Frame:', canvasFrame.url());
    
    // Wait for frame content to be ready
    await canvasFrame.waitForLoadState('domcontentloaded').catch(() => {});
    await page.waitForTimeout(4000);

    const frameHtml = await canvasFrame.content();
    fs.writeFileSync('scripts/canvas_frame.html', frameHtml);
    console.log('Saved canvas_frame.html, length:', frameHtml.length);

    // Take screenshot of the frame element or page
    const frameEl = await page.$('iframe');
    if (frameEl) {
      await frameEl.screenshot({ path: 'scripts/canvas_frame_screen.png' });
      console.log('Saved canvas_frame_screen.png');
    }

    // Extract styles from inside the iframe
    const frameData = await canvasFrame.evaluate(() => {
      const styles = [];
      const fonts = new Set();
      const colors = new Set();
      const bgColors = new Set();
      
      const elements = Array.from(document.querySelectorAll('*'));
      for (const el of elements) {
        const s = window.getComputedStyle(el);
        if (s.fontFamily) fonts.add(s.fontFamily);
        if (s.color) colors.add(s.color);
        if (s.backgroundColor) bgColors.add(s.backgroundColor);
        
        if (el.children.length === 0 && el.innerText && el.innerText.trim()) {
          styles.push({
            tag: el.tagName,
            text: el.innerText.trim().slice(0, 100),
            className: el.className,
            fontFamily: s.fontFamily,
            fontSize: s.fontSize,
            fontWeight: s.fontWeight,
            lineHeight: s.lineHeight,
            letterSpacing: s.letterSpacing,
            color: s.color,
            backgroundColor: s.backgroundColor,
            borderRadius: s.borderRadius,
            border: s.border,
            boxShadow: s.boxShadow,
            padding: s.padding,
            margin: s.margin
          });
        }
      }

      // Check for <link> or <style> tags
      const headLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href);
      const styleTags = Array.from(document.querySelectorAll('style')).map(s => s.textContent.slice(0, 1000));

      return {
        title: document.title,
        bodyText: document.body.innerText,
        headLinks,
        styleTags,
        fonts: Array.from(fonts),
        colors: Array.from(colors),
        bgColors: Array.from(bgColors),
        elementsSample: styles.slice(0, 80)
      };
    });

    fs.writeFileSync('scripts/canvas_frame_data.json', JSON.stringify(frameData, null, 2));
    console.log('Saved scripts/canvas_frame_data.json');
  } else {
    console.log('Canvas frame not found!');
  }

  await browser.close();
}

main().catch(e => console.error(e));
