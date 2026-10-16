import https from 'https';

const url = 'https://www.pciconcursos.com.br/provas/download/residencia-com-acesso-direto-e-autoavaliacao-amb-amrigs-acm-e-amms-fundatec-2024';

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const lines = data.split('\n');
    console.log(lines.slice(430, 515).join('\n'));
  });
});
