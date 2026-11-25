import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const t = l.trim(); if (!t || t.startsWith('#')) return;
  const [k, ...v] = t.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY);
const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

const snippets = [
  'colecistectomia laparoscópica eletiva, devido a litíase não complicada',
  'colisão contra poste, com uso de capacete, é atendido no local',
  'Tratamento Fora do Domicílio (TFD)',
  'pedreiro, foi atendido em ambulatório de especialidade, há 4 meses'
];

console.log('=== 1. RASTREANDO OS 4 EXEMPLOS NO SUPABASE vs SQLITE ===');
for (const s of snippets) {
  const { data: supaRows } = await supabase
    .from('questions_revalida')
    .select('id, code, institution, banca, year, has_gabarito, correct_answer, commentary, options')
    .ilike('statement', `%${s}%`);

  const sqliteRows = db.prepare(`
    SELECT id, code, institution, banca, year, modalidade, correct_answer, substr(COALESCE(commentary,''),1,120) as comm
    FROM questions_curated_staging
    WHERE statement LIKE ?
  `).all(`%${s}%`);

  console.log(`\n--- Busca: "${s.slice(0, 45)}..." ---`);
  console.log('Supabase questions_revalida encontrados:', supaRows?.length || 0);
  if (supaRows) {
    for (const r of supaRows) {
      const optsHasExp = Array.isArray(r.options) && r.options.some(o => o.explanation && o.explanation.length > 5);
      console.log(`  [SUPA] id=${r.id} | code=${r.code} | inst=${r.institution} | year=${r.year} | gab=${r.correct_answer} | optsExp=${optsHasExp} | comm="${(r.commentary || '').slice(0, 80).replace(/\n/g, ' ')}"`);
    }
  }
  console.log('SQLite questions_curated_staging encontrados:', sqliteRows.length);
  for (const r of sqliteRows) {
    console.log(`  [SQLITE] id=${r.id} | code=${r.code} | mod=${r.modalidade} | inst=${r.institution} | year=${r.year} | comm="${r.comm.replace(/\n/g, ' ')}"`);
  }
}

console.log('\n=== 2. AUDITORIA COMPLETA DE SUPABASE questions_revalida (has_gabarito = true) ===');
let allRevSupa = [];
let from = 0;
while (true) {
  const { data, error } = await supabase
    .from('questions_revalida')
    .select('id, code, institution, banca, year, type, has_gabarito, correct_answer, commentary, options, images')
    .eq('has_gabarito', true)
    .range(from, from + 999);
  if (error || !data || data.length === 0) break;
  allRevSupa.push(...data);
  if (data.length < 1000) break;
  from += 1000;
}

let revOuro = 0, revPlaceholder = 0, revVazio = 0, revLegado = 0, revInSqlite = 0, revNotInSqlite = 0;
const revNotInSqliteByYear = {};
const revPlaceholderSamples = [];

const sqliteAllIds = new Set(
  db.prepare(`SELECT id FROM questions_curated_staging`).all().map(r => {
    const m = r.id.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    return m ? m[0] : r.id;
  })
);

for (const r of allRevSupa) {
  if (sqliteAllIds.has(r.id)) revInSqlite++; else {
    revNotInSqlite++;
    const y = `${r.institution || r.banca || '?'} (${r.year || '?'})`;
    revNotInSqliteByYear[y] = (revNotInSqliteByYear[y] || 0) + 1;
  }

  const c = (r.commentary || '').trim();
  if (c.includes('Take-Home')) {
    revOuro++;
  } else if (c.startsWith('Gabarito Oficial') || c.includes('Gabarito Oficial Homologado') || c.length <= 50) {
    if (c.startsWith('Gabarito Oficial')) revPlaceholder++;
    else revVazio++;
    if (revPlaceholderSamples.length < 8) {
      revPlaceholderSamples.push({ id: r.id, code: r.code, year: r.year, inst: r.institution, comm: c.slice(0, 60) });
    }
  } else {
    revLegado++;
  }
}

console.log({
  total_supa_revalida_has_gabarito: allRevSupa.length,
  revInSqlite,
  revNotInSqlite,
  revOuro,
  revPlaceholder_GabaritoOficial: revPlaceholder,
  revVazio,
  revLegado
});
console.log('\nTop origens do Revalida no Supabase que NÃO estão no SQLite SSOT:');
const sortedMissing = Object.entries(revNotInSqliteByYear).sort((a, b) => b[1] - a[1]).slice(0, 15);
console.table(sortedMissing.map(([origem, qtd]) => ({ origem, qtd })));
console.log('\nAmostra de placeholders/vazios em questions_revalida no Supabase:');
console.table(revPlaceholderSamples);

console.log('\n=== 3. VERIFICANDO SE HÁ INEP 2026 OU PLACEHOLDERS EM OUTRAS TABELAS DO SUPABASE ===');
for (const tbl of ['questions_direto', 'questions_rplus', 'questions_titulo']) {
  const { count: tot } = await supabase.from(tbl).select('id', { count: 'exact', head: true }).eq('has_gabarito', true);
  const { count: gabHomolog } = await supabase.from(tbl).select('id', { count: 'exact', head: true }).eq('has_gabarito', true).ilike('commentary', 'Gabarito Oficial%');
  const { count: yr2026 } = await supabase.from(tbl).select('id', { count: 'exact', head: true }).eq('has_gabarito', true).eq('year', 2026);
  const { count: yr2026NoOuro } = await supabase.from(tbl).select('id', { count: 'exact', head: true }).eq('has_gabarito', true).eq('year', 2026).not('commentary', 'ilike', '%Take-Home%');
  console.log(`${tbl}: has_gabarito=${tot} | placeholder "Gabarito Oficial%"=${gabHomolog} | year=2026 total=${yr2026} (sem Ouro=${yr2026NoOuro})`);
}

