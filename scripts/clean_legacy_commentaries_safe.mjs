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
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA busy_timeout = 10000;');
db.exec('PRAGMA synchronous = NORMAL;');

function isConfirmedLegacy(commentary, options) {
  const c = (commentary || '').trim();
  if (!c) return false;
  const cLow = c.toLowerCase();

  // Trava tripla de preservação de Padrão-Ouro
  if (cLow.includes('take-home') || cLow.includes('take home') || cLow.includes('takehome')) return false;
  if (c.includes('Síntese Clínica') || c.includes('Armadilha da Questão') || c.includes('Pérola Clínica') || c.includes('💡')) return false;
  const opts = Array.isArray(options) ? options : [];
  if (opts.some(o => o.explanation && o.explanation.includes('**') && !o.explanation.includes('<u>'))) return false;

  return true;
}

function stripLegacyOptionExplanations(options) {
  if (!Array.isArray(options)) return options;
  let changed = false;
  const cleaned = options.map(o => {
    if (o && typeof o === 'object' && 'explanation' in o) {
      changed = true;
      const { explanation, ...rest } = o;
      return rest;
    }
    return o;
  });
  return { cleaned, changed };
}

async function fetchLegacyRowsInTable(tableName) {
  const legacy = [];
  if (tableName === 'questions_direto') {
    const hex = '0123456789abcdef'.split('');
    await Promise.all(hex.map(async (h) => {
      const lower = `${h}0000000-0000-0000-0000-000000000000`;
      const upper = `${h}fffffff-ffff-ffff-ffff-ffffffffffff`;
      let lastId = null;
      while (true) {
        let q = supabase
          .from(tableName)
          .select('id, code, commentary, options')
          .gte('id', lastId ? lastId : lower)
          .lte('id', upper)
          .order('id', { ascending: true })
          .limit(1000);
        if (lastId) q = q.gt('id', lastId);
        const { data, error } = await q;
        if (error) { console.error(`Err bucket ${h}:`, error.message); break; }
        if (!data || data.length === 0) break;
        lastId = data[data.length - 1].id;
        for (const r of data) {
          if (isConfirmedLegacy(r.commentary, r.options)) legacy.push(r);
        }
        if (data.length < 1000) break;
      }
    }));

    // Also pdr_%
    let pdrLast = null;
    while (true) {
      let q = supabase
        .from(tableName)
        .select('id, code, commentary, options')
        .like('id', 'pdr_%')
        .order('id', { ascending: true })
        .limit(1000);
      if (pdrLast) q = q.gt('id', pdrLast);
      const { data, error } = await q;
      if (error) { console.error('Err pdr_%:', error.message); break; }
      if (!data || !data.length) break;
      pdrLast = data[data.length - 1].id;
      for (const r of data) {
        if (isConfirmedLegacy(r.commentary, r.options)) legacy.push(r);
      }
      if (data.length < 1000) break;
    }
  } else {
    let lastId = null;
    while (true) {
      let q = supabase
        .from(tableName)
        .select('id, code, commentary, options')
        .not('commentary', 'is', null)
        .neq('commentary', '')
        .not('commentary', 'ilike', '%Take-Home%')
        .order('id', { ascending: true })
        .limit(1000);
      if (lastId) q = q.gt('id', lastId);
      const { data, error } = await q;
      if (error || !data || data.length === 0) break;
      lastId = data[data.length - 1].id;
      for (const r of data) {
        if (isConfirmedLegacy(r.commentary, r.options)) legacy.push(r);
      }
      if (data.length < 1000) break;
    }
  }
  return legacy;
}

