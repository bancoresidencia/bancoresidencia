import https from 'https';

const url = 'https://portal.fcm.unicamp.br/residencias-em-saude/residencia-medica/';

https.get(url, { rejectUnauthorized: false, headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode, 'len:', data.length);
    const regex = /href=['"]([^'"]+)['"]/g;
    let m;
    const links = [];
    while ((m = regex.exec(data)) !== null) {
      if (m[1].includes('processo') || m[1].includes('prova') || m[1].includes('gabarito') || m[1].includes('edital') || m[1].includes('.pdf')) {
        links.push(m[1]);
      }
    }
    console.log(`Matching links (${links.length}):`);
    Array.from(new Set(links)).forEach(l => console.log(' ->', l));
  });
}).on('error', err => console.error(err));
