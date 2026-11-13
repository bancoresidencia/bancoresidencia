import fs from 'fs';

async function listVerbenaHtml() {
  const url = 'https://sistemas.institutoverbena.ufg.br/2026/coreme-ses/sistema/provas_gabaritos/Provas_gabaritos_finais_COREME_SES-2026-%23%24%23%24R.html';
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.log('Fetch status:', res.status);
      return;
    }
    const html = await res.text();
    console.log('HTML length:', html.length);
    // find all <a href="...">
    const regex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
    let match;
    const links = [];
    while ((match = regex.exec(html)) !== null) {
      links.push({ href: match[1], text: match[2].replace(/<[^>]+>/g, '').trim() });
    }
    console.log('Total links found:', links.length);
    links.forEach(l => console.log(`[${l.text}] -> ${l.href}`));
  } catch (e) {
    console.error(e);
  }
}

listVerbenaHtml();
