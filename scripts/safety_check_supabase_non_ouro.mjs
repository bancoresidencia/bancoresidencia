import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const t = l.trim(); if (!t || t.startsWith('#')) return;
  const [k, ...v] = t.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY);

async function checkTableForHiddenOuro(tableName) {
  console.log(`\n=== CHECAGEM DE SEGURANÇA EM SUPABASE: ${tableName} ===`);
  let totalNonOuro = 0;
  let hiddenOuro_takeHomeNoHyphen = 0;
  let hiddenOuro_sinteseOrLightbulb = 0;
  let hiddenOuro_optionsExp = 0;
  let confirmedLegacyOrPlaceholder = 0;

  // Paginate only rows where commentary is not null, commentary != '', and NOT ilike '%Take-Home%'
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
    if (error) { console.error('Err:', error.message); break; }
    if (!data || data.length === 0) break;
    lastId = data[data.length - 1].id;

    for (const r of data) {
      totalNonOuro++;
      const c = (r.commentary || '').trim();
      const cLow = c.toLowerCase();
      const opts = Array.isArray(r.options) ? r.options : [];
      const hasOptExp = opts.some(o => o.explanation && o.explanation.trim().length > 15);

      if (cLow.includes('take home') || cLow.includes('takehome')) {
        hiddenOuro_takeHomeNoHyphen++;
      } else if (c.includes('Síntese Clínica') || c.includes('Comentário Integrado') || c.includes('Pérola Clínica') || c.includes('💡')) {
        hiddenOuro_sinteseOrLightbulb++;
      } else if (hasOptExp) {
        hiddenOuro_optionsExp++;
        if (hiddenOuro_optionsExp <= 3) console.log(`  ⚠️ [${tableName}] ${r.code} tem options[].explanation preenchido sem Take-Home!`);
      } else {
        confirmedLegacyOrPlaceholder++;
      }
    }
    if (data.length < 1000) break;
  }

  console.log({
    tableName,
    totalNonOuroNotEmpty: totalNonOuro,
    hiddenOuro_takeHomeNoHyphen,
    hiddenOuro_sinteseOrLightbulb,
    hiddenOuro_optionsExp,
    confirmedLegacyOrPlaceholder
  });
}

await checkTableForHiddenOuro('questions_revalida');
await checkTableForHiddenOuro('questions_rplus');
await checkTableForHiddenOuro('questions_direto');

