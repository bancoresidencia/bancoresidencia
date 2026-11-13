import https from 'https';

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function probe() {
  const res = await fetchPage('https://selecting.com.br/residencia-medica-em-oftalmologia/');
  const links = [...res.data.matchAll(/href=["']([^"']+)["']/gi)].map(m => m[1]);
  console.log(`Total links: ${links.length}`);
  links.slice(0, 30).forEach(l => console.log('  ->', l));
}

probe();

