import https from 'https';

https.get('https://www.pciconcursos.com.br/provas/amrigs', { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode, 'len:', data.length);
    const regex = /href=['"]([^'"]+)['"]/g;
    let m;
    const links = [];
    while ((m = regex.exec(data)) !== null) {
      if (m[1].includes('prova') || m[1].includes('.pdf') || m[1].includes('gabarito')) {
        links.push(m[1]);
      }
    }
    console.log(`Found ${links.length} links:`);
    links.slice(0, 30).forEach(l => console.log(' ->', l));
  });
}).on('error', err => console.error(err));
