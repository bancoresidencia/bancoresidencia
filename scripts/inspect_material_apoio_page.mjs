import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('medevo.com.br'));

  if (!page) {
    console.log('Página medevo não encontrada');
    process.exit(1);
  }

  console.log('📌 Aba conectada:', page.url());

  // Inspeciona elementos na página material-apoio
  const analysis = await page.evaluate(() => {
    // Busca listas, links, cards, filtros de especialidades/temas
    const links = Array.from(document.querySelectorAll('a[href]')).map(a => ({
      text: a.innerText.trim(),
      href: a.href
    })).filter(l => l.text.length > 0);

    const cards = Array.from(document.querySelectorAll('[class*="card"], [class*="item"], [class*="material"], [role="button"], button')).map(el => ({
      text: el.innerText.trim(),
      tag: el.tagName
    })).filter(c => c.text.length > 0 && c.text.length < 200);

    // Inspeciona se há dados no __NEXT_DATA__ ou similar
    let nextData = null;
    const nextScript = document.getElementById('__NEXT_DATA__');
    if (nextScript) {
      try {
        nextData = JSON.parse(nextScript.innerText);
      } catch {}
    }

    // Pega títulos de seções visíveis
    const headers = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => h.innerText.trim());

    return {
      title: document.title,
      url: window.location.href,
      headers,
      linksSample: links.slice(0, 30),
      cardsSample: cards.slice(0, 30),
      totalLinks: links.length,
      hasNextData: !!nextData,
      nextDataPage: nextData ? nextData.page : null,
      nextDataKeys: nextData ? Object.keys(nextData.props || {}) : []
    };
  });

  console.log('--- ANÁLISE DO FRONTEND/BACKEND DO MATERIAL DE APOIO ---');
  console.log('Headers:', analysis.headers);
  console.log('Total de links encontrados:', analysis.totalLinks);
  console.log('Amostra de Links:', analysis.linksSample);
  console.log('Amostra de Cards/Botões:', analysis.cardsSample);
  
  fs.writeFileSync('scripts/medevo_material_apoio_analysis.json', JSON.stringify(analysis, null, 2), 'utf8');
}

main().catch(err => {
  console.error('Erro:', err);
});
