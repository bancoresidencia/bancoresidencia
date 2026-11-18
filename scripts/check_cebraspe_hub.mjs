import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (const slug of ['HUB_16_RESIDENCIA', 'HUB_17_RESIDENCIA']) {
    const url = `https://www.cebraspe.org.br/residencias/${slug}`;
    console.log(`\n🔍 Acessando: ${url}...`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const docs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a'))
          .map(a => ({ text: a.innerText.replace(/\s+/g, ' ').trim(), href: a.href }))
          .filter(d => d.text.toLowerCase().includes('prova') || d.text.toLowerCase().includes('caderno') || d.text.toLowerCase().includes('gabarito') || d.href.includes('.pdf'));
      });
      console.log(`Documentos encontrados em ${slug}: ${docs.length}`);
      for (const d of docs) {
        if (d.text.toLowerCase().includes('prova') || d.text.toLowerCase().includes('gabarito')) {
          console.log(`  📄 ${d.text} -> ${d.href}`);
        }
      }
    } catch(e) {
      console.log(`Erro em ${slug}: ${e.message}`);
    }
  }

  await browser.close();
}

main();
