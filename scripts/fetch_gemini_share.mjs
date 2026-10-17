import { chromium } from 'playwright';
import fs from 'fs';

const CHROME_USER_DATA = 'C:\\Users\\cnath\\AppData\\Local\\Google\\Chrome\\User Data';
const TARGET_URL = 'https://share.gemini.google/NpwDIY8cQMXc';
const profiles = ['Default', 'Profile 1', 'Profile 8', 'Profile 9'];

async function tryFetch() {
  for (const prof of profiles) {
    console.log(`Testing profile: ${prof}`);
    try {
      const context = await chromium.launchPersistentContext(CHROME_USER_DATA, {
        channel: 'chrome',
        headless: true,
        args: [`--profile-directory=${prof}`]
      });

      const page = context.pages()[0] || await context.newPage();
      await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(4000);

      const url = page.url();
      const title = await page.title();
      console.log(`URL: ${url}`);
      console.log(`Title: ${title}`);

      if (!url.includes('signin') && !url.includes('ServiceLogin')) {
        console.log(`SUCCESS! Authenticated in profile ${prof}`);
        
        // Take screenshot
        await page.screenshot({ path: 'scripts/gemini_share_captured.png', fullPage: true });
        
        // Extract conversation text and content
        const data = await page.evaluate(() => {
          return {
            title: document.title,
            bodyText: document.body.innerText,
            fontFamily: window.getComputedStyle(document.body).fontFamily,
            h1Font: document.querySelector('h1') ? window.getComputedStyle(document.querySelector('h1')).fontFamily : null,
            preFont: document.querySelector('pre') ? window.getComputedStyle(document.querySelector('pre')).fontFamily : null,
            html: document.body.innerHTML.slice(0, 100000)
          };
        });

        fs.writeFileSync('scripts/gemini_share_data.json', JSON.stringify(data, null, 2));
        await context.close();
        return;
      }

      await context.close();
    } catch (e) {
      console.log(`Failed for ${prof}: ${e.message}`);
    }
  }
}

tryFetch();
