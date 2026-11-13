import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { PDFParse } from 'pdf-parse';

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

async function run() {
  const stagingPath = 'data/staging_homologados_85pct.json';
  let staging = { ultimaAtualizacao: new Date().toISOString(), totalHomologados: 0, decisoes: [] };
  if (fs.existsSync(stagingPath)) {
    staging = JSON.parse(fs.readFileSync(stagingPath, 'utf8').replace(/^\uFEFF/, ''));
  }
  const initialCount = staging.decisoes.length;
  console.log(`[Staging Inicial] ${initialCount} decisões homologadas.`);

  const { data: dbQuestions } = await supabase
    .from('questions')
    .select('id, code, year, statement, options, correct_answer')
    .ilike('code', 'SESGO%');

  const pending = (dbQuestions || []).filter(q => !q.correct_answer || q.correct_answer.trim() === '');
  console.log(`SES-GO Pendentes: ${pending.length}`);

  const folders = ['data/official_exams/SES_GO_2024', 'data/official_exams/SES_GO_2025', 'data/official_exams/SES_GO_2026', 'data/official_exams/SES_GO'];
  const examPairs = [];

  for (const dir of folders) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir);
    const pvs = files.filter(f => f.startsWith('PV_') || f.includes('_PROVA_'));
    for (const pv of pvs) {
      let gbName = pv.replace(/^PV_/, 'GB_').replace(/_PROVA_/, '_GABARITO_');
      if (!files.includes(gbName)) {
        const cand = files.filter(f => (f.startsWith('GB_') || f.includes('GABARITO')) && f.endsWith('.pdf'));
        const pvBase = pv.replace(/^(?:PV_|SES_GO_\d+_PV_)/, '').replace(/\.pdf$/, '');
        const matchGb = cand.find(c => c.includes(pvBase));
        if (matchGb) gbName = matchGb;
        else if (cand.length === 1) gbName = cand[0];
      }
      if (files.includes(gbName)) {
        examPairs.push({
          pvPath: path.join(dir, pv),
          gbPath: path.join(dir, gbName),
          name: `${dir}/${pv}`,
          caderno: pv.replace(/\.pdf$/, '')
        });
      }
    }
  }

  let newHomologations = 0;

  for (const ep of examPairs) {
    const pvTxt = await extractPdfText(ep.pvPath);
    const gbTxt = await extractPdfText(ep.gbPath);
    if (!pvTxt || !gbTxt) continue;

    // Parse answer key
    const ansMap = {};
    const lines = gbTxt.split('\n').map(l => l.trim()).filter(Boolean);
    for (let i = 0; i < lines.length - 1; i++) {
      const numTokens = lines[i].split(/\s+/).filter(t => /^\d{1,3}$/.test(t));
      const letTokens = lines[i+1].split(/\s+/).filter(t => /^[A-Ea-eX]$/.test(t));
      if (numTokens.length === letTokens.length && numTokens.length >= 2) {
        for (let j = 0; j < numTokens.length; j++) {
          const qn = parseInt(numTokens[j], 10);
          const an = letTokens[j].toUpperCase();
          ansMap[qn] = an === 'X' ? 'ANULADA' : an;
        }
      }
    }
    if (Object.keys(ansMap).length < 10) {
      const pm = [...gbTxt.matchAll(/(\b\d{1,3}\b)\s*[\.\-\)]?\s*([A-Ea-eX])\b/g)];
      for (const m of pm) {
        const qn = parseInt(m[1], 10);
        const an = m[2].toUpperCase();
        ansMap[qn] = an === 'X' ? 'ANULADA' : an;
      }
    }

    const qMatches = [];
    const qRegex = /(?:QUESTÃO|Questão)\s+(\d{1,3})/gi;
    let qm;
    while ((qm = qRegex.exec(pvTxt)) !== null) {
      qMatches.push({ qNum: parseInt(qm[1], 10), index: qm.index });
    }

    for (let i = 0; i < qMatches.length; i++) {
      const qNum = qMatches[i].qNum;
      const s = qMatches[i].index;
      const e = i + 1 < qMatches.length ? qMatches[i+1].index : pvTxt.length;
      const qBody = pvTxt.slice(s, e);
      const stmt = qBody.split(/(?:^|\n)\s*\([a-d]\)|\([A-D]\)|(?:^|\n)\s*[a-d]\)/i)[0].replace(/^(?:QUESTÃO|Questão)\s+\d{1,3}[^\n]*\n/i, '').trim();

      // extract options
      const optRegex = /(?:^|\n)\s*(?:\(([a-d])\)|([a-d])\))\s+([^\n\r]+)/gi;
      const opts = [];
      let om;
      while ((om = optRegex.exec(qBody)) !== null) {
        const l = (om[1] || om[2]).toUpperCase();
        opts.push({ letter: l, text: om[3].trim() });
      }

      for (const qDb of pending) {
        if (staging.decisoes.some(d => d.code === qDb.code)) continue;

        const stmtSim = calculateSimilarity(qDb.statement, stmt);
        if (stmtSim >= 0.85) {
          const gbOficial = ansMap[qNum];
          if (!gbOficial) continue;

          // Dual-Gate validation
          let optSim = 1.0;
          if (gbOficial !== 'ANULADA' && opts.length > 0 && qDb.options) {
            const pdfOpt = opts.find(o => o.letter === gbOficial);
            const dbOpt = qDb.options.find(o => o.letter === gbOficial);
            if (pdfOpt && dbOpt) {
              optSim = calculateSimilarity(dbOpt.text, pdfOpt.text);
            } else {
              optSim = 0.5;
            }
          }

          if (optSim >= 0.85) {
            staging.decisoes.push({
              id: qDb.id,
              code: qDb.code,
              ano: qDb.year,
              caderno: ep.caderno,
              qNum,
              similaridadeEnunciado: Math.round(stmtSim * 1000) / 1000,
              similaridadeAlternativa: Math.round(optSim * 1000) / 1000,
              gabaritoOficialExtraido: gbOficial,
              gabaritoMapeadoNoBanco: gbOficial,
              foiRemapeado: false,
              isAnulada: gbOficial === 'ANULADA',
              dataHomologacao: new Date().toISOString()
            });
            newHomologations++;
            console.log(`  ✅ [SES-GO HOMOLOGADA] ${qDb.code} -> ${ep.caderno} Q#${qNum} GB=${gbOficial} (Stmt: ${(stmtSim*100).toFixed(1)}%, Opt: ${(optSim*100).toFixed(1)}%)`);
          }
        }
      }
    }
  }

  staging.totalHomologados = staging.decisoes.length;
  staging.ultimaAtualizacao = new Date().toISOString();
  fs.writeFileSync(stagingPath, JSON.stringify(staging, null, 2));

  console.log(`\nNovas homologações adicionadas: ${newHomologations}`);
  console.log(`Total em staging agora: ${staging.totalHomologados}`);
}

run().catch(console.error);
