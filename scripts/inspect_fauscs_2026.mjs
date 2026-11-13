import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function inspectFauscs2026Gabarito() {
  const url = 'https://anexos.cdn.selecao.net.br/uploads/325/concursos/29/anexos/92914b52-fc7a-4fd1-86f5-24bdad4c5164.pdf';
  console.log('Downloading FAUSCS 2026 Gabarito Definitivo from:', url);
  const res = await fetch(url);
  const buf = Buffer.from(await res.arrayBuffer());
  const parser = new PDFParse({ data: buf });
  const text = (await parser.getText()).text;
  console.log('Length:', text.length);
  console.log('Preview:\n', text.slice(0, 1000));
}
inspectFauscs2026Gabarito();
