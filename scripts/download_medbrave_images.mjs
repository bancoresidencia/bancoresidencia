import fs from 'fs';
import path from 'path';

const QUESTIONS_FILE = path.join(process.cwd(), 'data', 'medbrave_questions_clean.json');
const IMAGES_DIR = path.join(process.cwd(), 'data', 'medbrave_images');

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

async function main() {
  console.log('===============================================================');
  console.log('🖼️ DOWNLOADER DE IMAGENS MEDBRAVE PARA ARMAZENAMENTO LOCAL');
  console.log('===============================================================');

  if (!fs.existsSync(QUESTIONS_FILE)) {
    console.error(`Arquivo ${QUESTIONS_FILE} não encontrado.`);
    process.exit(1);
  }

  const qs = JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf8'));
  const urlsToDownload = new Map();

  for (const q of qs) {
    const textToCheck = (q.statement || '') + ' ' + (q.alternatives || []).map(a => a.text).join(' ');
    const matches = textToCheck.match(/src=["']([^"']+)["']/g) || [];
    for (const m of matches) {
      const u = m.replace(/^src=["']|["']$/g, '');
      if (u.startsWith('http')) {
        const ext = path.extname(new URL(u).pathname) || '.jpg';
        const filename = `${q.id}_${urlsToDownload.size}${ext}`;
        urlsToDownload.set(u, filename);
      }
    }
  }

  console.log(`📊 Total de URLs de imagens únicas mapeadas: ${urlsToDownload.size.toLocaleString('pt-BR')}`);
  console.log(`📁 Pasta de destino: ${IMAGES_DIR}`);

  const queue = Array.from(urlsToDownload.entries());
  const CONCURRENCY = 10;
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < queue.length; i += CONCURRENCY) {
    const chunk = queue.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map(async ([url, filename]) => {
      const destPath = path.join(IMAGES_DIR, filename);
      if (fs.existsSync(destPath)) {
        skipped++;
        return;
      }

      try {
        const res = await fetch(url);
        if (res.ok) {
          const buffer = Buffer.from(await res.arrayBuffer());
          fs.writeFileSync(destPath, buffer);
          downloaded++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }));

    if ((i + CONCURRENCY) % 100 === 0 || i + CONCURRENCY >= queue.length) {
      const total = downloaded + skipped;
      const pct = ((total / queue.length) * 100).toFixed(1);
      console.log(`[${pct}%] ${total}/${queue.length} | Baixadas: ${downloaded} | Já existiam: ${skipped} | Falhas: ${failed}`);
    }
  }

  console.log('\n===============================================================');
  console.log('✅ DOWNLOAD DE IMAGENS CONCLUÍDO!');
  console.log(`📁 Total de arquivos salvos: ${downloaded + skipped}`);
  console.log('===============================================================\n');
}

main().catch(console.error);
