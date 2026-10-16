import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function extractText(filePath) {
  if (!fs.existsSync(filePath)) return '';
  const buf = new Uint8Array(fs.readFileSync(filePath));
  const p = new PDFParse(buf);
  await p.load();
  return (await p.getText()).text || await p.getText();
}

async function main() {
  console.log('=== EXTRAÇÃO DOS GABARITOS DEFINITIVOS PSU-MG ===\n');

  // 1. PSU-MG 2025
  const pre2025 = await extractText('data/official_exams/PSU_MG/PSU_MG_2025_GABARITO_PRELIMINAR_TIPO1.pdf');
  const alt2025 = await extractText('data/official_exams/PSU_MG/PSU_MG_2025_ALTERACAO_GABARITO_DEFINITIVO.pdf');
  
  // Parse preliminar 2025
  const key2025 = {};
  const lines2025 = pre2025.split('\n').map(l => l.trim());
  for (const l of lines2025) {
    const m = l.match(/^(\d{1,3})\.\s*([A-E])$/i);
    if (m) {
      key2025[parseInt(m[1], 10)] = m[2].toUpperCase();
    }
  }
  console.log(`2025 Preliminar parsed: ${Object.keys(key2025).length} questões.`);
  // Apply alteração: "Prova Geral Tipo 1 Questões 12 e 67 anuladas sendo atribuído ponto"
  if (alt2025.includes('12 e 67 anuladas')) {
    key2025[12] = 'ANULADA';
    key2025[67] = 'ANULADA';
    console.log('2025 Definitivo aplicado: Questões 12 e 67 ANULADAS.');
  }

  // 2. PSU-MG 2024
  const pre2024 = await extractText('data/official_exams/PSU_MG/PSU_MG_2024_GABARITO_PRELIMINAR_TIPO1.pdf');
  const alt2024 = await extractText('data/official_exams/PSU_MG/PSU_MG_2024_ALTERACAO_GABARITO_DEFINITIVO.pdf');
  const key2024 = {};
  const m2024 = pre2024.matchAll(/(\d{1,3})\.\s*([A-E])/g);
  for (const match of m2024) {
    key2024[parseInt(match[1], 10)] = match[2].toUpperCase();
  }
  console.log(`2024 Preliminar parsed: ${Object.keys(key2024).length} questões.`);
  console.log('2024 Altera texto:', alt2024.slice(0, 400).replace(/\n/g, ' '));

  // 3. PSU-MG 2023
  const pre2023 = await extractText('data/official_exams/PSU_MG/PSU_MG_2023_GABARITO_PRELIMINAR_TIPO1.pdf');
  const alt2023 = await extractText('data/official_exams/PSU_MG/PSU_MG_2023_ALTERACAO_GABARITO_DEFINITIVO.pdf');
  const key2023 = {};
  const m2023 = pre2023.matchAll(/(\d{1,3})\.\s*([A-E])/g);
  for (const match of m2023) {
    key2023[parseInt(match[1], 10)] = match[2].toUpperCase();
  }
  console.log(`2023 Preliminar parsed: ${Object.keys(key2023).length} questões.`);
  console.log('2023 Altera texto:', alt2023.slice(0, 400).replace(/\n/g, ' '));
}

main().catch(console.error);
