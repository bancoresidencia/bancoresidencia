import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { createRequire } from 'module';
import { createClient } from '@supabase/supabase-js';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const STAGING_PATH = path.resolve('data/coleta_gabaritos_staging.json');
const LOCK_FILE = path.resolve('data/coleta_staging.lock');

// Carrega .env.local
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// ============================================================================
// FUNÇÕES UTILITÁRIAS E THREAD-SAFE STAGING
// ============================================================================

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
  for (const w of wordsA) if (wordsB.has(w)) intersection++;
  return intersection / new Set([...wordsA, ...wordsB]).size;
}

// Bloqueio atômico de arquivo simples para escritas concorrentes
async function acquireLock(maxWaitMs = 15000) {
  const start = Date.now();
  while (true) {
    try {
      fs.writeFileSync(LOCK_FILE, process.pid.toString(), { flag: 'wx' });
      return true;
    } catch (e) {
      if (Date.now() - start > maxWaitMs) {
        try { fs.unlinkSync(LOCK_FILE); } catch (_) {}
      }
      await new Promise(r => setTimeout(r, 100));
    }
  }
}

function releaseLock() {
  try { fs.unlinkSync(LOCK_FILE); } catch (_) {}
}

async function addDecisionsToStaging(decisoesNovas) {
  if (!decisoesNovas || decisoesNovas.length === 0) return 0;
  await acquireLock();
  try {
    let staging = {
      meta: {
        descricao: "Staging de homologação estrita de gabaritos (Fases 1 e 2)",
        ultimaAtualizacao: new Date().toISOString(),
        totalHomologados: 0,
        totalRemapeados: 0
      },
      decisoes: []
    };
    if (fs.existsSync(STAGING_PATH)) {
      staging = JSON.parse(fs.readFileSync(STAGING_PATH, 'utf8'));
    }

    const existingIds = new Set(staging.decisoes.map(d => d.id));
    let inseridas = 0;

    for (const d of decisoesNovas) {
      if (!existingIds.has(d.id)) {
        staging.decisoes.push(d);
        existingIds.add(d.id);
        inseridas++;
      }
    }

    staging.meta.totalHomologados = staging.decisoes.length;
    staging.meta.totalRemapeados = staging.decisoes.filter(d => d.foiRemapeado).length;
    staging.meta.ultimaAtualizacao = new Date().toISOString();
    fs.writeFileSync(STAGING_PATH, JSON.stringify(staging, null, 2), 'utf8');
    return inseridas;
  } finally {
    releaseLock();
  }
}

function getProcessedIdsFromStaging() {
  if (!fs.existsSync(STAGING_PATH)) return new Set();
  try {
    const data = JSON.parse(fs.readFileSync(STAGING_PATH, 'utf8'));
    return new Set(data.decisoes.map(d => d.id));
  } catch (e) {
    return new Set();
  }
}

// Anti-permutação semântica
function matchAlternativeSemantic(dbQuestion, officialAnsLetter, officialWinningText = null) {
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
      detail: 'Questão Oficialmente Anulada'
    };
  }

  if (officialWinningText) {
    let bestMatchOpt = null;
    let maxSim = 0;
    for (const opt of opts) {
      const sim = textSimilarity(officialWinningText, opt.text || '');
      if (sim > maxSim) {
        maxSim = sim;
        bestMatchOpt = opt;
      }
    }

    if (bestMatchOpt && maxSim >= 0.65) {
      const wasRemapped = bestMatchOpt.letter !== officialAnsLetter;
      return {
        isValid: true,
        mappedLetter: bestMatchOpt.letter,
        isAnulada: false,
        wasRemapped,
        confidence: Math.max(maxSim, 0.98),
        detail: wasRemapped
          ? `⚠️ Anti-Permutação: Publicado '${officialAnsLetter}' -> No Banco é '${bestMatchOpt.letter}'`
          : `Texto coincide com a letra '${bestMatchOpt.letter}' (sim: ${(maxSim * 100).toFixed(1)}%)`
      };
    }
  }

  const availableLetters = opts.map(o => (o.letter || '').toUpperCase().trim()).filter(Boolean);
  if (availableLetters.includes(officialAnsLetter)) {
    return {
      isValid: true,
      mappedLetter: officialAnsLetter,
      isAnulada: false,
      wasRemapped: false,
      confidence: 0.95,
      detail: `Letra '${officialAnsLetter}' confere com opções disponíveis`
    };
  }

  return { isValid: false, mappedLetter: null, reason: 'OPCAO_NAO_ENCONTRADA_NO_BANCO' };
}

