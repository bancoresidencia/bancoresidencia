import fs from 'fs';
import path from 'path';

function norm(s) {
  if (!s) return '';
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const files = [
  { key: 'urologia', path: 'data/urologia_final_questions.json' },
  { key: 'ginecologia', path: 'data/ginecologia_final_questions.json' },
  { key: 'cirurgia', path: 'data/cirurgia_final_questions.json' },
  { key: 'obstetricia', path: 'data/obstetricia_final_questions.json' },
  { key: 'pediatria', path: 'data/pediatria_final_questions.json' },
  { key: 'preventiva', path: 'data/medicina_preventiva_final_questions.json' },
  { key: 'clinica', path: 'data/clinica_medica_final_questions.json' }
];

console.log('1. Carregando e indexando questoes sem gabarito...');
const snippetIndex = new Map();
let totalPending = 0;

files.forEach(f => {
  const qs = JSON.parse(fs.readFileSync(f.path, 'utf8'));
  qs.forEach(q => {
    const existing = (q.correct_answer || q.correctAnswer || '').trim();
    if (!existing && !q.isAnulada && !q.is_anulada) {
      totalPending++;
      const n = norm(q.statement);
      if (n.length >= 40) {
        // Index multiple rolling windows of 45 characters
        for (let i = 0; i <= Math.min(n.length - 45, 120); i += 20) {
          const window = n.slice(i, i + 45);
          if (!snippetIndex.has(window)) {
            snippetIndex.set(window, q);
          }
        }
      }
    }
  });
});

console.log(`Questoes sem gabarito: ${totalPending}`);
console.log(`Chaves de busca indexadas na memoria: ${snippetIndex.size}`);

console.log('\n2. Varrendo os 337 livros didaticos do Google Drive...');
const GABARITO_DIR = path.join(process.cwd(), 'data', 'knowledge', 'gabarito_das_questoes');

let booksProcessed = 0;
let matchedQuestions = new Set();
const matchesBySpec = {};

if (fs.existsSync(GABARITO_DIR)) {
  const dirs = fs.readdirSync(GABARITO_DIR);
  for (const dir of dirs) {
    const fullDir = path.join(GABARITO_DIR, dir);
    if (!fs.statSync(fullDir).isDirectory()) continue;
    const jsonFiles = fs.readdirSync(fullDir).filter(f => f.endsWith('.json'));

    for (const jf of jsonFiles) {
      booksProcessed++;
      try {
        const bookData = JSON.parse(fs.readFileSync(path.join(fullDir, jf), 'utf8'));
        const fullText = (bookData.chunks || []).map(c => c.content).join('\n\n');

        // Split by Questão
        const blocks = fullText.split(/(?:Quest[ãa]o\s*\n+|QUEST[ÃA]O\s*\n+)/gi);
        for (let b = 1; b < blocks.length; b++) {
          const block = blocks[b];
          const gabMatch = block.match(/(?:Gabarito[:\s]+|GABARITO[:\s]+(?:ALTERNATIVA\s*)?)([A-E])\b/i);
          if (gabMatch) {
            const ans = gabMatch[1].toUpperCase();
            // Pegar enunciado antes das alternativas A)
            const altParts = block.split(/\n\s*[A-E]\)\s+/);
            const rawStatement = altParts[0];
            const clean = norm(rawStatement);

            if (clean.length >= 40) {
              // Try windows
              let foundTarget = null;
              for (let i = 0; i <= Math.min(clean.length - 45, 120); i += 20) {
                const win = clean.slice(i, i + 45);
                if (snippetIndex.has(win)) {
                  foundTarget = snippetIndex.get(win);
                  break;
                }
              }

              if (foundTarget && !matchedQuestions.has(foundTarget.id)) {
                matchedQuestions.add(foundTarget.id);
                matchesBySpec[dir] = (matchesBySpec[dir] || 0) + 1;
              }
            }
          }
        }
      } catch (err) {}
    }
  }
}

console.log(`\n======================================================`);
console.log(`RESULTADO DA FASE 2 (MATCHING DE LIVROS DO DRIVE):`);
console.log(`Livros processados: ${booksProcessed}`);
console.log(`Novas questoes homologadas com gabarito: ${matchedQuestions.size}`);
console.log('Distribuicao por especialidade nos livros:', matchesBySpec);
console.log(`======================================================`);
