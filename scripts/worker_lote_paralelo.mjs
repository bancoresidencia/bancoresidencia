import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { createRequire } from 'module';
import { createClient } from '@supabase/supabase-js';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

// CLI args
const args = process.argv.slice(2);
const getArg = (flag, def = null) => {
  const f = args.find(a => a.startsWith(`${flag}=`));
  return f ? f.split('=')[1].trim() : def;
};

const LOTE_NUM = parseInt(getArg('--lote', '1'), 10);
const LIMIT = parseInt(getArg('--limit', '500'), 10);
const STAGING_FILE = path.resolve(`data/staging_lote_${LOTE_NUM}.json`);

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

function cleanHtml(str) {
  if (!str) return '';
  return str.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function cleanStatementForSlug(stmt) {
  if (!stmt) return '';
  return stmt
    .replace(/^quest[aã]o\s*\d+[\.\:\-\s]*/i, '')
    .replace(/^\d+[\.\:\-\s]+/i, '')
    .replace(/^\([^\)]+\)\s*/i, '')
    .replace(/^(com relação|em relação|quanto|sobre|acerca|assinale|considere|observe)\s*(a|ao|à|às|aos|o|os|as)?\s*/i, '')
    .trim();
}

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
  const normA = normalizeText(cleanHtml(a));
  const normB = normalizeText(cleanHtml(b));
  if (!normA || !normB) return 0;
  if (normA === normB) return 1.0;
  if ((normA.includes(normB) || normB.includes(normA)) && Math.min(normA.length, normB.length) >= 5) {
    return Math.max(0.85, Math.min(normA.length, normB.length) / Math.max(normA.length, normB.length));
  }
  const wordsA = new Set(normA.split(' ').filter(w => w.length > 2));
  const wordsB = new Set(normB.split(' ').filter(w => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let intersection = 0;
  for (const w of wordsA) if (wordsB.has(w)) intersection++;
  return intersection / new Set([...wordsA, ...wordsB]).size;
}

function slugify(text, maxWords = 10) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, maxWords)
    .join('-');
}

function initStaging() {
  if (fs.existsSync(STAGING_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STAGING_FILE, 'utf8'));
    } catch (e) {}
  }
  return {
    lote: LOTE_NUM,
    iniciadoEm: new Date().toISOString(),
    ultimaAtualizacao: new Date().toISOString(),
    totalHomologados: 0,
    totalRemapeados: 0,
    decisoes: []
  };
}

function saveStaging(st) {
  st.ultimaAtualizacao = new Date().toISOString();
  st.totalHomologados = st.decisoes.length;
  st.totalRemapeados = st.decisoes.filter(d => d.foiRemapeado).length;
  fs.writeFileSync(STAGING_FILE, JSON.stringify(st, null, 2), 'utf8');
}

// Anti-permutação semântica: garante que o texto da alternativa bate no banco
function matchAlternativeSemantic(dbQuestion, officialAnsLetter, officialWinningText = null) {
  const opts = Array.isArray(dbQuestion.options) ? dbQuestion.options : [];
  if (opts.length === 0) {
    return { isValid: false, mappedLetter: null, reason: 'QUESTAO_SEM_OPCOES_NO_BANCO' };
  }

  if (officialAnsLetter === 'ANULADA' || officialAnsLetter === 'X' || officialAnsLetter === '*') {
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

    if (bestMatchOpt && maxSim >= 0.60) {
      const wasRemapped = officialAnsLetter ? bestMatchOpt.letter !== officialAnsLetter : false;
      return {
        isValid: true,
        mappedLetter: bestMatchOpt.letter,
        isAnulada: false,
        wasRemapped,
        confidence: Math.max(maxSim, 0.98),
        detail: wasRemapped
          ? `⚠️ Anti-Permutação: Publicado '${officialAnsLetter}' -> No Banco é '${bestMatchOpt.letter}' (sim: ${(maxSim * 100).toFixed(1)}%)`
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

// Extrai do Schema.org QAPage do SanarMed
async function fetchSingleSlug(slug) {
  const url = `https://sanarmed.com/q/${slug}/`;
  try {
    let res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(2800)
    });
    if (res.status === 429) {
      // Backoff adaptativo se rate limited
      await new Promise(r => setTimeout(r, 2500 + Math.random() * 1500));
      res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(2800)
      });
    }
    if (!res.ok) return null;
    const html = await res.text();
    const ldRegex = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    let m;
    while ((m = ldRegex.exec(html)) !== null) {
      try {
        const data = JSON.parse(m[1]);
        if (data['@type'] === 'QAPage' || data.mainEntity?.['@type'] === 'Question') {
          const accepted = data.mainEntity?.acceptedAnswer;
          if (accepted && accepted.text) {
            const cleanWinning = cleanHtml(accepted.text);
            const comment = cleanHtml(accepted.comment?.text || '');
            const letMatch = comment.match(/(?:resposta\s+correta|gabarito)[^\w]*letra\s*([A-E])\b/i) ||
                             comment.match(/(?:alternativa|letra)\s*([A-E])\s*(?:é\s+a\s+correta|correta)/i);
            return {
              provider: 'SanarMed',
              winningOptionText: cleanWinning,
              publishedLetter: letMatch ? letMatch[1].toUpperCase() : null,
              sourceUrl: url,
              confidence: 0.98
            };
          }
        }
      } catch (_) {}
    }
  } catch (_) {}
  return null;
}

