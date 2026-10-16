import https from 'https';

https.get('https://www.fundatec.org.br/portal/concursos/', { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode, 'len:', data.length);
    const regex = /href=['"]([^'"]+)['"]/g;
    let m;
    const links = [];
    while ((m = regex.exec(data)) !== null) {
      if (m[1].toLowerCase().includes('amrigs') || m[1].toLowerCase().includes('residencia') || m[1].toLowerCase().includes('concurso')) {
        links.push(m[1]);
      }
    }
    console.log(`Found ${links.length} links:`);
    links.slice(0, 30).forEach(l => console.log(' ->', l));
  });
}).on('error', err => console.error(err));
