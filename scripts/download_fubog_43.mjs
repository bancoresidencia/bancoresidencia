import fs from 'fs';
import path from 'path';

async function downloadFubog() {
  const dir = 'data/official_exams/FUBOG';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const files = [
    { name: 'PV_FUBOG_V1A.pdf', url: 'https://concursos.selecting.com.br/arquivo.php?file=edital/1/43/648bcfe9891bb047b6ec4cb0fb473da8.pdf' },
    { name: 'GB_FUBOG_V1A.pdf', url: 'https://concursos.selecting.com.br/arquivo.php?file=edital/1/43/46b6af893d9faa4f3c3f54cf47120a5a.pdf' },
    { name: 'PV_FUBOG_V2B.pdf', url: 'https://concursos.selecting.com.br/arquivo.php?file=edital/1/43/4a750a660b4733f8167c4f124a1081c2.pdf' },
    { name: 'GB_FUBOG_V2B.pdf', url: 'https://concursos.selecting.com.br/arquivo.php?file=edital/1/43/994791c6f37259d10c6f4d5a187a25b3.pdf' },
  ];

  for (const f of files) {
    const dest = path.join(dir, f.name);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      console.log(`Already downloaded: ${f.name} (${fs.statSync(dest).size} bytes)`);
      continue;
    }
    console.log(`Downloading ${f.name} from ${f.url}...`);
    const res = await fetch(f.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) {
      console.error(`Failed to download ${f.name}: HTTP ${res.status}`);
      continue;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buffer);
    console.log(`Saved ${f.name} (${buffer.length} bytes)`);
    await new Promise(r => setTimeout(r, 500));
  }
}
downloadFubog();
