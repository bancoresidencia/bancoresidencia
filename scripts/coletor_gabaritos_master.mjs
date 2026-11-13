import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { createClient } from '@supabase/supabase-js';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

// 1. Variáveis de ambiente
const envPath = path.resolve('.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
        env[k] = v;
      }
    }
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Erro: Supabase URL ou Service Key não definidos.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const GEMINI_KEYS = [
  env.GEMINI_API_KEY,
  env.GEMINI_API_KEY_1,
  env.GEMINI_API_KEY_2,
  env.GEMINI_API_KEY_3,
  env.GEMINI_API_KEY_4,
  env.GEMINI_API_KEY_5
].filter(Boolean);

let keyIndex = 0;
function getNextGeminiKey() {
  if (GEMINI_KEYS.length === 0) return null;
  const k = GEMINI_KEYS[keyIndex % GEMINI_KEYS.length];
  keyIndex++;
  return k;
}

// Argumentos CLI
const args = process.argv.slice(2);
const getArg = (flag, def = null) => {
  const f = args.find(a => a.startsWith(`${flag}=`));
  return f ? f.split('=')[1].trim() : def;
};
const hasFlag = flag => args.includes(flag);

const LIMIT_EXAMS = parseInt(getArg('--limit-exams', '10'), 10);
const TARGET_EXAM = getArg('--exam', null);
const MAX_PHASE2_PER_EXAM = parseInt(getArg('--max-phase2', '20'), 10);
const IS_APPLY_DB = hasFlag('--apply');

function normalizeText(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function textSimilarity(a, b) {
  const normA = normalizeText(a);
  const normB = normalizeText(b);
  if (!normA || !normB) return 0;
  if (normA === normB) return 1.0;
  
  const wordsA = new Set(normA.split(' ').filter(w => w.length > 2));
  const wordsB = new Set(normB.split(' ').filter(w => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersection = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) intersection++;
  }
  const union = new Set([...wordsA, ...wordsB]).size;
  return intersection / union;
}

// Busca web DuckDuckGo
async function searchWeb(query) {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8'
      },
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) return [];
    const html = await res.text();
    const links = [];
    const linkRegex = /<a[^>]+class="result__url"[^>]+href="([^"]+)"/g;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      let rawUrl = match[1];
      if (rawUrl.includes('uddg=')) {
        const decoded = decodeURIComponent(rawUrl.split('uddg=')[1].split('&')[0]);
        links.push(decoded);
      } else if (rawUrl.startsWith('http')) {
        links.push(rawUrl);
      }
    }
    return links;
  } catch (e) {
    return [];
  }
}

// Fatiador de questões do PDF completo
function splitPdfQuestions(pdfText) {
  const qSplits = pdfText.split(/QUEST[AÃ]O\s+(\d{1,3})[\.\:\-\s]/i);
  const result = [];
  for (let i = 1; i < qSplits.length; i += 2) {
    const qNum = parseInt(qSplits[i], 10);
    const content = qSplits[i + 1] || '';
    
    const optMap = {};
    const optSplits = content.split(/\n\s*([A-E])[\.\:\-\)\s]\s*/i);
    for (let j = 1; j < optSplits.length; j += 2) {
      const letter = optSplits[j].toUpperCase();
      const text = optSplits[j + 1]?.split(/\n\s*[A-E][\.\:\-\)\s]/i)[0]?.trim() || '';
      optMap[letter] = text;
    }

    result.push({
      num: qNum,
      rawContent: content,
      snippet: content.substring(0, 300),
      options: optMap
    });
  }
  return result;
}

