import https from 'https';

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { rejectUnauthorized: false, headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function probe() {
  const res = await fetchPage('https://www.resmedceara.ufc.br/ares/');
  const links = [...res.data.matchAll(/href=["']([^"']+)["']/gi)].map(m => m[1]);
  console.log(`Total de links: ${links.length}`);
  links.filter(l => l.includes('processo') || l.includes('edital') || l.includes('residencia') || l.includes('202')).forEach(l => console.log('  ->', l));
}

probe();

