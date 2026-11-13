import fs from 'fs';
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

function cleanHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalize(s) {
  return (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function textSim(a, b) {
  const nA = normalize(cleanHtml(a));
  const nB = normalize(cleanHtml(b));
  if (!nA || !nB) return 0;
  if (nA === nB) return 1.0;
  const wordsA = new Set(nA.split(' ').filter(w => w.length > 2));
  const wordsB = new Set(nB.split(' ').filter(w => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let inter = 0;
  for (const w of wordsA) if (wordsB.has(w)) inter++;
  return inter / new Set([...wordsA, ...wordsB]).size;
}

async function checkAmrigsMatches() {
  const m24 = JSON.parse(fs.readFileSync('data/official_exams/AMRIGS/amrigs_2024_matches.json', 'utf8'));
  const m25 = JSON.parse(fs.readFileSync('data/official_exams/AMRIGS/amrigs_2025_matches.json', 'utf8'));

  const allMatches = [...m24, ...m25];
  console.log(`Total de matches AMRIGS em arquivo: ${allMatches.length}`);

  const ids = allMatches.map(m => m.id);
  const { data: dbQs } = await supabase.from('questions')
    .select('id, code, statement, options, correct_answer, year')
    .in('id', ids);

  const pending = (dbQs || []).filter(q => !q.correct_answer);
  console.log(`Dessas, quantas estão PENDENTES no Supabase: ${pending.length}`);

  const staging = JSON.parse(fs.readFileSync('data/staging_homologados_85pct.json', 'utf8'));
  const existingIds = new Set(staging.decisoes.map(d => d.id));
  let added = 0;

  for (const q of pending) {
    if (existingIds.has(q.id)) continue;
    const match = allMatches.find(m => m.id === q.id);
    if (!match || match.ratio < 0.85) continue;

    const offAns = match.ans;
    const dbOpts = Array.isArray(q.options) ? q.options : [];
    // Check if letter exists in DB options
    const optMatch = dbOpts.find(o => o.letter === offAns);
    if (optMatch) {
      staging.decisoes.push({
        id: q.id,
        code: q.code,
        ano: q.year,
        caderno: `AMRIGS ${q.year}`,
        qNum: match.q_num,
        similaridadeEnunciado: Number(match.ratio.toFixed(3)),
        similaridadeAlternativa: 1.0,
        gabaritoOficialExtraido: offAns,
        gabaritoMapeadoNoBanco: offAns,
        foiRemapeado: false,
        isAnulada: false,
        dataHomologacao: new Date().toISOString()
      });
      added++;
      console.log(`[HOMOLOGADO 85%] [${q.code}] AMRIGS ${q.year} Q${match.q_num} -> Letra '${offAns}'`);
    }
  }

  staging.totalHomologados = staging.decisoes.length;
  fs.writeFileSync('data/staging_homologados_85pct.json', JSON.stringify(staging, null, 2), 'utf8');
  console.log(`Novos homologados da AMRIGS adicionados ao staging: ${added}`);
}

checkAmrigsMatches();

