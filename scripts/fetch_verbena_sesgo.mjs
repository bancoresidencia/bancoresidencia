import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 Chrome/124' }, rejectUnauthorized: false, timeout: 30000 }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const stream = fs.createWriteStream(destPath);
      res.pipe(stream);
      stream.on('finish', () => { stream.close(); resolve(true); });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function sanitizeName(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_\-\.]/g, '_').slice(0, 80);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  const targetDir = path.resolve('data/incoming_exams/SES_GO');
  fs.mkdirSync(targetDir, { recursive: true });

  for (const year of ['2026', '2025', '2024']) {
    const url = `https://sistemas.institutoverbena.ufg.br/${year}/coreme-ses/`;
    console.log(`\n🔍 Acessando: ${url}...`);

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      console.log(`📌 Título: ${await page.title()}`);

      const docs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a'))
          .map(a => ({ text: a.innerText.replace(/\s+/g, ' ').trim(), href: a.href }))
          .filter(d => d.href && (d.href.includes('.pdf') || d.text.toLowerCase().includes('prova') || d.text.toLowerCase().includes('caderno') || d.text.toLowerCase().includes('gabarito')));
      });

      console.log(`   Documentos encontrados: ${docs.length}`);

      for (const d of docs) {
        const lower = d.text.toLowerCase();
        if ((lower.includes('prova') || lower.includes('caderno') || lower.includes('gabarito')) &&
            !lower.includes('convoca') && !lower.includes('resultado') && !lower.includes('local')) {
          
          let prefix = lower.includes('prova') || lower.includes('caderno') ? 'PV_' : 'GB_';
          const cleanName = `${prefix}SESGO_${year}_${sanitizeName(d.text)}.pdf`;
          const dest = path.join(targetDir, cleanName);

          console.log(`   📄 Documento relevante: ${d.text} -> ${d.href}`);

          if (!fs.existsSync(dest) || fs.statSync(dest).size < 1000) {
            console.log(`     ⬇️ Baixando: ${cleanName}...`);
            try {
              await downloadFile(d.href, dest);
              const sz = fs.statSync(dest).size;
              if (sz > 5000) {
                console.log(`     ✅ Salvo com sucesso (${(sz/1024).toFixed(1)} KB)`);
              } else {
                try { fs.unlinkSync(dest); } catch(e){}
              }
            } catch(e) {
              console.log(`     ⚠️ Erro: ${e.message}`);
            }
          } else {
            console.log(`     ⚡ Já existente: ${cleanName}`);
          }
        }
      }
    } catch(e) {
      console.log(`Erro ao acessar ano ${year}: ${e.message}`);
    }
  }

  await browser.close();
}

main();
