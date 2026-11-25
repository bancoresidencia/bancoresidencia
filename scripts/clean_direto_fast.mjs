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

function isConfirmedLegacy(commentary, options) {
  const c = (commentary || '').trim();
  if (!c) return false;
  const cLow = c.toLowerCase();
  if (cLow.includes('take-home') || cLow.includes('take home') || cLow.includes('takehome')) return false;
  if (c.includes('Síntese Clínica') || c.includes('Armadilha da Questão') || c.includes('Pérola Clínica') || c.includes('💡')) return false;
  const opts = Array.isArray(options) ? options : [];
  if (opts.some(o => o.explanation && o.explanation.includes('**') && !o.explanation.includes('<u>'))) return false;
  return true;
}

function stripLegacyOptionExplanations(options) {
  if (!Array.isArray(options)) return { cleaned: options, changed: false };
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

async function scanDiretoLight() {
  let ouroCount = 0;
  let totalScanned = 0;
  const candidates = [];
  const buckets = '0123456789abcdef'.split('');

  // Pool de apenas 3 workers para não dar statement_timeout no Supabase
  let bIdx = 0;
  async function worker() {
    while (bIdx < buckets.length) {
      const h = buckets[bIdx++];
      const lower = `${h}0000000-0000-0000-0000-000000000000`;
      const upper = `${h}fffffff-ffff-ffff-ffff-ffffffffffff`;
      let lastId = null;

      while (true) {
        let q = supabase
          .from('questions_direto')
          .select('id, commentary')
          .gte('id', lastId ? lastId : lower)
          .lte('id', upper)
          .order('id', { ascending: true })
          .limit(1000);
        if (lastId) q = q.gt('id', lastId);

        const { data, error } = await q;
        if (error) {
          console.warn(`⚠️ Retry bucket ${h} (${error.message})...`);
          await new Promise(r => setTimeout(r, 1500));
          continue;
        }
        if (!data || data.length === 0) break;
        lastId = data[data.length - 1].id;
        totalScanned += data.length;

        for (const r of data) {
          const c = (r.commentary || '').trim();
          if (c.includes('Take-Home')) ouroCount++;
          else if (c.length > 0) candidates.push(r);
        }
        if (data.length < 1000) break;
      }
    }
  }

  await Promise.all([worker(), worker(), worker()]);

  // Also scan pdr_%
  let pdrLast = null;
  while (true) {
    let q = supabase.from('questions_direto').select('id, commentary').like('id', 'pdr_%').order('id', { ascending: true }).limit(1000);
    if (pdrLast) q = q.gt('id', pdrLast);
    const { data, error } = await q;
    if (error || !data || !data.length) break;
    pdrLast = data[data.length - 1].id;
    totalScanned += data.length;
    for (const r of data) {
      const c = (r.commentary || '').trim();
      if (c.includes('Take-Home')) ouroCount++;
      else if (c.length > 0) candidates.push(r);
    }
    if (data.length < 1000) break;
  }

  return { totalScanned, ouroCount, candidates };
}

console.log('🔍 [questions_direto] Escaneando 100% (3 workers estáveis, zero timeout)...');
const before = await scanDiretoLight();
console.log(`  -> Total lido: ${before.totalScanned} | Ouro antes: ${before.ouroCount} | Candidatos sem Take-Home: ${before.candidates.length}`);

// Fetch options only for the candidates to double-check safety & strip legacy HTML explanations
const simpleIds = [];
const withOptExp = [];

for (let i = 0; i < before.candidates.length; i += 100) {
  const chunkIds = before.candidates.slice(i, i + 100).map(c => c.id);
  const { data } = await supabase.from('questions_direto').select('id, commentary, options').in('id', chunkIds);
  for (const r of data || []) {
    if (!isConfirmedLegacy(r.commentary, r.options)) continue;
    const { cleaned, changed } = stripLegacyOptionExplanations(r.options);
    if (changed) withOptExp.push({ id: r.id, options: cleaned });
    else simpleIds.push(r.id);
  }
}

let cleared = 0;
for (let i = 0; i < simpleIds.length; i += 100) {
  const chunk = simpleIds.slice(i, i + 100);
  const { data, error } = await supabase
    .from('questions_direto')
    .update({ commentary: null })
    .in('id', chunk)
    .not('commentary', 'ilike', '%Take-Home%')
    .select('id');
  if (!error && data) cleared += data.length;
}

for (const item of withOptExp) {
  const { data, error } = await supabase
    .from('questions_direto')
    .update({ commentary: null, options: item.options })
    .eq('id', item.id)
    .not('commentary', 'ilike', '%Take-Home%')
    .select('id');
  if (!error && data) cleared += data.length;
}

console.log(`✅ [questions_direto] Limpos agora: ${cleared} (${simpleIds.length} texto + ${withOptExp.length} c/ options HTML). Re-auditando...`);
const after = await scanDiretoLight();
console.log(`🔒 PÓS-LIMPEZA [questions_direto]: Total lido=${after.totalScanned} | Ouro depois=${after.ouroCount} (Diferença: ${after.ouroCount - before.ouroCount}) | Legados restantes=${after.candidates.length}`);

const sqlRem = db.prepare(`SELECT COUNT(*) as c FROM questions_curated_staging WHERE commentary IS NOT NULL AND length(trim(commentary)) > 0 AND lower(commentary) NOT LIKE '%take-home%'`).get().c;
console.log(`🔒 PÓS-LIMPEZA [SQLite]: Legados restantes=${sqlRem}`);
