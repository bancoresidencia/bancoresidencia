import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function testUscs() {
  const url = 'https://cdn.medblog.estrategiaeducacional.com.br/wp-content/uploads/2024/11/Gabarito-da-Prova-Objetiva-Residencia-Medica-2025.pdf';
  console.log('Downloading USCS PDF from:', url);
  try {
    const res = await fetch(url);
    console.log('Status:', res.status);
    if (!res.ok) return;
    const buf = Buffer.from(await res.arrayBuffer());
    const parser = new PDFParse({ data: buf });
    const parsed = await parser.getText();
    console.log('Length:', parsed.text.length);
    console.log('Preview:\n', parsed.text.slice(0, 800));
  } catch (e) {
    console.error('Error:', e.message);
  }
}
testUscs();

