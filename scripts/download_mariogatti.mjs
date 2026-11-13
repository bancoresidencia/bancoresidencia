import fs from 'fs';
import path from 'path';

async function downloadMarioGatti() {
  const dir = 'data/official_exams/MARIO_GATTI';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const url = 'https://anexos.cdn.selecao.net.br/uploads/361/concursos/2568/anexos/668c7724-ea42-4e67-a859-cd1f7eeaaa0a.pdf';
  const dest = path.join(dir, 'GB_MARIO_GATTI_2026_DEFINITIVO.pdf');

  console.log('Downloading Gabarito Definitivo Mario Gatti 2026...');
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) {
    console.error('Failed:', res.status);
    return;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  console.log(`Saved ${dest} (${buf.length} bytes)`);
}
downloadMarioGatti();

