import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

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

function calculateJaccard(s1, s2) {
  const words1 = new Set(normalizeText(s1).split(' ').filter(w => w.length > 2));
  const words2 = new Set(normalizeText(s2).split(' ').filter(w => w.length > 2));
  if (words1.size === 0 || words2.size === 0) return 0;
  let intersection = 0;
  for (const w of words1) if (words2.has(w)) intersection++;
  return intersection / new Set([...words1, ...words2]).size;
}

function getBiGrams(str) {
  const s = normalizeText(str).replace(/\s+/g, '');
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
  for (const bg of bg1) if (bg2.has(bg)) inter++;
  const bgSim = (2.0 * inter) / (bg1.size + bg2.size);
  return (jaccard * 0.4) + (bgSim * 0.6);
}

function slugify(text, maxWords = 6) {
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

async function fetchSingleSlug(slug) {
  const url = `https://sanarmed.com/q/${slug}/`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(3500)
    });
    if (!res.ok) return null;
    const html = await res.text();
    const ldRegex = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    let m;
    while ((m = ldRegex.exec(html)) !== null) {
      try {
        const data = JSON.parse(m[1]);
        if (data['@type'] === 'QAPage' || data.mainEntity?.['@type'] === 'Question') {
          const qObj = data.mainEntity || data;
          const accepted = qObj.acceptedAnswer;
          if (accepted && accepted.text) {
            return {
              statementText: cleanHtml(qObj.text || qObj.name || ''),
              winningOptionText: cleanHtml(accepted.text),
              commentText: cleanHtml(accepted.comment?.text || ''),
              url
            };
          }
        }
      } catch (_) {}
    }
  } catch (_) {}
  return null;
}

async function searchSanar(statement) {
  const cleanStmt = cleanStatementForSlug(statement);
  const slugsToTry = [
    slugify(cleanStmt, 5),
    slugify(cleanStmt, 6),
    slugify(cleanStmt, 8),
    slugify(statement, 5),
    slugify(statement, 6)
  ].filter(Boolean);

  const uniqueSlugs = [...new Set(slugsToTry)];
  for (const slug of uniqueSlugs) {
    const res = await fetchSingleSlug(slug);
    if (res) return res;
    // Small jitter to prevent 429
    await new Promise(r => setTimeout(r, 60));
  }
  return null;
}

async function run() {
  console.log('Testing SanarMed with Dual-Gate >= 85% on 20 pending questions...');

  // Fetch 20 pending questions from USCS, Mandic, Américas
  const { data: questions, error } = await supabase
    .from('questions')
    .select('id, code, institution, year, statement, options')
    .or('correct_answer.is.null,correct_answer.eq.')
    .in('year', [2026, 2025])
    .limit(20);

  if (error) {
    console.error(error);
    return;
  }

  let homologados = 0;
  for (const q of questions) {
    const cleanStmt = cleanHtml(q.statement);
    process.stdout.write(`Testing [${q.code}] (${q.institution.slice(0, 20)}...): `);

    const hit = await searchSanar(cleanStmt);
    if (!hit) {
      console.log('Not found on Sanar.');
      continue;
    }

    // Trava 1: Similaridade de Enunciado >= 85%
    const stmtSim = calculateSimilarity(cleanStmt, hit.statementText);
    if (stmtSim < 0.85) {
      console.log(`Enunciado divergente (${(stmtSim*100).toFixed(1)}% < 85%)`);
      continue;
    }

    // Trava 2 & Anti-permutação: Similaridade de Alternativa >= 85%
    let bestOptSim = 0;
    let matchedLetter = null;
    let matchedText = null;

    if (Array.isArray(q.options)) {
      for (const opt of q.options) {
        const optText = cleanHtml(opt.text || opt.descricao || '');
        const sim = calculateSimilarity(hit.winningOptionText, optText);
        if (sim > bestOptSim) {
          bestOptSim = sim;
          matchedLetter = opt.letter;
          matchedText = optText;
        }
      }
    }

    if (bestOptSim >= 0.85 && matchedLetter) {
      homologados++;
      console.log(`HOMOLOGADO! Gabarito DB: ${matchedLetter} | Stmt: ${(stmtSim*100).toFixed(1)}% | Opt: ${(bestOptSim*100).toFixed(1)}% | ${hit.url}`);
    } else {
      console.log(`Alternativa divergente (${(bestOptSim*100).toFixed(1)}% < 85%)`);
    }
  }

  console.log(`\nTotal testados: ${questions.length} | Homologados com Dupla Trava >= 85%: ${homologados}`);
}

run();