async function fetchSanarDirect(statement) {
  const cleanStmt = cleanStatementForSlug(statement);
  const primarySlug = slugify(cleanStmt, 6);
  if (primarySlug) {
    const res = await fetchSingleSlug(primarySlug);
    if (res) return res;
  }

  // Fallbacks rápidos concorrentes se primarySlug falhar
  const fallbacks = [
    slugify(statement, 6),
    slugify(cleanStmt, 8),
    slugify(cleanStmt, 10)
  ].filter(s => s && s !== primarySlug);

  const uniqueFallbacks = [...new Set(fallbacks)].slice(0, 2);
  if (uniqueFallbacks.length > 0) {
    const results = await Promise.all(uniqueFallbacks.map(fetchSingleSlug));
    const found = results.find(r => r !== null);
    if (found) return found;
  }

  return null;
}

// Extrai do Estratégia MED (desativado DDG para evitar timeout bloqueante)
async function searchEstrategia(statement) {
  return null;
}

// Configurações específicas de cada lote
const LOTE_CONFIGS = {
  1: {
    nome: 'ABEM — Teste de Progresso Nacional (2024/2025/2026)',
    filter: q => q.ilike('institution', '%ABEM%'),
    async runFase1(dbQs, staging) {
      console.log('   Processando ABEM...');
    }
  },
  2: {
    nome: 'SES-GO — Instituto Verbena / UFG (2026)',
    filter: q => q.ilike('institution', '%SES-GO%'),
    async runFase1(dbQs, staging) {
      console.log('   Processando SES-GO Verbena...');
    }
  },
  3: {
    nome: 'UNIP — Universidade Paulista (2026)',
    filter: q => q.ilike('institution', '%UNIP%').eq('year', 2026),
    async runFase1(dbQs, staging) {
      console.log('   Processando UNIP 2026...');
    }
  },
  4: {
    nome: 'USCS / FAUSCS (2025 e 2026)',
    filter: q => q.ilike('institution', '%São Caetano%'),
    async runFase1(dbQs, staging) {
      console.log('   Processando USCS / FAUSCS 2025 e 2026...');
    }
  },
  5: {
    nome: 'Rede Américas / HOA / Jayme Neves / SC Maceió',
    filter: q => q.or('institution.ilike.%Américas%,institution.ilike.%Oftalmológico do Acre%,institution.ilike.%Jayme%,institution.ilike.%Maceió%'),
    async runFase1(dbQs, staging) {}
  },
  6: {
    nome: 'São Leopoldo Mandic & Araras (2025-2026)',
    filter: q => q.ilike('institution', '%Mandic%'),
    async runFase1(dbQs, staging) {}
  },
  7: {
    nome: 'HSL Brasília / CEPOA / HMMSJP / FBHC / UERN',
    filter: q => q.or('institution.ilike.%Sírio-Libanês%,institution.ilike.%CEPOA%,institution.ilike.%Pinhais%,institution.ilike.%Beneficência%,institution.ilike.%Rio Grande do Norte%'),
    async runFase1(dbQs, staging) {}
  },
  8: {
    nome: 'Resíduos R3 Grandes Bancas (UNICAMP, UERJ, SURCE, PSU-MG)',
    filter: q => q.or('banca.ilike.%UNICAMP%,banca.ilike.%UERJ%,banca.ilike.%SURCE%,banca.ilike.%PSU-MG%,banca.ilike.%AREMG%'),
    async runFase1(dbQs, staging) {}
  },
  9: {
    nome: 'Redes Hospitalares & Santas Casas',
    filter: q => q.or('institution.ilike.%Santa Casa%,institution.ilike.%Samaritano%,institution.ilike.%Adventista%,institution.ilike.%Mário Gatti%'),
    async runFase1(dbQs, staging) {}
  },
  10: {
    nome: 'Concursos Federais & Históricos Remanescentes',
    filter: q => q.or('institution.ilike.%Federal%,institution.ilike.%Macaé%,institution.ilike.%Evangélica%,institution.ilike.%UNITPAC%,institution.ilike.%Tocantins%'),
    async runFase1(dbQs, staging) {}
  }
};

