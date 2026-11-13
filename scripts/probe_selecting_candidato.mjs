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
  const res = await fetchPage('https://candidato.concursos.selecting.com.br/');
  console.log(`Status: ${res.status}, length: ${res.data.length}`);
  const pdfs = [...res.data.matchAll(/href=["']([^"']+\.pdf)["']/gi)].map(m => m[1]);
  console.log(`Total PDFs: ${pdfs.length}`);
  const links = [...res.data.matchAll(/href=["']([^"']+)["']/gi)].map(m => m[1]);
  console.log(`Total links: ${links.length}`);
  links.filter(l => l.includes('fubog') || l.includes('concurso') || l.includes('processo') || l.includes('edital') || l.includes('oftalmo')).forEach(l => console.log('  ->', l));
}

probe();

