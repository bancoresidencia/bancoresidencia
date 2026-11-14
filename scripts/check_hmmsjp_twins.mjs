import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
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

async function findHmmsjpTwins() {
  console.log('Buscando pendentes de HMMSJP...');
  const { data: pending } = await supabase
    .from('questions')
    .select('id, code, year, institution, statement, options, correct_answer')
    .ilike('code', 'HMMSJP%')
    .or('correct_answer.is.null,correct_answer.eq.');

  console.log(`HMMSJP pendentes carregadas: ${pending.length}`);

  // Para cada pendente, vamos buscar candidatos com palavras-chave relevantes
  const matched = [];

  for (let i = 0; i < pending.length; i++) {
    const p = pending[i];
    if (!p.statement || p.statement.trim().length < 40) continue;

    // Pega as primeiras palavras significativas para busca rápida
    const words = cleanText(p.statement).split(' ').filter(w => w.length > 4).slice(0, 4);
    if (words.length < 2) continue;

    const queryWord = words[0];
    const { data: candidates } = await supabase
      .from('questions')
      .select('id, code, year, institution, statement, options, correct_answer')
      .neq('id', p.id)
      .not('correct_answer', 'is', null)
      .neq('correct_answer', '')
      .ilike('statement', `%${queryWord}%`)
      .limit(30);

    if (candidates && candidates.length > 0) {
      for (const c of candidates) {
        const stmtSim = calculateSimilarity(p.statement, c.statement);
        if (stmtSim >= 0.85) {
          // Trava 2: Verifica opções
          // Pega a alternativa vencedora de C
          const winningOptC = Array.isArray(c.options) ? c.options.find(o => o.letter === c.correct_answer) : null;
          const winningTextC = winningOptC ? (winningOptC.text || winningOptC.descricao || '') : '';

          let bestOptSim = 0;
          let matchedDbLetter = null;

          if (Array.isArray(p.options) && winningTextC) {
            for (const opt of p.options) {
              const oText = opt.text || opt.descricao || '';
              const sim = calculateSimilarity(winningTextC, oText);
              if (sim > bestOptSim) {
                bestOptSim = sim;
                matchedDbLetter = opt.letter;
              }
            }
          }

          if (bestOptSim >= 0.85 && matchedDbLetter) {
            matched.push({
              pendingId: p.id,
              pendingCode: p.code,
              donorCode: c.code,
              donorInst: c.institution,
              donorYear: c.year,
              donorAnswer: c.correct_answer,
              mappedAnswer: matchedDbLetter,
              stmtSim: parseFloat(stmtSim.toFixed(4)),
              optSim: parseFloat(bestOptSim.toFixed(4))
            });
            break; // Já achou um doador confiável
          }
        }
      }
    }
    if ((i + 1) % 25 === 0) {
      console.log(`Analisadas ${i + 1}/${pending.length}... Encontradas gêmeas até agora: ${matched.length}`);
    }
  }

  console.log(`\n========================================`);
  console.log(`TOTAL GÊMEAS CONFIRMADAS PARA HMMSJP: ${matched.length}`);
  console.log(`========================================`);
  fs.writeFileSync('data/staging_hmmsjp_twins.json', JSON.stringify(matched, null, 2), 'utf8');
}

findHmmsjpTwins().catch(console.error);
