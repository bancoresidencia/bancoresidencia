import fs from 'fs';
import path from 'path';

const outDir = 'd:/bancoresidencia/public/images/questoes/ginecologia';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const list = JSON.parse(fs.readFileSync('d:/bancoresidencia/data/ginecologia_image_attachments.json', 'utf8'));
console.log(`Total de imagens para verificar/baixar: ${list.length}`);

// Unique URLs
const uniqueUrls = new Map();
list.forEach(item => {
  if (item.url && !uniqueUrls.has(item.url)) {
    uniqueUrls.set(item.url, item);
  }
});
console.log(`Imagens únicas: ${uniqueUrls.size}`);

async function downloadImage(url, filename, attempt = 1) {
  const filePath = path.join(outDir, filename);
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 100) {
    return true; // Already downloaded
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    return true;
  } catch (err) {
    if (attempt < 3) {
      await new Promise(r => setTimeout(r, 1000));
      return downloadImage(url, filename, attempt + 1);
    }
    console.error(`Falha ao baixar imagem: ${url} - ${err.message}`);
    return false;
  }
}

async function main() {
  const entries = Array.from(uniqueUrls.entries());
  const CONCURRENCY = 10;
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < entries.length; i += CONCURRENCY) {
    const batch = entries.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(async ([url, item]) => {
      // Create a deterministic safe filename from URL
      const urlObj = new URL(url);
      const ext = path.extname(urlObj.pathname) || '.webp';
      const cleanName = path.basename(urlObj.pathname).replace(/[^a-zA-Z0-9._-]/g, '_');
      const filename = `${cleanName.endsWith(ext) ? cleanName : cleanName + ext}`;
      
      const ok = await downloadImage(url, filename);
      if (ok) successCount++;
      else failCount++;
    }));

    if ((i + CONCURRENCY) % 50 === 0 || i + CONCURRENCY >= entries.length) {
      console.log(`Download: ${Math.min(i + CONCURRENCY, entries.length)}/${entries.length} imagens processadas.`);
    }
  }

  console.log(`✅ Imagens concluídas! Sucessos: ${successCount}, Falhas: ${failCount}`);
}

main().catch(console.error);