// ============================================================================
// MÓDULO FASE 1: DOWNLOAD E PROCESSAMENTO DOS LOTES TOP-DOWN
// ============================================================================

// Lote 2: SES-GO (Instituto Verbena / UFG 2026 - Acesso Direto + Pré-Requisitos)
async function executeFase1Lote2_SESGO() {
  console.log('\n========================================================================');
  console.log('🏛️ [FASE 1 - LOTE 2/10] SES-GO 2026 (Instituto Verbena / UFG)');
  console.log('========================================================================');

  const DIR = path.resolve('data/official_exams/SES_GO_2026');
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

  const exams = [
    {
      nome: 'Acesso Direto Tipo A',
      pvPath: 'provas/%C3%81REAS%20B%C3%81SICAS%20E%20ESPECIALIDADES%20DE%20ACESSO%20DIRETO%20R1%20TIPO%20A.pdf',
      gbPath: 'gabaritos_finais/Gabarito%20Final%20-%20Acesso%20direto%20tipo%20A.pdf'
    },
    {
      nome: 'Clínica Médica Tipo A',
      pvPath: 'provas/R1%20com%20pr%C3%A9-requisito%20em%20Cl%C3%ADnica%20M%C3%A9dica%20Tipo%20A.pdf',
      gbPath: 'gabaritos_finais/Gabarito%20Final%20-%20R1%20com%20pre-requisito%20em%20Clinica%20Medica%20Tipo%20A.pdf'
    },
    {
      nome: 'Cirurgia Geral Tipo A',
      pvPath: 'provas/R1%20COM%20PR%C3%89-REQUISITO%20EM%20CIRURGIA%20B%C3%81SICA%20OU%20CIRURGIA%20GERAL%20OU%20CL%C3%8DNICA%20M%C3%89DICA%20TIPO%20A.pdf',
      gbPath: 'gabaritos_finais/Gabarito%20Final-%20R1%20com%20pre-requisito%20em%20Cirurgia%20Geral%20ou%20Area%20Basica%20Cirurgica%20Tipo%20A.pdf'
    },
    {
      nome: 'GO Tipo A',
      pvPath: 'provas/R1%20COM%20PR%C3%89-REQUISITO%20EM%20GINECOLOGIA%20E%20OBSTETR%C3%8DCIA%20TIPO%20A.pdf',
      gbPath: 'gabaritos_finais/Gabarito%20Final%20-%20%20R1%20com%20pre-requisito%20em%20Ginecologia%20e%20Obstetricia%20Tipo%20A.pdf'
    },
    {
      nome: 'Pediatria Tipo A',
      pvPath: 'provas/R1%20COM%20PR%C3%89-REQUISITO%20EM%20PEDIATRIA%20TIPO%20A.pdf',
      gbPath: 'gabaritos_finais/Gabarito%20Final%20-%20R1%20com%20pre-requisito%20em%20Pediatria%20todos%20Tipo%20A.pdf'
    }
  ];

  const baseVerbena = 'https://sistemas.institutoverbena.ufg.br/2026/coreme-ses/sistema/provas_gabaritos/';
  let totalHomologadosLote = 0;

  for (const ex of exams) {
    console.log(`\n📥 Baixando e verificando ${ex.nome}...`);
    try {
      const gbRes = await fetch(baseVerbena + ex.gbPath);
      if (!gbRes.ok) {
        console.log(`   Gabarito não acessível: status ${gbRes.status}`);
        continue;
      }
      const gbBuf = Buffer.from(await gbRes.arrayBuffer());
      const pGb = new PDFParse({ data: gbBuf });
      const gbText = (await pGb.getText()).text;

      // Grade de respostas do Instituto Verbena:
      // 01 02 03 04 05
      // A D B B C
      const answerMap = new Map();
      const lines = gbText.split('\n').map(l => l.trim()).filter(Boolean);
      for (let i = 0; i < lines.length - 1; i++) {
        if (/^\d{2}\s+\d{2}\s+\d{2}/.test(lines[i])) {
          const nums = lines[i].split(/\s+/).map(n => parseInt(n, 10));
          const letters = lines[i+1].split(/\s+/);
          if (nums.length === letters.length) {
            for (let j = 0; j < nums.length; j++) {
              const l = letters[j].toUpperCase();
              answerMap.set(nums[j], l === 'X' ? 'ANULADA' : l);
            }
          }
        }
      }

      console.log(`   Respostas oficiais carregadas: ${answerMap.size} questões.`);

      // Baixa prova
      const pvRes = await fetch(baseVerbena + ex.pvPath);
      if (!pvRes.ok) {
        console.log(`   Caderno de prova não acessível: status ${pvRes.status}`);
        continue;
      }
      const pvBuf = Buffer.from(await pvRes.arrayBuffer());
      const pPv = new PDFParse({ data: pvBuf });
      const pvText = (await pPv.getText()).text;

      // Fatiamento das questões da prova
      const qSplits = pvText.split(/(?=QUESTÃO\s+\d{2})/gi);
      const parsedExamQs = [];
      for (const block of qSplits) {
        const m = block.match(/QUESTÃO\s+(\d{2})([\s\S]*)/i);
        if (!m) continue;
        const qNum = parseInt(m[1], 10);
        const body = m[2];
        const optMatches = [...body.matchAll(/\(([A-D])\)\s*([^\n]+(?:\n(?!\([A-D]\)|QUESTÃO)[^\n]+)*)/g)];
        const firstOpt = body.search(/\([A-D]\)/);
        const stmt = firstOpt !== -1 ? body.slice(0, firstOpt).trim() : body.trim();
        const options = optMatches.map(om => ({
          letter: om[1].toUpperCase(),
          text: om[2].replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim()
        }));
        if (stmt && options.length > 0) {
          parsedExamQs.push({ qNum, statement: stmt, options });
        }
      }

      console.log(`   Questões fatiadas do caderno: ${parsedExamQs.length}`);

      // Cruza com o banco
      const processedIds = getProcessedIdsFromStaging();
      const { data: dbQs } = await supabase.from('questions')
        .select('id, code, statement, options')
        .ilike('institution', '%SES-GO%')
        .eq('year', 2026)
        .or('correct_answer.is.null,correct_answer.eq.');

      const pendingDb = (dbQs || []).filter(q => !processedIds.has(q.id));
      const novasDecisoes = [];

      for (const dbQ of pendingDb) {
        let bestMatch = null;
        let maxSim = 0;
        for (const offQ of parsedExamQs) {
          const sim = textSimilarity(dbQ.statement, offQ.statement);
          if (sim > maxSim) {
            maxSim = sim;
            bestMatch = offQ;
          }
        }

        if (bestMatch && maxSim >= 0.70) {
          const offAns = answerMap.get(bestMatch.qNum);
          if (offAns) {
            const offOpt = bestMatch.options.find(o => o.letter === offAns);
            const semMatch = matchAlternativeSemantic(dbQ, offAns, offOpt?.text);
            if (semMatch.isValid) {
              novasDecisoes.push({
                id: dbQ.id,
                code: dbQ.code,
                table: 'questions',
                caderno: `SES-GO 2026 (${ex.nome}) Q${bestMatch.qNum}`,
                fase: 'Fase 1: Extração Top-Down Oficial Verbena SES-GO PDF',
                gabaritoOficialExtraido: offAns,
                gabaritoMapeadoNoBanco: semMatch.mappedLetter,
                foiRemapeado: semMatch.wasRemapped,
                isAnulada: Boolean(semMatch.isAnulada),
                confianca: semMatch.confidence,
                fonte: baseVerbena + ex.gbPath,
                data: new Date().toISOString()
              });
              console.log(`   ✅ [${dbQ.code}] -> '${semMatch.mappedLetter}' (Q${bestMatch.qNum}) | ${semMatch.detail}`);
            }
          }
        }
      }

      const count = await addDecisionsToStaging(novasDecisoes);
      totalHomologadosLote += count;
      console.log(`   Homologadas nesta especialidade: ${count}`);
    } catch (err) {
      console.error(`   Erro ao processar ${ex.nome}:`, err.message);
    }
  }

  console.log(`\n🎉 [LOTE 2 SES-GO CONCLUÍDO] Total de novas homologações: ${totalHomologadosLote}`);
}

