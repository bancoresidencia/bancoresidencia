import { chromium } from 'playwright';
import fs from 'fs';

const SPECIALTY_NAMES = [
  'Ginecologia',
  'Obstetrícia',
  'Clínica Médica',
  'Cirurgia',
  'Medicina Preventiva e Social',
  'Pediatria',
  'Oftalmologia',
  'StudyLab'
];

async function main() {
  console.log('===============================================================');
  console.log('📊 MAPEANDO TODAS AS ÁREAS E MATERIAIS DE APOIO DO MEDEVO');
  console.log('===============================================================\n');

  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('medevo.com.br'));

  if (!page) {
    console.error('❌ Aba MedEvo não encontrada.');
    process.exit(1);
  }

  const overview = {
    total_materiais: 0,
    total_temas_geral: 0,
    especialidades: {}
  };

  for (const specName of SPECIALTY_NAMES) {
    console.log(`\n🔍 Navegando para especialidade: [${specName}]...`);

    // Vai para a raiz
    await page.goto('https://www.medevo.com.br/material-apoio', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);

    // Clica no botão exato da especialidade
    const clicked = await page.evaluate((name) => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find(b => b.innerText.trim() === name);
      if (target) {
        target.click();
        return true;
      }
      return false;
    }, specName);

    if (!clicked) {
      console.log(`   ⚠️ Botão "${specName}" não encontrado.`);
      continue;
    }

    await page.waitForTimeout(2000);

    // Extrai temas e contagens
    const specData = await page.evaluate((specName) => {
      const cards = Array.from(document.querySelectorAll('button, div, a')).filter(el => {
        const text = el.innerText || '';
        return text.includes('materiais') || text.includes('material');
      });

      const seen = new Set();
      const temas = [];

      for (const c of cards) {
        const lines = c.innerText.trim().split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length >= 2 && (lines[1].includes('material') || lines[1].includes('materiais'))) {
          const key = lines[0];
          if (!seen.has(key)) {
            seen.add(key);
            const count = parseInt(lines[1].match(/\d+/)?.[0] || '0', 10);
            temas.push({ tema: key, count, raw: lines[1] });
          }
        }
      }

      // Amostra de links diretos de materiais (se houver)
      const directLinks = Array.from(document.querySelectorAll('a[href*="/material-apoio/ler/"]')).map(a => ({
        title: a.innerText.trim(),
        url: a.href,
        id: a.href.split('/').pop()
      }));

      const totalMaterialsInSpec = temas.reduce((acc, t) => acc + t.count, 0);

      return {
        especialidade: specName,
        total_materiais: totalMaterialsInSpec,
        total_temas: temas.length,
        temas,
        directLinksSample: directLinks
      };
    }, specName);

    overview.especialidades[specName] = specData;
    overview.total_materiais += specData.total_materiais;
    overview.total_temas_geral += specData.total_temas;

    console.log(`   ✅ ${specName}: ${specData.total_temas} temas mapeados | Total: ${specData.total_materiais} materiais.`);
  }

  // Retorna para a página principal
  await page.goto('https://www.medevo.com.br/material-apoio', { waitUntil: 'domcontentloaded' });

  console.log('\n===============================================================');
  console.log(`🎉 MAPEAMENTO DE TODAS AS ÁREAS CONCLUÍDO COM SUCESSO!`);
  console.log(`TOTAL DE TEMAS: ${overview.total_temas_geral}`);
  console.log(`TOTAL GERAL DE MATERIAIS DE APOIO: ${overview.total_materiais}`);
  console.log('===============================================================\n');

  fs.writeFileSync('data/medevo_material_apoio_full_manifest.json', JSON.stringify(overview, null, 2), 'utf8');
  console.log('📁 Salvo com sucesso em: data/medevo_material_apoio_full_manifest.json');
}

main().catch(err => {
  console.error('❌ Erro no mapeamento:', err);
});
