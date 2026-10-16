import fs from 'fs';
import { PDFParse } from 'pdf-parse';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

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

async function run() {
  const pvPath = 'data/official_exams/UNICAMP/UNICAMP_2026_PROVA_ACESSO_DIRETO.pdf';
  const gbPath = 'data/official_exams/UNICAMP/UNICAMP_2026_GABARITO_DEFINITIVO.pdf';

  if (!fs.existsSync(pvPath) || !fs.existsSync(gbPath)) {
    console.log('Arquivos não encontrados');
    return;
  }

  // 1. Parse Gabarito
  const gbBuf = new Uint8Array(fs.readFileSync(gbPath));
  const gbParser = new PDFParse(gbBuf);
  await gbParser.load();
  const gbRes = await gbParser.getText();
  const gbText = typeof gbRes === 'string' ? gbRes : (gbRes.text || '');

  // Extrai linhas "1 Tomografia computadorizada..."
  const lines = gbText.split('\n').map(l => l.trim()).filter(Boolean);
  const answers = {};
  for (const l of lines) {
    const m = l.match(/^(\d{1,2})\s+(.+)$/);
    if (m) {
      answers[parseInt(m[1], 10)] = m[2].trim();
    }
  }
  console.log('Gabarito UNICAMP extraído:', Object.keys(answers).length, 'respostas');
  console.log('Exemplos de gabarito:', Object.entries(answers).slice(0, 5));

  // 2. Parse Prova
  const pvBuf = new Uint8Array(fs.readFileSync(pvPath));
  const pvParser = new PDFParse(pvBuf);
  await pvParser.load();
  const pvRes = await pvParser.getText();
  const pvText = typeof pvRes === 'string' ? pvRes : (pvRes.text || '');

  // Separar questões: "1.Homem, 74a...", "2.Mulher, 52a..."
  const qMatches = [];
  const regex = /(?:^|\n)\s*(\d{1,2})\s*[\.\-–\)]\s*([A-Z][^\n]+)/g;
  let m;
  while ((m = regex.exec(pvText)) !== null) {
    qMatches.push({ qNum: parseInt(m[1], 10), index: m.index, header: m[2] });
  }
  console.log('Questões detectadas no caderno:', qMatches.length);

  // 3. Buscar do Supabase
  const headers = { 'apikey': SERVICE_KEY, 'Authorization': 'Bearer ' + SERVICE_KEY };
  const res = await fetch(SUPABASE_URL + '/rest/v1/questions?institution=ilike.*UNICAMP*&year=eq.2026&select=id,code,statement,correct_answer', { headers });
  const dbQuestions = await res.json();
  console.log('Questões no Supabase para UNICAMP 2026:', dbQuestions.length);

  // 4. Comparar tokens
  let matched = 0;
  for (let i = 0; i < qMatches.length; i++) {
    const curr = qMatches[i];
    const next = qMatches[i + 1];
    const rawStmt = next ? pvText.substring(curr.index, next.index) : pvText.substring(curr.index, curr.index + 2000);
    const cleanStmt = rawStmt.replace(/^\s*\d{1,2}\s*[\.\-–\)]\s*/, '').trim();
    const qTokens = getTokens(cleanStmt);

    for (const dq of dbQuestions) {
      const dTokens = getTokens(dq.statement);
      let common = 0;
      for (const t of qTokens) {
        if (dTokens.has(t)) common++;
      }
      const score = common / (qTokens.size + dTokens.size - common);
      if (score >= 0.35) {
        matched++;
        console.log(`MATCH! Q${curr.qNum} -> DB ${dq.code} (Score: ${score.toFixed(2)})`);
        console.log(`  Gabarito: "${answers[curr.qNum]}"`);
        console.log(`  DB Stmt: ${dq.statement.slice(0, 80)}...`);
      }
    }
  }
  console.log(`Total de matches encontrados: ${matched}`);
}
run();
