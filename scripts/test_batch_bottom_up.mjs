import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const env = {};
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

function verifyPageAndExtractAnswer(html, statement, options) {
  // 1. Tenta extrair via Schema.org QAPage (Sanar, etc)
  const ldRegex = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = ldRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(m[1]);
      if (data['@type'] === 'QAPage' || data.mainEntity?.['@type'] === 'Question') {
        const accepted = data.mainEntity?.acceptedAnswer;
        if (accepted && accepted.text) {
          // Compara accepted.text com as opções do banco
          let bestOpt = null;
          let maxSim = 0;
          for (const opt of options) {
            const sim = textSimilarity(accepted.text, opt.text);
            if (sim > maxSim) {
              maxSim = sim;
              bestOpt = opt;
            }
          }
          if (bestOpt && maxSim >= 0.70) {
            return {
              letter: bestOpt.letter,
              matchedOptionText: bestOpt.text,
              isAnulada: false,
              confidence: maxSim,
              method: 'Schema.org QAPage acceptedAnswer'
            };
          }
        }
      }
    } catch (e) {}
  }

  // 2. Tenta extrair via correspondência de texto e regex
  const normHtml = normalizeText(html);
  const normStmt = normalizeText(statement);

  const stmtWords = normStmt.split(' ').filter(w => w.length > 4);
  let wordsFound = 0;
  for (const w of stmtWords) {
    if (normHtml.includes(w)) wordsFound++;
  }
  const wordRatio = stmtWords.length > 0 ? wordsFound / stmtWords.length : 0;
  if (wordRatio < 0.60) return null; // Não é a mesma questão

  // Regex de gabarito
  const answerRegexes = [
    /(?:gabarito|resposta\s+correta|alternativa\s+correta)[\:\s\-]+([A-E])\b/i,
    /(?:letra\s+correta|gabarito\s+definitivo|gabarito\s+oficial)[\:\s\-]+([A-E])\b/i,
    /(?:item\s+correto|opção\s+correta)[\:\s\-]+([A-E])\b/i,
    /alternativa\s+([A-E])\s+(?:é\s+a\s+correta|está\s+correta|é\s+o\s+gabarito)/i,
    /(?:anulada|questão\s+anulada|gabarito\s*\:\s*anulada)/i
  ];

  for (const r of answerRegexes) {
    const rm = html.match(r);
    if (rm) {
      if (rm[0].toLowerCase().includes('anulada')) {
        return { letter: 'ANULADA', isAnulada: true, confidence: 1.0, method: 'Regex Anulada' };
      } else if (rm[1]) {
        return { letter: rm[1].toUpperCase(), isAnulada: false, confidence: 0.90, method: 'Regex Gabarito' };
      }
    }
  }

  return null;
}

async function testBatch() {
  const { data: qs } = await supabase.from('questions')
    .select('id, code, banca, institution, year, statement, options')
    .or('correct_answer.is.null,correct_answer.eq.')
    .limit(5);

  console.log(`Testando 5 questões...`);
  for (const q of qs) {
    console.log(`\n--------------------------------------------------`);
    console.log(`ID: ${q.code} (${q.institution || q.banca} ${q.year})`);
    console.log(`Stmt: ${q.statement.slice(0, 70)}...`);
    
    // Constrói query natural
    const words = normalizeText(q.statement).split(' ').filter(w => w.length > 3).slice(0, 10).join(' ');
    const query = `${words} ${normalizeText(q.institution || q.banca || '').split(' ').slice(0, 3).join(' ')}`;
    console.log(`Query: ${query}`);
    
    const links = await searchWeb(query);
    console.log(`Links encontrados: ${links.length}`);
    for (const link of links.slice(0, 3)) {
      console.log(`  -> ${link}`);
      try {
        const res = await fetch(link, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
          },
          signal: AbortSignal.timeout(6000)
        });
        if (!res.ok) continue;
        const html = await res.text();
        const ans = verifyPageAndExtractAnswer(html, q.statement, q.options);
        if (ans) {
          console.log(`  🎯 MATCH ENCONTRADO! Letra: ${ans.letter} via ${ans.method} (Confiança: ${ans.confidence})`);
          break;
        }
      } catch (e) {
        console.log(`  Erro link: ${e.message}`);
      }
    }
    await new Promise(r => setTimeout(r, 1500));
  }
}
testBatch();

