import fs from 'fs';

const content = fs.readFileSync('data/catalogo_pdf_extracted.txt', 'utf8');
const pages = content.split(/=== PAGE \d+ ===/);

console.log('Total páginas no split:', pages.length - 1);

const especialidades = [
  'Pediatria',
  'Ginecologia',
  'Obstetrícia',
  'Medicina Preventiva e Social',
  'Cirurgia Geral',
  'Clínica Médica'
];

pages.forEach((p, idx) => {
  if (idx === 0) return;
  const lines = p.trim().split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return;

  // Checar se é início de especialidade
  const firstLine = lines[0];
  if (especialidades.includes(firstLine) && lines[1] && lines[1].includes('Temas')) {
    console.log(`Página ${idx}: Início de especialidade -> ${firstLine} (${lines[1]})`);
  }

  // Checar temas
  const temaLine = lines.find(l => /^\d+\s+[A-ZÁÉÍÓÚÂÊÔÃÕ]/.test(l) && !l.includes('Temas •') && !l.includes('Banco Residência') && !l.includes('questões'));
  if (temaLine) {
    // console.log(`  Página ${idx}: Tema -> ${temaLine}`);
  }
});
