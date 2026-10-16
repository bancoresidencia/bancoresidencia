import https from 'https';

function probe(term) {
  https.get('https://www.pciconcursos.com.br/provas/' + term, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      console.log(`\n=== Termo: ${term} (Status: ${res.statusCode}, Tamanho: ${data.length}) ===`);
      const regex = /href="([^"]+)"/g;
      let m;
      const links = [];
      while ((m = regex.exec(data)) !== null) {
        if (m[1].includes('residencia') || m[1].includes('med') || m[1].includes('.pdf')) {
          links.push(m[1]);
        }
      }
      console.log(`Links encontrados (${term}): ${links.length}`);
      links.slice(0, 10).forEach(l => console.log(' ->', l));
    });
  }).on('error', e => console.error(term, e));
}

probe('unicamp');
probe('amp');
probe('uel');
