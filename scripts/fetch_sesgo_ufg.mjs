import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 Chrome/124' }, timeout: 30000 }, res => {
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

async function fetchSesGo() {
  console.log('========================================================================');
  console.log('🎯 BUSCANDO PROVA E GABARITO OFICIAL: SES-GO 2026 (CS UFG)');
  console.log('========================================================================\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });

  // 1. Busca na página de editais do CS UFG
  const targetUrls = [
    'https://centrodeselecao.ufg.br/residencia-medica',
    'https://sistemas.cs.ufg.br/inicio/concursos',
    'https://centrodeselecao.ufg.br/'
  ];

  let foundLinks = [];

  // Tenta também busca no Bing direcionada ao domínio cs.ufg.br
  const bingQuery = 'site:cs.ufg.br "SES-GO" 2026 (prova OR caderno OR gabarito)';
  console.log('🔎 Pesquisando no portal CS UFG:', bingQuery);
  try {
    await page.goto('https://www.bing.com/search?q=' + encodeURIComponent(bingQuery), { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const bLinks = await page.evaluate(() => {
      const links = [];
      document.querySelectorAll('a').forEach(a => {
        let h = a.href || '';
        if (h.includes('u=a1')) {
          try {
            const b64 = h.split('u=a1')[1].split('&')[0];
            const dec = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
            if (dec.startsWith('http')) h = dec;
          } catch(e){}
        }
        if (h.startsWith('http') && (h.includes('cs.ufg.br') || h.includes('.pdf'))) {
          links.push(h);
        }
      });
      return [...new Set(links)];
    });

    console.log(`Links CS UFG encontrados no Bing: ${bLinks.length}`);
    foundLinks.push(...bLinks);
  } catch(e) {
    console.log('Erro na busca Bing:', e.message);
  }

  // Se encontrou páginas de processo seletivo da SES-GO, entra nelas
  const targetDir = path.resolve('data/incoming_exams/SES_GO_2026');
  fs.mkdirSync(targetDir, { recursive: true });

  for (const pageUrl of foundLinks.slice(0, 6)) {
    console.log(`\n📄 Inspecionando página CS UFG: ${pageUrl}...`);
    try {
      await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1000);

      const docs = await page.evaluate(() => {
        const list = [];
        document.querySelectorAll('a').forEach(a => {
          if (a.href && (a.href.includes('.pdf') || a.innerText.toLowerCase().includes('prova') || a.innerText.toLowerCase().includes('gabarito'))) {
            list.push({ text: a.innerText.replace(/\s+/g, ' ').trim(), href: a.href });
          }
        });
        return list;
      });

      console.log(`   Documentos encontrados na página: ${docs.length}`);
      for (const d of docs) {
        const lower = d.text.toLowerCase();
        if (lower.includes('prova') || lower.includes('caderno') || lower.includes('gabarito')) {
          let prefix = lower.includes('prova') || lower.includes('caderno') ? 'PV_' : 'GB_';
          const cleanName = `${prefix}SESGO_2026_${d.text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 70)}.pdf`;
          const dest = path.join(targetDir, cleanName);

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
            } catch(err) {
              console.log(`     ⚠️ Erro: ${err.message}`);
            }
          } else {
            console.log(`     ⚡ Já existente: ${cleanName}`);
          }
        }
      }
    } catch(e) {}
  }

  await browser.close();
}

fetchSesGo();
