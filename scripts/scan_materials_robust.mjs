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

    // Recarrega a URL raiz para garantir estado limpo do React
    await page.goto('https://www.medevo.com.br/material-apoio', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Clica no botão exato usando localizador do Playwright
    const btn = page.locator('button.material-library-item').filter({ hasText: specName }).first();
    const count = await btn.count();
    
    if (count === 0) {
      // Tenta localizar por texto simples em qualquer botão
      const anyBtn = page.locator('button').filter({ hasText: specName }).first();
      if (await anyBtn.count() > 0) {
        await anyBtn.click();
      } else {
        console.log(`   ⚠️ Botão "${specName}" não encontrado.`);
        continue;
      }
    } else {
      await btn.click();
    }

    await page.waitForTimeout(2000);

    // Extrai temas e contagens
    const specData = await page.evaluate((name) => {
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
            const num = parseInt(lines[1].match(/\d+/)?.[0] || '0', 10);
            temas.push({ tema: key, count: num, raw: lines[1] });
          }
        }
      }

      const totalMaterialsInSpec = temas.reduce((acc, t) => acc + t.count, 0);

      return {
        especialidade: name,
        total_materiais: totalMaterialsInSpec,
        total_temas: temas.length,
        temas
      };
    }, specName);

    overview.especialidades[specName] = specData;
    overview.total_materiais += specData.total_materiais;
    overview.total_temas_geral += specData.total_temas;

    console.log(`   ✅ ${specName}: ${specData.total_temas} temas | ${specData.total_materiais} materiais de apoio.`);
  }

  // Volta à página inicial
  await page.goto('https://www.medevo.com.br/material-apoio', { waitUntil: 'domcontentloaded' });

  console.log('\n===============================================================');
  console.log(`🎉 MAPEAMENTO DE TODAS AS ÁREAS CONCLUÍDO COM SUCESSO!`);
  console.log(`TOTAL DE TEMAS CATALOGADOS: ${overview.total_temas_geral}`);
  console.log(`TOTAL GERAL DE MATERIAIS DE APOIO: ${overview.total_materiais}`);
  console.log('===============================================================\n');

  fs.writeFileSync('data/medevo_material_apoio_full_manifest.json', JSON.stringify(overview, null, 2), 'utf8');
}

main().catch(console.error);
