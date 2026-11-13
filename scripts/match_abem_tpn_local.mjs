import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');
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

// Extrai gabarito de tabela ABEM
// Formato no PDF:
// Questão  Correta  Gabarito  Referencia bibliografica
// 1        B) Delirium misto. ...
// 2        C) Doença de Graves. ...
function parseAbemGabarito(text) {
  const map = new Map();
  // Regex para pegar número da questão seguido da letra e texto
  const regex = /(?:^|\n)\s*(\d{1,3})\s+([A-E])\)\s+([^\n]+)/g;
  let m;
  while ((m = regex.exec(text)) !== null) {
    const qNum = parseInt(m[1], 10);
    const letter = m[2].toUpperCase();
    const winningText = m[3].trim();
    map.set(qNum, { letter, winningText });
  }
  return map;
}

// Extrai questões do caderno de prova
function parseAbemCaderno(text) {
  const questions = [];
  // Formato: "QUESTÃO 1 - CLINICA MEDICA ..." ou "QUESTÃO 28 - PEDIATRIA ..."
  const qSplits = text.split(/(?:^|\n)\s*(?:QUESTÃO|Questão)\s+(\d{1,3})\s*[-–]/i);
  for (let i = 1; i < qSplits.length; i += 2) {
    const qNum = parseInt(qSplits[i], 10);
    const qBlock = qSplits[i + 1] || '';
    
    // Divide alternativas A), B), C), D)
    const optParts = qBlock.split(/(?:^|\n)\s*([A-E])\)\s+/);
    const stmt = optParts[0].replace(/^[^\n]*\n/, '').trim(); // remove a linha do cabeçalho da especialidade
    const opts = {};
    for (let j = 1; j < optParts.length; j += 2) {
      opts[optParts[j].toUpperCase()] = optParts[j + 1].trim();
    }
    questions.push({ qNum, stmt, opts });
  }
  return questions;
}

async function runAbem() {
  console.log('=== PROCESSANDO ABEM TPN (TESTE DE PROGRESSO) ===');
  
  // 1. Prova 09h00
  const bufGb09 = fs.readFileSync('data/official_exams/ABEM/TPN25_Gabarito_Prova_09h00.pdf');
  const pGb09 = new PDFParse({ data: bufGb09 });
  await pGb09.load();
  const gb09Text = (await pGb09.getText()).text || await pGb09.getText();
  const mapGb09 = parseAbemGabarito(gb09Text);
  console.log(`Gabarito 09h00 extraído: ${mapGb09.size} questões.`);

  const bufPv09 = fs.readFileSync('data/official_exams/ABEM/TPN25_Caderno_Prova_09h00.pdf');
  const pPv09 = new PDFParse({ data: bufPv09 });
  await pPv09.load();
  const pv09Text = (await pPv09.getText()).text || await pPv09.getText();
  const qs09 = parseAbemCaderno(pv09Text);
  console.log(`Caderno 09h00 extraído: ${qs09.length} questões.`);

  // 2. Prova 19h30
  const bufGb19 = fs.readFileSync('data/official_exams/ABEM/TPN25_Gabarito_Prova_19h30.pdf');
  const pGb19 = new PDFParse({ data: bufGb19 });
  await pGb19.load();
  const gb19Text = (await pGb19.getText()).text || await pGb19.getText();
  const mapGb19 = parseAbemGabarito(gb19Text);
  console.log(`Gabarito 19h30 extraído: ${mapGb19.size} questões.`);

  const bufPv19 = fs.readFileSync('data/official_exams/ABEM/TPN25_Caderno_Prova_19h30.pdf');
  const pPv19 = new PDFParse({ data: bufPv19 });
  await pPv19.load();
  const pv19Text = (await pPv19.getText()).text || await pPv19.getText();
  const qs19 = parseAbemCaderno(pv19Text);
  console.log(`Caderno 19h30 extraído: ${qs19.length} questões.`);

  // Lista combinada de provas com gabaritos oficiais
  const allExamQuestions = [];
  for (const q of qs09) {
    const gb = mapGb09.get(q.qNum);
    if (gb) allExamQuestions.push({ ...q, officialAnswer: gb.letter, winningText: gb.winningText, caderno: 'ABEM 2025/2026 - 09h00' });
  }
  for (const q of qs19) {
    const gb = mapGb19.get(q.qNum);
    if (gb) allExamQuestions.push({ ...q, officialAnswer: gb.letter, winningText: gb.winningText, caderno: 'ABEM 2025/2026 - 19h30' });
  }
  console.log(`\nTotal de questões oficiais montadas com gabarito: ${allExamQuestions.length}`);

  // Buscar questões pendentes da ABEM no Supabase
  const { data: dbQs, error } = await supabase.from('questions')
    .select('id, code, statement, options, correct_answer, year')
    .ilike('institution', '%ABEM%')
    .or('correct_answer.is.null,correct_answer.eq.');

  if (error) { console.error('Erro ao buscar no Supabase:', error.message); return; }
  console.log(`Total de pendências ABEM no Supabase: ${dbQs.length}`);

  const resolved = [];
  for (const dbQ of dbQs) {
    let bestSim = 0;
    let bestExamQ = null;

    for (const eq of allExamQuestions) {
      const sim = textSim(dbQ.statement, eq.stmt);
      if (sim > bestSim) {
        bestSim = sim;
        bestExamQ = eq;
      }
    }

    if (bestExamQ && bestSim >= 0.55) {
      const offAns = bestExamQ.officialAnswer;
      const offText = bestExamQ.winningText || bestExamQ.opts[offAns] || '';

      // Anti-permutação: verificar opções no banco
      const dbOpts = Array.isArray(dbQ.options) ? dbQ.options : [];
      let bestOptSim = 0;
      let matchedDbOpt = null;

      for (const opt of dbOpts) {
        const sim = textSim(opt.text, offText);
        if (sim > bestOptSim) {
          bestOptSim = sim;
          matchedDbOpt = opt;
        }
      }

      let finalMappedLetter = offAns;
      let wasRemapped = false;
      if (matchedDbOpt && bestOptSim >= 0.60) {
        finalMappedLetter = matchedDbOpt.letter;
        wasRemapped = finalMappedLetter !== offAns;
      }

      resolved.push({
        id: dbQ.id,
        code: dbQ.code,
        caderno: bestExamQ.caderno,
        qNum: bestExamQ.qNum,
        similarity: bestSim,
        gabaritoOficialExtraido: offAns,
        gabaritoMapeadoNoBanco: finalMappedLetter,
        foiRemapeado: wasRemapped,
        winningText: offText
      });
      console.log(`[MATCH ${(bestSim * 100).toFixed(1)}%] [${dbQ.code}] Q${bestExamQ.qNum} -> '${finalMappedLetter}' (Oficial: '${offAns}') ${wasRemapped ? '⚠️ REMAPEADA' : ''}`);
    }
  }

  console.log(`\n🎉 Total de questões casadas com sucesso para ABEM: ${resolved.length}/${dbQs.length}`);
  return resolved;
}

runAbem().catch(console.error);

