import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (const slug of ['HUB_16_RESIDENCIA', 'HUB_17_RESIDENCIA']) {
    const url = `https://www.cebraspe.org.br/concursos/${slug}`;
    console.log(`\n🔍 Acessando: ${url}...`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1500);
      const docs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a'))
          .map(a => ({ text: a.innerText.replace(/\s+/g, ' ').trim(), href: a.href }))
          .filter(d => d.href && (d.href.includes('.pdf') || d.text.toLowerCase().includes('prova') || d.text.toLowerCase().includes('gabarito')));
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
