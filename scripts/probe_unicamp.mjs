import https from 'https';

const url = 'https://portal.fcm.unicamp.br/provas-e-gabaritos/';

https.get(url, { rejectUnauthorized: false, headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode, 'len:', data.length);
    const regex = /href=['"]([^'"]+)['"]/g;
    let m;
    const pdfs = [];
    while ((m = regex.exec(data)) !== null) {
      if (m[1].toLowerCase().includes('.pdf')) {
        pdfs.push(m[1]);
      }
    }
    console.log(`Found ${pdfs.length} PDF files:`);
    pdfs.forEach(p => console.log(' ->', p));
  });
}).on('error', err => console.error(err));