async function cleanSupabaseTable(tableName) {
  let ouroBefore = 0;
  if (tableName === 'questions_direto') {
    const specs = ['Pediatria', 'Cirurgia Geral', 'Ginecologia', 'Obstetrícia', 'Clínica Médica', 'Medicina Preventiva e Social'];
    for (const s of specs) {
      const { count } = await supabase.from(tableName).select('id', { count: 'exact', head: true }).eq('especialidade', s).ilike('commentary', '%Take-Home%');
      ouroBefore += (count || 0);
    }
  } else {
    const { count } = await supabase.from(tableName).select('id', { count: 'exact', head: true }).ilike('commentary', '%Take-Home%');
    ouroBefore = count || 0;
  }
  const legacyRows = await fetchLegacyRowsInTable(tableName);

  console.log(`\n🧹 [${tableName}] Ouro antes: ${ouroBefore} | Legados confirmados para limpar: ${legacyRows.length}`);

  const simpleIds = [];
  const withOptExp = [];
  for (const r of legacyRows) {
    const { cleaned, changed } = stripLegacyOptionExplanations(r.options);
    if (changed) withOptExp.push({ id: r.id, options: cleaned });
    else simpleIds.push(r.id);
  }

  let clearedCount = 0;
  // Batch clear simpleIds (commentary = null) with server-side guard NOT ilike '%Take-Home%'
  const BATCH = 100;
  for (let i = 0; i < simpleIds.length; i += BATCH) {
    const chunk = simpleIds.slice(i, i + BATCH);
    const { data, error } = await supabase
      .from(tableName)
      .update({ commentary: null })
      .in('id', chunk)
      .not('commentary', 'ilike', '%Take-Home%')
      .select('id');
    if (error) console.error(`  ⚠️ Erro lote ${tableName}:`, error.message);
    else clearedCount += (data?.length || 0);
  }

  // Update rows that also had legacy HTML option explanations
  for (const item of withOptExp) {
    const { data, error } = await supabase
      .from(tableName)
      .update({ commentary: null, options: item.options })
      .eq('id', item.id)
      .not('commentary', 'ilike', '%Take-Home%')
      .select('id');
    if (!error && data) clearedCount += data.length;
  }

  let ouroAfter = 0;
  if (tableName === 'questions_direto') {
    const specs = ['Pediatria', 'Cirurgia Geral', 'Ginecologia', 'Obstetrícia', 'Clínica Médica', 'Medicina Preventiva e Social'];
    for (const s of specs) {
      const { count } = await supabase.from(tableName).select('id', { count: 'exact', head: true }).eq('especialidade', s).ilike('commentary', '%Take-Home%');
      ouroAfter += (count || 0);
    }
  } else {
    const { count } = await supabase.from(tableName).select('id', { count: 'exact', head: true }).ilike('commentary', '%Take-Home%');
    ouroAfter = count || 0;
  }
  console.log(`✅ [${tableName}] Limpos: ${clearedCount} | Ouro depois: ${ouroAfter} (Diferença: ${ouroAfter - ouroBefore})`);
  return { tableName, ouroBefore, clearedCount, ouroAfter };
}

console.log('================================================================================');
console.log('🧹 LIMPEZA SEGURA DE COMENTÁRIOS LEGADOS (100% PRESERVAÇÃO DO PADRÃO-OURO)');
console.log('================================================================================');

const results = [];
for (const tbl of ['questions_titulo', 'questions_revalida', 'questions_rplus', 'questions_direto']) {
  results.push(await cleanSupabaseTable(tbl));
}

// Limpeza espelhada no SQLite SSOT (questions_curated_staging)
console.log('\n🧹 [SQLite questions_curated_staging] Verificando e limpando legados...');
const sqliteOuroBefore = db.prepare(`SELECT COUNT(*) as c FROM questions_curated_staging WHERE commentary LIKE '%Take-Home%'`).get().c;
const sqliteLegacyRows = db.prepare(`
  SELECT id, commentary, options FROM questions_curated_staging
  WHERE commentary IS NOT NULL AND length(trim(commentary)) > 0
    AND lower(commentary) NOT LIKE '%take-home%'
`).all();

let sqliteCleared = 0;
const updSimple = db.prepare(`UPDATE questions_curated_staging SET commentary = NULL WHERE id = ? AND lower(COALESCE(commentary,'')) NOT LIKE '%take-home%'`);
const updWithOpts = db.prepare(`UPDATE questions_curated_staging SET commentary = NULL, options = ? WHERE id = ? AND lower(COALESCE(commentary,'')) NOT LIKE '%take-home%'`);

db.exec('BEGIN IMMEDIATE;');
try {
  for (const r of sqliteLegacyRows) {
    let opts = [];
    try { opts = JSON.parse(r.options || '[]'); } catch {}
    if (!isConfirmedLegacy(r.commentary, opts)) continue;
    const { cleaned, changed } = stripLegacyOptionExplanations(opts);
    if (changed) {
      updWithOpts.run(JSON.stringify(cleaned), r.id);
    } else {
      updSimple.run(r.id);
    }
    sqliteCleared++;
  }
  db.exec('COMMIT;');
} catch (err) {
  db.exec('ROLLBACK;');
  throw err;
}

const sqliteOuroAfter = db.prepare(`SELECT COUNT(*) as c FROM questions_curated_staging WHERE commentary LIKE '%Take-Home%'`).get().c;
console.log(`✅ [SQLite] Ouro antes: ${sqliteOuroBefore} | Limpos: ${sqliteCleared} | Ouro depois: ${sqliteOuroAfter} (Diferença: ${sqliteOuroAfter - sqliteOuroBefore})`);

console.log('\n=== RESUMO FINAL DA LIMPEZA ===');
console.table(results);
