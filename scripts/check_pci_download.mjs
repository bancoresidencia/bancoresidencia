import https from 'https';

const url = 'https://www.pciconcursos.com.br/provas/download/residencia-com-acesso-direto-e-autoavaliacao-amb-amrigs-acm-e-amms-fundatec-2024';

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const start = data.indexOf('<article');
    const end = data.indexOf('</article>');
    if (start !== -1 && end !== -1) {
      console.log('Article content:');
      console.log(data.substring(start, end + 10));
    } else {
      console.log('Start:', start, 'End:', end);
      console.log(data.slice(2000, 4000));
    }
  });
}).on('error', err => console.error(err));