// Parser universal de gabaritos em tabelas ou texto
function parseAnswerKeyFromFullText(rawText) {
  const answerMap = {};
  const lines = rawText.split(/\r?\n/);
  
  const regexPatterns = [
    /(?:quest[aã]o|item)?\s*0?(\d{1,3})\s*[\.\:\-\s\)]+\s*([A-E]|ANULADA|NULA|\*|X|CANCELADA)\b/gi,
    /\b0?(\d{1,3})\s*[\.\:\-\)]\s*([A-E]|ANULADA|NULA|\*|X)\b/gi,
    /\b0?(\d{1,3})\s+([A-E])\b/g
  ];

  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine || cleanLine.length > 250) continue;

    const anulaMatch = cleanLine.match(/(\d{1,3})\s*[\.\:\-\s]+(?:Anulada|ANULADA|NULA|Cancelada)/i);
    if (anulaMatch) {
      const num = parseInt(anulaMatch[1], 10);
      if (num >= 1 && num <= 150) {
        answerMap[num] = 'ANULADA';
        continue;
      }
    }

    for (const pat of regexPatterns) {
      pat.lastIndex = 0;
      let m;
      while ((m = pat.exec(cleanLine)) !== null) {
        const num = parseInt(m[1], 10);
        let ans = m[2].toUpperCase().trim();
        if (['ANULADA', 'NULA', '*', 'X', 'CANCELADA'].includes(ans)) {
          ans = 'ANULADA';
        }
        if (num >= 1 && num <= 150) {
          if (!answerMap[num]) answerMap[num] = ans;
        }
      }
    }
  }

  return answerMap;
}

// Validação Semântica de Conteúdo (Blindagem contra troca de alternativas)
function matchAlternativeSemantic(dbQuestion, officialAnsLetter, officialOptionText = null) {
  const opts = Array.isArray(dbQuestion.options) ? dbQuestion.options : [];
  if (opts.length === 0) {
    return { isValid: false, mappedLetter: null, reason: 'QUESTAO_SEM_OPCOES_NO_BANCO' };
  }

  if (officialAnsLetter === 'ANULADA') {
    return {
      isValid: true,
      mappedLetter: 'ANULADA',
      isAnulada: true,
      wasRemapped: false,
      confidence: 1.0,
      detail: 'Questão Oficialmente Anulada pela Banca'
    };
  }

  // Se temos o texto da alternativa correta da fonte oficial, casamos pelo texto!
  if (officialOptionText) {
    let bestMatchLetter = null;
    let maxSim = 0;

    for (const opt of opts) {
      const sim = textSimilarity(officialOptionText, opt.text || '');
      if (sim > maxSim) {
        maxSim = sim;
        bestMatchLetter = opt.letter;
      }
    }

    if (maxSim >= 0.70) {
      const wasRemapped = bestMatchLetter !== officialAnsLetter;
      return {
        isValid: true,
        mappedLetter: bestMatchLetter,
        isAnulada: false,
        wasRemapped,
        confidence: maxSim,
        detail: wasRemapped
          ? `⚠️ Remapeamento de segurança: Oficial '${officialAnsLetter}' -> No banco é '${bestMatchLetter}' (similaridade: ${(maxSim * 100).toFixed(1)}%)`
          : `Texto coincide com a letra '${bestMatchLetter}'`
      };
    }
  }

  // Validação por letra disponível no nosso banco
  const availableLetters = opts.map(o => (o.letter || '').toUpperCase().trim()).filter(Boolean);
  if (availableLetters.includes(officialAnsLetter)) {
    return {
      isValid: true,
      mappedLetter: officialAnsLetter,
      isAnulada: false,
      wasRemapped: false,
      confidence: 0.95,
      detail: `Letra oficial '${officialAnsLetter}' existe entre as alternativas disponíveis (${availableLetters.join(',')})`
    };
  } else {
    return {
      isValid: false,
      mappedLetter: null,
      reason: `LETRA_FORA_DAS_OPCOES (oficial: ${officialAnsLetter}, disponiveis: ${availableLetters.join(',')})`
    };
  }
}

