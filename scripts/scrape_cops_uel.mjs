import https from 'https';

const postData = 'action=gerarDetalhesSelecao&Selecao=409';
const req = https.request('https://www.cops.uel.br/v2/Selecao/execute/', {
  method: 'POST',
  rejectUnauthorized: false,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Length': Buffer.byteLength(postData)
  }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const json = JSON.parse(body);
    const html = json.mensagem || '';
    const regex = /<a[^>]+href=['"]([^'"]+)['"][^>]*>(.*?)<\/a>/gi;
    let m;
    while ((m = regex.exec(html)) !== null) {
      console.log('Doc:', m[2].replace(/<[^>]+>/g, '').trim(), '-->', m[1]);
    }
  });
}).on('error', err => console.error(err));
req.write(postData);
req.end();
