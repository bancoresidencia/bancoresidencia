import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

function norm(text) {
  if (!text) return '';
  return text.normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function getTokens(text) {
  return new Set(norm(text).split(' ').filter(w => w.length >= 4));
}

// Extrai gabarito em grade
function parseGrid(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const map = new Map();
  for (let i = 0; i < lines.length - 1; i++) {
    const nums = lines[i].split(/\s+/);
    const answers = lines[i+1].split(/\s+/);
    if (nums.every(n => /^\d+$/.test(n)) && answers.length === nums.length) {
      if (answers.every(a => /^[A-EX\*]$/i.test(a.replace(/[\*]/g, '')))) {
        for (let j = 0; j < nums.length; j++) {
          const qNum = parseInt(nums[j], 10);
          let ans = answers[j].toUpperCase().replace(/\*/g, '');
          if (ans === 'X') ans = 'ANULADA';
          map.set(qNum, ans);
        }
      }
    }
  }
  return map;
}

// Divide o texto do caderno de prova por QUESTÃO XX
function splitQuestions(text) {
  const questions = [];
  // Procura padrões como "QUESTÃO 01", "QUESTÃO 1", "Questão 1"
  const regex = /(?:QUEST[ÃA]O|Quest[ãa]o)\s+(\d{1,3})[\s\S]*?(?=(?:QUEST[ÃA]O|Quest[ãa]o)\s+\d{1,3}|$)/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const qNum = parseInt(match[1], 10);
    const rawText = match[0];
    questions.push({ qNum, text: rawText });
  }
  return questions;
}

async function extractEdicao(provaPath, gabaritoPath, ano) {
  console.log(`\nProcessando SES-GO ${ano}...`);
  const gBuf = fs.readFileSync(gabaritoPath);
  const gParser = new PDFParse({ data: gBuf });
  await gParser.load();
  const gText = await gParser.getText();
  const gMap = parseGrid(gText.text || gText);
  console.log(`  Gabarito ${ano}: ${gMap.size} itens`);

  const pBuf = fs.readFileSync(provaPath);
  const pParser = new PDFParse({ data: pBuf });
  await pParser.load();
  const pText = await pParser.getText();
  const questions = splitQuestions(pText.text || pText);
  console.log(`  Caderno ${ano}: ${questions.length} questões detectadas`);

  const gold = [];
  for (const q of questions) {
    if (gMap.has(q.qNum)) {
      gold.push({
        ano,
        qNum: q.qNum,
        statement: q.text,
        tokens: getTokens(q.text),
        correct_answer: gMap.get(q.qNum),
        commentary: `Gabarito Oficial Definitivo pós-recurso SES-GO ${ano} (Questão ${q.qNum})`
      });
    }
  }
  return gold;
}

async function run() {
  const goldTotal = [];

  if (fs.existsSync('data/official_exams/SES_GO/SES_GO_2024_PROVA_ACESSO_DIRETO.pdf') &&
      fs.existsSync('data/official_exams/SES_GO/SES_GO_2024_GABARITO_DEFINITIVO.pdf')) {
    const g24 = await extractEdicao(
      'data/official_exams/SES_GO/SES_GO_2024_PROVA_ACESSO_DIRETO.pdf',
      'data/official_exams/SES_GO/SES_GO_2024_GABARITO_DEFINITIVO.pdf',
      2024
    );
    goldTotal.push(...g24);
  }

  if (fs.existsSync('data/official_exams/SES_GO/SES_GO_2026_PROVA_ACESSO_DIRETO.pdf') &&
      fs.existsSync('data/official_exams/SES_GO/SES_GO_2026_GABARITO_DEFINITIVO.pdf')) {
    const g26 = await extractEdicao(
      'data/official_exams/SES_GO/SES_GO_2026_PROVA_ACESSO_DIRETO.pdf',
      'data/official_exams/SES_GO/SES_GO_2026_GABARITO_DEFINITIVO.pdf',
      2026
    );
    goldTotal.push(...g26);
  }

  if (fs.existsSync('data/official_exams/SES_GO/SES_GO_2023_PROVA_ACESSO_DIRETO.pdf') &&
      fs.existsSync('data/official_exams/SES_GO/SES_GO_2023_GABARITO_DEFINITIVO.pdf')) {
    const g23 = await extractEdicao(
      'data/official_exams/SES_GO/SES_GO_2023_PROVA_ACESSO_DIRETO.pdf',
      'data/official_exams/SES_GO/SES_GO_2023_GABARITO_DEFINITIVO.pdf',
      2023
    );
    goldTotal.push(...g23);
  }

  console.log(`\n🎯 Total de questões oficiais da SES-GO indexadas: ${goldTotal.length}`);
  
  // Agora cruzar com as pendências do Supabase em lote2_pending_index.json
  const pending = JSON.parse(fs.readFileSync('data/lote2_pending_index.json', 'utf8'));
  console.log(`Buscando matches entre as ${pending.length} pendências...`);

  const matches = [];
  for (const q of pending) {
    if (!q.statement || q.statement.length < 40) continue;
    const qTokens = getTokens(q.statement);
    if (qTokens.size < 6) continue;

    let bestScore = 0;
    let bestCandidate = null;

    for (const c of goldTotal) {
      if (q.year && c.ano && q.year !== c.ano) continue;

      let intersection = 0;
      for (const t of qTokens) {
        if (c.tokens.has(t)) intersection++;
      }
      if (intersection === 0) continue;

      const union = qTokens.size + c.tokens.size - intersection;
      const score = intersection / union;

      if (score > bestScore && score >= 0.40) {
        bestScore = score;
        bestCandidate = c;
      }
    }

    if (bestCandidate) {
      matches.push({
        id: q.id,
        code: q.code,
        institution: q.institution,
        banca: q.banca,
        year: q.year,
        correct_answer: bestCandidate.correct_answer,
        commentary: bestCandidate.commentary,
        score: bestScore
      });
    }
  }

  console.log(`\n✨ NOVOS MATCHES ENCONTRADOS: ${matches.length}`);
  if (matches.length > 0) {
    fs.writeFileSync('data/sesgo_matched_for_upload.json', JSON.stringify(matches, null, 2), 'utf8');
    console.log('Salvo em data/sesgo_matched_for_upload.json');
  }
}

run().catch(console.error);
