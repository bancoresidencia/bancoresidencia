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

// Map SQLite UUID -> { isOuro }
const sqliteMap = new Map();
for (const r of db.prepare(`SELECT id, commentary FROM questions_curated_staging`).all()) {
  const m = r.id.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  const uuid = m ? m[0].toLowerCase() : r.id.toLowerCase();
  const isOuro = (r.commentary || '').includes('Take-Home');
  sqliteMap.set(uuid, isOuro);
}

const hex = '0123456789abcdef'.split('');
const stats = {
  totalRows: 0, hasGabTrue: 0, inSqlite: 0, notInSqlite: 0,
  ouro: 0, placeholder: 0, vazio: 0, legado: 0,
  supaSemOuroMasSqliteTemOuro: 0,
  placeholderTextoPuro: 0, vazioTextoPuro: 0, legadoTextoPuro: 0
};
const bySpec = {};
const notInSqliteInst = {};
const desyncSamples = [];

await Promise.all(hex.map(async (h) => {
  const lower = `${h}0000000-0000-0000-0000-000000000000`;
  const upper = `${h}fffffff-ffff-ffff-ffff-ffffffffffff`;
  let lastId = null;

  while (true) {
    let q = supabase
      .from('questions_direto')
      .select('id, code, institution, year, especialidade, has_gabarito, commentary, images')
      .gte('id', lastId ? lastId : lower)
      .lte('id', upper)
      .order('id', { ascending: true })
      .limit(1000);
    if (lastId) q = q.gt('id', lastId);

    const { data, error } = await q;
    if (error) { console.error(`Bucket ${h} err:`, error.message); break; }
    if (!data || data.length === 0) break;
    lastId = data[data.length - 1].id;

    for (const r of data) {
      stats.totalRows++;
      if (!r.has_gabarito) continue;
      stats.hasGabTrue++;

      const esp = r.especialidade || 'NULL';
      if (!bySpec[esp]) bySpec[esp] = { totalGab: 0, inSqlite: 0, notInSqlite: 0, ouro: 0, placeholder: 0, vazio: 0, legado: 0, textoPuroElegivel: 0, desyncOuroSqlite: 0 };
      bySpec[esp].totalGab++;

      const uuid = r.id.toLowerCase();
      const isPresent = sqliteMap.has(uuid);
      if (isPresent) { stats.inSqlite++; bySpec[esp].inSqlite++; }
      else {
        stats.notInSqlite++; bySpec[esp].notInSqlite++;
        const k = `${r.institution || '?'} (${r.year || '?'})`;
        notInSqliteInst[k] = (notInSqliteInst[k] || 0) + 1;
      }

      const c = (r.commentary || '').trim();
      const hasImg = Array.isArray(r.images) && r.images.length > 0;

      if (c.includes('Take-Home')) {
        stats.ouro++; bySpec[esp].ouro++;
      } else {
        if (isPresent && sqliteMap.get(uuid) === true) {
          stats.supaSemOuroMasSqliteTemOuro++;
          bySpec[esp].desyncOuroSqlite++;
          if (desyncSamples.length < 8) desyncSamples.push({ code: r.code, esp, supaComm: c.slice(0, 50) });
        }
        if (!hasImg) bySpec[esp].textoPuroElegivel++;

        if (c.includes('Gabarito Oficial Homologado') || c.startsWith('Gabarito Oficial')) {
          stats.placeholder++; bySpec[esp].placeholder++;
          if (!hasImg) stats.placeholderTextoPuro++;
        } else if (c.length <= 50) {
          stats.vazio++; bySpec[esp].vazio++;
          if (!hasImg) stats.vazioTextoPuro++;
        } else {
          stats.legado++; bySpec[esp].legado++;
          if (!hasImg) stats.legadoTextoPuro++;
        }
      }
    }
    if (data.length < 1000) break;
  }
}));

console.log('=== AUDITORIA COMPLETA 100% DE questions_direto (TODAS AS 206k LINHAS) ===');
console.log(stats);
console.table(bySpec);
if (desyncSamples.length) {
  console.log('\nAmostra onde SQLite TEM Ouro mas Supabase questions_direto NÃO tem:');
  console.table(desyncSamples);
}
const missingTop = Object.entries(notInSqliteInst).sort((a, b) => b[1] - a[1]).slice(0, 10);
if (missingTop.length) {
  console.log('\nOrigens em questions_direto fora do SQLite:');
  console.table(missingTop.map(([origem, qtd]) => ({ origem, qtd })));
}