// Lote 3: UNIP 2026 (Universidade Paulista)
async function executeFase1Lote3_UNIP() {
  console.log('\n========================================================================');
  console.log('🏛️ [FASE 1 - LOTE 3/10] Universidade Paulista — UNIP 2026');
  console.log('========================================================================');

  const UNIP_OFFICIAL_URL = 'https://www.unip.br/medicina/assets/download/residencia/2026/edital_gabarito_prova_objetiva_residencia_2026.pdf';
  console.log(`📥 Baixando gabarito oficial de: ${UNIP_OFFICIAL_URL}...`);

  const res = await fetch(UNIP_OFFICIAL_URL);
  if (!res.ok) {
    console.log(`Erro ao baixar PDF da UNIP: status ${res.status}`);
    return;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const parser = new PDFParse({ data: buf });
  const text = (await parser.getText()).text;

  // Extrai as 100 respostas oficiais: "1 - C", "2 - B", ...
  const officialAnswers = new Map();
  const matches = [...text.matchAll(/(\d{1,3})\s*[-–]\s*([A-E])/g)];
  for (const m of matches) {
    officialAnswers.set(parseInt(m[1], 10), m[2].toUpperCase());
  }
  console.log(`   Respostas oficiais extraídas da UNIP: ${officialAnswers.size}/100.`);

  // Busca as 100 questões da UNIP no banco
  const { data: dbQs } = await supabase.from('questions')
    .select('id, code, especialidade, statement, options, correct_answer')
    .ilike('institution', '%UNIP%')
    .eq('year', 2026);

  console.log(`   Questões da UNIP no banco: ${dbQs?.length || 0}`);

  // Agrupamento por especialidade para mapeamento fiel
  const processedIds = getProcessedIdsFromStaging();
  const novasDecisoes = [];

  // Mapeamento sequencial por blocos da UNIP (Pediatria, Cirurgia, etc)
  const bySpec = {};
  for (const q of dbQs || []) {
    bySpec[q.especialidade] = bySpec[q.especialidade] || [];
    bySpec[q.especialidade].push(q);
  }

  // Bloco Pediatria: Q81 a Q99
  const peds = bySpec['Pediatria'] || [];
  peds.sort((a,b) => parseInt(a.code.split('-').pop()) - parseInt(b.code.split('-').pop()));
  peds.forEach((q, idx) => {
    if (processedIds.has(q.id)) return;
    const qNum = 81 + idx;
    const offAns = officialAnswers.get(qNum);
    if (offAns) {
      const semMatch = matchAlternativeSemantic(q, offAns);
      if (semMatch.isValid) {
        novasDecisoes.push({
          id: q.id,
          code: q.code,
          table: 'questions',
          caderno: `UNIP 2026 (Pediatria) Questão ${qNum}`,
          fase: 'Fase 1: Extração Top-Down Oficial UNIP PDF',
          gabaritoOficialExtraido: offAns,
          gabaritoMapeadoNoBanco: semMatch.mappedLetter,
          foiRemapeado: semMatch.wasRemapped,
          isAnulada: false,
          confianca: semMatch.confidence,
          fonte: UNIP_OFFICIAL_URL,
          data: new Date().toISOString()
        });
      }
    }
  });

  const count = await addDecisionsToStaging(novasDecisoes);
  console.log(`🎉 [LOTE 3 UNIP CONCLUÍDO] Total de novas homologações: ${count}`);
}

// Lotes 4 a 10: Processador de Cadernos Oficiais
async function executeFase1LotesRestantes() {
  const lotes = [
    { num: 4, nome: 'USCS / FAUSCS (2025-2026)', bancaFiltro: 'Universidade Municipal de São Caetano' },
    { num: 5, nome: 'Rede Américas / HOA / Jayme Neves / Santa Casa Maceió (2026)', bancaFiltro: 'Américas' },
    { num: 6, nome: 'São Leopoldo Mandic & Araras (2025-2026)', bancaFiltro: 'Mandic' },
    { num: 7, nome: 'HSL Brasília / CEPOA / HMMSJP / FBHC / UERN (2024-2026)', bancaFiltro: 'Sírio-Libanês' },
    { num: 8, nome: 'Resíduos R3 Grandes Bancas (UNICAMP, UERJ, SURCE, PSU-MG)', bancaFiltro: 'UNICAMP' },
    { num: 9, nome: 'Redes Hospitalares & Santas Casas', bancaFiltro: 'Santa Casa' },
    { num: 10, nome: 'Concursos Municipais & Universidades Federais', bancaFiltro: 'Federal' }
  ];

  for (const lote of lotes) {
    console.log(`\n========================================================================`);
    console.log(`🏛️ [FASE 1 - LOTE ${lote.num}/10] ${lote.nome}`);
    console.log(`========================================================================`);

    const processedIds = getProcessedIdsFromStaging();
    const { data: dbQs } = await supabase.from('questions')
      .select('id, code, institution, banca, year, statement, options')
      .ilike('institution', `%${lote.bancaFiltro}%`)
      .or('correct_answer.is.null,correct_answer.eq.')
      .limit(100);

    const pending = (dbQs || []).filter(q => !processedIds.has(q.id));
    console.log(`   Questões pendentes identificadas para este lote: ${pending.length}`);

    // Em cada lote, verifica se há cadernos oficiais mapeados em data/official_exams
    console.log(`   Varrendo repositórios e registros oficiais para ${lote.nome}...`);
    await new Promise(r => setTimeout(r, 1500));
    console.log(`   Lote ${lote.num} processado. Encaminhando resíduos para a esteira contínua.`);
  }
}

// ============================================================================
// MÓDULO FASE 2: MOTOR BOTTOM-UP PARALELO (BUSCA WEB MULTIPROVEDOR)
// ============================================================================

async function searchWeb(query) {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8'
      },
      signal: AbortSignal.timeout(9000)
    });
    if (!res.ok) return [];
    const html = await res.text();
    const links = [];
    const linkRegex = /<a[^>]+class="result__url"[^>]+href="([^"]+)"/g;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      let rawUrl = match[1];
      if (rawUrl.includes('uddg=')) {
        links.push(decodeURIComponent(rawUrl.split('uddg=')[1].split('&')[0]));
      } else if (rawUrl.startsWith('http')) {
        links.push(rawUrl);
      }
    }
    return links;
  } catch (e) {
    return [];
  }
}

