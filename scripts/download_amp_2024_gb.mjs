import fs from 'fs';
import path from 'path';

async function downloadAmpGabaritos() {
  const dir = 'data/official_exams/AMP_PARANA';
  const files = [
    { name: 'GB_AMP_2024_PRELIMINAR.pdf', url: 'https://med.estrategia.com/portal/wp-content/uploads/2024/11/gabaritos_1730720273.pdf' },
    { name: 'GB_AMP_2024_OFICIAL.pdf', url: 'https://cdn.medblog.estrategiaeducacional.com.br/wp-content/uploads/2024/11/gabarito_oficial_2024.pdf' },
    { name: 'GB_AMP_2024_ATA_RECURSOS.pdf', url: 'https://med.estrategia.com/portal/wp-content/uploads/2024/11/ata-recursos-questoes-2024_1730991487.pdf' }
  ];

  for (const f of files) {
    const dest = path.join(dir, f.name);
    console.log(`Downloading ${f.name} from ${f.url}...`);
    try {
      const res = await fetch(f.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) {
        console.error(`Failed ${f.name}: HTTP ${res.status}`);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buf);
      console.log(`Saved ${f.name} (${(buf.length / 1024).toFixed(1)} KB)`);
    } catch (e) {
      console.error(`Error downloading ${f.name}:`, e.message);
    }
  }
}
downloadAmpGabaritos();
