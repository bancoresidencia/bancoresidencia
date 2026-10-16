import https from 'https';

function check(url) {
  return new Promise((resolve) => {
    https.get(url, { rejectUnauthorized: false, headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 8000 }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ url, status: res.statusCode, data }));
    }).on('error', err => resolve({ url, error: err.message }));
  });
}

async function run() {
  const res = await check('https://www.amrigs.org.br/');
  console.log(`AMRIGS: Status: ${res.status} | Length: ${(res.data || '').length}`);
  if (res.data) {
    const regex = /href=['"]([^'"]+)['"]/g;
    let m;
    const links = [];
    while ((m = regex.exec(res.data)) !== null) {
      if (m[1].includes('prova') || m[1].includes('exame') || m[1].includes('residencia') || m[1].includes('gabarito')) {
        links.push(m[1]);
      }
    }
    console.log(`Found (${links.length}):`);
    links.forEach(l => console.log(' ->', l));
  }
}

run();
