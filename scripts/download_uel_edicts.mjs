import fs from 'fs';
import https from 'https';
import path from 'path';

const cops = JSON.parse(fs.readFileSync('data/cops_uel_residencia_all.json', 'utf8'));

if (!fs.existsSync('data/uel_pdfs')) {
  fs.mkdirSync('data/uel_pdfs', { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode} para ${url}`));
      }
      const chunks = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        fs.writeFileSync(dest, buf);
        resolve(buf.length);
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Iniciando download dos editais da UEL...');
  for (const sel of cops) {
    if (!sel.docs || sel.docs.length === 0) continue;
    const ano = sel.title.match(/\d{4}/)?.[0] || sel.id;
    for (let i = 0; i < sel.docs.length; i++) {
      const doc = sel.docs[i];
      const filename = `UEL_${ano}_doc_${i+1}.pdf`;
      const dest = path.join('data/uel_pdfs', filename);
      if (fs.existsSync(dest)) {
        console.log(`  Já existe: ${filename}`);
        continue;
      }
      try {
        console.log(`  Baixando ${filename} (${doc.docTitle})...`);
        const size = await download(doc.link, dest);
        console.log(`   Salvo: ${size} bytes`);
      } catch (err) {
        console.error(`  Erro ao baixar ${filename}:`, err.message);
      }
    }
  }
  console.log('Download concluído!');
}

run().catch(console.error);
