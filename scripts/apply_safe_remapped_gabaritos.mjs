import fs from 'fs';
import path from 'path';

function normalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanPrefix(norm) {
  return norm
    .replace(/^([0-9]{1,3}\s*[\.\-\)]\s*)/, '')
    .replace(/^(questao\s*[0-9]{1,3}\s*[\.\-\:]\s*)/, '')
    .replace(/^(assinale a alternativa (correta|incorreta|falsa|verdadeira)|com relacao a|a respeito de|sobre|quanto a|no que se refere a|considerando)\s+/i, '')
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
  return intersection / new Set([...wordsA, ...wordsB]).size;
}

const SPECIALTIES = [
  { key: 'urologia', name: 'Urologia', file: 'data/urologia_final_questions.json' },
  { key: 'ginecologia', name: 'Ginecologia', file: 'data/ginecologia_final_questions.json' },
  { key: 'cirurgia', name: 'Cirurgia Geral', file: 'data/cirurgia_final_questions.json' },
  { key: 'obstetricia', name: 'Obstetrícia', file: 'data/obstetricia_final_questions.json' },
  { key: 'pediatria', name: 'Pediatria', file: 'data/pediatria_final_questions.json' },
  { key: 'preventiva', name: 'Medicina Preventiva', file: 'data/medicina_preventiva_final_questions.json' },
  { key: 'clinica', name: 'Clínica Médica', file: 'data/clinica_medica_final_questions.json' }
];

async function main() {
  console.log('========================================================================');
  console.log('🛡️ APLICAÇÃO DE GABARITOS BLINDADOS: RE-MAPEAMENTO SEGURO DE OPÇÕES');
  console.log('   (Validação de alternativa com similaridade >= 80% e re-mapeamento de letra)');
  console.log('========================================================================\n');

  console.log('1. Carregando base de 52.034 questões limpas do MedBrave...');
  const mbQuestions = JSON.parse(fs.readFileSync('data/medbrave_questions_clean.json', 'utf8'));

  // Indexar MedBrave por prefixo e miolo
  const mbIndexPrefix = new Map();
  const mbIndexMid = new Map();

  for (const mb of mbQuestions) {
    if (!mb.correct_letter || !Array.isArray(mb.alternatives) || mb.alternatives.length === 0) continue;
    const rawNorm = normalize(mb.statement);
    const norm = cleanPrefix(rawNorm);
    if (norm.length < 20) continue;

    const correctAlt = mb.alternatives.find(a => a.letter === mb.correct_letter || a.isCorrect);
    if (!correctAlt) continue;
    const correctText = normalize(correctAlt.text || correctAlt.description);
    if (correctText.length < 5) continue;

    const p = norm.slice(0, 45);
    const entry = { id: mb.id, norm, correct_letter: mb.correct_letter, correctText };

    if (!mbIndexPrefix.has(p)) mbIndexPrefix.set(p, []);
    mbIndexPrefix.get(p).push(entry);

    if (norm.length >= 70) {
      const mid = norm.slice(Math.floor(norm.length / 2) - 20, Math.floor(norm.length / 2) + 20);
      if (!mbIndexMid.has(mid)) mbIndexMid.set(mid, []);
      mbIndexMid.get(mid).push(entry);
    }
  }

  console.log(`   MedBrave indexado: ${mbIndexPrefix.size} prefixos, ${mbIndexMid.size} miolos.\n`);

  let grandTotalUpdated = 0;
  const auditLog = [];

  for (const spec of SPECIALTIES) {
    const filePath = path.join(process.cwd(), spec.file);
    if (!fs.existsSync(filePath)) continue;

    console.log(`📂 Processando [${spec.name}] (${spec.file})...`);
    const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let specUpdated = 0;

    for (const q of questions) {
      const currentAns = (q.correctAnswer || q.correct_answer || '').trim();
      const isAnul = Boolean(q.isAnulada || q.is_anulada);

      // Apenas questões que AINDA NÃO possuem gabarito
      if (currentAns || isAnul) continue;

      const rawNorm = normalize(q.statement);
      const norm = cleanPrefix(rawNorm);
      if (norm.length < 20) continue;

      const p = norm.slice(0, 45);
      const mid = norm.length >= 70 ? norm.slice(Math.floor(norm.length / 2) - 20, Math.floor(norm.length / 2) + 20) : null;

      const pool = [...(mbIndexPrefix.get(p) || []), ...(mid ? (mbIndexMid.get(mid) || []) : [])];
      if (pool.length === 0) continue;

      let bestMatch = null;
      let highestStmtSim = 0;

      for (const cand of pool) {
        const stmtSim = textSimilarity(norm, cand.norm);
        if (stmtSim >= 0.70 && stmtSim > highestStmtSim) {
          // Validar contra as opções do banco
          if (Array.isArray(q.options)) {
            for (const bOpt of q.options) {
              const bOptText = normalize(bOpt.text);
              const optSim = textSimilarity(cand.correctText, bOptText);
              // Proteção máxima: alternativa com similaridade >= 80%
              if (optSim >= 0.80) {
                highestStmtSim = stmtSim;
                bestMatch = {
                  mbId: cand.id,
                  stmtSim,
                  optSim,
                  mbLetter: cand.correct_letter,
                  assignedLetter: bOpt.letter, // RE-MAPEAMENTO DA LETRA NO BANCO
                  optText: bOpt.text
                };
                break;
              }
            }
          }
        }
      }

      if (bestMatch) {
        // Aplica com segurança
        q.correctAnswer = bestMatch.assignedLetter;
        q.correct_answer = bestMatch.assignedLetter;
        specUpdated++;
        grandTotalUpdated++;

        auditLog.push({
          questionId: q.id,
          specialty: spec.key,
          assignedLetter: bestMatch.assignedLetter,
          mbLetter: bestMatch.mbLetter,
          wasScrambled: bestMatch.assignedLetter !== bestMatch.mbLetter,
          stmtSim: (bestMatch.stmtSim * 100).toFixed(1) + '%',
          optSim: (bestMatch.optSim * 100).toFixed(1) + '%'
        });
      }
    }

    if (specUpdated > 0) {
      fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf8');
      console.log(`   ✅ [${spec.name}]: +${specUpdated} novos gabaritos homologados com segurança!`);
    } else {
      console.log(`   ℹ️ [${spec.name}]: Nenhuma nova correspondência pendente segura.`);
    }
  }

  console.log('\n========================================================================');
  console.log(`🎉 TOTAL DE NOVOS GABARITOS HOMOLOGADOS COM BLINDAGEM: +${grandTotalUpdated}`);
  const scrambledCount = auditLog.filter(l => l.wasScrambled).length;
  console.log(`   • Casos com letra re-mapeada (alternativas embaralhadas corrigidas): ${scrambledCount}`);
  console.log('========================================================================\n');

  // Salvar log de auditoria
  fs.writeFileSync('data/cruzamento_blindado_log.json', JSON.stringify(auditLog, null, 2), 'utf8');
  console.log('Log salvo em: data/cruzamento_blindado_log.json');
}

main().catch(console.error);
