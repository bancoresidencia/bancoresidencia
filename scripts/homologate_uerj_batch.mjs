import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');
import { createClient } from '@supabase/supabase-js';

const WRITE_TO_SUPABASE = false; // MODO SEGURO: STAGING PURO
const SIMILARITY_THRESHOLD = 0.85;

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function cleanText(txt) {
  if (!txt) return '';
  return txt
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/["'“”«»]/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
}

function calculateJaccard(s1, s2) {
  const words1 = new Set(cleanText(s1).split(' ').filter(w => w.length > 2));
  const words2 = new Set(cleanText(s2).split(' ').filter(w => w.length > 2));
  if (words1.size === 0 || words2.size === 0) return 0;
  let intersection = 0;
  for (const w of words1) if (words2.has(w)) intersection++;
  return intersection / new Set([...words1, ...words2]).size;
}

function getBiGrams(str) {
  const s = cleanText(str).replace(/\s+/g, '');
  const bigrams = new Set();
  for (let i = 0; i < s.length - 1; i++) bigrams.add(s.slice(i, i + 2));
  return bigrams;
}

function calculateSimilarity(s1, s2) {
  const jaccard = calculateJaccard(s1, s2);
  const bg1 = getBiGrams(s1);
  const bg2 = getBiGrams(s2);
  if (bg1.size === 0 || bg2.size === 0) return jaccard;
  let inter = 0;
  for (const bg of bg1) if (bg2.has(bg)) inter++;
  const bgSim = (2.0 * inter) / (bg1.size + bg2.size);
  return (jaccard * 0.4) + (bgSim * 0.6);
}

async function parsePdf(pdfPath) {
  const buf = new Uint8Array(fs.readFileSync(pdfPath));
  const p = new PDFParse({ data: buf });
  await p.load();
  return (await p.getText()).text || await p.getText();
}

function parseUerjGabarito(text) {
  const map = new Map();
  // Padrão UERJ: 1 A ou 01 A ou Questão 1 A
  const regex = /(?:^|\n|\s)(\d{1,3})\s*[\-\.\)]?\s*([A-Ea-eX\-\*])/g;
  let m;
  while ((m = regex.exec(text)) !== null) {
    const num = parseInt(m[1], 10);
    const ans = m[2].toUpperCase();
    if (num >= 1 && num <= 100 && !map.has(num)) {
      map.set(num, (ans === 'X' || ans === '-' || ans === '*') ? 'ANULADA' : ans);
    }
  }
  return map;
}

function parseUerjExam(text) {
  // Encontra questões numeradas de 1 a 100
  const qRegex = /(?:^|\n)\s*(?:QUEST[ÃA]O\s+|Q\.\s*)?(\d{1,3})[\.\-\)\s]+([\s\S]*?)(?=(?:\n\s*(?:QUEST[ÃA]O\s+|Q\.\s*)?\d{1,3}[\.\-\)\s]+)|$)/gi;
  const questions = [];
  let match;
  while ((match = qRegex.exec(text)) !== null) {
    const qNum = parseInt(match[1], 10);
    const body = match[2].trim();
    if (qNum >= 1 && qNum <= 100 && body.length > 30) {
      const optRegex = /(?:^|\n)\s*([A-D])[\.\)\-\s]\s*([\s\S]*?)(?=(?:\n\s*[A-D][\.\)\-\s])|$)/g;
      let optMatch;
      const options = [];
      let firstOptIdx = body.length;
      while ((optMatch = optRegex.exec(body)) !== null) {
        if (optMatch.index < firstOptIdx) firstOptIdx = optMatch.index;
        options.push({
          letter: optMatch[1].toUpperCase(),
          text: optMatch[2].replace(/\s+/g, ' ').trim()
        });
      }
      const statement = body.slice(0, firstOptIdx).replace(/\s+/g, ' ').trim();
      questions.push({ num: qNum, statement, options });
    }
  }
  return questions;
}

