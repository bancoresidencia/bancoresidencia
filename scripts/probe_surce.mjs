import https from 'https';

async function fetchLinks(pagePath) {
  return new Promise((resolve) => {
    const fullUrl = 'https://www.resmedceara.ufc.br' + pagePath;
    https.get(fullUrl, { rejectUnauthorized: false, headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const regex = /href=['"]([^'"]+)['"]/gi;
        let m;
        const links = [];
        while ((m = regex.exec(data)) !== null) {
          links.push(m[1]);
        }
        resolve({ path: pagePath, status: res.statusCode, links });
      });
    }).on('error', err => resolve({ path: pagePath, error: err.message }));
  });
}

async function main() {
  const p2023Gb = await fetchLinks('/ares/processo_seletivo/gabarito-finalpos-recurso-do-exame-escrito-objetivo-resmed-ce-2023');
  console.log('=== GABARITO FINAL 2023 ===');
  p2023Gb.links.filter(l => l.includes('.pdf') && (l.includes('DIRETO') || l.includes('AD'))).forEach(l => console.log(' ->', l));

  const p2023Pv = await fetchLinks('/ares/processo_seletivo/caderno-e-gabarito-preliminar-do-exame-escrito-objetivo-resmed-ce-2023');
  console.log('=== CADERNO 2023 ===');
  p2023Pv.links.filter(l => l.includes('.pdf') && (l.includes('DIRETO') || l.includes('AD'))).forEach(l => console.log(' ->', l));

  const p2022 = await fetchLinks('/ares/processo_seletivo/caderno-e-gabarito-preliminar-do-exame-escrito-objetivo-psu-resmed-ce-2022');
  console.log('=== 2022 ===');
  p2022.links.filter(l => l.includes('.pdf') && (l.includes('DIRETO') || l.includes('AD'))).forEach(l => console.log(' ->', l));
}
main();
