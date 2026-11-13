import fs from 'fs';
import path from 'path';

async function downloadAcessoDireto() {
  const url = 'https://sistemas.institutoverbena.ufg.br/2026/coreme-ses/sistema/provas_gabaritos/Provas_gabaritos_finais_COREME_SES-2026-%23%24%23%24R.html';
  const res = await fetch(url);
  const html = await res.text();
  const regex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
  let match;
  const baseUrl = 'https://sistemas.institutoverbena.ufg.br/2026/coreme-ses/sistema/provas_gabaritos/';
  const outDir = path.resolve('data/official_exams/SES_GO_2026');

  while ((match = regex.exec(html)) !== null) {
    const rawHref = match[1];
    const text = match[2].replace(/<[^>]+>/g, '').trim();
    if (rawHref.toLowerCase().includes('acesso direto tipo a') || rawHref.toLowerCase().includes('acesso%20direto%20tipo%20a') || rawHref.toUpperCase().includes('ACESSO DIRETO (R1) TIPO A') || rawHref.includes('ACESSO DIRETO') && rawHref.includes('TIPO A')) {
      console.log('Target found:', text, rawHref);
      const fullUrl = new URL(rawHref, baseUrl).toString();
      console.log('Fetching:', fullUrl);
      const fileRes = await fetch(fullUrl);
      console.log('Status:', fileRes.status);
      if (fileRes.ok) {
        const buf = Buffer.from(await fileRes.arrayBuffer());
        const filename = rawHref.includes('gabarito') || rawHref.includes('Gabarito') ? 'GB_ACESSO_DIRETO_A.pdf' : 'PV_ACESSO_DIRETO_A.pdf';
        fs.writeFileSync(path.join(outDir, filename), buf);
        console.log(`Saved ${filename} (${(buf.length/1024).toFixed(1)} KB)`);
      }
    }
  }
}
downloadAcessoDireto();
