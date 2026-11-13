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
  console.log('Testando conexão com resmedceara.ufc.br...');
  try {
    const res = await fetchPage('https://www.resmedceara.ufc.br/ares/');
    console.log(`Status: ${res.status}, tamanho html: ${res.data.length}`);
    const pdfs = [...res.data.matchAll(/href=["'](https?:\/\/[^"']+\.pdf)["']/gi)].map(m => m[1]);
    console.log(`Total de links PDF encontrados: ${pdfs.length}`);
    pdfs.slice(0, 20).forEach(p => console.log('  ->', p));
  } catch (e) {
    console.error('Erro:', e.message);
  }
}

probe();

