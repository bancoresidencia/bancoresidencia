import https from 'https';
import fs from 'fs';
import path from 'path';

const outDir = 'data/official_exams/SURCE';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const downloads = [
  {
    url: 'https://www.resmedceara.ufc.br/ares/wp-content/uploads/2023/11/PROVA-ACESSO-DIRETO.pdf',
    filename: 'SURCE_2024_PROVA_ACESSO_DIRETO.pdf'
  },
  {
    url: 'https://www.resmedceara.ufc.br/ares/wp-content/uploads/2023/11/GABARITO-FINAL-POS-RECURSO-ACESSO-DIRETO-2024.pdf',
    filename: 'SURCE_2024_GABARITO_DEFINITIVO.pdf'
  },
  {
    url: 'https://www.resmedceara.ufc.br/ares/wp-content/uploads/2022/11/PROVA-ACESSO-DIRETO.pdf',
    filename: 'SURCE_2023_PROVA_ACESSO_DIRETO.pdf'
  },
  {
    url: 'https://www.resmedceara.ufc.br/ares/wp-content/uploads/2022/11/GABARITO-FINAL-ACESSO-DIRETO-2023-corretiva.pdf',
    filename: 'SURCE_2023_GABARITO_DEFINITIVO.pdf'
  },
  {
    url: 'https://www.resmedceara.ufc.br/ares/wp-content/uploads/2021/11/PROVA-ACESSO-DIRETO.pdf',
    filename: 'SURCE_2022_PROVA_ACESSO_DIRETO.pdf'
  },
  {
    url: 'https://www.resmedceara.ufc.br/ares/wp-content/uploads/2021/11/GABARITO-ACESSO-DIRETO-2022.pdf',
    filename: 'SURCE_2022_GABARITO_DEFINITIVO.pdf'
  }
];

function download(item) {
  return new Promise((resolve, reject) => {
    const dest = path.join(outDir, item.filename);
    const stream = fs.createWriteStream(dest);
    https.get(item.url, { rejectUnauthorized: false, headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed ${item.url}: HTTP ${res.statusCode}`));
      }
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        console.log(`✅ [SURCE] Baixado: ${item.filename} (${fs.statSync(dest).size} bytes)`);
        resolve();
      });
    }).on('error', err => reject(err));
  });
}

async function main() {
  for (const item of downloads) {
    try {
      await download(item);
    } catch (err) {
      console.error(`❌ Erro em ${item.filename}:`, err.message);
    }
  }
}

main();
