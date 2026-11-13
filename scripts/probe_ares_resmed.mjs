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
  const res = await fetchPage('https://www.resmedceara.ufc.br/ares/processo-seletivo-resmed/');
  console.log(`Final URL: ${res.url}, Status: ${res.status}`);
  const links = [...res.data.matchAll(/href=["']([^"']+)["']/gi)].map(m => m[1]);
  console.log(`Total links: ${links.length}`);
  links.filter(l => l.includes('.pdf') || l.includes('processo') || l.includes('202')).forEach(l => console.log('  ->', l));
}

probe();
