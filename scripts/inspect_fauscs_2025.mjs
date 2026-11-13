import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function inspectFauscs2025Gabarito() {
  const url = 'https://anexos.cdn.selecao.net.br/uploads/325/concursos/28/anexos/cb31f7cf-d051-47d7-a8d0-1da843ea5201.pdf';
  console.log('Downloading FAUSCS 2025 Gabarito Definitivo from:', url);
  const res = await fetch(url);
  console.log('Status:', res.status);
  const buf = Buffer.from(await res.arrayBuffer());
  const parser = new PDFParse({ data: buf });
  const text = (await parser.getText()).text;
  console.log('Length:', text.length);
  console.log('Preview:\n', text.slice(0, 1000));
}
inspectFauscs2025Gabarito();
