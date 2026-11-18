import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log("Acessando concursosfcc.com.br/concursoOutraSituacao.html...");
  try {
    await page.goto('https://www.concursosfcc.com.br/concursoOutraSituacao.html', { waitUntil: 'domcontentloaded', timeout: 20000 });
    const text = await page.evaluate(() => document.body.innerText);
    console.log("Página carregada, tamanho texto:", text.length);
    
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a'))
        .map(a => ({ text: a.innerText.trim(), href: a.href }))
        .filter(l => l.text.toLowerCase().includes('sírio') || l.text.toLowerCase().includes('sirio') || l.text.toLowerCase().includes('hsl') || l.text.toLowerCase().includes('residencia') || l.text.toLowerCase().includes('residência'));
    });
    console.log("Links Sírio-Libanês na FCC:", links.length);
    console.log(JSON.stringify(links, null, 2));
  } catch(e) {
    console.log("Erro:", e.message);
  }

  await browser.close();
}

main();
