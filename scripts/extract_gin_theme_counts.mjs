import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('medevo.com.br'));

  // Coleta os temas e contagens visíveis em Ginecologia
  const ginThemes = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('button, div, a')).filter(el => {
      const text = el.innerText || '';
      return text.includes('materiais') || text.includes('material');
    });
    
    // Mapeia texto único
    const seen = new Set();
    const results = [];
    for (const c of cards) {
      const lines = c.innerText.trim().split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length >= 2 && (lines[1].includes('material') || lines[1].includes('materiais'))) {
        const key = lines[0];
        if (!seen.has(key)) {
          seen.add(key);
          const count = parseInt(lines[1].match(/\d+/)?.[0] || '0', 10);
          results.push({ tema: key, count, raw: lines[1] });
        }
      }
    }
    return results;
  });

  console.log(`Ginecologia: ${ginThemes.length} temas encontrados.`);
  const totalGin = ginThemes.reduce((acc, t) => acc + t.count, 0);
  console.log(`Total de materiais em Ginecologia: ${totalGin}`);
  console.log(ginThemes);
}

main().catch(console.error);
