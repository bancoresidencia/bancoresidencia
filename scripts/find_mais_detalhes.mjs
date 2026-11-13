import https from 'https';

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function probe() {
  const res = await fetchPage('https://selecting.com.br/residencia-medica-em-oftalmologia/');
  const matches = [...res.data.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi)];
  for (const m of matches) {
    if (m[2].includes('detalhes') || m[2].includes('Fundação') || m[2].includes('FUBOG') || m[1].includes('fubog') || m[1].includes('concurso')) {
      console.log(`Link: ${m[1]} | Texto: ${m[2].trim()}`);
    }
  }
}

probe();

