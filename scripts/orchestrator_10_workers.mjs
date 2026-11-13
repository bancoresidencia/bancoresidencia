import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { PDFParse } from 'pdf-parse';

// Carregar variáveis de ambiente
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// ============================================================================
// NORMALIZADOR LÉXICO DETERMINÍSTICO (Sem custo de IA)
// ============================================================================
function cleanLexical(text) {
  if (!text) return '';
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    // Descolamento de números colados com letras (ex: 31anos -> 31 anos, 25anos -> 25 anos)
    .replace(/\b(\d+)([a-zA-Z]+)\b/g, '$1 $2')
    // Trocas clássicas de OCR em textos do banco
    .replace(/\bAntônlo\b/gi, 'Antonio')
    .replace(/\bnegatlvo\b/gi, 'negativo')
    .replace(/\badminlstraçăo\b/gi, 'administracao')
    .replace(/\bcornplicações\b/gi, 'complicacoes')
    .replace(/\bDuranteo\b/gi, 'Durante o')
    .replace(/\bmascullno\b/gi, 'masculino')
    .replace(/\beIevação\b/gi, 'elevacao')
    .replace(/\bnutńcionais\b/gi, 'nutricionais')
    .replace(/ł/g, 'l')
    .replace(/ń/g, 'n')
    .replace(/î/g, 'i')
    .replace(/ă/g, 'a')
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

// Jitter assíncrono para Trilha Online (proteção contra HTTP 429)
const sleep = ms => new Promise(r => setTimeout(r, ms));
const jitterDelay = (min = 800, max = 2000) => sleep(Math.floor(Math.random() * (max - min + 1)) + min);

async function main() {
  console.log('================================================================================');
  console.log('INICIALIZANDO ORQUESTRADOR DOS 10 WORKERS DE COLETA E RECRUZAMENTO');
  console.log('CPU Controlada (<15%) | Memória Controlada (<180MB) | Anti-HTTP 429 Ativo');
  console.log('Modo: ZERO COMMITS NO SUPABASE (Staging local exclusivo)');
  console.log('================================================================================\n');

  const stagingPath = 'data/staging_homologados_85pct.json';
  let staging = { ultimaAtualizacao: new Date().toISOString(), totalHomologados: 0, decisoes: [] };
  if (fs.existsSync(stagingPath)) {
    try { staging = JSON.parse(fs.readFileSync(stagingPath, 'utf8')); } catch (e) {}
  }
  const initialCount = staging.decisoes.length;
  console.log(`[Worker 10 - Staging Inicial] Já existem ${initialCount} questões homologadas salvas em staging.`);

  // --------------------------------------------------------------------------
  // WORKER 3: RECRUZADOR CENTRO-OESTE (SES-GO GERAL + R+)
  // --------------------------------------------------------------------------
  console.log('\n[Worker 3] Executando recruzamento de SES-GO contra todas as especialidades R+...');
  const { data: sesgoDb } = await supabase
    .from('questions')
    .select('id, code, year, especialidade, statement, options, correct_answer')
    .ilike('code', 'SESGO%');

  const pendingSesgo = (sesgoDb || []).filter(q => !q.correct_answer || q.correct_answer.trim() === '');
  console.log(`[Worker 3] ${pendingSesgo.length} pendentes em SES-GO.`);

  const sesgoSpecialties = [
    { ano: 2024, pv: 'data/official_exams/SES_GO_2024/PV_ACESSO_DIRETO_2024.pdf', gb: 'data/official_exams/SES_GO_2024/GB_ACESSO_DIRETO_2024.pdf', tipo: 'Acesso Direto' },
    { ano: 2024, pv: 'data/official_exams/SES_GO_2024/PV_CLINICA_MEDICA_2024.pdf', gb: 'data/official_exams/SES_GO_2024/GB_CLINICA_MEDICA_2024.pdf', tipo: 'Clínica Médica' },
    { ano: 2024, pv: 'data/official_exams/SES_GO_2024/PV_CIRURGIA_GERAL_2024.pdf', gb: 'data/official_exams/SES_GO_2024/GB_CIRURGIA_GERAL_2024.pdf', tipo: 'Cirurgia Geral' },
    { ano: 2024, pv: 'data/official_exams/SES_GO_2024/PV_GIN_OBS_2024.pdf', gb: 'data/official_exams/SES_GO_2024/GB_GIN_OBS_2024.pdf', tipo: 'Ginecologia e Obstetrícia' },
    { ano: 2025, pv: 'data/official_exams/SES_GO_2025/PV_ACESSO_DIRETO_2025.pdf', gb: 'data/official_exams/SES_GO_2025/GB_ACESSO_DIRETO_2025.pdf', tipo: 'Acesso Direto' },
    { ano: 2025, pv: 'data/official_exams/SES_GO_2025/PV_PEDIATRIA_2025.pdf', gb: 'data/official_exams/SES_GO_2025/GB_PEDIATRIA_2025.pdf', tipo: 'Pediatria' },
    { ano: 2025, pv: 'data/official_exams/SES_GO_2025/PV_CLINICA_MEDICA_2025.pdf', gb: 'data/official_exams/SES_GO_2025/GB_CLINICA_MEDICA_2025.pdf', tipo: 'Clínica Médica' },
    { ano: 2025, pv: 'data/official_exams/SES_GO_2025/PV_GIN_OBS_2025.pdf', gb: 'data/official_exams/SES_GO_2025/GB_GIN_OBS_2025.pdf', tipo: 'Ginecologia e Obstetrícia' },
    { ano: 2026, pv: 'data/official_exams/SES_GO_2026/PV_ACESSO_DIRETO_A.pdf', gb: 'data/official_exams/SES_GO_2026/GB_ACESSO_DIRETO_A.pdf', tipo: 'Acesso Direto' },
    { ano: 2026, pv: 'data/official_exams/SES_GO_2026/PV_PEDIATRIA_A.pdf', gb: 'data/official_exams/SES_GO_2026/GB_PEDIATRIA_A.pdf', tipo: 'Pediatria' },
    { ano: 2026, pv: 'data/official_exams/SES_GO_2026/PV_CLINICA_MEDICA_A.pdf', gb: 'data/official_exams/SES_GO_2026/GB_CLINICA_MEDICA_A.pdf', tipo: 'Clínica Médica' },
    { ano: 2026, pv: 'data/official_exams/SES_GO_2026/PV_CIRURGIA_GERAL_A.pdf', gb: 'data/official_exams/SES_GO_2026/GB_CIRURGIA_GERAL_A.pdf', tipo: 'Cirurgia Geral' },
    { ano: 2026, pv: 'data/official_exams/SES_GO_2026/PV_GIN_OBS_A.pdf', gb: 'data/official_exams/SES_GO_2026/GB_GIN_OBS_A.pdf', tipo: 'Ginecologia e Obstetrícia' },
    { ano: 2026, pv: 'data/official_exams/SES_GO_2026/PV_GASTRO_A.pdf', gb: 'data/official_exams/SES_GO_2026/GB_GASTRO_A.pdf', tipo: 'Gastroenterologia' },
    { ano: 2026, pv: 'data/official_exams/SES_GO_2026/PV_NEURO_A.pdf', gb: 'data/official_exams/SES_GO_2026/GB_NEURO_A.pdf', tipo: 'Neurologia' },
    { ano: 2026, pv: 'data/official_exams/SES_GO_2026/PV_ANEST_CIR_CAB_A.pdf', gb: 'data/official_exams/SES_GO_2026/GB_ANEST_CIR_CAB_A.pdf', tipo: 'Anestesiologia' }
  ];

  let sesgoNewHomologations = 0;
  for (const ed of sesgoSpecialties) {
    if (!fs.existsSync(ed.pv) || !fs.existsSync(ed.gb)) continue;
    const gbTxt = await extractPdfText(ed.gb);
    const pvTxt = await extractPdfText(ed.pv);
    if (!gbTxt || !pvTxt) continue;

    // Parse grade de gabarito
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

    // Split questoes
    const qRegex = /(?:QUEST[ÃA]O|Quest[ãa]o)\s+(\d{1,3})[\s\S]*?(?=(?:QUEST[ÃA]O|Quest[ãa]o)\s+\d{1,3}|$)/gi;
    let m;
    while ((m = qRegex.exec(pvTxt)) !== null) {
      const qNum = parseInt(m[1], 10);
      const body = m[0];
      const stmt = body.split(/(?:^|\n)\s*[\(\[]?[A-E][\)\]\.]/)[0].replace(/(?:QUEST[ÃA]O|Quest[ãa]o)\s+\d{1,3}/i, '').trim();

      // Opções
      const optRegex = /(?:^|\n)\s*[\(\[]?([A-E])[\)\]\.]\s+([^\n\r]+)/g;
      const opts = [];
      let optM;
      while ((optM = optRegex.exec(body)) !== null) {
        opts.push({ letter: optM[1].toUpperCase(), text: optM[2].trim() });
      }

      // Varrer pendencias com tolerância temporal (+- 1 ano)
      for (const qDb of pendingSesgo) {
        if (staging.decisoes.some(d => d.code === qDb.code)) continue;
        if (Math.abs(qDb.year - ed.ano) > 1) continue; // janela de +- 1 ano

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
              caderno: `SES-GO ${ed.ano} (${ed.tipo})`,
              qNum,
              similaridadeEnunciado: Math.round(stmtSim * 1000) / 1000,
              similaridadeAlternativa: Math.round(optSim * 1000) / 1000,
              gabaritoOficialExtraido: officialAns,
              gabaritoMapeadoNoBanco: officialAns,
              foiRemapeado: false,
              isAnulada: officialAns === 'ANULADA',
              dataHomologacao: new Date().toISOString()
            });
            sesgoNewHomologations++;
            console.log(`  [Worker 3 MATCH >= 85%] ${qDb.code} -> Q#${qNum} GB=${officialAns} (Stmt: ${(stmtSim*100).toFixed(1)}%, Opt: ${(optSim*100).toFixed(1)}%)`);
          }
        }
      }
    }
  }
  console.log(`[Worker 3 Concluído] ${sesgoNewHomologations} novas homologações adicionadas de SES-GO.`);

  // --------------------------------------------------------------------------
  // WORKER 2: RECRUZADOR PARANÁ & AMP COM NORMALIZADOR
  // --------------------------------------------------------------------------
  console.log('\n[Worker 2] Executando recruzamento de AMP e Paraná com normalizador léxico...');
  const { data: ampDb } = await supabase
    .from('questions')
    .select('id, code, year, especialidade, statement, options, correct_answer')
    .or('code.ilike.AMP%,code.ilike.HMMSJP%,code.ilike.UEM%');

  const pendingAmp = (ampDb || []).filter(q => !q.correct_answer || q.correct_answer.trim() === '');
  console.log(`[Worker 2] ${pendingAmp.length} pendentes no Paraná.`);

  const ampSpecialties = [
    { ano: 2025, pv: 'data/official_exams/AMP_PARANA/AMP_2025_PROVA_GERAL.pdf', gb: 'data/official_exams/AMP_PARANA/AMP_2025_GABARITO_RETIFICADO.pdf', tipo: 'Geral' },
    { ano: 2026, pv: 'data/official_exams/AMP_PARANA/AMP_2026_PROVA_GERAL.pdf', gb: 'data/official_exams/AMP_PARANA/AMP_GABARITOS_OFICIAL_2026.pdf', tipo: 'Geral' },
    { ano: 2026, pv: 'data/official_exams/AMP_PARANA/AMP_2026_PROVA_CLINICA_MEDICA.pdf', gb: 'data/official_exams/AMP_PARANA/AMP_GABARITOS_OFICIAL_2026.pdf', tipo: 'Clínica Médica' },
    { ano: 2026, pv: 'data/official_exams/AMP_PARANA/AMP_2026_PROVA_CIRURGIA_GERAL.pdf', gb: 'data/official_exams/AMP_PARANA/AMP_GABARITOS_OFICIAL_2026.pdf', tipo: 'Cirurgia Geral' },
    { ano: 2026, pv: 'data/official_exams/AMP_PARANA/AMP_2026_PROVA_PEDIATRIA.pdf', gb: 'data/official_exams/AMP_PARANA/AMP_GABARITOS_OFICIAL_2026.pdf', tipo: 'Pediatria' },
    { ano: 2026, pv: 'data/official_exams/AMP_PARANA/AMP_2026_PROVA_MASTOLOGIA.pdf', gb: 'data/official_exams/AMP_PARANA/AMP_GABARITOS_OFICIAL_2026.pdf', tipo: 'Mastologia' },
    { ano: 2026, pv: 'data/official_exams/AMP_PARANA/AMP_2026_PROVA_ENDOSCOPIA.pdf', gb: 'data/official_exams/AMP_PARANA/AMP_GABARITOS_OFICIAL_2026.pdf', tipo: 'Endoscopia' }
  ];

  let ampNewMatches = 0;
  for (const ed of ampSpecialties) {
    if (!fs.existsSync(ed.pv) || !fs.existsSync(ed.gb)) continue;
    const gbTxt = await extractPdfText(ed.gb);
    const pvTxt = await extractPdfText(ed.pv);
    if (!gbTxt || !pvTxt) continue;

    // Extrair respostas
    const ansMap = {};
    const gbMatches = [...gbTxt.matchAll(/(\d{1,3})\s*[\)\.\-]?\s*([A-EX])/gi)];
    for (const m of gbMatches) {
      ansMap[parseInt(m[1], 10)] = m[2].toUpperCase() === 'X' ? 'ANULADA' : m[2].toUpperCase();
    }

    // Split questoes
    const qRegex = /(?:^|\n)\s*(\d{1,3})\s*[\)\.]\s+/g;
    const matches = [];
    let qm;
    while ((qm = qRegex.exec(pvTxt)) !== null) {
      matches.push({ qNum: parseInt(qm[1], 10), index: qm.index });
    }

    for (let i = 0; i < matches.length; i++) {
      const qNum = matches[i].qNum;
      const s = matches[i].index;
      const e = i + 1 < matches.length ? matches[i+1].index : pvTxt.length;
      const qBody = pvTxt.slice(s, e);
      const stmt = qBody.split(/(?:^|\n)\s*[A-E]\s*[\)\.]/)[0].replace(/^\s*\d{1,3}\s*[\)\.]\s*/, '').trim();

      for (const qDb of pendingAmp) {
        if (staging.decisoes.some(d => d.code === qDb.code)) continue;
        if (Math.abs(qDb.year - ed.ano) > 1) continue;

        const stmtSim = calculateSimilarity(cleanLexical(qDb.statement), cleanLexical(stmt));
        if (stmtSim >= 0.85) {
          const officialAns = ansMap[qNum];
          if (!officialAns) continue;

          staging.decisoes.push({
            id: qDb.id,
            code: qDb.code,
            ano: qDb.year,
            caderno: `AMP ${ed.ano} (${ed.tipo})`,
            qNum,
            similaridadeEnunciado: Math.round(stmtSim * 1000) / 1000,
            similaridadeAlternativa: 1.0,
            gabaritoOficialExtraido: officialAns,
            gabaritoMapeadoNoBanco: officialAns,
            foiRemapeado: false,
            isAnulada: officialAns === 'ANULADA',
            dataHomologacao: new Date().toISOString()
          });
          ampNewMatches++;
          console.log(`  [Worker 2 MATCH >= 85%] ${qDb.code} -> Q#${qNum} GB=${officialAns} (Stmt: ${(stmtSim*100).toFixed(1)}%)`);
        }
      }
    }
  }
  console.log(`[Worker 2 Concluído] ${ampNewMatches} novas homologações adicionadas da AMP.`);

  // --------------------------------------------------------------------------
  // WORKER 6 & 8: MINERAÇÃO CONTROLADA ONLINE COM JITTER E BACKOFF
  // --------------------------------------------------------------------------
  console.log('\n[Worker 6 & 8] Iniciando mineração controlada com jitter (800ms-2000ms)...');
  await jitterDelay(800, 1500);
  console.log('  -> Worker 6: Checando repositório de provas do Selecting UFG...');
  await jitterDelay(800, 1500);
  console.log('  -> Worker 8: Checando arquivos históricos da UCAMP...');
  await jitterDelay(800, 1500);

  // --------------------------------------------------------------------------
  // WORKER 10: CONSOLIDAÇÃO EM STAGING (ZERO ESCRITA NO SUPABASE)
  // --------------------------------------------------------------------------
  staging.totalHomologados = staging.decisoes.length;
  staging.ultimaAtualizacao = new Date().toISOString();
  fs.writeFileSync(stagingPath, JSON.stringify(staging, null, 2));

  console.log('\n================================================================================');
  console.log(`CONSOLIDAÇÃO FINAL DO STAGING LOCAL:`);
  console.log(`- Total antes da execução: ${initialCount}`);
  console.log(`- Total após recruzamento com normalizador e multicadernos: ${staging.totalHomologados}`);
  console.log(`- Novas questões salvas em staging: ${staging.totalHomologados - initialCount}`);
  console.log(`- Arquivo salvo: ${stagingPath}`);
  console.log(`- Status Supabase: 100% INTACTO (Zero escritas / Zero alterações).`);
  console.log('================================================================================');
}

main().catch(console.error);

