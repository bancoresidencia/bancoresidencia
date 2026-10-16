import https from 'https';
import fs from 'fs';
import path from 'path';

const outDir = 'data/official_exams/UNICAMP';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const filesToDownload = [
  {
    url: 'https://portal.fcm.unicamp.br/wp-content/uploads/sites/58/2026/03/AD-P2-para-publicar-1.pdf',
    filename: 'UNICAMP_2026_PROVA_ACESSO_DIRETO.pdf'
  },
  {
    url: 'https://portal.fcm.unicamp.br/wp-content/uploads/sites/58/2026/03/AD-prova-2-gabarito-1.pdf',
    filename: 'UNICAMP_2026_GABARITO_DEFINITIVO.pdf'
  }
];

function download(item) {
  return new Promise((resolve, reject) => {
    const dest = path.join(outDir, item.filename);
    const stream = fs.createWriteStream(dest);
    https.get(item.url, { rejectUnauthorized: false, headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        console.log(`✅ [UNICAMP] Baixado: ${item.filename} (${fs.statSync(dest).size} bytes)`);
        resolve();
      });
    }).on('error', err => reject(err));
  });
}

async function main() {
  for (const f of filesToDownload) {
    await download(f);
  }
}

main().catch(console.error);
