import fs from 'fs';

async function listAll63Links() {
  const url = 'https://sistemas.institutoverbena.ufg.br/2026/coreme-ses/sistema/provas_gabaritos/Provas_gabaritos_finais_COREME_SES-2026-%23%24%23%24R.html';
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  const html = new TextDecoder('iso-8859-1').decode(buf);
  const regex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
  let match;
  let i = 0;
  while ((match = regex.exec(html)) !== null) {
    i++;
    const href = match[1];
    const text = match[2].replace(/<[^>]+>/g, '').trim();
    console.log(`${i}. [${text}] => ${href}`);
  }
}

listAll63Links();
