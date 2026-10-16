import https from 'https';
import fs from 'fs';
import path from 'path';

const outDir = 'data/official_exams/UNICAMP';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function fetchHtml(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects < 0) return reject(new Error('Too many redirects'));
    https.get(url, { rejectUnauthorized: false, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
        return fetchHtml(res.headers.location, maxRedirects - 1).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { rejectUnauthorized: false, headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', err => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function main() {
  console.log('================================================================');
  console.log('  COLETOR AUTOMÁTICO OFICIAL — UNICAMP (FCM)');
  console.log('================================================================');

  const pageUrl = 'https://portal.fcm.unicamp.br/provas-e-gabaritos/';
  const html = await fetchHtml(pageUrl);

  const pdfUrls = [];
  const regex = /href=["'](https?:\/\/[^"']+\.pdf)["']/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    pdfUrls.push(match[1]);
  }
  const uniqueUrls = Array.from(new Set(pdfUrls));
  console.log(`Encontrados ${uniqueUrls.length} links para PDFs oficiais.`);

  const targets = uniqueUrls.map(url => ({
    url,
    text: path.basename(url)
  }));

  console.log(`\nBaixando cadernos e gabaritos oficiais para ${outDir}...`);
  let downloaded = 0;
  let skipped = 0;

  for (const t of targets) {
    const rawName = path.basename(t.url);
    const dest = path.join(outDir, rawName);

    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      console.log(`  ⏩ Já existe: ${rawName}`);
      skipped++;
      continue;
    }

    try {
      console.log(`  ⬇️ Baixando: ${t.text} (${rawName})...`);
      await downloadFile(t.url, dest);
      const sz = (fs.statSync(dest).size / 1024).toFixed(1);
      console.log(`     ✅ Salvo: ${rawName} (${sz} KB)`);
      downloaded++;
    } catch (e) {
      console.log(`     ❌ Falha: ${rawName} -> ${e.message}`);
    }
  }

  console.log('\n================================================================');
  console.log(`Total baixados: ${downloaded} | Já existentes: ${skipped} | Total no diretório: ${fs.readdirSync(outDir).length}`);
  console.log('================================================================\n');
}

main().catch(console.error);
