
// Usa Playwright para navegar nas páginas do ENARE/HU Brasil e extrair links de PDFs de provas e gabaritos
import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const EDITION_URLS = [
  {
    year: '2021-2022',
    urls: [
      'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2021-2022',
      'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2021-2022/area-medica',
    ]
  },
  {
    year: '2022-2023',
    urls: [
      'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2022-2023',
      'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2022-2023/area-medica',
    ]
  },
  {
    year: '2023-2024',
    urls: [
      'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2023-2024',
      'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2023-2024/area-medica',
    ]
  },
  {
    year: '2024-2025',
    urls: [
      'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2024-2025',
      'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores/2024-2025/area-medica',
      'https://enare.ebserh.gov.br',
      // FGV (organizadora 2024/2025)
      'https://conhecimento.fgv.br/concursos/enare24',
    ]
  }
];

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
});

const allLinks = {};

function isPDFLink(href, text) {
  if (!href) return false;
  const hrefLower = href.toLowerCase();
  const textLower = (text || '').toLowerCase();
  const isPdf = hrefLower.includes('.pdf');
  const isRelevant = 
    textLower.includes('prova') || 
    textLower.includes('gabarito') || 
    textLower.includes('caderno') || 
    textLower.includes('questão') ||
    textLower.includes('questoes') ||
    hrefLower.includes('prova') || 
    hrefLower.includes('gabarito') || 
    hrefLower.includes('caderno');
  return isPdf && isRelevant;
}

for (const edition of EDITION_URLS) {
  allLinks[edition.year] = [];
  for (const url of edition.urls) {
    console.log(`\nNavegando: ${url}`);
    const page = await ctx.newPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(2000);
      
      // Extrai todos os links
      const links = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a[href]'));
        return anchors.map(a => ({
          text: a.textContent.trim(),
          href: a.href
        }));
      });
      
      // Filtra por relevantes
      const relevant = links.filter(l => isPDFLink(l.href, l.text));
      console.log(`  Encontrados ${relevant.length} links relevantes`);
      relevant.forEach(l => console.log(`  - [${l.text}] ${l.href}`));
      
      allLinks[edition.year].push(...relevant);
      
      // Também pega texto da página
      const title = await page.title();
      console.log(`  Título: ${title}`);
      
    } catch(e) {
      console.log(`  ERRO: ${e.message}`);
    }
    await page.close();
  }
}

await browser.close();

// Deduplica
for (const year of Object.keys(allLinks)) {
  const seen = new Set();
  allLinks[year] = allLinks[year].filter(l => {
    if (seen.has(l.href)) return false;
    seen.add(l.href);
    return true;
  });
}

writeFileSync('d:/bancoresidencia/data/enare_pdf_links.json', JSON.stringify(allLinks, null, 2));
console.log('\n\nLINKS ENCONTRADOS POR ANO:');
for (const [year, links] of Object.entries(allLinks)) {
  console.log(`\n${year}: ${links.length} links`);
  links.forEach(l => console.log(`  [${l.text}] ${l.href}`));
}
console.log('\nSalvo em data/enare_pdf_links.json');
