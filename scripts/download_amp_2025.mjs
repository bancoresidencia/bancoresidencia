import fs from 'fs';
import path from 'path';

const outDir = path.resolve('data/official_exams/AMP_PARANA');

const downloads = [
  { name: 'AMP_2025_PROVA_GERAL.pdf', url: 'https://cms.amp.org.br/arquivos/bibliotecaarquivos/prova-geral_1762130132.pdf' },
  { name: 'AMP_2025_GABARITO_RETIFICADO.pdf', url: 'https://cms.amp.org.br/arquivos/bibliotecaarquivos/gabarito-oficial-retificado-2025_1762517847.pdf' }
];

async function run() {
  for (const item of downloads) {
    const dest = path.join(outDir, item.name);
    console.log(`Downloading ${item.name} from ${item.url}...`);
    try {
      const res = await fetch(item.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      if (!res.ok) {
        console.error(`Failed ${item.name}: HTTP ${res.status}`);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buf);
      console.log(`Saved ${item.name} (${(buf.length / 1024).toFixed(1)} KB)`);
    } catch (e) {
      console.error(`Error downloading ${item.name}:`, e.message);
    }
  }
}

run();
