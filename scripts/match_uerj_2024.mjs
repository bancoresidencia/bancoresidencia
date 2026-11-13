import fs from 'fs';
import { PDFParse } from 'pdf-parse';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const t = line.trim();
  if (t && !t.startsWith('#')) {
    const idx = t.indexOf('=');
    if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  }
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function cleanHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function normalize(s) {
  return (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function textSim(a, b) {
  const nA = normalize(cleanHtml(a));
  const nB = normalize(cleanHtml(b));
  if (!nA || !nB) return 0;
  if (nA === nB) return 1.0;
  if ((nA.includes(nB) || nB.includes(nA)) && Math.min(nA.length, nB.length) >= 20) {
    return Math.max(0.85, Math.min(nA.length, nB.length) / Math.max(nA.length, nB.length));
  }
  const setA = new Set(nA.split(' ').filter(w => w.length > 2));
  const setB = new Set(nB.split(' ').filter(w => w.length > 2));
  if (setA.size === 0 || setB.size === 0) return 0;
  let inter = 0;
  for (const w of setA) if (setB.has(w)) inter++;
  return inter / new Set([...setA, ...setB]).size;
}

async function matchUerj2024() {
  console.log('--- Carregando Gabarito UERJ 2024 ---');
  const gbBuf = new Uint8Array(fs.readFileSync('data/official_exams/UERJ/UERJ_2024_GABARITO_DEFINITIVO.pdf'));
  const p1 = new PDFParse(gbBuf);
  await p1.load();
  const raw1 = await p1.getText();
  const gbText = typeof raw1 === 'string' ? raw1 : (raw1.text || JSON.stringify(raw1));

  // Extrai sequência de letras R1 a R100
  // R1 R2 ...
  // A C B C ...
  const lines = gbText.split('\n').map(l => l.trim()).filter(Boolean);
  const rLine = lines.find(l => l.startsWith('R1 R2 R3'));
  const aLine = lines.find(l => l.match(/^[A-D X\s]{80,}$/));

  const answers = aLine.split(/\s+/).filter(Boolean);
  console.log(`Gabarito oficial carregado com ${answers.length} respostas.`);

  console.log('\n--- Extraindo Questões do Caderno de Prova ---');
  const pvBuf = new Uint8Array(fs.readFileSync('data/official_exams/UERJ/UERJ_2024_PROVA_ACESSO_DIRETO.pdf'));
  const p2 = new PDFParse(pvBuf);
  await p2.load();
  const raw2 = await p2.getText();
  const pvText = typeof raw2 === 'string' ? raw2 : (raw2.text || JSON.stringify(raw2));

  // Regex para capturar cada questão N) ... até (N+1))
  const examQuestions = [];
  for (let num = 1; num <= 100; num++) {
    const nextNum = num + 1;
    const startRegex = new RegExp(`(?:^|\\n)\\s*${num}\\)\\s+`, 'm');
    const endRegex = num === 100 
      ? /(?:-- \d+ of \d+ --|$)/m 
      : new RegExp(`(?:^|\\n)\\s*${nextNum}\\)\\s+`, 'm');

    const startMatch = pvText.match(startRegex);
    if (!startMatch) continue;
    const startIndex = startMatch.index + startMatch[0].length;
    const remainingText = pvText.slice(startIndex);
    const endMatch = remainingText.match(endRegex);
    const qBlock = endMatch ? remainingText.slice(0, endMatch.index) : remainingText.slice(0, 1500);

    // Separar enunciado e alternativas a), b), c), d)
    const optSplit = qBlock.split(/(?:^|\n)\s*([a-d])\)\s+/i);
    const stmt = optSplit[0].replace(/-- \d+ of \d+ --/g, '').replace(/Página \d+ de \d+/g, '').replace(/RESIDÊNCIA MÉDICA UERJ.*/g, '').replace(/ORGANIZADOR/g, '').trim();
    
    const opts = {};
    for (let j = 1; j < optSplit.length; j += 2) {
      const letter = optSplit[j].toUpperCase();
      const text = optSplit[j + 1].replace(/-- \d+ of \d+ --/g, '').replace(/Página \d+ de \d+/g, '').replace(/RESIDÊNCIA MÉDICA UERJ.*/g, '').trim();
      opts[letter] = text;
    }

    examQuestions.push({
      num,
      stmt,
      opts,
      officialAnswer: answers[num - 1]
    });
  }

  console.log(`Extraídas ${examQuestions.length} questões da prova oficial.`);

  // Buscar questões pendentes da UERJ 2024 no banco
  const { data: dbQs, error } = await supabase.from('questions')
    .select('id, code, statement, options, correct_answer')
    .ilike('banca', '%UERJ%')
    .eq('year', 2024)
    .or('correct_answer.is.null,correct_answer.eq.');

  if (error) { console.error(error); return; }
  console.log(`\nQuestões pendentes da UERJ 2024 no Banco: ${dbQs.length}`);

  let matchesFound = 0;
  for (const dbQ of dbQs) {
    let bestSim = 0;
    let matchedExamQ = null;

    for (const eq of examQuestions) {
      const sim = textSim(dbQ.statement, eq.stmt);
      if (sim > bestSim) {
        bestSim = sim;
        matchedExamQ = eq;
      }
    }

    if (matchedExamQ && bestSim >= 0.60) {
      matchesFound++;
      const isAnulada = matchedExamQ.officialAnswer === 'X';
      const offAns = matchedExamQ.officialAnswer;
      const winningText = matchedExamQ.opts[offAns] || '';

      console.log(`\n[MATCH ${(bestSim * 100).toFixed(1)}%] DB ID ${dbQ.id} (${dbQ.code}) <-> Questão ${matchedExamQ.num}`);
      console.log(`  Gabarito Oficial: ${offAns} ${isAnulada ? '(ANULADA)' : ''}`);
      console.log(`  Texto Oficial: "${winningText.slice(0, 60)}..."`);
      
      // Match option against DB options
      const dbOpts = Array.isArray(dbQ.options) ? dbQ.options : [];
      let dbWinner = null;
      let dbOptSim = 0;
      for (const opt of dbOpts) {
        const sim = textSim(opt.text, winningText);
        if (sim > dbOptSim) {
          dbOptSim = sim;
          dbWinner = opt;
        }
      }
      if (dbWinner && dbOptSim >= 0.60) {
        console.log(`  -> Mapeado no Banco para Letra '${dbWinner.letter}' (sim: ${(dbOptSim * 100).toFixed(1)}%)`);
      } else {
        console.log(`  -> Mapeado direto na Letra '${offAns}'`);
      }
    }
  }

  console.log(`\nTotal de pendências resolvidas para UERJ 2024: ${matchesFound}/${dbQs.length}`);
}

matchUerj2024().catch(console.error);
