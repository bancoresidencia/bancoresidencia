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

async function scrapeSelectingPortal() {
  console.log('========================================================================');
  console.log('🎯 SELECTING CONCURSOS: PORTAL DOS EDITAIS (DOWNLOAD RESIDÊNCIAS)');
  console.log('========================================================================\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });

  // Editais médicos de residência da Selecting Concursos
  const targetEditais = [12, 18, 19, 21, 23, 24, 31, 32, 33, 34, 41, 42, 43, 44, 45, 46, 47];
  let totalDownloaded = 0;

  for (const id of targetEditais) {
    const url = `https://portal.concursos.selecting.com.br/edital/ver/${id}`;
    console.log(`\n🔍 Acessando: ${url}...`);

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1000);

      const pageInfo = await page.evaluate(() => {
        const text = document.body.innerText;
        let title = 'Desconhecido';
        if (text.includes('INFORMAÇÕES')) {
          const parts = text.split('INFORMAÇÕES');
          title = parts[1].split('INSCRIÇÕES')[0].replace(/\n+/g, ' -- ').trim().slice(0, 80);
        }
        const docs = [];
        document.querySelectorAll('tr, .list-group-item, .card, div').forEach(el => {
          const a = el.querySelector('a');
          if (a && a.href && (a.href.includes('arquivo.php') || a.href.includes('.pdf'))) {
            const text = el.innerText.replace(/\s+/g, ' ').trim();
            docs.push({ text, href: a.href });
          }
        });
        return { title, docs };
      });

      console.log(`📌 [Edital ${id}] Instituição: ${pageInfo.title}`);

      // Deduplica por href
      const uniqueDocs = [];
      const seenHref = new Set();
      for (const d of pageInfo.docs) {
        if (!seenHref.has(d.href)) {
          seenHref.add(d.href);
          uniqueDocs.push(d);
        }
      }

      // Filtra estritamente Provas e Gabaritos
      const relevantDocs = uniqueDocs.filter(d => {
        const lower = d.text.toLowerCase();
        const isExamOrKey = (lower.includes('prova') || lower.includes('caderno') || lower.includes('carderno') || lower.includes('gabarito')) &&
          !lower.includes('convoca') && !lower.includes('local') && !lower.includes('espelho') && !lower.includes('matricula') && !lower.includes('entrevista') && !lower.includes('horario');
        return isExamOrKey;
      });

      console.log(`   Provas e Gabaritos relevantes encontrados: ${relevantDocs.length}`);

      if (relevantDocs.length > 0) {
        const targetDir = path.resolve(`data/incoming_exams/Selecting_${id}`);
        fs.mkdirSync(targetDir, { recursive: true });

        for (const doc of relevantDocs) {
          const lower = doc.text.toLowerCase();
          let prefix = 'DOC_';
          if (lower.includes('prova') || lower.includes('caderno') || lower.includes('carderno')) {
            prefix = 'PV_';
          } else if (lower.includes('gabarito')) {
            prefix = 'GB_';
          }

          const baseClean = sanitizeName(doc.text);
          const fileName = `${prefix}Edital${id}_${baseClean}.pdf`;
          const dest = path.join(targetDir, fileName);

          if (!fs.existsSync(dest) || fs.statSync(dest).size < 1000) {
            console.log(`     ⬇️ Baixando: ${fileName}...`);
            try {
              await downloadFile(doc.href, dest);
              const size = fs.statSync(dest).size;
              if (size > 5000) {
                console.log(`     ✅ Salvo com sucesso (${(size/1024).toFixed(1)} KB)`);
                totalDownloaded++;
              } else {
                try { fs.unlinkSync(dest); } catch(e){}
              }
            } catch (e) {
              console.log(`     ⚠️ Erro no download: ${e.message}`);
            }
          } else {
            console.log(`     ⚡ Já existente: ${fileName} (${(fs.statSync(dest).size/1024).toFixed(1)} KB)`);
          }
        }
      }
    } catch (e) {
      console.log(`   ⚠️ Erro ao processar Edital ${id}: ${e.message}`);
    }
  }

  await browser.close();
  console.log(`\n========================================================================`);
  console.log(`🏁 Download da Selecting concluído! Total novos PDFs: ${totalDownloaded}`);
  console.log(`========================================================================\n`);
}

scrapeSelectingPortal();
