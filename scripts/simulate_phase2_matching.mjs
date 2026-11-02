import fs from 'fs';
import path from 'path';

function normalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanPrefix(norm) {
  return norm
    .replace(/^([0-9]{1,3}\s*[\.\-\)]\s*)/, '')
    .replace(/^(questao\s*[0-9]{1,3}\s*[\.\-\:]\s*)/, '')
    .replace(/^(assinale a alternativa (correta|incorreta|falsa|verdadeira)|com relacao a|a respeito de|sobre|quanto a|no que se refere a|considerando|diante do exposto|com base no caso)\s+/i, '')
    .trim();
}

function textSimilarity(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1.0;
  const wordsA = new Set(a.split(' ').filter(w => w.length > 2));
  const wordsB = new Set(b.split(' ').filter(w => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let intersection = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) intersection++;
  }
  const union = new Set([...wordsA, ...wordsB]).size;
  return intersection / union;
}

console.log('1. Carregando e indexando MedBrave...');
const mbQuestions = JSON.parse(fs.readFileSync('data/medbrave_questions_clean.json', 'utf8'));

const mbIndexPrefix = new Map();
const mbIndexMid = new Map();

for (const mb of mbQuestions) {
  const rawNorm = normalize(mb.statement);
  const norm = cleanPrefix(rawNorm);
  if (norm.length < 25) continue;

  const isAnul = Boolean(mb.is_annulled || mb.correct_letter === 'ANULADA');
  let correctText = '';
  if (Array.isArray(mb.alternatives)) {
    const correctAlt = mb.alternatives.find(a => a.isCorrect || a.letter === mb.correct_letter);
    if (correctAlt) correctText = normalize(correctAlt.text);
  }

  if (!correctText && !isAnul) continue;

  const entry = {
    id: mb.id,
    year: mb.year,
    norm,
    isAnul,
    correct_letter: mb.correct_letter,
    correctText,
    alternatives: mb.alternatives || []
  };

  const p = norm.slice(0, 45);
  if (!mbIndexPrefix.has(p)) mbIndexPrefix.set(p, []);
  mbIndexPrefix.get(p).push(entry);

  if (norm.length >= 70) {
    const mid = norm.slice(Math.floor(norm.length / 2) - 20, Math.floor(norm.length / 2) + 20);
    if (!mbIndexMid.has(mid)) mbIndexMid.set(mid, []);
    mbIndexMid.get(mid).push(entry);
  }
}

console.log(`MedBrave indexado com sucesso (${mbQuestions.length} questões).\n`);

const FILES = [
  { key: 'cirurgia', name: 'Cirurgia', file: 'data/cirurgia_final_questions.json' },
  { key: 'clinica', name: 'Clínica Médica', file: 'data/clinica_medica_final_questions.json' },
  { key: 'ginecologia', name: 'Ginecologia', file: 'data/ginecologia_final_questions.json' },
  { key: 'preventiva', name: 'Medicina Preventiva e Social', file: 'data/medicina_preventiva_final_questions.json' },
  { key: 'obstetricia', name: 'Obstetrícia', file: 'data/obstetricia_final_questions.json' },
  { key: 'pediatria', name: 'Pediatria', file: 'data/pediatria_final_questions.json' },
  { key: 'urologia', name: 'Urologia', file: 'data/urologia_final_questions.json' }
];

let totalScrambled = 0;
let totalNewHomologated = 0;
let totalAnuladasFixed = 0;
const samples = [];

