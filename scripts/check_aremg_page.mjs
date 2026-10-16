import https from 'https';

async function fetchPage(url) {
  return new Promise((resolve) => {
    https.get(url, { rejectUnauthorized: false, headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

async function main() {
  const pages = [
    'https://www.aremg.org.br/detalhes-do-processo/aremg-divulga-gabarito-preliminar-de-prova--psu-mg-2025/1748',
    'https://www.aremg.org.br/detalhes-do-processo/aremg-divulga-alteracao-de-gabaritos-apos-analise-de-recursos--psu-mg-2025/1760',
    'https://www.aremg.org.br/detalhes-do-processo/aremg-divulga-resultado-da-prova-apos-recursos--psu-mg-2025/1761'
  ];

  for (const p of pages) {
    console.log('\nChecking:', p);
    const html = await fetchPage(p);
    const regex = /href=["']([^"']+)["']/g;
    let m;
    while ((m = regex.exec(html)) !== null) {
      if (m[1].includes('galaxcms') || m[1].includes('.pdf')) {
        console.log(' ->', m[1]);
      }
    }
  }
}

main();
