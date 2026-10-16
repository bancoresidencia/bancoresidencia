import https from 'https';

https.get('https://portal.fcm.unicamp.br/provas-e-gabaritos/', { rejectUnauthorized: false }, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const regex = /<a[^>]+href=['"]([^'"]+)['"][^>]*>(.*?)<\/a>/gi;
    let m;
    while ((m = regex.exec(body)) !== null) {
      const href = m[1];
      const text = m[2].replace(/<[^>]+>/g, '').trim();
      if (text.length > 2 && !href.includes('wp-content/themes') && !href.includes('#')) {
        console.log(`${text} --> ${href}`);
      }
    }
  });
}).on('error', err => console.error(err));