async function homologateUerj() {
  console.log('=== HOMOLOGAÇÃO OFICIAL UERJ (DUPLA TRAVA >= 85%) ===\n');

  const { data: dbUerj } = await supabase
    .from('questions')
    .select('id, code, year, institution, statement, options, correct_answer')
    .ilike('institution', '%UERJ%')
    .or('correct_answer.is.null,correct_answer.eq.');

  console.log(`Total UERJ pendentes no banco: ${dbUerj.length}`);

  const homologadas = [];
  const years = ['2022', '2023', '2024', '2025', '2026'];

  for (const yr of years) {
    const pvPath = `data/official_exams/UERJ/UERJ_${yr}_PROVA_ACESSO_DIRETO.pdf`;
    const gbPath = `data/official_exams/UERJ/UERJ_${yr}_GABARITO_DEFINITIVO.pdf`;
    if (!fs.existsSync(pvPath) || !fs.existsSync(gbPath)) continue;

    console.log(`\nProcessando UERJ ${yr}...`);
    const pvText = await parsePdf(pvPath);
    const gbText = await parsePdf(gbPath);
    
    const gbMap = parseUerjGabarito(gbText);
    const pvQuestions = parseUerjExam(pvText);
    console.log(`  -> Questões extraídas do caderno: ${pvQuestions.length} | Gabaritos: ${gbMap.size}`);

    const dbYr = dbUerj.filter(q => String(q.year) === yr || !q.year);

    for (const dbQ of dbYr) {
      for (const exQ of pvQuestions) {
        const stmtSim = calculateSimilarity(dbQ.statement, exQ.statement);
        if (stmtSim < SIMILARITY_THRESHOLD) continue;

        const officialAns = gbMap.get(exQ.num);
        if (!officialAns) continue;

        if (officialAns === 'ANULADA') {
          homologadas.push({
            id: dbQ.id,
            code: dbQ.code,
            year: dbQ.year,
            num: exQ.num,
            isAnulada: true,
            gabaritoOficial: 'ANULADA',
            gabaritoDb: 'ANULADA',
            simEnunciado: parseFloat(stmtSim.toFixed(4)),
            simAlternativa: 1.0,
            origem: `UERJ_${yr}_OFICIAL`
          });
          break;
        }

        const winOpt = exQ.options.find(o => o.letter === officialAns);
        const winText = winOpt ? winOpt.text : '';

        let bestOptSim = 0;
        let matchedDbLetter = null;
        if (Array.isArray(dbQ.options) && winText) {
          for (const opt of dbQ.options) {
            const oText = opt.text || opt.descricao || '';
            const oSim = calculateSimilarity(winText, oText);
            if (oSim > bestOptSim) {
              bestOptSim = oSim;
              matchedDbLetter = opt.letter;
            }
          }
        }

        if (bestOptSim >= SIMILARITY_THRESHOLD && matchedDbLetter) {
          homologadas.push({
            id: dbQ.id,
            code: dbQ.code,
            year: dbQ.year,
            num: exQ.num,
            isAnulada: false,
            gabaritoOficial: officialAns,
            gabaritoDb: matchedDbLetter,
            simEnunciado: parseFloat(stmtSim.toFixed(4)),
            simAlternativa: parseFloat(bestOptSim.toFixed(4)),
            origem: `UERJ_${yr}_OFICIAL`
          });
          break;
        }
      }
    }
  }

  console.log(`\n======================================================`);
  console.log(`RESULTADO UERJ:`);
  console.log(`Homologadas com Dupla Trava >= 85%: ${homologadas.length}`);
  console.log(`Gravação no Supabase executada: ${WRITE_TO_SUPABASE} (RIGOROSAMENTE ZERO)`);
  console.log(`======================================================`);

  fs.writeFileSync('data/staging_uerj_homologados.json', JSON.stringify(homologadas, null, 2), 'utf8');
}

homologateUerj().catch(console.error);
