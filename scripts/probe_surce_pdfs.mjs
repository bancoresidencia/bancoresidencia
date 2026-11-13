import https from 'https';
import http from 'http';

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { rejectUnauthorized: false, headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let nextUrl = res.headers.location;
        if (nextUrl.startsWith('/')) {
          const u = new URL(url);
          nextUrl = `${u.origin}${nextUrl}`;
        }
        return resolve(fetchPage(nextUrl));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data, url }));
    }).on('error', reject);
  });
}

async function probe() {
  for (const path of ['/ares/psu-resmed-ce-2024-acesso-direto', '/ares/processos-seletivos-anteriores-resmed']) {
    const res = await fetchPage(`https://www.resmedceara.ufc.br${path}`);
    console.log(`\n=== PATH: ${path} (Status ${res.status}) ===`);
    const pdfs = [...res.data.matchAll(/href=["']([^"']+\.pdf)["']/gi)].map(m => m[1]);
    console.log(`Total PDFs: ${pdfs.length}`);
    pdfs.forEach(p => console.log('  PDF:', p));
  }
}

probe();

