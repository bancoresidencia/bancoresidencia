import fs from 'fs';
import path from 'path';

async function downloadAmp2024() {
  const dest = 'data/official_exams/AMP_PARANA/AMP_2024_PROVA_GERAL.pdf';
  const url = 'https://cms.amp.org.br/arquivos/bibliotecaarquivos/prova-geral_1730720350.pdf';

  console.log(`Downloading ${url}...`);
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) {
    console.error(`Failed: HTTP ${res.status}`);
    return;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  console.log(`Saved ${dest} (${(buf.length / 1024).toFixed(1)} KB)`);
}
downloadAmp2024();

