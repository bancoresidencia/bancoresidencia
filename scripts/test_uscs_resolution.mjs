import fs from 'fs';
import vm from 'vm';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const t = line.trim();
  if (t && !t.startsWith('#')) {
    const idx = t.indexOf('=');
    if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
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

async function fetchSanarDirect(statement) {
  for (const wordsCount of [10, 8, 12, 14]) {
    const slug = slugify(statement, wordsCount);
    const url = `https://sanarmed.com/q/${slug}/`;
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(5000)
      });
      if (!res.ok) continue;
      const html = await res.text();
      const ldRegex = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
      let m;
      while ((m = ldRegex.exec(html)) !== null) {
        try {
          const data = JSON.parse(m[1]);
          if (data['@type'] === 'QAPage' || data.mainEntity?.['@type'] === 'Question') {
            const accepted = data.mainEntity?.acceptedAnswer;
            if (accepted && accepted.text) {
              const comment = accepted.comment?.text || '';
              const letMatch = comment.match(/(?:resposta\s+correta|gabarito)[^\w]*letra\s*([A-E])\b/i) ||
                               comment.match(/(?:alternativa|letra)\s*([A-E])\s*(?:é\s+a\s+correta|correta)/i);
              return {
                provider: 'SanarMed',
                winningOptionText: accepted.text,
                publishedLetter: letMatch ? letMatch[1].toUpperCase() : null,
                sourceUrl: url,
                confidence: 0.98
              };
            }
          }
        } catch (_) {}
      }
    } catch (_) {}
  }
  return null;
}

async function testResolution() {
  const { data: qs } = await supabase.from('questions')
    .select('id, code, year, statement, options, correct_answer')
    .ilike('institution', '%São Caetano%')
    .or('correct_answer.is.null,correct_answer.eq.')
    .limit(10);

  console.log(`Testing ${qs.length} pending USCS questions...`);
  for (const q of qs) {
    console.log(`\nTesting [${q.code}] (Ano ${q.year}): ${q.statement.slice(0, 70)}...`);
    const res = await fetchSanarDirect(q.statement);
    if (res) {
      console.log(`  -> FOUND on Sanar: ${res.sourceUrl}`);
      console.log(`  -> Published: ${res.publishedLetter} | Winning text: ${res.winningOptionText.slice(0, 60)}...`);
      // Find matching option in DB
      let best = null;
      let maxSim = 0;
      for (const opt of q.options || []) {
        const sim = textSimilarity(res.winningOptionText, opt.text);
        if (sim > maxSim) {
          maxSim = sim;
          best = opt;
        }
      }
      console.log(`  -> Best DB match: Letra '${best?.letter}' (sim: ${(maxSim * 100).toFixed(1)}%)`);
    } else {
      console.log(`  -> Not found directly on SanarMed slug.`);
    }
  }
}

testResolution();
