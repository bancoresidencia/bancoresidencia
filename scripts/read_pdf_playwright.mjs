import { chromium } from 'playwright';
import path from 'path';

async function readPdf() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const pdfPath = 'file:///' + path.resolve('data/official_exams/UNICAMP/UNICAMP_2026_GABARITO_DEFINITIVO.pdf').replace(/\\/g, '/');
  console.log('Abrindo:', pdfPath);
  
  await page.goto(pdfPath, { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  
  const text = await page.evaluate(() => document.body.innerText);
  console.log('Texto extraído (tamanho):', text.length);
  console.log('Trecho inicial:');
  console.log(text.slice(0, 1000));
  
  await browser.close();
}

readPdf().catch(console.error);
