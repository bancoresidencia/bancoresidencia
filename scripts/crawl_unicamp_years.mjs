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
  const url = 'https://portal.fcm.unicamp.br/residencias-em-saude/residencia-medica/';
  const html = await fetchUrl(url);
  const hrefs = html.match(/href=["'][^"']+["']/gi) || [];
  console.log(`Total hrefs: ${hrefs.length}`);
  const unique = new Set();
  hrefs.forEach(h => {
    const c = h.replace(/^href=["']|["']$/gi, '');
    if (/processo|seletivo|edital|prova|gabarito|202[0-6]/i.test(c)) {
      unique.add(c);
    }
  });

  console.log(`Links relevantes encontrados: ${unique.size}`);
  Array.from(unique).forEach(l => console.log('   📄', l));
}

main().catch(console.error);
