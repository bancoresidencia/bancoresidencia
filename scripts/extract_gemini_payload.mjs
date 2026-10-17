import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('Navigating...');
  await page.goto('https://share.gemini.google/NpwDIY8cQMXc', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  const continueBtn = page.locator('button:has-text("Continue")').first();
  if (await continueBtn.isVisible()) {
    await continueBtn.click();
    await page.waitForTimeout(8000);
  }

  // Save the full HTML of the main page
  const fullHtml = await page.content();
  fs.writeFileSync('scripts/gemini_main_page.html', fullHtml);
  console.log('Saved main page HTML length:', fullHtml.length);

  // Search for any JavaScript objects containing the canvas code, App.jsx, styles, etc.
  const pageData = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script')).map(s => s.innerHTML);
    const codeMatches = [];

    for (const s of scripts) {
      if (s.includes('App.jsx') || s.includes('export default') || s.includes('lucide-react') || s.includes('tailwind') || s.includes('c9c54187d4dc')) {
        codeMatches.push(s.slice(0, 5000));
      }
    }

    return {
      codeMatches,
      windowKeys: Object.keys(window).filter(k => k.includes('WIZ') || k.includes('data') || k.includes('DATA') || k.includes('gemini') || k.includes('bard'))
    };
  });

  fs.writeFileSync('scripts/gemini_extracted_code.json', JSON.stringify(pageData, null, 2));
  console.log('Found code matches:', pageData.codeMatches.length);

  await browser.close();
}

main().catch(console.error);
