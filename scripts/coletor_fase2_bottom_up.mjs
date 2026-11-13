import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

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

// Busca web DuckDuckGo com delay e headers
async function searchWeb(query) {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
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

// Extrai o gabarito de páginas de questões (QConcursos, Sanar, Estratégia, etc.)
function extractAnswerFromPage(html, options) {
  // Procura padrões comuns de resposta em portais médicos e de concursos
  const patterns = [
    /(?:gabarito|resposta|alternativa\s+correta)[\:\s\-]+([A-E])\b/i,
    /(?:letra\s+correta|resposta\s+certa)[\:\s\-]+([A-E])\b/i,
    /item\s+([A-E])\s+(?:é\s+o\s+correto|correto|está\s+correto)/i,
    /alternativa\s+([A-E])\s+(?:é\s+a\s+correta|está\s+correta)/i,
    /class="[^"]*(?:correct|gabarito|certa)[^"]*"[^>]*>[\s\n]*([A-E])[\s\n]*</i
  ];

  for (const pat of patterns) {
    const m = html.match(pat);
    if (m) {
      return { letter: m[1].toUpperCase(), matchedPattern: pat.toString() };
    }
  }

  // Se não achou por letra, tenta casar pelo texto das alternativas
  if (Array.isArray(options)) {
    for (const opt of options) {
      if (opt.text && opt.text.length > 15) {
        const cleanOpt = opt.text.slice(0, 40).replace(/[^a-zA-Z0-9À-ÿ\s]/g, '');
        if (html.includes(cleanOpt)) {
          // Checa se aparece perto da palavra "gabarito" ou "corret"
          const idx = html.indexOf(cleanOpt);
          const snippet = html.slice(Math.max(0, idx - 150), idx + 250);
          if (/gabarito|corret|certa|resposta/i.test(snippet)) {
            return { letter: opt.letter, matchedPattern: 'TEXT_PROXIMITY', textMatched: opt.text };
          }
        }
      }
    }
  }

  return null;
}

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
          ? `⚠️ Remapeamento de segurança: Publicado '${officialAnsLetter}' -> No banco é '${bestMatchLetter}'`
          : `Texto coincide com a letra '${bestMatchLetter}'`
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
      detail: `Letra publicada '${officialAnsLetter}' confere com as opções disponíveis`
    };
  } else {
    return {
      isValid: false,
      mappedLetter: null,
      reason: `LETRA_FORA_DAS_OPCOES (publicado: ${officialAnsLetter}, disponiveis: ${availableLetters.join(',')})`
    };
  }
}

async function testBottomUp() {
  console.log('========================================================================');
  console.log('🔬 TESTE PILOTO FASE 2: BOTTOM-UP BUSCA NA WEB QUESTÃO A QUESTÃO');
  console.log('========================================================================\n');

  // Seleciona 5 questões reais pendentes
  const { data: sampleQuestions } = await supabase
    .from('questions')
    .select('id, code, banca, year, statement, options')
    .or('correct_answer.is.null,correct_answer.eq.')
    .eq('is_anulada', false)
    .limit(5);

  for (const q of sampleQuestions) {
    console.log(`------------------------------------------------------------------------`);
    console.log(`🔍 Questão: ${q.code} (${q.banca} — ${q.year})`);
    
    // Extrai impressão digital do enunciado (primeiras 100-120 letras limpas)
    const cleanStmt = q.statement.replace(/[\r\n\t]+/g, ' ').trim();
    const snippet = cleanStmt.slice(0, 110);
    console.log(`   Enunciado: "${snippet}..."`);

    const query = `"${snippet.slice(0, 80)}"`;
    console.log(`   🔎 Query: ${query}`);

    const links = await searchWeb(query);
    console.log(`   🌐 Links encontrados na web: ${links.length}`);

    let foundAnswer = null;
    let sourceLink = null;

    for (const link of links.slice(0, 3)) {
      try {
        console.log(`      Acessando: ${link.slice(0, 70)}...`);
        const res = await fetch(link, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          signal: AbortSignal.timeout(8000)
        });
        if (!res.ok) continue;
        const html = await res.text();
        const extracted = extractAnswerFromPage(html, q.options);
        if (extracted) {
          foundAnswer = extracted;
          sourceLink = link;
          console.log(`      💎 Gabarito identificado na página: ${extracted.letter} (${extracted.matchedPattern})`);
          break;
        }
      } catch (e) {
        // segue
      }
    }

    if (foundAnswer) {
      const match = matchAlternativeSemantic(q, foundAnswer.letter, foundAnswer.textMatched);
      if (match.isValid) {
        console.log(`   ✅ HOMOLOGADO: Gabarito '${match.mappedLetter}' (Remapeado: ${match.wasRemapped})`);
        console.log(`   🔗 Fonte Web: ${sourceLink}`);
      } else {
        console.log(`   ⛔ REJEITADO: ${match.reason}`);
      }
    } else {
      console.log(`   ⏳ Sem gabarito identificado nesta varredura web.`);
    }

    // Delay de cortesia para evitar rate limit
    await new Promise(r => setTimeout(r, 1500));
  }
}

testBottomUp().catch(console.error);
