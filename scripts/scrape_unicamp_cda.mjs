import https from 'https';
import fs from 'fs';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { rejectUnauthorized: false, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

async function main() {
  const url = 'https://www.fcm.unicamp.br/fcm/coordenadoria-de-desenvolvimento-academico-cda/provas-e-gabaritos';
  console.log(`Buscando: ${url}`);
  try {
    const html = await fetchUrl(url);
    console.log(`Tamanho recebido: ${html.length} bytes`);
    const links = html.match(/href=["'][^"']+["']/gi) || [];
    console.log(`Total de links: ${links.length}`);
    const pdfs = [];
    links.forEach(l => {
      const clean = l.replace(/^href=["']|["']$/gi, '');
      if (clean.includes('.pdf') || clean.includes('download') || clean.includes('prova') || clean.includes('gabarito')) {
        pdfs.push(clean);
      }
    });
    console.log(`Links relevantes (${pdfs.length}):`);
    pdfs.forEach(p => console.log('  ->', p));
  } catch (e) {
    console.error('Erro:', e.message);
  }
}

main();
