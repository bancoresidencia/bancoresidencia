import fs from 'fs';
import { supabase, norm, calculateSimilarity, extractPdfText } from './pdf_crossref_utils.mjs';

function parseUerjAnswerKey(text) {
  const ansMap = {};
  const clean = text.replace(/UNIVERSIDADE[\s\S]*?PROVA/i, '')
                    .replace(/Legenda[\s\S]*$/i, '');
  const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const rMatches = line.match(/\bR(\d+)\b/g);
    if (rMatches && rMatches.length >= 5) {
      const qNums = rMatches.map(m => parseInt(m.replace('R', ''), 10));
      let answers = (lines[i + 1] || '').split(/\s+/).filter(t => /^[A-DX]$/i.test(t));
      if (answers.length === qNums.length) {
        for (let j = 0; j < qNums.length; j++) {
          const ans = answers[j].toUpperCase();
          ansMap[qNums[j]] = ans === 'X' ? 'ANULADA' : ans;
        }
      }
    }
  }
  return ansMap;
}

function extractUerjQuestions(text) {
  // Regex for UERJ question blocks: e.g. "01\n" or "1 )" or "QUESTÃO 1"
  // Let's split by question numbers: (?:^|\n)\s*(\d{1,3})\s*[\)\.]\s+
  const questions = [];
  const lines = text.split('\n');
  let currentQ = null;
  
  for (const line of lines) {
    const m = line.match(/^\s*(\d{1,3})\s*[\.\)]\s*(.*)/);
    if (m && parseInt(m[1], 10) >= 1 && parseInt(m[1], 10) <= 100) {
      if (currentQ) questions.push(currentQ);
      currentQ = {
        qNum: parseInt(m[1], 10),
        statement: m[2] + '\n',
        options: []
      };
    } else if (currentQ) {
      const optM = line.match(/^\s*\(([A-D])\)\s*(.*)/);
      if (optM) {
        currentQ.options.push({ letter: optM[1], text: optM[2] });
      } else {
        if (currentQ.options.length > 0) {
          // append to last option
          currentQ.options[currentQ.options.length - 1].text += ' ' + line.trim();
        } else {
          currentQ.statement += ' ' + line.trim();
        }
      }
    }
  }
  if (currentQ) questions.push(currentQ);
  return questions;
}

async function runUerjAudit() {
  console.log('=== AUDITORIA DE CRUZAMENTO: UERJ ===');
  
  // 1. Buscar pendentes UERJ no Supabase
  const { data: dbQuestions, error } = await supabase
    .from('questions')
    .select('id, code, year, especialidade, statement, options, correct_answer')
    .ilike('code', 'UERJ%');

  if (error) {
    console.error('Erro ao buscar no Supabase:', error);
    return;
  }

  const pending = dbQuestions.filter(q => !q.correct_answer || q.correct_answer.trim() === '');
  console.log(`UERJ no banco: ${dbQuestions.length} total | ${pending.length} pendentes sem gabarito`);

  const years = [2026, 2025, 2024, 2023, 2022];
  let totalMatched = 0;
  const matches = [];

  for (const year of years) {
    const pvFile = `data/official_exams/UERJ/UERJ_${year}_PROVA_ACESSO_DIRETO.pdf`;
    const gbFile = `data/official_exams/UERJ/UERJ_${year}_GABARITO_DEFINITIVO.pdf`;

    if (!fs.existsSync(pvFile) || !fs.existsSync(gbFile)) {
      console.log(`Ano ${year}: Arquivos não encontrados localmente.`);
      continue;
    }

    const gbText = await extractPdfText(gbFile);
    const ansMap = parseUerjAnswerKey(gbText);
    const pvText = await extractPdfText(pvFile);
    const pdfQuestions = extractUerjQuestions(pvText);

    console.log(`\nAno ${year}: ${pdfQuestions.length} questões no caderno PDF, ${Object.keys(ansMap).length} respostas no gabarito oficial`);

    const yearPending = pending.filter(q => q.year === year);
    console.log(`Pendentes no banco para ${year}: ${yearPending.length}`);

    for (const qDb of yearPending) {
      let bestMatch = null;
      let maxSim = 0;

      for (const qPdf of pdfQuestions) {
        const stmtSim = calculateSimilarity(qDb.statement, qPdf.statement);
        if (stmtSim > maxSim) {
          maxSim = stmtSim;
          bestMatch = qPdf;
        }
      }

      if (maxSim >= 0.85 && bestMatch) {
        const officialAns = ansMap[bestMatch.qNum];
        // Verificar trava da alternativa
        let optSim = 1.0;
        let mappedLetter = officialAns;

        if (officialAns && officialAns !== 'ANULADA') {
          const pdfOpt = bestMatch.options.find(o => o.letter === officialAns);
          if (pdfOpt && qDb.options) {
            const dbOpt = qDb.options.find(o => o.letter === officialAns);
            if (dbOpt) {
              optSim = calculateSimilarity(dbOpt.text, pdfOpt.text);
            }
          }
        }

        if (optSim >= 0.85) {
          totalMatched++;
          matches.push({
            id: qDb.id,
            code: qDb.code,
            year: qDb.year,
            especialidade: qDb.especialidade,
            qNum: bestMatch.qNum,
            stmtSim: Math.round(maxSim * 1000) / 1000,
            optSim: Math.round(optSim * 1000) / 1000,
            gabaritoOficial: officialAns,
            statementSnippet: qDb.statement.slice(0, 90)
          });
          console.log(`  [MATCH >= 85%] ${qDb.code} -> Q#${bestMatch.qNum} (GB: ${officialAns}) [Stmt: ${(maxSim*100).toFixed(1)}%, Opt: ${(optSim*100).toFixed(1)}%]`);
        }
      }
    }
  }

  console.log(`\n==============================================`);
  console.log(`TOTAL UERJ PENDENTES QUE RECEBERÃO GABARITO: ${totalMatched} de ${pending.length}`);
  console.log(`==============================================`);
  return matches;
}

runUerjAudit();
