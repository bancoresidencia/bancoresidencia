import https from 'https';

const url = 'https://portal.fcm.unicamp.br/residencias-em-saude/residencia-medica/processo-seletivo-2027/processo-seletivo-2026/';

https.get(url, { rejectUnauthorized: false, headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const regex = /href=['"]([^'"]+)['"]/g;
    let m;
    const links = [];
    while ((m = regex.exec(data)) !== null) {
      if (m[1].includes('.pdf') || m[1].includes('comvest') || m[1].includes('fcm.unicamp') || m[1].includes('download')) {
        links.push(m[1]);
      }
    }
    console.log(`Matching links (${links.length}):`);
    Array.from(new Set(links)).forEach(l => console.log(' ->', l));
  });
}).on('error', err => console.error(err));
