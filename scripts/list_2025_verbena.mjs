import fs from 'fs';

async function list2025Provas() {
  const url = 'https://sistemas.institutoverbena.ufg.br/2025/coreme-ses/sistema/provas_gabaritos/Provas_gabaritos_finais_COREME_SES_alterado.html';
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  const html = new TextDecoder('iso-8859-1').decode(buf);
  const regex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
  let match;
  console.log('=== PROVAS AND GABARITOS 2025 ===');
  while ((match = regex.exec(html)) !== null) {
    const href = match[1];
    const text = match[2].replace(/<[^>]+>/g, '').trim();
    console.log(`[${text}] => ${href}`);
  }
}

list2025Provas();
