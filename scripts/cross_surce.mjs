import fs from 'fs';
import { PDFParse } from 'pdf-parse';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function cleanLexical(text) {
  if (!text) return '';
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(\d+)([a-zA-Z]+)\b/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateJaccard(s1, s2) {
  const w1 = new Set(cleanLexical(s1).split(' ').filter(w => w.length > 2));
  const w2 = new Set(cleanLexical(s2).split(' ').filter(w => w.length > 2));
  if (w1.size === 0 || w2.size === 0) return 0;
  let inter = 0;
  for (const w of w1) if (w2.has(w)) inter++;
  return inter / new Set([...w1, ...w2]).size;
}

function getBiGrams(str) {
  const s = cleanLexical(str).replace(/\s+/g, '');
  const bg = new Set();
  for (let i = 0; i < s.length - 1; i++) bg.add(s.slice(i, i + 2));
  return bg;
}

function calculateSimilarity(s1, s2) {
  const j = calculateJaccard(s1, s2);
  const bg1 = getBiGrams(s1);
  const bg2 = getBiGrams(s2);
  if (bg1.size === 0 || bg2.size === 0) return j;
  let inter = 0;
  for (const b of bg1) if (bg2.has(b)) inter++;
  const bgSim = (2.0 * inter) / (bg1.size + bg2.size);
  return (j * 0.4) + (bgSim * 0.6);
}

async function extractPdfText(filePath) {
  if (!fs.existsSync(filePath)) return '';
  try {
    const buf = new Uint8Array(fs.readFileSync(filePath));
    if (buf.length === 0) return '';
    const parser = new PDFParse(buf);
    await parser.load();
    const res = await parser.getText();
    return typeof res === 'string' ? res : (res.text || '');
  } catch (e) {
    return '';
  }
}

async function main() {
  console.log('=== CRUZAMENTO SURCE CONTRA PROVAS DIGITAIS OFICIAIS ===');
  const stagingPath = 'data/staging_homologados_85pct.json';
  let staging = { ultimaAtualizacao: new Date().toISOString(), totalHomologados: 0, decisoes: [] };
  if (fs.existsSync(stagingPath)) {
    staging = JSON.parse(fs.readFileSync(stagingPath, 'utf8'));
  }
  const initialCount = staging.decisoes.length;

  const { data: surceDb, error: sErr } = await supabase
    .from('questions')
    .select('id, code, year, statement, options, correct_answer')
    .ilike('code', 'SURCE%');

  if (sErr) {
    console.error('Erro ao buscar SURCE do Supabase:', sErr);
    return;
  }
  const pending = surceDb.filter(q => !q.correct_answer || q.correct_answer.trim() === '');
  console.log(`Total de pendentes SURCE no banco: ${pending.length}`);

  const editions = [
    {
      ano: 2024,
      pv: 'data/official_exams/SURCE/SURCE_2024_PROVA_ACESSO_DIRETO.pdf',
      gb: 'data/official_exams/SURCE/SURCE_2024_GABARITO_PRELIMINAR.pdf',
      tipo: 'SURCE 2024 (Acesso Direto)'
    },
    {
      ano: 2022,
      pv: 'data/official_exams/SURCE/SURCE_2022_PROVA_ACESSO_DIRETO.pdf',
      gb: 'data/official_exams/SURCE/SURCE_2022_GABARITO_DEFINITIVO.pdf',
      tipo: 'SURCE 2022 (Acesso Direto)'
    }
  ];

  let totalNew = 0;
  for (const ed of editions) {
    if (!fs.existsSync(ed.pv) || !fs.existsSync(ed.gb)) continue;
    const gbTxt = await extractPdfText(ed.gb);
    const pvTxt = await extractPdfText(ed.pv);
    if (!gbTxt || !pvTxt) continue;

    console.log(`\nProcessando ${ed.tipo}... PV len=${pvTxt.length}, GB len=${gbTxt.length}`);

    // Parse gabarito em grade
    const ansMap = {};
    const lines = gbTxt.split('\n').map(l => l.trim()).filter(Boolean);
    for (let i = 0; i < lines.length - 1; i++) {
      const nums = lines[i].split(/\s+/);
      const ans = lines[i+1].split(/\s+/);
      if (nums.every(n => /^\d+$/.test(n)) && nums.length >= 4 && nums.length === ans.length) {
        for (let j = 0; j < nums.length; j++) {
          let a = ans[j].replace(/[*#]/g, '').toUpperCase();
          ansMap[parseInt(nums[j], 10)] = a === 'X' ? 'ANULADA' : a;
        }
      }
    }
    console.log(`  Gabaritos parseados em grade: ${Object.keys(ansMap).length} questões.`);

    // Split questoes: 01. ou 1. ou 100.
    const qRegex = /(?:^|\n)\s*(\b\d{1,3}\b)\s*[\.\-]\s+/g;
    const matches = [];
    let qm;
    while ((qm = qRegex.exec(pvTxt)) !== null) {
      const num = parseInt(qm[1], 10);
      if (num >= 1 && num <= 100) {
        matches.push({ qNum: num, index: qm.index });
      }
    }
    console.log(`  Questões identificadas no caderno: ${matches.length}`);

    for (let i = 0; i < matches.length; i++) {
      const qNum = matches[i].qNum;
      const s = matches[i].index;
      const e = i + 1 < matches.length ? matches[i+1].index : pvTxt.length;
      const qBody = pvTxt.slice(s, e);
      const stmt = qBody.split(/(?:^|\n)\s*[A-E]\s*[\)\.]/)[0].replace(/^\s*\d{1,3}\s*[\.\-]\s*/, '').trim();

      const optRegex = /(?:^|\n)\s*([A-E])\s*[\)\.]\s+([^\n\r]+)/g;
      const opts = [];
      let optM;
      while ((optM = optRegex.exec(qBody)) !== null) {
        opts.push({ letter: optM[1].toUpperCase(), text: optM[2].trim() });
      }

      for (const qDb of pending) {
        if (staging.decisoes.some(d => d.code === qDb.code)) continue;
        if (Math.abs(qDb.year - ed.ano) > 1) continue;

        const stmtSim = calculateSimilarity(qDb.statement, stmt);
        if (stmtSim >= 0.85) {
          const officialAns = ansMap[qNum];
          if (!officialAns) continue;

          let optSim = 1.0;
          if (officialAns !== 'ANULADA' && opts.length > 0) {
            const pdfOpt = opts.find(o => o.letter === officialAns);
            if (pdfOpt && qDb.options) {
              const dbOpt = qDb.options.find(o => o.letter === officialAns);
              if (dbOpt) optSim = calculateSimilarity(dbOpt.text, pdfOpt.text);
              else optSim = 0.5;
            }
          }

          if (optSim >= 0.85) {
            staging.decisoes.push({
              id: qDb.id,
              code: qDb.code,
              ano: qDb.year,
              caderno: ed.tipo,
              qNum,
              similaridadeEnunciado: Math.round(stmtSim * 1000) / 1000,
              similaridadeAlternativa: Math.round(optSim * 1000) / 1000,
              gabaritoOficialExtraido: officialAns,
              gabaritoMapeadoNoBanco: officialAns,
              foiRemapeado: false,
              isAnulada: officialAns === 'ANULADA',
              dataHomologacao: new Date().toISOString()
            });
            totalNew++;
            console.log(`  >>> [MATCH >= 85%] ${qDb.code} -> Q#${qNum} GB=${officialAns} (Stmt: ${(stmtSim*100).toFixed(1)}%, Opt: ${(optSim*100).toFixed(1)}%)`);
          }
        }
      }
    }
  }

  staging.totalHomologados = staging.decisoes.length;
  staging.ultimaAtualizacao = new Date().toISOString();
  fs.writeFileSync(stagingPath, JSON.stringify(staging, null, 2));

  console.log(`\nSURCE Concluído! ${totalNew} novas homologações adicionadas.`);
  console.log(`Total em Staging agora: ${staging.totalHomologados}`);
}

main().catch(console.error);
