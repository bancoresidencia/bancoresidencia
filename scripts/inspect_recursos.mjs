import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function inspectRecursos() {
  const url = 'https://anexos.cdn.selecao.net.br/uploads/325/concursos/28/anexos/a49ae07d-146d-4ad4-8ce4-881b818e31a4.pdf';
  console.log('Downloading Recursos FAUSCS from:', url);
  const res = await fetch(url);
  const buf = Buffer.from(await res.arrayBuffer());
  const parser = new PDFParse({ data: buf });
  const text = (await parser.getText()).text;
  console.log('Recursos length:', text.length);
  console.log('Preview:\n', text.slice(0, 1500));
}
inspectRecursos();