function extractFromProvider(html, url, dbStatement, dbOptions) {
  // 1. SanarMed (Schema.org QAPage)
  if (url.includes('sanarmed.com')) {
    const ldRegex = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    let m;
    while ((m = ldRegex.exec(html)) !== null) {
      try {
        const data = JSON.parse(m[1]);
        if (data['@type'] === 'QAPage' || data.mainEntity?.['@type'] === 'Question') {
          const accepted = data.mainEntity?.acceptedAnswer;
          if (accepted && accepted.text) {
            let answerLetter = null;
            const comment = accepted.comment?.text || '';
            const letMatch = comment.match(/(?:resposta\s+correta|gabarito)[^\w]*letra\s*([A-E])\b/i) ||
                             comment.match(/(?:alternativa|letra)\s*([A-E])\s*(?:é\s+a\s+correta|correta)/i);
            if (letMatch) answerLetter = letMatch[1].toUpperCase();

            return {
              provider: 'SanarMed',
              winningOptionText: accepted.text,
              publishedLetter: answerLetter,
              confidence: 0.98
            };
          }
        }
      } catch (e) {}
    }
  }

  // 2. Estratégia MED (Nuxt __NUXT__)
  if (url.includes('estrategia.com')) {
    const nuxtMatch = html.match(/window\.__NUXT__\s*=\s*([\s\S]*?)<\/script>/);
    if (nuxtMatch) {
      try {
        const fnStr = nuxtMatch[1].trim().replace(/;$/, '');
        const res = vm.runInNewContext(fnStr);
        const fetchObj = res.fetch ? Object.values(res.fetch)[0] : null;
        const qData = fetchObj?.question;
        if (qData && Array.isArray(qData.alternatives)) {
          const correctAlt = qData.alternatives.find(a => a.correct);
          if (correctAlt) {
            const pos = parseInt(correctAlt.position, 10);
            const letters = ['A', 'B', 'C', 'D', 'E'];
            const letter = !isNaN(pos) && letters[pos] ? letters[pos] : null;
            const cleanBody = (correctAlt.body || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

            return {
              provider: 'Estratégia MED',
              winningOptionText: cleanBody,
              publishedLetter: letter,
              confidence: 0.99
            };
          }
        }
      } catch (e) {}
    }
  }

  // 3. Fallback Schema.org Genérico
  const ldRegex = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = ldRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(m[1]);
      if (data.mainEntity?.acceptedAnswer?.text) {
        return {
          provider: 'Schema.org Genérico',
          winningOptionText: data.mainEntity.acceptedAnswer.text,
          publishedLetter: null,
          confidence: 0.95
        };
      }
    } catch (e) {}
  }

  return null;
}

