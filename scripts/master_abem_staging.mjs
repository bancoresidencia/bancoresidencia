import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');
import { createClient } from '@supabase/supabase-js';

// =========================================================================
// REGRA MANDATÓRIA: ZERO ESCRITA NO SUPABASE (SOMENTE STAGING LOCAL)
// =========================================================================
const WRITE_TO_SUPABASE = false;
const SIMILARITY_THRESHOLD = 0.85; // DUPLA TRAVA >= 85%
const STAGING_OUTPUT = path.resolve('data/staging_homologados_85pct.json');

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const t = line.trim();
    if (t && !t.startsWith('#')) {
      const idx = t.indexOf('=');
      if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    }
  });
}
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
  for (const w of words1) {
    if (words2.has(w)) intersection++;
  }
  const union = new Set([...words1, ...words2]).size;
  return union === 0 ? 0 : intersection / union;
}

// Bi-gram similarity for precision
function getBiGrams(str) {
  const s = cleanText(str).replace(/\s+/g, '');
  const bigrams = new Set();
  for (let i = 0; i < s.length - 1; i++) {
    bigrams.add(s.slice(i, i + 2));
  }
  return bigrams;
}

function calculateSimilarity(s1, s2) {
  const jaccard = calculateJaccard(s1, s2);
  const bg1 = getBiGrams(s1);
  const bg2 = getBiGrams(s2);
  if (bg1.size === 0 || bg2.size === 0) return jaccard;
  let inter = 0;
  for (const bg of bg1) {
    if (bg2.has(bg)) inter++;
  }
  const bgSim = (2.0 * inter) / (bg1.size + bg2.size);
  return (jaccard * 0.4) + (bgSim * 0.6);
}

async function parseExamPdf(pdfPath) {
  const p = new PDFParse({ data: fs.readFileSync(pdfPath) });
  await p.load();
  const rawText = (await p.getText()).text || await p.getText();

  const qRegex = /Questão\s+(\d{1,3})\s*[-–]\s*([^\n]+)/gi;
  const matches = [...rawText.matchAll(qRegex)];
  
  const parsed = [];
  for (let i = 0; i < matches.length; i++) {
    const startIdx = matches[i].index + matches[i][0].length;
    const endIdx = (i < matches.length - 1) ? matches[i+1].index : rawText.length;
    const block = rawText.slice(startIdx, endIdx);
    
    const optRegex = /([A-D])\)\s+([\s\S]*?)(?=(?:[A-D]\)|--\s*\d+\s*of\s*\d+\s*--|$))/g;
    const optMatches = [...block.matchAll(optRegex)];
    
    const firstOptIdx = optMatches.length > 0 ? optMatches[0].index : block.length;
    const statement = block.slice(0, firstOptIdx).replace(/--\s*\d+\s*of\s*\d+\s*--/g, '').trim();
    
    const options = optMatches.map(m => ({
      letter: m[1],
      text: m[2].replace(/--\s*\d+\s*of\s*\d+\s*--/g, '').replace(/\s+/g, ' ').trim()
    }));

    parsed.push({
      num: parseInt(matches[i][1], 10),
      especialidade: matches[i][2].trim(),
      statement: statement.replace(/\s+/g, ' '),
      options
    });
  }
  return parsed;
}

async function parseGabaritoPdf(pdfPath) {
  const p = new PDFParse({ data: fs.readFileSync(pdfPath) });
  await p.load();
  const rawText = (await p.getText()).text || await p.getText();
  
  const regex = /(?:^|\n)\s*(\d{1,3})\s+([A-E])\)\s+([^\n]+)/g;
  const matches = [...rawText.matchAll(regex)];
  const map = new Map();
  for (const m of matches) {
    map.set(parseInt(m[1], 10), {
      letter: m[2].toUpperCase(),
      prefix: m[3].trim()
    });
  }
  return map;
}

