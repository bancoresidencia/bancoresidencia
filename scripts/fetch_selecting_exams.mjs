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

function sanitizeName(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_\-\.]/g, '_').slice(0, 80);
}

async function scrapeSelecting() {
  console.log('========================================================================');
  console.log('🎯 SELECTING CONCURSOS: VARREDURA DIRETA DE EDITAIS E CADERNOS OFICIAIS');
  console.log('========================================================================\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });

  const editalIds = [12, 13, 14, 18, 19, 20, 31, 35, 36, 41, 42, 43, 44, 45];
  let totalDownloaded = 0;

  for (const id of editalIds) {
    const url = `https://concursos.selecting.com.br/informacoes/${id}/`;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1000);

      const editalData = await page.evaluate(() => {
        const titleEl = document.querySelector('h1, h2, h3, .panel-title, .title, strong');
        const title = titleEl ? titleEl.innerText.trim() : document.title;
        const docs = [];
        document.querySelectorAll('tr, .list-group-item, li').forEach(el => {
          const a = el.querySelector('a');
          if (a && a.href && (a.href.includes('arquivo.php') || a.href.includes('.pdf'))) {
            const label = el.innerText.replace(/\s+/g, ' ').trim();
            docs.push({ label, href: a.href });
          }
        });
        return { title, docs };
      });

      console.log(`\n📌 [Edital ${id}] ${editalData.title.slice(0, 70)}`);
      console.log(`   Documentos encontrados: ${editalData.docs.length}`);

      const relevantDocs = editalData.docs.filter(d => {
        const lower = d.label.toLowerCase();
        return lower.includes('prova') || lower.includes('caderno') || lower.includes('gabarito') || lower.includes('resultado') || lower.includes('recurso');
      });

      console.log(`   Provas e Gabaritos identificados: ${relevantDocs.length}`);

      if (relevantDocs.length > 0) {
        const targetDir = path.resolve(`data/incoming_exams/Selecting_${id}`);
        fs.mkdirSync(targetDir, { recursive: true });

        for (const doc of relevantDocs) {
          const lower = doc.label.toLowerCase();
          let prefix = 'DOC_';
          if (lower.includes('prova') || lower.includes('caderno')) {
            prefix = 'PV_';
          } else if (lower.includes('gabarito') || lower.includes('resultado')) {
            prefix = 'GB_';
          }

          const baseClean = sanitizeName(doc.label);
          const fileName = `${prefix}Edital${id}_${baseClean}.pdf`;
          const dest = path.join(targetDir, fileName);

          if (!fs.existsSync(dest) || fs.statSync(dest).size < 1000) {
            console.log(`     ⬇️ Baixando: ${fileName}...`);
            try {
              await downloadFile(doc.href, dest);
              const size = fs.statSync(dest).size;
              if (size > 10000) {
                console.log(`     ✅ Salvo com sucesso (${(size/1024).toFixed(1)} KB)`);
                totalDownloaded++;
              } else {
                fs.unlinkSync(dest);
              }
            } catch (e) {
              console.log(`     ⚠️ Erro ao baixar ${fileName}: ${e.message}`);
            }
          } else {
            console.log(`     ⚡ Já existente: ${fileName} (${(fs.statSync(dest).size/1024).toFixed(1)} KB)`);
          }
        }
      }
    } catch (e) {
      console.log(`   ⚠️ Erro ao acessar Edital ${id}: ${e.message}`);
    }
  }

  await browser.close();
  console.log(`\n🏁 Varredura da Selecting Concursos concluída! Total novos arquivos baixados: ${totalDownloaded}`);
}

scrapeSelecting();