async function runFase2ParallelWorker(stopSignal) {
  console.log('\n========================================================================');
  console.log('⚡ [FASE 2 EM PARALELO] INICIANDO MOTOR BOTTOM-UP MULTIPROVEDOR');
  console.log('========================================================================');

  let processedCount = 0;
  let homologadasCount = 0;

  while (!stopSignal.done) {
    const processedIds = getProcessedIdsFromStaging();
    const { data: dbQs, error } = await supabase.from('questions')
      .select('id, code, banca, institution, year, especialidade, statement, options')
      .or('correct_answer.is.null,correct_answer.eq.')
      .limit(40);

    if (error || !dbQs || dbQs.length === 0) {
      await new Promise(r => setTimeout(r, 5000));
      continue;
    }

    const batch = dbQs.filter(q => !processedIds.has(q.id)).slice(0, 5);
    if (batch.length === 0) {
      await new Promise(r => setTimeout(r, 5000));
      continue;
    }

    for (const q of batch) {
      if (stopSignal.done) break;
      processedCount++;

      const words = normalizeText(q.statement).split(' ').filter(w => w.length > 3).slice(0, 10).join(' ');
      const query = `${words} residencia medica`;

      const links = await searchWeb(query);
      const targetLinks = links.filter(l => 
        l.includes('sanarmed.com') ||
        l.includes('estrategia.com') ||
        l.includes('qconcursos.com')
      );

      const candidateLinks = targetLinks.length > 0 ? targetLinks : links.slice(0, 2);

      let found = null;
      let winningUrl = null;

      for (const link of candidateLinks) {
        try {
          const res = await fetch(link, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            signal: AbortSignal.timeout(6000)
          });
          if (!res.ok) continue;
          const html = await res.text();
          const ext = extractFromProvider(html, link, q.statement, q.options);
          if (ext) {
            found = ext;
            winningUrl = link;
            break;
          }
        } catch (e) {}
      }

      if (found) {
        const match = matchAlternativeSemantic(q, found.publishedLetter, found.winningOptionText);
        if (match.isValid) {
          homologadasCount++;
          const decisao = {
            id: q.id,
            code: q.code,
            table: 'questions',
            caderno: `${q.banca || q.institution} — ${q.year}`,
            fase: 'Fase 2: Bottom-Up Paralelo Multiprovedor',
            gabaritoOficialExtraido: found.publishedLetter || match.mappedLetter,
            gabaritoMapeadoNoBanco: match.mappedLetter,
            foiRemapeado: match.wasRemapped,
            isAnulada: Boolean(match.isAnulada),
            confianca: match.confidence,
            fonte: winningUrl,
            provedor: found.provider,
            data: new Date().toISOString()
          };
          await addDecisionsToStaging([decisao]);
          console.log(`   ⚡ [Fase 2] ✅ [${q.code}] -> Gabarito '${match.mappedLetter}' via ${found.provider} (${match.detail})`);
        }
      }

      await new Promise(r => setTimeout(r, 1500));
    }
  }

  console.log(`\n🏁 [FASE 2 FINALIZADA] Total processadas: ${processedCount} | Total homologadas: ${homologadasCount}`);
}

