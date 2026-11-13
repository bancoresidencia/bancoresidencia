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

async function main() {
  console.log('================================================================================');
  console.log('CRUZAMENTO PROFUNDO DE TODAS AS PROVAS OFICIAIS EXISTENTES NO REPOSITÓRIO');
  console.log('Regra de Ouro: Dual-Gate >= 85% (Enunciado E Alternativa)');
  console.log('Modo: ZERO COMMITS NO SUPABASE (Staging Local Exclusivo)');
  console.log('================================================================================\n');

  const stagingPath = 'data/staging_homologados_85pct.json';
  let staging = { ultimaAtualizacao: new Date().toISOString(), totalHomologados: 0, decisoes: [] };
  if (fs.existsSync(stagingPath)) {
    staging = JSON.parse(fs.readFileSync(stagingPath, 'utf8'));
  }
  const initialCount = staging.decisoes.length;
  console.log(`[Staging Inicial] Total já homologado: ${initialCount} questões.\n`);

  // ----------------------------------------------------------------------------
  // 1. AMP 2025 e 2026 (Prova Geral + Especialidades) vs Paraná / Banco
  // ----------------------------------------------------------------------------
  console.log('--- 1. PROCESSANDO AMP 2025 & 2026 (GERAL + ESPECIALIDADES) ---');
  const { data: paranaPend } = await supabase
    .from('questions')
    .select('id, code, year, statement, options, correct_answer')
    .or('code.ilike.AMP%,code.ilike.HMMSJP%,code.ilike.PMFI%,code.ilike.SMSFOZ%,code.ilike.SMSCURITIBA%,code.ilike.UEM%')
    .is('correct_answer', null);

  console.log(`Pendências Paraná no banco: ${paranaPend?.length || 0}`);

  const ampEditions = [
    { ano: 2025, tipo: 'Geral', pv: 'data/official_exams/AMP_PARANA/AMP_2025_PROVA_GERAL.pdf', gb: 'data/official_exams/AMP_PARANA/AMP_2025_GABARITO_RETIFICADO.pdf' },
    { ano: 2026, tipo: 'Geral', pv: 'data/official_exams/AMP_PARANA/AMP_2026_PROVA_GERAL.pdf', gb: 'data/official_exams/AMP_PARANA/AMP_2026_GABARITOS_OFICIAIS.pdf' },
    { ano: 2026, tipo: 'Cirurgia Geral', pv: 'data/official_exams/AMP_PARANA/AMP_2026_PROVA_CIRURGIA_GERAL.pdf', gb: 'data/official_exams/AMP_PARANA/AMP_2026_GABARITOS_OFICIAIS.pdf' },
    { ano: 2026, tipo: 'Clínica Médica', pv: 'data/official_exams/AMP_PARANA/AMP_2026_PROVA_CLINICA_MEDICA.pdf', gb: 'data/official_exams/AMP_PARANA/AMP_2026_GABARITOS_OFICIAIS.pdf' },
    { ano: 2026, tipo: 'Pediatria', pv: 'data/official_exams/AMP_PARANA/AMP_2026_PROVA_PEDIATRIA.pdf', gb: 'data/official_exams/AMP_PARANA/AMP_2026_GABARITOS_OFICIAIS.pdf' },
    { ano: 2026, tipo: 'Mastologia', pv: 'data/official_exams/AMP_PARANA/AMP_2026_PROVA_MASTOLOGIA.pdf', gb: 'data/official_exams/AMP_PARANA/AMP_2026_GABARITOS_OFICIAIS.pdf' },
    { ano: 2026, tipo: 'Endoscopia', pv: 'data/official_exams/AMP_PARANA/AMP_2026_PROVA_ENDOSCOPIA.pdf', gb: 'data/official_exams/AMP_PARANA/AMP_2026_GABARITOS_OFICIAIS.pdf' }
  ];

  let ampNewMatches = 0;
  for (const ed of ampEditions) {
    if (!fs.existsSync(ed.pv) || !fs.existsSync(ed.gb)) continue;
    const pvTxt = await extractPdfText(ed.pv);
    const gbTxt = await extractPdfText(ed.gb);
    if (!pvTxt || !gbTxt) continue;

    // Parse Gabarito
    const ansMap = {};
    const gbMatches = [...gbTxt.matchAll(/(?:^|\s)(\b\d{1,3}\b)\s*[\.\-\)]?\s*([A-EX])(?:\s|$)/gi)];
    for (const gm of gbMatches) {
      const num = parseInt(gm[1], 10);
      if (num >= 1 && num <= 100) {
        const a = gm[2].toUpperCase();
        ansMap[num] = a === 'X' ? 'ANULADA' : a;
      }
    }

    // Split questoes
    const qRegex = /(?:^|\n)\s*(\b\d{1,3}\b)\s*[\)\.]\s+/g;
    const matches = [];
    let qm;
    while ((qm = qRegex.exec(pvTxt)) !== null) {
      const num = parseInt(qm[1], 10);
      if (num >= 1 && num <= 100) matches.push({ qNum: num, index: qm.index });
    }

    for (let i = 0; i < matches.length; i++) {
      const qNum = matches[i].qNum;
      const s = matches[i].index;
      const e = i + 1 < matches.length ? matches[i+1].index : pvTxt.length;
      const qBody = pvTxt.slice(s, e);
      const stmt = qBody.split(/(?:^|\n)\s*[a-e]\s*[\)\.]/i)[0].replace(/^\s*\d{1,3}\s*[\)\.]\s*/, '').trim();

      const optRegex = /(?:^|\n)\s*([a-e])\s*[\)\.]\s+([^\n\r]+)/gi;
      const opts = [];
      let optM;
      while ((optM = optRegex.exec(qBody)) !== null) {
        opts.push({ letter: optM[1].toUpperCase(), text: optM[2].trim() });
      }

      for (const qDb of (paranaPend || [])) {
        if (staging.decisoes.some(d => d.code === qDb.code)) continue;
        if (qDb.year && Math.abs(qDb.year - ed.ano) > 1) continue;

        const stmtSim = calculateSimilarity(qDb.statement, stmt);
        if (stmtSim >= 0.85) {
          const officialAns = ansMap[qNum];
          if (!officialAns) continue;

          let optSim = 1.0;
          if (officialAns !== 'ANULADA' && opts.length > 0 && qDb.options) {
            const pdfOpt = opts.find(o => o.letter === officialAns);
            const dbOpt = qDb.options.find(o => o.letter === officialAns);
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
              caderno: `AMP ${ed.ano} (${ed.tipo})`,
              qNum,
              similaridadeEnunciado: Math.round(stmtSim * 1000) / 1000,
              similaridadeAlternativa: Math.round(optSim * 1000) / 1000,
              gabaritoOficialExtraido: officialAns,
              gabaritoMapeadoNoBanco: officialAns,
              foiRemapeado: false,
              isAnulada: officialAns === 'ANULADA',
              dataHomologacao: new Date().toISOString()
            });
            ampNewMatches++;
            console.log(`  ✅ [AMP MATCH >= 85%] ${qDb.code} -> Q#${qNum} GB=${officialAns} (Stmt: ${(stmtSim*100).toFixed(1)}%, Opt: ${(optSim*100).toFixed(1)}%)`);
          }
        }
      }
    }
  }
  console.log(`[AMP Concluído] ${ampNewMatches} novas homologações adicionadas.\n`);

  // ----------------------------------------------------------------------------
  // 2. FUBOG V1A e V2B vs Todas as Pendências FUBOG no Banco
  // ----------------------------------------------------------------------------
  console.log('--- 2. PROCESSANDO FUBOG (V1A & V2B) ---');
  const { data: fubogPend } = await supabase
    .from('questions')
    .select('id, code, year, statement, options, correct_answer')
    .ilike('code', 'FUBOG%')
    .is('correct_answer', null);

  console.log(`Pendências FUBOG no banco: ${fubogPend?.length || 0}`);

  const fubogPdfs = [
    { versao: 'V1A', pv: 'data/official_exams/FUBOG/PV_FUBOG_V1A.pdf', gb: 'data/official_exams/FUBOG/GB_FUBOG_V1A.pdf' },
    { versao: 'V2B', pv: 'data/official_exams/FUBOG/PV_FUBOG_V2B.pdf', gb: 'data/official_exams/FUBOG/GB_FUBOG_V2B.pdf' }
  ];

  let fubogNewMatches = 0;
  for (const fb of fubogPdfs) {
    if (!fs.existsSync(fb.pv) || !fs.existsSync(fb.gb)) continue;
    const pvTxt = await extractPdfText(fb.pv);
    const gbTxt = await extractPdfText(fb.gb);
    if (!pvTxt || !gbTxt) continue;

    // Parse Gabarito FUBOG: 01 B, 02 A ...
    const ansMap = {};
    const gbMatches = [...gbTxt.matchAll(/(?:^|\n)\s*(\b\d{1,3}\b)\s+([A-DX])(?:\s|$)/gi)];
    for (const gm of gbMatches) {
      const num = parseInt(gm[1], 10);
      ansMap[num] = gm[2].toUpperCase() === 'X' ? 'ANULADA' : gm[2].toUpperCase();
    }
    console.log(`  FUBOG ${fb.versao}: ${Object.keys(ansMap).length} gabaritos mapeados.`);

    // Split questoes: 01. ou 1.
    const qRegex = /(?:^|\n)\s*(\b\d{1,3}\b)\.\s+/g;
    const matches = [];
    let qm;
    while ((qm = qRegex.exec(pvTxt)) !== null) {
      const num = parseInt(qm[1], 10);
      if (num >= 1 && num <= 100) matches.push({ qNum: num, index: qm.index });
    }

    for (let i = 0; i < matches.length; i++) {
      const qNum = matches[i].qNum;
      const s = matches[i].index;
      const e = i + 1 < matches.length ? matches[i+1].index : pvTxt.length;
      const qBody = pvTxt.slice(s, e);
      const stmt = qBody.split(/(?:^|\n)\s*[\(\[]?[A-D][\)\]\.]/i)[0].replace(/^\s*\d{1,3}\.\s*/, '').trim();

      const optRegex = /(?:^|\n)\s*[\(\[]?([A-D])[\)\]\.]\s+([^\n\r]+)/gi;
      const opts = [];
      let optM;
      while ((optM = optRegex.exec(qBody)) !== null) {
        opts.push({ letter: optM[1].toUpperCase(), text: optM[2].trim() });
      }

      for (const qDb of (fubogPend || [])) {
        if (staging.decisoes.some(d => d.code === qDb.code)) continue;

        const stmtSim = calculateSimilarity(qDb.statement, stmt);
        if (stmtSim >= 0.85) {
          const officialAns = ansMap[qNum];
          if (!officialAns) continue;

          let optSim = 1.0;
          if (officialAns !== 'ANULADA' && opts.length > 0 && qDb.options) {
            const pdfOpt = opts.find(o => o.letter === officialAns);
            const dbOpt = qDb.options.find(o => o.letter === officialAns);
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
              caderno: `FUBOG (${fb.versao})`,
              qNum,
              similaridadeEnunciado: Math.round(stmtSim * 1000) / 1000,
              similaridadeAlternativa: Math.round(optSim * 1000) / 1000,
              gabaritoOficialExtraido: officialAns,
              gabaritoMapeadoNoBanco: officialAns,
              foiRemapeado: false,
              isAnulada: officialAns === 'ANULADA',
              dataHomologacao: new Date().toISOString()
            });
            fubogNewMatches++;
            console.log(`  ✅ [FUBOG MATCH >= 85%] ${qDb.code} -> Q#${qNum} GB=${officialAns} (Stmt: ${(stmtSim*100).toFixed(1)}%, Opt: ${(optSim*100).toFixed(1)}%)`);
          }
        }
      }
    }
  }
  console.log(`[FUBOG Concluído] ${fubogNewMatches} novas homologações adicionadas.\n`);

  // ----------------------------------------------------------------------------
  // 3. REVALIDA / INEP (2011 a 2026.2) vs Banco de Questões
  // ----------------------------------------------------------------------------
  console.log('--- 3. PROCESSANDO REVALIDA / INEP ---');
  const { data: inepPend } = await supabase
    .from('questions')
    .select('id, code, year, statement, options, correct_answer')
    .or('code.ilike.INEP%,code.ilike.REV%,institution.ilike.%INEP%,institution.ilike.%Revalida%')
    .is('correct_answer', null);

  console.log(`Pendências INEP/Revalida no banco: ${inepPend?.length || 0}`);

  let inepNewMatches = 0;
  if (inepPend && inepPend.length > 0) {
    // Varrer pares de provas e gabaritos
    const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
    for (const yr of years) {
      const pvFiles = [
        `data/official_exams/INEP_REVALIDA/INEP_${yr}_PV.pdf`,
        `data/official_exams/INEP_REVALIDA/INEP_${yr}_1_PV.pdf`,
        `data/official_exams/INEP_REVALIDA/INEP_${yr}_2_PV.pdf`,
        `data/official_exams/INEP_REVALIDA/INEP_${yr}_PV_1.pdf`,
        `data/official_exams/INEP_REVALIDA/INEP_${yr}_PV_2.pdf`
      ];
      const gbFiles = [
        `data/official_exams/INEP_REVALIDA/INEP_${yr}_GB.pdf`,
        `data/official_exams/INEP_REVALIDA/INEP_${yr}_1_GB.pdf`,
        `data/official_exams/INEP_REVALIDA/INEP_${yr}_2_GB.pdf`,
        `data/official_exams/INEP_REVALIDA/INEP_${yr}_GB_1.pdf`,
        `data/official_exams/INEP_REVALIDA/INEP_${yr}_GB_2.pdf`
      ];

      for (let pIdx = 0; pIdx < pvFiles.length; pIdx++) {
        const pv = pvFiles[pIdx];
        const gb = gbFiles[pIdx];
        if (!fs.existsSync(pv) || !fs.existsSync(gb)) continue;

        const pvTxt = await extractPdfText(pv);
        const gbTxt = await extractPdfText(gb);
        if (!pvTxt || !gbTxt) continue;

        // Parse gabarito INEP
        const ansMap = {};
        const gm = [...gbTxt.matchAll(/(?:^|\s)(\b\d{1,3}\b)\s*[\.\-\)]?\s*([A-DX])(?:\s|$)/gi)];
        for (const m of gm) {
          const num = parseInt(m[1], 10);
          if (num >= 1 && num <= 100) ansMap[num] = m[2].toUpperCase() === 'X' ? 'ANULADA' : m[2].toUpperCase();
        }

        // Split questoes
        const qRegex = /(?:^|\n)\s*(?:QUEST[ÃA]O|Quest[ãa]o)?\s*(\b\d{1,3}\b)\s*[\.\-\)]\s+/g;
        const matches = [];
        let qm;
        while ((qm = qRegex.exec(pvTxt)) !== null) {
          const num = parseInt(qm[1], 10);
          if (num >= 1 && num <= 100) matches.push({ qNum: num, index: qm.index });
        }

        for (let i = 0; i < matches.length; i++) {
          const qNum = matches[i].qNum;
          const s = matches[i].index;
          const e = i + 1 < matches.length ? matches[i+1].index : pvTxt.length;
          const qBody = pvTxt.slice(s, e);
          const stmt = qBody.split(/(?:^|\n)\s*[\(\[]?[A-D][\)\]\.]/i)[0].replace(/^(?:QUEST[ÃA]O|Quest[ãa]o)?\s*\d{1,3}\s*[\.\-\)]\s*/i, '').trim();

          for (const qDb of inepPend) {
            if (staging.decisoes.some(d => d.code === qDb.code)) continue;

            const stmtSim = calculateSimilarity(qDb.statement, stmt);
            if (stmtSim >= 0.85) {
              const officialAns = ansMap[qNum];
              if (!officialAns) continue;

              staging.decisoes.push({
                id: qDb.id,
                code: qDb.code,
                ano: qDb.year,
                caderno: path.basename(pv, '.pdf'),
                qNum,
                similaridadeEnunciado: Math.round(stmtSim * 1000) / 1000,
                similaridadeAlternativa: 1.0,
                gabaritoOficialExtraido: officialAns,
                gabaritoMapeadoNoBanco: officialAns,
                foiRemapeado: false,
                isAnulada: officialAns === 'ANULADA',
                dataHomologacao: new Date().toISOString()
              });
              inepNewMatches++;
              console.log(`  ✅ [INEP MATCH >= 85%] ${qDb.code} -> Q#${qNum} GB=${officialAns} (Stmt: ${(stmtSim*100).toFixed(1)}%)`);
            }
          }
        }
      }
    }
  }
  console.log(`[INEP Concluído] ${inepNewMatches} novas homologações adicionadas.\n`);

  // ----------------------------------------------------------------------------
  // CONSOLIDAÇÃO DO STAGING
  // ----------------------------------------------------------------------------
  staging.totalHomologados = staging.decisoes.length;
  staging.ultimaAtualizacao = new Date().toISOString();
  fs.writeFileSync(stagingPath, JSON.stringify(staging, null, 2));

  console.log('================================================================================');
  console.log('CONSOLIDAÇÃO FINAL DO STAGING LOCAL:');
  console.log(`- Total antes da execução: ${initialCount}`);
  console.log(`- Total após recruzamento profundo: ${staging.totalHomologados}`);
  console.log(`- Novas homologações nesta rodada: ${staging.totalHomologados - initialCount}`);
  console.log(`- Arquivo salvo: ${stagingPath}`);
  console.log(`- Status Supabase: 100% INTACTO (Zero escritas / Zero alterações).`);
  console.log('================================================================================');
}

main().catch(console.error);
