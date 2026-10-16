import https from 'https';

https.get('https://www.eumedicoresidente.com.br/provas-antigas-amrigs', { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode, 'len:', data.length);
    const regex = /href=['"]([^'"]+)['"]/g;
    let m;
    const links = [];
    while ((m = regex.exec(data)) !== null) {
      if (m[1].includes('pdf') || m[1].includes('drive') || m[1].includes('amrigs')) {
        links.push(m[1]);
      }
    }
    console.log(`Found ${links.length} links:`);
    links.slice(0, 30).forEach(l => console.log(' ->', l));
  });
}).on('error', err => console.error(err));
