import https from 'https';

function checkUrl(url) {
  return new Promise(resolve => {
    https.get(url, { rejectUnauthorized: false, headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      resolve({ url, status: res.statusCode, location: res.headers.location });
    }).on('error', err => resolve({ url, error: err.message }));
  });
}

async function main() {
  const years = [2021, 2022, 2023, 2024, 2025, 2026];
  const portals = [
    y => `https://centrodeselecao.ufg.br/${y}/fubog/`,
    y => `https://centrodeselecao.ufg.br/${y}/residencia-fubog/`,
    y => `https://centrodeselecao.ufg.br/${y}/coreme-fubog/`,
    y => `https://institutoverbena.ufg.br/processo-seletivo/${y}/fubog/`,
    y => `https://institutoverbena.ufg.br/processo-seletivo/${y}/residencia-medica/`,
    y => `https://centrodeselecao.ufg.br/${y}/iog/`
  ];

  for (const y of years) {
    for (const p of portals) {
      const u = p(y);
      const res = await checkUrl(u);
      if (res.status === 200 || res.status === 301 || res.status === 302) {
        console.log(`[${res.status}] ${u} -> ${res.location || ''}`);
      }
    }
  }
}

main();

