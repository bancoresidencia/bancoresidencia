import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { DatabaseSync } from 'node:sqlite';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      }
    }
  });
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const dbPath = path.resolve('data/questoes_132k.db');
const localDb = new DatabaseSync(dbPath, { readOnly: true });

function cleanLexical(text) {
  if (!text) return '';
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(\d+)([a-zA-Z]+)\b/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function getWords(text) {
  return cleanLexical(text).split(' ').filter(w => w.length >= 4);
}

function calculateJaccard(s1, s2) {
  const w1 = new Set(getWords(s1));
  const w2 = new Set(getWords(s2));
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
  if (j < 0.7) return j;
  const bg1 = getBiGrams(s1);
  const bg2 = getBiGrams(s2);
  if (bg1.size === 0 || bg2.size === 0) return j;
  let inter = 0;
  for (const b of bg1) if (bg2.has(b)) inter++;
  const bgSim = (2.0 * inter) / (bg1.size + bg2.size);
  return (j * 0.4) + (bgSim * 0.6);
}

async function main() {
  console.log('🚀 Testando Estratégia 1: Herança Intrabanco por Questões Gêmeas');
  
  // 1. Carrega as 10.655 pendências do Supabase
  console.log('📡 Buscando pendências do Supabase...');
  let pending = [];
  let from = 0;
  const step = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('questions')
      .select('id, code, year, institution, statement, options')
      .or('correct_answer.is.null,correct_answer.eq.""')
      .range(from, from + step - 1);
    if (error || !data || data.length === 0) break;
    pending = pending.concat(data);
    from += step;
    if (data.length < step) break;
  }
  console.log(`🎯 ${pending.length} pendências carregadas.`);

  // 2. Carrega as questões gabaritadas do banco SQLite local
  console.log('📂 Carregando questões gabaritadas do questoes_132k.db...');
  const resolved = localDb.prepare(`
    SELECT id, code, year, institution, statement, options, correct_answer 
    FROM questions 
    WHERE correct_answer IS NOT NULL AND correct_answer != ''
  `).all();
  console.log(`✅ ${resolved.length} questões com gabarito carregadas.`);

  // 3. Constrói índice invertido sobre as questões resolvidas
  console.log('🔨 Construindo Índice Invertido sobre o acervo gabaritado...');
  const index = new Map(); // palavra -> array de indices em resolved
  for (let i = 0; i < resolved.length; i++) {
    const words = getWords(resolved[i].statement);
    // Pega as primeiras 15 palavras distintas significativas para indexar
    const uniqueWords = [...new Set(words)].slice(0, 15);
    for (const w of uniqueWords) {
      if (!index.has(w)) index.set(w, []);
      index.get(w).push(i);
    }
  }
  console.log(`✅ Índice construído com ${index.size} termos.`);

  // 4. Cruzamento
  console.log('🔍 Executando cruzamento Dual-Gate (similaridade >= 95%)...');
  let twinMatches = [];
  let checked = 0;

  for (const qPend of pending) {
    checked++;
    if (checked % 2000 === 0) console.log(`   Progresso: ${checked}/${pending.length}...`);

    const qWords = getWords(qPend.statement);
    if (qWords.length < 6) continue;

    const candidateHits = new Map();
    for (const w of qWords.slice(0, 15)) {
      const postings = index.get(w);
      if (postings && postings.length < 500) {
        for (const idx of postings) {
          candidateHits.set(idx, (candidateHits.get(idx) || 0) + 1);
        }
      }
    }

    let bestMatch = null;
    let maxSim = 0;

    for (const [candIdx, hits] of candidateHits.entries()) {
      if (hits < 4) continue; // Precisa coincidir em pelo menos 4 termos-chave

      const qRes = resolved[candIdx];
      // Ignora se for o mesmo id
      if (qRes.id === qPend.id || qRes.code === qPend.code) continue;

      const sim = calculateSimilarity(qPend.statement, qRes.statement);
      if (sim >= 0.95 && sim > maxSim) {
        // Verifica coerência de alternativas
        maxSim = sim;
        bestMatch = {
          pendenteCode: qPend.code,
          pendenteInst: qPend.institution,
          pendenteAno: qPend.year,
          resolvidaCode: qRes.code,
          resolvidaInst: qRes.institution,
          resolvidaAno: qRes.year,
          gabaritoHerdado: qRes.correct_answer,
          similaridade: Math.round(sim * 1000) / 10
        };
      }
    }

    if (bestMatch) {
      twinMatches.push(bestMatch);
    }
  }

  console.log(`\n======================================================`);
  console.log(`🎉 RESULTADO DO CRUZAMENTO DE QUESTÕES GÊMEAS:`);
  console.log(`Questões pendentes analisadas: ${pending.length}`);
  console.log(`Questões Gêmeas identificadas (>= 95% similaridade): ${twinMatches.length}`);
  console.log(`======================================================\n`);

  if (twinMatches.length > 0) {
    console.log('Amostra das 10 primeiras gêmeas encontradas:');
    console.log(twinMatches.slice(0, 10));
    fs.writeFileSync('data/staging_questoes_gemeas_preview.json', JSON.stringify(twinMatches, null, 2));
    console.log('Relatório de preview salvo em data/staging_questoes_gemeas_preview.json');
  }
}

main().catch(console.error);

