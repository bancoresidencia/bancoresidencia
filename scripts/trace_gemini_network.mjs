import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const requests = [];
  const responses = [];

  page.on('request', req => {
    requests.push({ url: req.url(), method: req.method(), resourceType: req.resourceType() });
  });

  page.on('response', async resp => {
    const url = resp.url();
    const status = resp.status();
    let body = '';
    if (url.includes('batchexecute') || url.includes('BardChatUi') || url.includes('share') || url.includes('canvas') || url.includes('artifacts') || url.includes('stream')) {
      try {
        body = await resp.text();
      } catch (e) {}
    }
    responses.push({ url, status, bodyLength: body.length, bodySnippet: body.slice(0, 1000) });
  });

  console.log('Navigating to Gemini share...');
  await page.goto('https://share.gemini.google/NpwDIY8cQMXc', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  const continueBtn = page.locator('button:has-text("Continue")').first();
  if (await continueBtn.isVisible()) {
    console.log('Clicking Continue...');
    await continueBtn.click();
    await page.waitForTimeout(10000);
  }

  fs.writeFileSync('scripts/network_trace.json', JSON.stringify({ requests, responses }, null, 2));
  console.log('Trace saved, total requests:', requests.length, 'responses:', responses.length);

  await browser.close();
}

main().catch(console.error);