FILES.forEach(f => {
  if (!fs.existsSync(f.file)) return;
  const qs = JSON.parse(fs.readFileSync(f.file, 'utf8'));
  let specScrambled = 0;
  let specNew = 0;
  let specAnul = 0;

  for (const q of qs) {
    const currentAns = (q.correctAnswer || q.correct_answer || '').trim().toUpperCase();
    const currentAnul = Boolean(q.isAnulada || q.is_anulada || currentAns === 'ANULADA');

    // Se já estiver em quarentena (sem opções ou truncada), pula
    const isMultiChoice = q.type !== 'Dissertativa';
    const opts = q.options || [];
    const stmt = (q.statement || '').trim();
    if ((isMultiChoice && opts.length === 0) || stmt.length < 15) continue;

    const rawNorm = normalize(q.statement);
    const norm = cleanPrefix(rawNorm);
    if (norm.length < 25) continue;

    const p = norm.slice(0, 45);
    const mid = norm.length >= 70 ? norm.slice(Math.floor(norm.length / 2) - 20, Math.floor(norm.length / 2) + 20) : null;
    const pool = [...(mbIndexPrefix.get(p) || []), ...(mid ? (mbIndexMid.get(mid) || []) : [])];
    if (pool.length === 0) continue;

    const seenIds = new Set();
    let bestMatch = null;
    let highestSim = 0;

    for (const cand of pool) {
      if (seenIds.has(cand.id)) continue;
      seenIds.add(cand.id);

      if (cand.year && q.year && Math.abs(cand.year - q.year) > 1) continue;

      const simStmt = textSimilarity(norm, cand.norm);
      if (simStmt >= 0.85 && simStmt > highestSim) {
        if (cand.isAnul) {
          bestMatch = { cand, type: 'ANULADA', stmtSim: simStmt };
          highestSim = simStmt;
        } else if (Array.isArray(q.options) && q.options.length > 0 && cand.correctText) {
          for (const opt of q.options) {
            const optNorm = normalize(opt.text);
            const optSim = textSimilarity(cand.correctText, optNorm);
            if (optSim >= 0.85) {
              highestSim = simStmt;
              bestMatch = {
                cand,
                type: 'VALID',
                assignedLetter: opt.letter,
                optSim,
                stmtSim: simStmt
              };
              break;
            }
          }
        }
      }
    }

    if (bestMatch) {
      if (bestMatch.type === 'ANULADA') {
        if (!currentAnul) {
          specAnul++;
          totalAnuladasFixed++;
        }
      } else if (bestMatch.type === 'VALID') {
        if (!currentAns && !currentAnul) {
          specNew++;
          totalNewHomologated++;
        } else if (currentAns && currentAns !== bestMatch.assignedLetter && !currentAnul) {
          specScrambled++;
          totalScrambled++;
          if (samples.length < 10) {
            samples.push({
              id: q.id,
              code: q.code,
              spec: f.name,
              banca: q.banca || q.institution,
              year: q.year,
              currentAns,
              newCorrectLetter: bestMatch.assignedLetter,
              mbLetter: bestMatch.cand.correct_letter,
              stmtSim: (bestMatch.stmtSim * 100).toFixed(1) + '%',
              optSim: (bestMatch.optSim * 100).toFixed(1) + '%',
              stmt: stmt.slice(0, 90) + '...'
            });
          }
        }
      }
    }
  }

  console.log(`• [${f.name.padEnd(28)}]: Permutações Corrigidas: ${specScrambled.toString().padStart(4)} | Novos Gabaritos: ${specNew.toString().padStart(4)} | Anulações: ${specAnul.toString().padStart(4)}`);
});

console.log('\n' + '='.repeat(80));
console.log('🏁 TOTAIS DA SIMULAÇÃO FASE 2:');
console.log('='.repeat(80));
console.log(`⭐ Total de Permutações de Caderno Detectadas (Gabarito errado corrigido): ${totalScrambled}`);
console.log(`📘 Total de Novos Gabaritos Homologados (sem gabarito resolvidos): ${totalNewHomologated}`);
console.log(`🛡️ Total de Anulações Oficiais Confirmadas: ${totalAnuladasFixed}`);
console.log('='.repeat(80));

console.log('\nAmostra de 10 Permutações de Caderno que serão corrigidas:');
console.log(JSON.stringify(samples, null, 2));
