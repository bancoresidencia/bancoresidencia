import https from 'https';

const url = 'https://www.resmedceara.ufc.br/ares/processo_seletivo/caderno-e-gabarito-preliminar-do-exame-escrito-objetivo-resmed-ce-2023';

https.get(url, { rejectUnauthorized: false }, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const regex = /<a[^>]+href=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>/gi;
    let m;
    while ((m = regex.exec(data)) !== null) {
      if (m[1].includes('.pdf') || m[2].includes('ACESSO DIRETO')) {
        console.log(m[2].trim(), '->', m[1]);
      }
    }
  });
});
