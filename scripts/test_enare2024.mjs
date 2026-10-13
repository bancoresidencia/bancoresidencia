process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function main() {
  const url = 'https://conhecimento.fgv.br/concursos/enare2024/medica';
  console.log(`Fetching ${url}...`);
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  console.log('Status:', res.status);
  const text = await res.text();
  const pdfs = text.match(/https?:\/\/[^\s"'<>]+\.pdf/gi) || [];
  console.log('PDFs found in raw text:', pdfs.length);
  pdfs.forEach(p => console.log(' - ' + p));

  const relPdfs = text.match(/href="([^"]+\.pdf)"/gi) || [];
  console.log('Relative PDFs found:', relPdfs.length);
  relPdfs.forEach(p => console.log(' * ' + p));
}

main();
