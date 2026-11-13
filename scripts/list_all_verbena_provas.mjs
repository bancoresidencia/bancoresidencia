import fs from 'fs';

async function listAllProvas() {
  const url = 'https://sistemas.institutoverbena.ufg.br/2026/coreme-ses/sistema/provas_gabaritos/Provas_gabaritos_finais_COREME_SES-2026-%23%24%23%24R.html';
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  const html = new TextDecoder('iso-8859-1').decode(buf);
  const regex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
  let match;
  console.log('=== ALL PROVAS ON VERBENA 2026 ===');
  while ((match = regex.exec(html)) !== null) {
    const href = match[1];
    const text = match[2].replace(/<[^>]+>/g, '').trim();
    if (href.includes('provas/') && (href.includes('Tipo A') || href.includes('TIPO A'))) {
      console.log(`[${text}] => ${href}`);
    }
  }
  console.log('\n=== ALL GABARITOS ON VERBENA 2026 ===');
  const regexGb = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
  while ((match = regexGb.exec(html)) !== null) {
    const href = match[1];
    const text = match[2].replace(/<[^>]+>/g, '').trim();
    if (href.includes('gabaritos') && (href.includes('Tipo A') || href.includes('tipo A') || href.includes('TIPO A'))) {
      console.log(`[${text}] => ${href}`);
    }
  }
}

listAllProvas();
