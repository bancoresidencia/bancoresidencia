import fs from 'fs';
import path from 'path';

const outDir = path.resolve('data/official_exams/AMP_PARANA');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const downloads = [
  { name: 'AMP_2026_PROVA_GERAL.pdf', url: 'https://cms.amp.org.br/arquivos/bibliotecaarquivos/prova-geral_1793579147.pdf' },
  { name: 'AMP_2026_PROVA_CLINICA_MEDICA.pdf', url: 'https://cms.amp.org.br/arquivos/bibliotecaarquivos/clinica-medica_1793579243.pdf' },
  { name: 'AMP_2026_PROVA_ENDOSCOPIA.pdf', url: 'https://cms.amp.org.br/arquivos/bibliotecaarquivos/endoscopia_1793579281.pdf' },
  { name: 'AMP_2026_PROVA_MASTOLOGIA.pdf', url: 'https://cms.amp.org.br/arquivos/bibliotecaarquivos/mastologia_1793579321.pdf' },
  { name: 'AMP_2026_PROVA_PEDIATRIA.pdf', url: 'https://cms.amp.org.br/arquivos/bibliotecaarquivos/pediatria_1793579357.pdf' },
  { name: 'AMP_2026_PROVA_CIRURGIA_GERAL.pdf', url: 'https://cms.amp.org.br/arquivos/bibliotecaarquivos/cirurgia-geral_1793579395.pdf' },
  { name: 'AMP_2026_GABARITOS_OFICIAIS.pdf', url: 'https://cms.amp.org.br/arquivos/bibliotecaarquivos/gabaritos-prova-geral-e-provas-especificas-_1793579535.pdf' }
];

async function run() {
  for (const item of downloads) {
    const dest = path.join(outDir, item.name);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 10000) {
      console.log(`Already exists: ${item.name} (${(fs.statSync(dest).size / 1024).toFixed(1)} KB)`);
      continue;
    }
    console.log(`Downloading ${item.name} from ${item.url}...`);
    try {
      const res = await fetch(item.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      if (!res.ok) {
        console.error(`Failed ${item.name}: HTTP ${res.status}`);
        continue;
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buffer);
      console.log(`Saved ${item.name} (${(buffer.length / 1024).toFixed(1)} KB)`);
    } catch (e) {
      console.error(`Error downloading ${item.name}:`, e.message);
    }
  }
  console.log('Download complete.');
}

run();
