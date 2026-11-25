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

// 1. Mapear SQLite UUID -> dados Ouro
const sqliteOuroMap = new Map();
for (const r of db.prepare(`SELECT id, code, commentary, options FROM questions_curated_staging WHERE commentary LIKE '%Take-Home%'`).all()) {
  const m = r.id.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  const uuid = m ? m[0].toLowerCase() : r.id.toLowerCase();
  sqliteOuroMap.set(uuid, r);
}

// 2. Buscar em questions_direto todas sem Take-Home que existem com Take-Home no SQLite
const hex = '0123456789abcdef'.split('');
const toSync = [];

await Promise.all(hex.map(async (h) => {
  const lower = `${h}0000000-0000-0000-0000-000000000000`;
  const upper = `${h}fffffff-ffff-ffff-ffff-ffffffffffff`;
  let lastId = null;

  while (true) {
    let q = supabase
      .from('questions_direto')
      .select('id, code, especialidade, commentary')
      .gte('id', lastId ? lastId : lower)
      .lte('id', upper)
      .order('id', { ascending: true })
      .limit(1000);
    if (lastId) q = q.gt('id', lastId);

    const { data, error } = await q;
    if (error || !data || data.length === 0) break;
    lastId = data[data.length - 1].id;

    for (const r of data) {
      const c = (r.commentary || '').trim();
      if (!c.includes('Take-Home')) {
        const local = sqliteOuroMap.get(r.id.toLowerCase());
        if (local) {
          toSync.push({ supaId: r.id, code: r.code, esp: r.especialidade, local });
        }
      }
    }
    if (data.length < 1000) break;
  }
}));

console.log(`🔍 Encontradas ${toSync.length} questões para sincronizar do SQLite -> Supabase questions_direto.`);

let synced = 0;
let failed = 0;
for (const item of toSync) {
  let opts = item.local.options;
  if (typeof opts === 'string') {
    try { opts = JSON.parse(opts); } catch { opts = undefined; }
  }
  const payload = { commentary: item.local.commentary };
  if (Array.isArray(opts) && opts.length > 0) payload.options = opts;

  const { data, error } = await supabase
    .from('questions_direto')
    .update(payload)
    .eq('id', item.supaId)
    .select('id');

  if (error || !data || data.length === 0) {
    failed++;
    console.error(`❌ Falha ao sincronizar ${item.code} (${item.supaId}):`, error?.message || '0 linhas');
  } else {
    synced++;
  }
}

console.log(`✅ Sincronização concluída: ${synced} atualizadas no site | ${failed} falhas.`);

// 3. Auditar os 1.261 pendentes reais de questions_revalida no Supabase (por ano & presença de imagem)
console.log('\n=== AUDITORIA DOS PENDENTES REAIS EM SUPABASE questions_revalida (has_gabarito = true) ===');
let allRev = [];
let from = 0;
while (true) {
  const { data, error } = await supabase
    .from('questions_revalida')
    .select('id, code, institution, year, type, commentary, images')
    .eq('has_gabarito', true)
    .range(from, from + 999);
  if (error || !data || data.length === 0) break;
  allRev.push(...data);
  if (data.length < 1000) break;
  from += 1000;
}

const revPending = allRev.filter(r => !(r.commentary || '').includes('Take-Home'));
const revByYear = {};
let textoPuro = 0, comImagem = 0, mcq = 0, diss = 0;
for (const r of revPending) {
  const hasImg = Array.isArray(r.images) && r.images.length > 0;
  if (hasImg) comImagem++; else textoPuro++;
  if ((r.type || '').toLowerCase().includes('dissert')) diss++; else mcq++;
  const y = `${r.year || '?'} (${r.institution?.split(' - ')[0] || '?'})`;
  if (!revByYear[y]) revByYear[y] = { total: 0, texto: 0, img: 0 };
  revByYear[y].total++;
  if (hasImg) revByYear[y].img++; else revByYear[y].texto++;
}

console.log({ totalPendenteRevalidaNoSite: revPending.length, textoPuro, comImagem, mcq, diss });
console.table(Object.entries(revByYear).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 20).map(([prova, d]) => ({ prova, ...d })));
