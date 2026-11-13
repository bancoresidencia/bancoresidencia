import fs from 'fs';

async function test() {
  const url = 'https://sistemas.institutoverbena.ufg.br/2026/coreme-ses/sistema/provas_gabaritos/Provas_gabaritos_finais_COREME_SES-2026-%23%24%23%24R.html';
  const res = await fetch(url);
  const html = await res.text();
  const regex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    if (match[1].toLowerCase().includes('acesso') || match[2].toLowerCase().includes('acesso')) {
      console.log(match[2].replace(/<[^>]+>/g, '').trim(), '==>', match[1]);
    }
  }
}
test();
