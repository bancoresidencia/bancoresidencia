import fs from 'fs';
import path from 'path';

async function downloadEdital42() {
  const r = await fetch('https://portal.concursos.selecting.com.br/edital/ver/42', { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await r.text();
  const files = [...html.matchAll(/arquivo\.php\?file=([^"']+)/g)].map(m => m[1]);
  const pMatches = [...html.matchAll(/<p[^>]*class="[^"]*text-uppercase[^"]*"[^>]*>([\s\S]*?)<\/p>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());

  const outDir = path.resolve('data/official_exams/HBO_BRASILIA');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (let i = 0; i < Math.min(files.length, pMatches.length); i++) {
    const label = pMatches[i];
    const fileUrl = 'https://concursos.selecting.com.br/arquivo.php?file=' + files[i];
    if (/gabarito|caderno|prova/i.test(label) && files[i].endsWith('.pdf')) {
      const fileName = label.replace(/[^a-zA-Z0-9_\-]/g, '_') + '.pdf';
      const outPath = path.join(outDir, fileName);
      console.log(`Downloading ${label} -> ${fileName}...`);
      try {
        const resp = await fetch(fileUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (resp.ok) {
          const buf = Buffer.from(await resp.arrayBuffer());
          fs.writeFileSync(outPath, buf);
          console.log(`  Saved: ${(buf.length/1024).toFixed(1)} KB`);
        }
      } catch (e) {
        console.error('  Error:', e.message);
      }
    }
  }
}

downloadEdital42().catch(console.error);

