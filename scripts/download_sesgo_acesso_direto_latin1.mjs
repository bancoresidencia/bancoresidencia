import fs from 'fs';
import path from 'path';

async function downloadAcessoDiretoLatin1() {
  const url = 'https://sistemas.institutoverbena.ufg.br/2026/coreme-ses/sistema/provas_gabaritos/Provas_gabaritos_finais_COREME_SES-2026-%23%24%23%24R.html';
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  // decode as latin1
  const decoder = new TextDecoder('iso-8859-1');
  const html = decoder.decode(buf);
  
  const regex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
  let match;
  const baseUrl = 'https://sistemas.institutoverbena.ufg.br/2026/coreme-ses/sistema/provas_gabaritos/';
  const outDir = path.resolve('data/official_exams/SES_GO_2026');

  while ((match = regex.exec(html)) !== null) {
    const rawHref = match[1];
    const text = match[2].replace(/<[^>]+>/g, '').trim();
    if (rawHref.includes('provas/') && rawHref.toUpperCase().includes('ACESSO DIRETO') && rawHref.toUpperCase().includes('TIPO A')) {
      console.log('Target found:', text, '--> raw:', rawHref);
      // Let's URL encode properly or try both raw and encoded
      // Notice what the web server expects: latin1 URI encoded or UTF-8 URI encoded?
      // Let's test!
      const encodedUtf8 = encodeURI(rawHref);
      const fullUrlUtf8 = new URL(encodedUtf8, baseUrl).toString();
      console.log('Trying UTF-8 URL:', fullUrlUtf8);
      const resUtf8 = await fetch(fullUrlUtf8);
      console.log('UTF-8 Status:', resUtf8.status);
      if (resUtf8.ok) {
        const fileBuf = Buffer.from(await resUtf8.arrayBuffer());
        fs.writeFileSync(path.join(outDir, 'PV_ACESSO_DIRETO_A.pdf'), fileBuf);
        console.log('SAVED PV_ACESSO_DIRETO_A.pdf!');
        return;
      }

      // If that fails, let's escape latin1 bytes:
      const latin1Encoded = rawHref.split('').map(c => {
        const code = c.charCodeAt(0);
        if (code > 127) return '%' + code.toString(16).toUpperCase();
        if (c === ' ') return '%20';
        return c;
      }).join('');
      const fullUrlLatin1 = baseUrl + latin1Encoded;
      console.log('Trying Latin1 URL:', fullUrlLatin1);
      const resLatin1 = await fetch(fullUrlLatin1);
      console.log('Latin1 Status:', resLatin1.status);
      if (resLatin1.ok) {
        const fileBuf = Buffer.from(await resLatin1.arrayBuffer());
        fs.writeFileSync(path.join(outDir, 'PV_ACESSO_DIRETO_A.pdf'), fileBuf);
        console.log('SAVED PV_ACESSO_DIRETO_A.pdf via Latin1!');
        return;
      }
    }
  }
}
downloadAcessoDiretoLatin1();