async function matchAbem() {
  console.log('=== PROCESSAMENTO OFICIAL ABEM (TESTE DE PROGRESSO NACIONAL) ===');
  console.log('Modo: STAGING PURO (ZERO ESCRITA NO SUPABASE)');
  console.log(`Critério de Homologação: Dupla Trava >= ${SIMILARITY_THRESHOLD * 100}%\n`);

  // 1. Carrega dados já homologados em staging
  let stagingData = {
    ultimaAtualizacao: new Date().toISOString(),
    regra: "DUPLA_TRAVA_SIMILARIDADE_GE_85",
    threshold: SIMILARITY_THRESHOLD,
    totalHomologados: 0,
    modo: "STAGING_PURO_SEM_ESCRITA_SUPABASE",
    decisoes: []
  };

  if (fs.existsSync(STAGING_OUTPUT)) {
    try {
      stagingData = JSON.parse(fs.readFileSync(STAGING_OUTPUT, 'utf8'));
      console.log(`Staging existente carregado com ${stagingData.decisoes.length} homologações.`);
    } catch (e) {
      console.warn('Erro ao ler staging existente, criando novo.');
    }
  }

  const existingIds = new Set(stagingData.decisoes.map(d => d.id));

  // 2. Busca todas as questões pendentes da ABEM no banco
  const { data: dbQuestions, error } = await supabase
    .from('questions')
    .select('id, code, institution, banca, year, statement, options, correct_answer')
    .ilike('institution', '%ABEM%')
    .or('correct_answer.is.null,correct_answer.eq.');

  if (error) {
    console.error('Erro ao buscar questões da ABEM:', error);
    return;
  }

  console.log(`Total de questões pendentes da ABEM no banco: ${dbQuestions.length}`);

  // 3. Provas a processar
  const examSets = [
    {
      nome: 'ABEM TPN 2025 - 09h00',
      caderno: 'data/official_exams/ABEM/TPN25_Caderno_Prova_09h00.pdf',
      gabarito: 'data/official_exams/ABEM/TPN25_Gabarito_Prova_09h00.pdf'
    },
    {
      nome: 'ABEM TPN 2025 - 19h30',
      caderno: 'data/official_exams/ABEM/TPN25_Caderno_Prova_19h30.pdf',
      gabarito: 'data/official_exams/ABEM/TPN25_Gabarito_Prova_19h30.pdf'
    }
  ];

  let novosHomologados = 0;

  for (const exam of examSets) {
    console.log(`\nProcessando caderno: ${exam.nome}...`);
    const questions = await parseExamPdf(exam.caderno);
    const gabarito = await parseGabaritoPdf(exam.gabarito);
    console.log(`  -> Questões no caderno: ${questions.length} | Respostas no gabarito: ${gabarito.size}`);

    for (const q of questions) {
      const gbEntry = gabarito.get(q.num);
      if (!gbEntry) continue;

      const pdfWinningOpt = q.options.find(o => o.letter === gbEntry.letter);
      if (!pdfWinningOpt) continue;

      for (const dbQ of dbQuestions) {
        if (existingIds.has(dbQ.id)) continue;

        // Trava 1: Similaridade de Enunciado
        const stmtSim = calculateSimilarity(q.statement, dbQ.statement);
        if (stmtSim < SIMILARITY_THRESHOLD) continue;

        // Trava 2 & Anti-Permutação: Encontra a alternativa correspondente no DB
        let bestOptSim = 0;
        let matchedDbLetter = null;
        let matchedDbOptText = null;

        if (Array.isArray(dbQ.options)) {
          for (const opt of dbQ.options) {
            const optText = opt.text || opt.descricao || '';
            const sim = calculateSimilarity(pdfWinningOpt.text, optText);
            if (sim > bestOptSim) {
              bestOptSim = sim;
              matchedDbLetter = opt.letter;
              matchedDbOptText = optText;
            }
          }
        }

        // Validação da Dupla Trava
        if (bestOptSim >= SIMILARITY_THRESHOLD && matchedDbLetter) {
          novosHomologados++;
          const decisao = {
            id: dbQ.id,
            code: dbQ.code,
            ano: dbQ.year,
            instituicao: dbQ.institution,
            caderno: exam.nome,
            numeroQuestao: q.num,
            gabaritoOficialPdf: gbEntry.letter,
            gabaritoHomologadoDb: matchedDbLetter,
            textoAlternativaPdf: pdfWinningOpt.text,
            textoAlternativaDb: matchedDbOptText,
            similaridadeEnunciado: parseFloat(stmtSim.toFixed(4)),
            similaridadeAlternativa: parseFloat(bestOptSim.toFixed(4)),
            fonte: path.basename(exam.gabarito),
            dataHomologacao: new Date().toISOString()
          };

          stagingData.decisoes.push(decisao);
          existingIds.add(dbQ.id);

          console.log(`[HOMOLOGADO] ${dbQ.code} | Q${q.num} -> Gabarito DB: ${matchedDbLetter} (Oficial PDF: ${gbEntry.letter}) | Stmt: ${(stmtSim*100).toFixed(1)}% | Opt: ${(bestOptSim*100).toFixed(1)}%`);
        }
      }
    }
  }

  // 4. Salva no staging local
  stagingData.totalHomologados = stagingData.decisoes.length;
  stagingData.ultimaAtualizacao = new Date().toISOString();
  fs.writeFileSync(STAGING_OUTPUT, JSON.stringify(stagingData, null, 2), 'utf8');

  console.log(`\n======================================================`);
  console.log(`RESULTADO FINAL ABEM:`);
  console.log(`  - Novos gabaritos homologados nesta rodada: ${novosHomologados}`);
  console.log(`  - Total acumulado em STAGING: ${stagingData.totalHomologados}`);
  console.log(`  - Gravação no Supabase executada: ${WRITE_TO_SUPABASE} (RIGOROSAMENTE ZERO)`);
  console.log(`  - Arquivo salvo: ${STAGING_OUTPUT}`);
  console.log(`======================================================`);
}

matchAbem().catch(console.error);
