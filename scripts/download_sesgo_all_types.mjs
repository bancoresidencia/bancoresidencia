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

function sanitize(name) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_\-\.]/g, '_').slice(0, 80);
}

async function main() {
  console.log('========================================================================');
  console.log('📥 DOWNLOAD COMPLETO: SES-GO 2026 (INSTITUTO VERBENA / UFG)');
  console.log('========================================================================\n');

  const targetDir = path.resolve('data/incoming_exams/SES_GO_2026');
  fs.mkdirSync(targetDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  const url = 'https://sistemas.institutoverbena.ufg.br/2026/coreme-ses/sistema/provas_gabaritos/Provas_gabaritos_finais_COREME_SES-2026-%23%24%23%24R.html';
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const items = await page.evaluate(() => {
    const res = [];
    document.querySelectorAll('a').forEach(a => {
      if (a.href && a.href.endsWith('.pdf')) {
        res.push({ text: a.innerText.replace(/\s+/g, ' ').trim(), href: a.href });
      }
    });
    return res;
  });

  console.log(`Encontrados ${items.length} PDFs oficiais de SES-GO 2026.\n`);

  let count = 0;
  for (const item of items) {
    const isProva = item.href.includes('/provas/');
    const isGabarito = item.href.includes('/gabaritos_finais/');
    const prefix = isProva ? 'PV_' : (isGabarito ? 'GB_' : 'DOC_');

    const cleanBase = sanitize(item.text);
    // Extrai tipo/versão se houver na URL
    const urlDec = decodeURIComponent(item.href);
    let typeTag = '';
    const m = urlDec.match(/Tipo\s+([A-D])/i) || urlDec.match(/tipo\s+([A-D])/i);
    if (m) typeTag = `_VERSAO_${m[1].toUpperCase()}`;

    const fileName = `${prefix}SESGO_2026${typeTag}_${cleanBase}.pdf`;
    const dest = path.join(targetDir, fileName);

    if (!fs.existsSync(dest) || fs.statSync(dest).size < 1000) {
      console.log(`⬇️ [${++count}/${items.length}] Baixando: ${fileName}...`);
      try {
        await downloadFile(item.href, dest);
        const sz = fs.statSync(dest).size;
        console.log(`   ✅ Concluído (${(sz/1024).toFixed(1)} KB)`);
      } catch(e) {
        console.log(`   ⚠️ Erro: ${e.message}`);
      }
    } else {
      console.log(`⚡ Já existente: ${fileName}`);
    }
  }

  await browser.close();
  console.log('\n🏁 Todos os PDFs oficiais de SES-GO 2026 baixados com sucesso!');
}

main();
