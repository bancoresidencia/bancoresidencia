import https from 'https';

const url = 'https://www.comvest.unicamp.br/residenciamedica/inscricao.html';
https.get(url, { rejectUnauthorized: false, headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
  console.log('Status COMVEST:', res.statusCode);
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('Tamanho recebido:', d.length);
    const regex = /href="([^"]+)"/g;
    let m;
    const links = [];
    while ((m = regex.exec(d)) !== null) {
      if (m[1].includes('prova') || m[1].includes('gabarito') || m[1].includes('.pdf') || m[1].includes('202') || m[1].includes('residencia')) {
        links.push(m[1]);
      }
    }
    console.log(`Links encontrados na COMVEST (${links.length}):`);
    Array.from(new Set(links)).slice(0, 30).forEach(l => console.log(' ->', l));
  });
}).on('error', err => console.error(err));
