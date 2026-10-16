import https from 'https';

const options = {
  hostname: 'www.aremg.org.br',
  path: '/ajaxCarregaProcesso.ajax.php?id=81',
  headers: { 'User-Agent': 'Mozilla/5.0', 'X-Requested-With': 'XMLHttpRequest' },
  rejectUnauthorized: false,
  timeout: 8000
};

https.get(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Keys in JSON:', Object.keys(json));
      const html = json.html || '';
      console.log('HTML length:', html.length);
      const links = [];
      const regex = /href=['"]([^'"]+)['"]/g;
      let m;
      while ((m = regex.exec(html)) !== null) {
        if (m[1].includes('galaxcms') || m[1].includes('pdf') || m[1].includes('processo')) {
          links.push(m[1]);
        }
      }
      console.log(`Found ${links.length} matching links:`);
      links.forEach(l => console.log(' ->', l));
    } catch(e) {
      console.error('Parse error:', e);
    }
  });
}).on('error', err => console.error('Request error:', err));