// Fase 2: Resolução Médica Grounded via Preceptor IA com Failover
async function solveWithMedicalGrounding(statement, options, institution, year) {
  if (!GEMINI_KEYS.length) return null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const apiKey = getNextGeminiKey();
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;
      const prompt = `Você é um preceptor médico especialista examinando uma questão de concurso oficial de residência médica.
Instituição: ${institution || 'Geral'} | Ano: ${year || 'Recente'}

Enunciado:
${statement}

Alternativas:
${options.map(o => `${o.letter}) ${o.text}`).join('\n')}

Determine a alternativa médica oficial CORRETA de acordo com as diretrizes vigentes das sociedades brasileiras (MS, SBP, SBC, SBD, FEBRASGO, ATLS 10/11, Sabiston).
Responda ESTRITAMENTE em formato JSON puro sem formatação markdown:
{"gabarito": "LETRA", "textoExato": "texto da alternativa correta", "justificativa": "resumo médico objetivo em 1 frase", "confianca": 0.95}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        }),
        signal: AbortSignal.timeout(8000)
      });
      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return JSON.parse(text);
        }
      }
    } catch (e) {
      // chave seguinte
    }
  }
  return null;
}

// Arquivo de Staging Auditado
const STAGING_PATH = path.resolve('data/coleta_gabaritos_staging.json');
function loadStaging() {
  if (fs.existsSync(STAGING_PATH)) {
    try { 
      const st = JSON.parse(fs.readFileSync(STAGING_PATH, 'utf8')); 
      st.meta = st.meta || {};
      st.meta.provasConcluidas = st.meta.provasConcluidas || [];
      st.decisoes = st.decisoes || [];
      return st;
    } catch (e) {}
  }
  return {
    meta: { criadoEm: new Date().toISOString(), totalHomologados: 0, totalRemapeados: 0, totalRejeitados: 0, provasConcluidas: [] },
    decisoes: []
  };
}

function saveStaging(staging) {
  fs.writeFileSync(STAGING_PATH, JSON.stringify(staging, null, 2), 'utf8');
}

async function runMasterCollector() {
  console.log('========================================================================');
  console.log('🚀 MOTOR HÍBRIDO DE COLETA & HOMOLOGAÇÃO (FASE 1: TOP-DOWN + FASE 2: GROUNDING)');
  console.log(`   Modo: ${IS_APPLY_DB ? '🟢 GRAVAÇÃO DIRETA NO SUPABASE (--apply)' : '🟡 AUDITORIA EM STAGING (Simulação Protegida)'}`);
  console.log(`   Limite de Cadernos: ${LIMIT_EXAMS} | Prova Específica: ${TARGET_EXAM || 'Ordem de Prioridade'}`);
  console.log('========================================================================\n');

  const manifestPath = path.resolve('data/relatorio_detalhado_gabaritos_faltantes.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('❌ Arquivo relatorio_detalhado_gabaritos_faltantes.json não encontrado.');
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  let cadernos = manifest.rankingCadernosDeProva;

  if (TARGET_EXAM) {
    cadernos = cadernos.filter(([c]) => c.toLowerCase().includes(TARGET_EXAM.toLowerCase()));
  }

  const cadernosToProcess = cadernos.slice(0, LIMIT_EXAMS);
  console.log(`📋 Cadernos na fila para processamento: ${cadernosToProcess.length}\n`);

  const staging = loadStaging();
  const processedIds = new Set((staging.decisoes || []).map(d => d.id));

  for (const [cadernoNome, qtdFaltante] of cadernosToProcess) {
    console.log(`------------------------------------------------------------------------`);
    console.log(`🎯 PROCESSANDO CADERNO: [${cadernoNome}] (Pendências estimadas: ${qtdFaltante})`);

    const parts = cadernoNome.split(' — ');
    const ano = parts[parts.length - 1]?.trim();
    const bancaRaw = parts.slice(0, parts.length - 1).join(' — ').trim();
    const bancaShort = bancaRaw.split(' ')[0].replace(/[\/\\,\(\)]/g, '').trim();

    // 1. Busca questões pendentes dessa prova no Supabase (com fallback entre tabelas)
    let targetTable = 'questions';
    let qBuilder = supabase
      .from('questions')
      .select('id, code, banca, institution, year, statement, options, correct_answer')
      .eq('is_anulada', false)
      .or('correct_answer.is.null,correct_answer.eq.');

    if (ano && /^\d{4}$/.test(ano)) {
      qBuilder = qBuilder.eq('year', parseInt(ano, 10));
    }
    qBuilder = qBuilder.or(`banca.ilike.%${bancaShort}%,institution.ilike.%${bancaShort}%`);

    let { data: dbQuestions, error: qErr } = await qBuilder.limit(250);

    if (!dbQuestions || dbQuestions.length === 0) {
      for (const otherTable of ['questions_expansion_direto', 'questions_expansion_r_plus']) {
        let ob = supabase
          .from(otherTable)
          .select('id, code, banca, institution, year, statement, options, correct_answer')
          .eq('is_anulada', false)
          .or('correct_answer.is.null,correct_answer.eq.');
        if (ano && /^\d{4}$/.test(ano)) ob = ob.eq('year', parseInt(ano, 10));
        ob = ob.or(`banca.ilike.%${bancaShort}%,institution.ilike.%${bancaShort}%`);
        const { data: oData } = await ob.limit(250);
        if (oData && oData.length > 0) {
          dbQuestions = oData;
          targetTable = otherTable;
          break;
        }
      }
    }

    if (!dbQuestions || dbQuestions.length === 0) {
      console.log(`  ℹ️ Nenhuma questão pendente encontrada no banco com o termo "${bancaShort}".`);
      continue;
    }

    const pendingQuestions = dbQuestions.filter(q => !processedIds.has(q.id));
    if (pendingQuestions.length === 0) {
      console.log(`  ℹ️ Todas as ${dbQuestions.length} questões deste caderno já constam no staging.`);
      continue;
    }

    console.log(`  📦 ${pendingQuestions.length} questões pendentes para este caderno (tabela: ${targetTable}).`);

    // ==========================================
    // FASE 1: EXTRAÇÃO TOP-DOWN (PDF / S3)
    // ==========================================
    const isAbem = bancaRaw.toUpperCase().includes('ABEM');
    const queries = isAbem ? [
      `gabarito "Teste de Progresso" "ABEM" ${ano} filetype:pdf`,
      `"Teste de Progresso Nacional" ABEM ${ano} gabarito oficial`,
      `caderno de prova "ABEM" "Teste de Progresso" ${ano} pdf`
    ] : [
      `gabarito prova residência médica "${bancaRaw}" ${ano}`,
      `"${bancaShort}" "${ano}" ("Gabarito Definitivo" OR "Gabarito Oficial") filetype:pdf`,
      `prova residência médica "${bancaShort}" ${ano} pdf`,
      `gabarito oficial residência médica "${bancaRaw}" ${ano} pdf`
    ];

    let answerMap = null;
    let pdfExamQuestions = [];
    let sourceUrl = null;

    for (const q of queries) {
      const links = await searchWeb(q);
      const candidates = links.filter(l => !l.includes('youtube.com') && !l.includes('instagram.com'));

      for (const link of candidates.slice(0, 3)) {
        try {
          const res = await fetch(link, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            signal: AbortSignal.timeout(8000)
          });
          if (!res.ok) continue;

          let targetPdfUrls = [];
          if (link.toLowerCase().endsWith('.pdf') || link.includes('/pdf/')) {
            targetPdfUrls.push(link);
          } else {
            const html = await res.text();
            const pdfMatches = html.match(/href="([^"]+\.pdf[^"]*)"/gi) || [];
            for (const m of pdfMatches) {
              const u = m.replace(/^href="/i, '').replace(/"$/, '');
              if (u.startsWith('http')) targetPdfUrls.push(u);
            }
          }

          for (const pdfUrl of targetPdfUrls.slice(0, 3)) {
            try {
              const pRes = await fetch(pdfUrl, { signal: AbortSignal.timeout(10000) });
              if (pRes.ok) {
                const buf = Buffer.from(await pRes.arrayBuffer());
                const parser = new PDFParse({ data: buf });
                const parsed = await parser.getText();
                
                const candidateMap = parseAnswerKeyFromFullText(parsed.text);
                const foundCount = Object.keys(candidateMap).length;
                const questionsInPdf = splitPdfQuestions(parsed.text);

                if (foundCount >= 40 && questionsInPdf.length >= 40) {
                  console.log(`      💎 Caderno MASTER encontrado! ${questionsInPdf.length} questões e ${foundCount} gabaritos.`);
                  answerMap = candidateMap;
                  pdfExamQuestions = questionsInPdf;
                  sourceUrl = pdfUrl;
                  break;
                } else if (foundCount >= 40 && !answerMap) {
                  answerMap = candidateMap;
                  sourceUrl = pdfUrl;
                } else if (questionsInPdf.length >= 40 && pdfExamQuestions.length === 0) {
                  pdfExamQuestions = questionsInPdf;
                }
              }
            } catch (pdfErr) {}
          }
          if (answerMap && pdfExamQuestions.length > 0) break;
        } catch (e) {}
      }
      if (answerMap && pdfExamQuestions.length > 0) break;
    }

    let cadernoMatchedCount = 0;
    let cadernoRemappedCount = 0;
    let cadernoRejectedCount = 0;
    const residualQuestions = [];

    // Casamento Top-Down
    if (answerMap) {
      for (const q of pendingQuestions) {
        let matchedOfficialNum = null;
        let matchedPdfOptionText = null;

        if (pdfExamQuestions.length > 0) {
          let maxStmtSim = 0;
          for (const pdfQ of pdfExamQuestions) {
            const sim = textSimilarity(q.statement, pdfQ.snippet);
            if (sim > maxStmtSim) {
              maxStmtSim = sim;
              if (sim >= 0.55) {
                matchedOfficialNum = pdfQ.num;
                const offLetter = answerMap[pdfQ.num];
                if (offLetter && pdfQ.options && pdfQ.options[offLetter]) {
                  matchedPdfOptionText = pdfQ.options[offLetter];
                }
              }
            }
          }
        }

        if (!matchedOfficialNum) {
          const m = (q.code || '').match(/-(\d{1,3})$/);
          matchedOfficialNum = m ? parseInt(m[1], 10) : null;
        }

        if (matchedOfficialNum && answerMap[matchedOfficialNum]) {
          const officialLetter = answerMap[matchedOfficialNum];
          const matchResult = matchAlternativeSemantic(q, officialLetter, matchedPdfOptionText);

          if (matchResult.isValid) {
            cadernoMatchedCount++;
            if (matchResult.wasRemapped) cadernoRemappedCount++;

            staging.decisoes.push({
              id: q.id,
              code: q.code,
              table: targetTable,
              caderno: cadernoNome,
              fase: 'Fase 1: Top-Down PDF',
              numeroQuestao: matchedOfficialNum,
              gabaritoOficialExtraido: officialLetter,
              gabaritoMapeadoNoBanco: matchResult.mappedLetter,
              foiRemapeado: matchResult.wasRemapped,
              isAnulada: matchResult.isAnulada,
              confianca: matchResult.confidence,
              fonte: sourceUrl,
              data: new Date().toISOString()
            });
            processedIds.add(q.id);

            if (IS_APPLY_DB) {
              await supabase
                .from(targetTable)
                .update({ correct_answer: matchResult.mappedLetter, is_anulada: matchResult.isAnulada, has_gabarito: true })
                .eq('id', q.id);
            }
          } else {
            cadernoRejectedCount++;
          }
        } else {
          residualQuestions.push(q);
        }
      }
    } else {
      residualQuestions.push(...pendingQuestions);
    }

    // ==========================================
    // FASE 2: RESOLUÇÃO MÉDICA GROUNDED (PRECEPTOR IA)
    // ==========================================
    if (residualQuestions.length > 0) {
      console.log(`  🔬 Iniciando Fase 2 (Grounding Médico) para ${Math.min(residualQuestions.length, MAX_PHASE2_PER_EXAM)} questões residuais...`);
      for (const q of residualQuestions.slice(0, MAX_PHASE2_PER_EXAM)) {
        if (!Array.isArray(q.options) || q.options.length < 2) continue;

        const solution = await solveWithMedicalGrounding(q.statement, q.options, q.institution || bancaRaw, q.year || ano);
        if (solution && solution.confianca >= 0.85 && solution.gabarito) {
          const matchResult = matchAlternativeSemantic(q, solution.gabarito, solution.textoExato);
          if (matchResult.isValid) {
            cadernoMatchedCount++;
            if (matchResult.wasRemapped) cadernoRemappedCount++;

            staging.decisoes.push({
              id: q.id,
              code: q.code,
              table: targetTable,
              caderno: cadernoNome,
              fase: 'Fase 2: Grounding Médico Preceptor',
              numeroQuestao: null,
              gabaritoOficialExtraido: solution.gabarito,
              gabaritoMapeadoNoBanco: matchResult.mappedLetter,
              foiRemapeado: matchResult.wasRemapped,
              isAnulada: false,
              confianca: solution.confianca,
              justificativa: solution.justificativa,
              fonte: 'Preceptor Médico IA (Diretrizes SBC/SBP/SBD/MS/Sabiston)',
              data: new Date().toISOString()
            });
            processedIds.add(q.id);

            if (IS_APPLY_DB) {
              await supabase
                .from(targetTable)
                .update({ correct_answer: matchResult.mappedLetter, is_anulada: false, has_gabarito: true })
                .eq('id', q.id);
            }
          }
        }
      }
    }

    console.log(`  🎉 Caderno Concluído: ${cadernoMatchedCount} homologadas | ${cadernoRemappedCount} remapeadas | ${cadernoRejectedCount} rejeitadas`);
    staging.meta.totalHomologados = (staging.meta.totalHomologados || 0) + cadernoMatchedCount;
    staging.meta.totalRemapeados = (staging.meta.totalRemapeados || 0) + cadernoRemappedCount;
    staging.meta.totalRejeitados = (staging.meta.totalRejeitados || 0) + cadernoRejectedCount;
    if (!staging.meta.provasConcluidas.includes(cadernoNome)) {
      staging.meta.provasConcluidas.push(cadernoNome);
    }
    saveStaging(staging);
  }

  saveStaging(staging);

  // Geração do Relatório Final Estruturado
  const relatorioFinal = {
    geradoEm: new Date().toISOString(),
    totalDecisoesHomologadas: staging.decisoes.length,
    totalRemapeamentosSeguranca: staging.decisoes.filter(d => d.foiRemapeado).length,
    totalQuestoesAnuladas: staging.decisoes.filter(d => d.isAnulada).length,
    porFase: {
      fase1_topDownPdf: staging.decisoes.filter(d => d.fase && d.fase.includes('Fase 1')).length,
      fase2_groundingPreceptor: staging.decisoes.filter(d => d.fase && d.fase.includes('Fase 2')).length
    },
    porCaderno: {},
    porTabela: {},
    amostraDecisoes: staging.decisoes.slice(-10)
  };

  staging.decisoes.forEach(d => {
    relatorioFinal.porCaderno[d.caderno] = (relatorioFinal.porCaderno[d.caderno] || 0) + 1;
    relatorioFinal.porTabela[d.table || 'questions'] = (relatorioFinal.porTabela[d.table || 'questions'] || 0) + 1;
  });

  fs.writeFileSync('data/relatorio_final_coleta_gabaritos.json', JSON.stringify(relatorioFinal, null, 2), 'utf8');

  console.log('\n========================================================================');
  console.log(`📊 BALANÇO DA OPERAÇÃO:`);
  console.log(`• Total Homologado em Staging: ${staging.decisoes.length}`);
  console.log(`• Total Remapeado por troca de alternativa: ${relatorioFinal.totalRemapeamentosSeguranca}`);
  console.log(`• Fase 1 (PDFs Oficiais): ${relatorioFinal.porFase.fase1_topDownPdf}`);
  console.log(`• Fase 2 (Grounding Médico): ${relatorioFinal.porFase.fase2_groundingPreceptor}`);
  console.log(`📁 Auditoria salva em: data/coleta_gabaritos_staging.json`);
  console.log(`📄 Relatório Final em: data/relatorio_final_coleta_gabaritos.json`);
  console.log('========================================================================\n');
}

runMasterCollector().catch(console.error);