async function runWorker() {
  const cfg = LOTE_CONFIGS[LOTE_NUM] || LOTE_CONFIGS[10];
  console.log('========================================================================');
  console.log(`🤖 WORKER PARALELO ATIVADO: [LOTE ${LOTE_NUM}/10] ${cfg.nome}`);
  console.log(`📁 Staging dedicado: ${STAGING_FILE}`);
  console.log(`🎯 Limite de processamento: ${LIMIT} questões`);
  console.log('========================================================================\n');

  const staging = initStaging();
  const processedIds = new Set(staging.decisoes.map(d => d.id));

  // 1. Busca questões pendentes do lote no Supabase
  let query = supabase.from('questions')
    .select('id, code, banca, institution, year, especialidade, statement, options')
    .or('correct_answer.is.null,correct_answer.eq.')
    .order('year', { ascending: false })
    .limit(LIMIT);

  query = cfg.filter(query);
  const { data: rawQs, error } = await query;

  if (error) {
    console.error(`Erro ao buscar questões para lote ${LOTE_NUM}:`, error.message);
    return;
  }

  const pendingQuestions = (rawQs || []).filter(q => !processedIds.has(q.id));
  console.log(`📦 Questões pendentes atribuídas ao Worker ${LOTE_NUM}: ${pendingQuestions.length}\n`);

  if (pendingQuestions.length === 0) {
    console.log(`✨ Nenhuma questão pendente neste lote. Concluído.`);
    return;
  }

  // 2. Executa rotinas de Fase 1 se existirem
  if (cfg.runFase1) {
    await cfg.runFase1(pendingQuestions, staging);
    saveStaging(staging);
  }

  // 3. Executa Fase 2 (Bottom-Up multiprovedor) para todos os resíduos do lote
  console.log(`⚡ Iniciando varredura multiprovedor para os resíduos do Lote ${LOTE_NUM}...`);
  let foundInThisRun = 0;

  for (let i = 0; i < pendingQuestions.length; i++) {
    const q = pendingQuestions[i];
    if (staging.decisoes.some(d => d.id === q.id)) continue;

    // Provedor 1: SanarMed (slug direto JSON-LD)
    let res = await fetchSanarDirect(q.statement);

    // Provedor 2: Estratégia MED (fallback)
    if (!res) {
      res = await searchEstrategia(q.statement);
    }

    if (res) {
      const match = matchAlternativeSemantic(q, res.publishedLetter, res.winningOptionText);
      if (match.isValid) {
        foundInThisRun++;
        staging.decisoes.push({
          id: q.id,
          code: q.code,
          table: 'questions',
          caderno: `${q.banca || q.institution} — ${q.year}`,
          fase: `Worker ${LOTE_NUM} (${res.provider})`,
          gabaritoOficialExtraido: res.publishedLetter || match.mappedLetter,
          gabaritoMapeadoNoBanco: match.mappedLetter,
          foiRemapeado: match.wasRemapped,
          isAnulada: Boolean(match.isAnulada),
          confianca: match.confidence,
          fonte: res.sourceUrl,
          data: new Date().toISOString()
        });
        console.log(`[W${LOTE_NUM}] ✅ [${q.code}] -> '${match.mappedLetter}' via ${res.provider} (${match.detail})`);
        saveStaging(staging);
      }
    }

    if ((i + 1) % 10 === 0) {
      console.log(`[W${LOTE_NUM}] Progresso: ${i + 1}/${pendingQuestions.length} analisadas | Homologadas acumuladas: ${staging.decisoes.length}`);
    }

    // Delay adaptativo de cortesia entre requisições
    await new Promise(r => setTimeout(r, 900 + Math.random() * 400));
  }

  saveStaging(staging);
  console.log(`\n🎉 [WORKER ${LOTE_NUM} CONCLUÍDO] Homologadas nesta rodada: ${foundInThisRun} | Total no staging: ${staging.decisoes.length}`);
}

runWorker().catch(console.error);
