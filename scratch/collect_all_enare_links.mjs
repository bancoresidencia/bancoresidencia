
// Script completo para coletar todos os PDFs de provas e gabaritos do ENARE
// a partir do portal HU Brasil (gov.br/hubrasil)
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import https from 'https';
import fs from 'fs';
import path from 'path';

const BASE = 'https://www.gov.br/hubrasil/pt-br/ensino-e-pesquisa/exame-nacional-de-residencia-enare/edicoes-anteriores';
const EDITIONS = ['2021-2022', '2022-2023', '2023-2024', '2024-2025', '2025-2026', '2020-2021'];
const OUTPUT_DIR = 'd:/bancoresidencia/data/enare_pdfs';

mkdirSync(OUTPUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
});

const allLinks = {};

async function extractPDFLinks(page) {
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href]')).map(a => ({
      text: a.textContent.trim(),
      href: a.href
    }));
  });
  return links.filter(l => l.href.includes('.pdf'));
}

// Coleta links de uma página e suas subpáginas (provas section)
async function crawlEdition(edition) {
  const editionLinks = [];
  
  // Primeira: página de provas
  const provasUrl = `${BASE}/${edition}/provas`;
  const page = await ctx.newPage();
  
  try {
    console.log(`\n=== Edição ${edition} ===`);
    console.log(`Navegando para ${provasUrl}`);
    
    const resp = await page.goto(provasUrl, { waitUntil: 'networkidle', timeout: 20000 });
    if (resp.status() === 404) {
      console.log(`  404 - tentando URL alternativa`);
      // Tenta URL alternativa sem /provas
      await page.goto(`${BASE}/${edition}`, { waitUntil: 'networkidle', timeout: 15000 });
    }
    await page.waitForTimeout(1000);
    
    const links = await extractPDFLinks(page);
    console.log(`  Encontrados ${links.length} PDFs`);
    links.forEach(l => {
      console.log(`  - ${l.text.substring(0, 80)}`);
      editionLinks.push({ ...l, edition, section: 'provas' });
    });
    
  } catch(e) {
    console.log(`  ERRO na página de provas: ${e.message}`);
  }
  await page.close();
  
  // Segunda: página de gabaritos (se existir separada)
  const areas = ['area-medica', 'area-uni-e-multiprofissional'];
  for (const area of areas) {
    const areaPage = await ctx.newPage();
    try {
      const areaUrl = `${BASE}/${edition}/${area}`;
      await areaPage.goto(areaUrl, { waitUntil: 'networkidle', timeout: 15000 });
      await areaPage.waitForTimeout(500);
      const links = await extractPDFLinks(areaPage);
      const gabaritos = links.filter(l => 
        l.href.toLowerCase().includes('gabarito') || 
        l.text.toLowerCase().includes('gabarito')
      );
      if (gabaritos.length > 0) {
        console.log(`  [${area}] ${gabaritos.length} gabaritos encontrados`);
        gabaritos.forEach(l => {
          editionLinks.push({ ...l, edition, section: area });
        });
      }
    } catch(e) {
      // silencioso
    }
    await areaPage.close();
  }
  
  return editionLinks;
}

// Coleta todos os links
for (const edition of EDITIONS) {
  const links = await crawlEdition(edition);
  allLinks[edition] = links;
}

await browser.close();

// Salva todos os links encontrados
writeFileSync(`${OUTPUT_DIR}/all_links.json`, JSON.stringify(allLinks, null, 2));

// Resume links encontrados
console.log('\n\n=== RESUMO ===');
let totalLinks = 0;
for (const [edition, links] of Object.entries(allLinks)) {
  console.log(`\n${edition}: ${links.length} PDFs`);
  
  // Categoriza
  const provas = links.filter(l => 
    l.href.toLowerCase().includes('acesso-direto') ||
    l.text.toLowerCase().includes('acesso direto') ||
    l.href.toLowerCase().includes('prm-acesso') ||
    l.text.toLowerCase().includes('acesso direto')
  );
  const gabaritos = links.filter(l => 
    l.href.toLowerCase().includes('gabarito') ||
    l.text.toLowerCase().includes('gabarito')
  );
  
  console.log(`  - Gabaritos: ${gabaritos.length}`);
  console.log(`  - Provas Acesso Direto: ${provas.length}`);
  console.log(`  - Total PDFs: ${links.length}`);
  totalLinks += links.length;
}
console.log(`\nTotal geral: ${totalLinks} PDFs`);
console.log(`\nSalvo em ${OUTPUT_DIR}/all_links.json`);
