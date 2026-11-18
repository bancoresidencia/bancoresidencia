import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36'
  });

  const urls = [
    'https://med.estrategia.com/portal/eventos/gabarito-recursos-sirio-libanes-2025/',
    'https://med.estrategia.com/portal/noticias/gabarito-recursos-sirio-libanes-2024/'
  ];

  for (const url of urls) {
    console.log(`\n🔍 Acessando: ${url}...`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const info = await page.evaluate(() => {
        const title = document.title;
        const pdfs = Array.from(document.querySelectorAll('a'))
          .map(a => ({ text: a.innerText.trim(), href: a.href }))
          .filter(a => a.href.includes('.pdf') || a.href.includes('drive.google') || a.text.toLowerCase().includes('caderno') || a.text.toLowerCase().includes('prova') || a.text.toLowerCase().includes('gabarito'));
        return { title, pdfs };
      });
      console.log(`Título: ${info.title}`);
      console.log(`Links relevantes: ${info.pdfs.length}`);
      for (const p of info.pdfs) {
        console.log(`  📄 ${p.text} -> ${p.href}`);
      }
    } catch(e) {
      console.log('Erro:', e.message);
    }
  }

  await browser.close();
}

main();
