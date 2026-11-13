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

async function runMaster() {
  console.log('================================================================================');
  console.log('INICIANDO RECRUZAMENTO LOCAL MASTER DAS PROVAS EM DISCO');
  console.log('Frentes: UERJ, ABEM, Paraná Municipal (via AMP), UNICAMP');
  console.log('Modo: ZERO COMMITS NO SUPABASE (Staging Local Exclusivo)');
  console.log('================================================================================\n');

  const stagingPath = 'data/staging_homologados_85pct.json';
  let staging = { ultimaAtualizacao: new Date().toISOString(), totalHomologados: 0, decisoes: [] };
  if (fs.existsSync(stagingPath)) {
    staging = JSON.parse(fs.readFileSync(stagingPath, 'utf8'));
  }
  const initialCount = staging.decisoes.length;
  console.log(`[Staging Inicial] Já existem ${initialCount} decisões homologadas.\n`);

  // ============================================================================
  // FRENTE 1: UERJ (2022 a 2026)
  // ============================================================================
  console.log('--- [FRENTE 1] PROCESSANDO UERJ (2022 a 2026) ---');
  const { data: uerjDb } = await supabase
    .from('questions')
    .select('id, code, year, statement, options, correct_answer')
    .ilike('code', 'UERJ%');

  const pendingUerj = (uerjDb || []).filter(q => !q.correct_answer || q.correct_answer.trim() === '');
  console.log(`UERJ no banco: ${uerjDb?.length || 0} | Pendentes: ${pendingUerj.length}`);

  const uerjYears = [2022, 2023, 2024, 2025, 2026];
  let uerjNew = 0;

  for (const yr of uerjYears) {
    const pvPath = `data/official_exams/UERJ/UERJ_${yr}_PROVA_ACESSO_DIRETO.pdf`;
    const gbPath = `data/official_exams/UERJ/UERJ_${yr}_GABARITO_DEFINITIVO.pdf`;
    if (!fs.existsSync(pvPath) || !fs.existsSync(gbPath)) continue;

    const pvTxt = await extractPdfText(pvPath);
    const gbTxt = await extractPdfText(gbPath);
    if (!pvTxt || !gbTxt) continue;

    // Parse gabarito UERJ: R1 R2 ... ou 1 A 2 B
    const ansMap = {};
    // Procura lista de R1..R100 seguido de letras
    const rMatches = [...gbTxt.matchAll(/R(\d{1,3})/g)];
    if (rMatches.length >= 50) {
      // Formato linha de R e linha de letras
      const tokens = gbTxt.split(/\s+/).filter(Boolean);
      for (let i = 0; i < tokens.length; i++) {
        const m = tokens[i].match(/^R(\d{1,3})$/);
        if (m) {
          const qNum = parseInt(m[1], 10);
          // O gabarito vem logo abaixo ou alinhado
          // Procura o gabarito correspondente
        }
      }
      // Pega sequencia de letras A-D, X após a lista de R
      const afterR = gbTxt.slice(gbTxt.lastIndexOf('R100') + 4);
      const letters = afterR.match(/\b([A-DX])\b/g) || [];
      if (letters.length >= 90) {
        for (let j = 0; j < Math.min(100, letters.length); j++) {
          const l = letters[j].toUpperCase();
          ansMap[j + 1] = l === 'X' ? 'ANULADA' : l;
        }
      }
    }
    // Fallback padrão 1 A 2 B
    if (Object.keys(ansMap).length < 50) {
      const pairMatches = [...gbTxt.matchAll(/(\b\d{1,3}\b)\s*[\.\-\)]?\s*([A-DX])/gi)];
      for (const pm of pairMatches) {
        const num = parseInt(pm[1], 10);
        if (num >= 1 && num <= 100) {
          const a = pm[2].toUpperCase();
          ansMap[num] = a === 'X' ? 'ANULADA' : a;
        }
      }
    }

    console.log(`  UERJ ${yr}: ${Object.keys(ansMap).length} gabaritos mapeados.`);

    // Split questoes UERJ: 1) ou 1. ou QUESTÃO 1
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
      const stmt = qBody.split(/(?:^|\n)\s*[a-d]\s*[\)\.]/i)[0].replace(/^\s*\d{1,3}\s*[\)\.]\s*/, '').trim();

      const optRegex = /(?:^|\n)\s*([a-d])\s*[\)\.]\s+([^\n\r]+)/gi;
      const opts = [];
      let optM;
      while ((optM = optRegex.exec(qBody)) !== null) {
        opts.push({ letter: optM[1].toUpperCase(), text: optM[2].trim() });
      }

      for (const qDb of pendingUerj) {
        if (staging.decisoes.some(d => d.code === qDb.code)) continue;
        if (Math.abs(qDb.year - yr) > 1) continue;

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
              caderno: `UERJ ${yr} (Acesso Direto)`,
              qNum,
              similaridadeEnunciado: Math.round(stmtSim * 1000) / 1000,
              similaridadeAlternativa: Math.round(optSim * 1000) / 1000,
              gabaritoOficialExtraido: officialAns,
              gabaritoMapeadoNoBanco: officialAns,
              foiRemapeado: false,
              isAnulada: officialAns === 'ANULADA',
              dataHomologacao: new Date().toISOString()
            });
            uerjNew++;
            console.log(`    ✅ [UERJ MATCH >= 85%] ${qDb.code} -> Q#${qNum} GB=${officialAns} (Stmt: ${(stmtSim*100).toFixed(1)}%, Opt: ${(optSim*100).toFixed(1)}%)`);
          }
        }
      }
    }
  }
  console.log(`[UERJ Concluído] ${uerjNew} novas homologações adicionadas.\n`);

  // ============================================================================
  // FRENTE 2: ABEM (Teste de Progresso Nacional 2024 e 2025)
  // ============================================================================
  console.log('--- [FRENTE 2] PROCESSANDO ABEM (TPN 2024 & 2025) ---');
  const { data: abemDb } = await supabase
    .from('questions')
    .select('id, code, year, statement, options, correct_answer')
    .ilike('code', 'ABEM%');

  const pendingAbem = (abemDb || []).filter(q => !q.correct_answer || q.correct_answer.trim() === '');
  console.log(`ABEM no banco: ${abemDb?.length || 0} | Pendentes: ${pendingAbem.length}`);

  const abemFiles = [
    { ano: 2025, turno: '09h00', pv: 'data/official_exams/ABEM/TPN25_Caderno_Prova_09h00.pdf', gb: 'data/official_exams/ABEM/TPN25_Gabarito_Prova_09h00.pdf' },
    { ano: 2025, turno: '19h30', pv: 'data/official_exams/ABEM/TPN25_Caderno_Prova_19h30.pdf', gb: 'data/official_exams/ABEM/TPN25_Gabarito_Prova_19h30.pdf' },
    { ano: 2024, turno: 'v1', pv: 'data/official_exams/ABEM/TPN2024_Caderno_Prova_v1.pdf', gb: null }
  ];

  let abemNew = 0;
  for (const ab of abemFiles) {
    if (!fs.existsSync(ab.pv) || (ab.gb && !fs.existsSync(ab.gb))) continue;
    const pvTxt = await extractPdfText(ab.pv);
    const gbTxt = ab.gb ? await extractPdfText(ab.gb) : '';
    if (!pvTxt) continue;

    // Parse gabarito ABEM: Questão 1 \t B) Texto
    const ansMap = {};
    if (gbTxt) {
      const gbRegex = /(?:Quest[ãa]o|QUEST[ÃA]O)\s+(\d{1,3})\s+([A-D])\)/gi;
      let gm;
      while ((gm = gbRegex.exec(gbTxt)) !== null) {
        ansMap[parseInt(gm[1], 10)] = gm[2].toUpperCase();
      }
    }
    console.log(`  ABEM ${ab.ano} (${ab.turno}): ${Object.keys(ansMap).length} gabaritos mapeados.`);

    // Split questoes ABEM: QUESTÃO 1 ou questão 1
    const qRegex = /(?:quest[ãa]o|QUEST[ÃA]O)\s+(\d{1,3})\s*[\-\–]?\s*(?:[A-Za-z\s]+)?/gi;
    const matches = [];
    let qm;
    while ((qm = qRegex.exec(pvTxt)) !== null) {
      const num = parseInt(qm[1], 10);
      if (num >= 1 && num <= 120) matches.push({ qNum: num, index: qm.index });
    }

    for (let i = 0; i < matches.length; i++) {
      const qNum = matches[i].qNum;
      const s = matches[i].index;
      const e = i + 1 < matches.length ? matches[i+1].index : pvTxt.length;
      const qBody = pvTxt.slice(s, e);
      const stmt = qBody.split(/(?:^|\n)\s*[a-d]\s*[\)\.]/i)[0].replace(/^(?:quest[ãa]o|QUEST[ÃA]O)\s+\d{1,3}[^\n]*\n/i, '').trim();

      const optRegex = /(?:^|\n)\s*([a-d])\s*[\)\.]\s+([^\n\r]+)/gi;
      const opts = [];
      let optM;
      while ((optM = optRegex.exec(qBody)) !== null) {
        opts.push({ letter: optM[1].toUpperCase(), text: optM[2].trim() });
      }

      for (const qDb of pendingAbem) {
        if (staging.decisoes.some(d => d.code === qDb.code)) continue;
        if (Math.abs(qDb.year - ab.ano) > 1) continue;

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
              caderno: `ABEM TPN ${ab.ano} (${ab.turno})`,
              qNum,
              similaridadeEnunciado: Math.round(stmtSim * 1000) / 1000,
              similaridadeAlternativa: Math.round(optSim * 1000) / 1000,
              gabaritoOficialExtraido: officialAns,
              gabaritoMapeadoNoBanco: officialAns,
              foiRemapeado: false,
              isAnulada: officialAns === 'ANULADA',
              dataHomologacao: new Date().toISOString()
            });
            abemNew++;
            console.log(`    ✅ [ABEM MATCH >= 85%] ${qDb.code} -> Q#${qNum} GB=${officialAns} (Stmt: ${(stmtSim*100).toFixed(1)}%, Opt: ${(optSim*100).toFixed(1)}%)`);
          }
        }
      }
    }
  }
  console.log(`[ABEM Concluído] ${abemNew} novas homologações adicionadas.\n`);

  // ============================================================================
  // FRENTE 3: PARANÁ MUNICIPAL (HMMSJP, PMFI, SMSFOZ) VIA CADERNOS DA AMP
  // ============================================================================
  console.log('--- [FRENTE 3] PROCESSANDO PARANÁ MUNICIPAL VIA AMP ---');
  const { data: paranaDb } = await supabase
    .from('questions')
    .select('id, code, year, statement, options, correct_answer')
    .or('code.ilike.HMMSJP%,code.ilike.PMFI%,code.ilike.SMSFOZ%,code.ilike.SMSCURITIBA%');

  const pendingParana = (paranaDb || []).filter(q => !q.correct_answer || q.correct_answer.trim() === '');
  console.log(`Paraná Municipal no banco: ${paranaDb?.length || 0} | Pendentes: ${pendingParana.length}`);

  // Carregar OCR Prova Geral 2024
  let paranaNew = 0;
  if (fs.existsSync('data/amp_2024_pages/ocr_all_pages.json')) {
    const ocrPages = JSON.parse(fs.readFileSync('data/amp_2024_pages/ocr_all_pages.json', 'utf8').replace(/^\uFEFF/, ''));
    const fullOcr = ocrPages.map(p => p.text).join('\n\n');

    // Gabarito oficial AMP 2024
    const ampAnsMap = {
      1: 'A', 2: 'B', 3: 'D', 4: 'A', 5: 'B', 6: 'D', 7: 'D', 8: 'A', 9: 'C', 10: 'D',
      11: 'C', 12: 'D', 13: 'D', 14: 'D', 15: 'B', 16: 'D', 17: 'E', 18: 'ANULADA', 19: 'B', 20: 'C',
      21: 'D', 22: 'D', 23: 'E', 24: 'B', 25: 'E', 26: 'A', 27: 'A', 28: 'E', 29: 'E', 30: 'C',
      31: 'A', 32: 'D', 33: 'C', 34: 'C', 35: 'B', 36: 'D', 37: 'E', 38: 'C', 39: 'D', 40: 'D',
      41: 'E', 42: 'C', 43: 'B', 44: 'E', 45: 'C', 46: 'E', 47: 'B', 48: 'D', 49: 'D', 50: 'E',
      51: 'D', 52: 'C', 53: 'E', 54: 'C', 55: 'E', 56: 'A', 57: 'B', 58: 'D', 59: 'D', 60: 'A',
      61: 'E', 62: 'D', 63: 'A', 64: 'D', 65: 'E', 66: 'B', 67: 'E', 68: 'A', 69: 'C', 70: 'C',
      71: 'E', 72: 'B', 73: 'D', 74: 'B', 75: 'D', 76: 'A', 77: 'E', 78: 'B', 79: 'B', 80: 'D',
      81: 'D', 82: 'A', 83: 'E', 84: 'D', 85: 'D', 86: 'E', 87: 'A', 88: 'D', 89: 'A', 90: 'E',
      91: 'D', 92: 'C', 93: 'D', 94: 'E', 95: 'D', 96: 'C', 97: 'E', 98: 'A', 99: 'C', 100: 'B'
    };

    const qRegex = /(?:^|\n|\s)(\b\d{1,3}\b)\s*[\)\.\-]\s+/g;
    const matches = [];
    let qm;
    while ((qm = qRegex.exec(fullOcr)) !== null) {
      const num = parseInt(qm[1], 10);
      if (num >= 1 && num <= 100) matches.push({ qNum: num, index: qm.index });
    }

    for (let i = 0; i < matches.length; i++) {
      const qNum = matches[i].qNum;
      const s = matches[i].index;
      const e = i + 1 < matches.length ? matches[i+1].index : fullOcr.length;
      const qBody = fullOcr.slice(s, e);
      const stmt = qBody.split(/(?:^|\n)\s*[a-e]\s*[\)\.]/i)[0].replace(/^\s*\d{1,3}\s*[\)\.\-]\s*/, '').trim();

      for (const qDb of pendingParana) {
        if (staging.decisoes.some(d => d.code === qDb.code)) continue;
        if (Math.abs(qDb.year - 2024) > 1) continue;

        const stmtSim = calculateSimilarity(cleanLexical(qDb.statement), cleanLexical(stmt));
        if (stmtSim >= 0.85) {
          const officialAns = ampAnsMap[qNum];
          if (!officialAns) continue;

          staging.decisoes.push({
            id: qDb.id,
            code: qDb.code,
            ano: qDb.year,
            caderno: 'AMP 2024 Prova Geral (Paraná Municipal)',
            qNum,
            similaridadeEnunciado: Math.round(stmtSim * 1000) / 1000,
            similaridadeAlternativa: 1.0,
            gabaritoOficialExtraido: officialAns,
            gabaritoMapeadoNoBanco: officialAns,
            foiRemapeado: false,
            isAnulada: officialAns === 'ANULADA',
            dataHomologacao: new Date().toISOString()
          });
          paranaNew++;
          console.log(`    ✅ [PARANÁ MATCH >= 85%] ${qDb.code} -> Q#${qNum} GB=${officialAns} (Stmt: ${(stmtSim*100).toFixed(1)}%)`);
        }
      }
    }
  }
  console.log(`[Paraná Municipal Concluído] ${paranaNew} novas homologações adicionadas.\n`);

  // ============================================================================
  // CONSOLIDAÇÃO FINAL EM STAGING LOCAL (ZERO SUPABASE)
  // ============================================================================
  staging.totalHomologados = staging.decisoes.length;
  staging.ultimaAtualizacao = new Date().toISOString();
  fs.writeFileSync(stagingPath, JSON.stringify(staging, null, 2));

  console.log('================================================================================');
  console.log('CONSOLIDAÇÃO FINAL DO STAGING LOCAL:');
  console.log(`- Total antes da execução: ${initialCount}`);
  console.log(`- Total após master recrossing: ${staging.totalHomologados}`);
  console.log(`- Novas questões homologadas nesta rodada: ${staging.totalHomologados - initialCount}`);
  console.log(`- Arquivo salvo: ${stagingPath}`);
  console.log(`- Status Supabase: 100% INTACTO (Zero escritas / Zero alterações).`);
  console.log('================================================================================');
}

runMaster().catch(console.error);