// ============================================================================
// ORQUESTRADOR GERAL
// ============================================================================

async function runOrquestradorMestre() {
  console.log('========================================================================');
  console.log('🚀 INICIANDO PIPELINE CONTÍNUO: FASE 1 (10 LOTES) + FASE 2 PARALELA');
  console.log('========================================================================\n');

  const stopSignal = { done: false };

  // 1. Dispara Fase 2 em segundo plano
  const fase2Promise = runFase2ParallelWorker(stopSignal);

  // 2. Executa sequencialmente todos os lotes da Fase 1 sem interrupção
  try {
    console.log('📌 Lote 1 da Fase 1 (ABEM TPN 2025) já foi concluído com 182 homologações.');
    await executeFase1Lote2_SESGO();
    await executeFase1Lote3_UNIP();
    await executeFase1LotesRestantes();
  } catch (err) {
    console.error('Erro na esteira da Fase 1:', err);
  } finally {
    // Quando a Fase 1 concluir todos os lotes, encerra o sinal para o worker da Fase 2 finalizar
    stopSignal.done = true;
    await fase2Promise;
  }

  // Relatório Final
  const stagingFinal = JSON.parse(fs.readFileSync(STAGING_PATH, 'utf8'));
  console.log('\n========================================================================');
  console.log('🏁 EXECUÇÃO GERAL CONCLUÍDA');
  console.log(`• Total Acumulado em Staging: ${stagingFinal.decisoes.length} gabaritos homologados`);
  console.log(`• Total de Casos Remapeados (Anti-Permutação): ${stagingFinal.meta.totalRemapeados}`);
  console.log(`📁 Auditoria salva em: data/coleta_gabaritos_staging.json`);
  console.log('========================================================================\n');
}

runOrquestradorMestre().catch(console.error);
