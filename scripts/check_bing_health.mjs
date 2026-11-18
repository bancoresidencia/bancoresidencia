import { chromium } from 'playwright';

async function checkBingHealth() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.bing.com/search?q=medicina+residencia+cardiologia', { waitUntil: 'networkidle' });

  const title = await page.title();
  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 300));
  const isCaptcha = bodyText.includes('Verifique se você é humano') || bodyText.includes('captcha') || bodyText.includes('challenge');

  console.log('Bing Title:', title);
  console.log('Is Captcha:', isCaptcha);
  console.log('Body snippet:', bodyText.replace(/\n+/g, ' '));

  await browser.close();
}

checkBingHealth();
