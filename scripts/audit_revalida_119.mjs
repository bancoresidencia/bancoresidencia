import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY);
const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

const rows = db.prepare(`
  SELECT id, code, especialidade, type, correct_answer, is_anulada, has_images, images,
    length(trim(COALESCE(commentary,''))) as clen,
    substr(COALESCE(commentary,''),1,90) as cprev
  FROM questions_curated_staging
  WHERE modalidade = 'Revalida'
    AND (commentary IS NULL OR commentary NOT LIKE '%Take-Home%')
`).all();

console.log('Total sem Take-Home no SQLite Revalida:', rows.length);
let comGab = 0, anulada = 0, semGab = 0, comImg = 0, legado = 0, vazio = 0;
const byType = {};
for (const r of rows) {
  const ans = (r.correct_answer || '').trim().toUpperCase();
  if (['A','B','C','D','E'].includes(ans)) comGab++;
  else if (r.is_anulada) anulada++;
  else semGab++;
  if (r.has_images || (r.images && r.images !== '[]' && r.images !== '')) comImg++;
  if (r.clen > 50) legado++; else vazio++;
  const t = r.type || 'NULL';
  byType[t] = (byType[t] || 0) + 1;
}
console.log({ comGab, anulada, semGab, comImg, legado, vazio, byType });
console.log('\nAmostra (10 primeiras):');
console.table(rows.slice(0, 10).map(r => ({
  code: r.code, esp: r.especialidade, type: r.type, ans: r.correct_answer, anul: r.is_anulada, clen: r.clen, prev: r.cprev.replace(/\n/g,' ')
})));

const { count: supaTotal } = await supabase.from('questions_revalida').select('*', { count: 'exact', head: true });
const { count: supaGab } = await supabase.from('questions_revalida').select('*', { count: 'exact', head: true }).eq('has_gabarito', true);
const { count: supaOuro } = await supabase.from('questions_revalida').select('*', { count: 'exact', head: true }).ilike('commentary', '%Take-Home%');
const { count: supaGabSemOuro } = await supabase.from('questions_revalida').select('*', { count: 'exact', head: true }).eq('has_gabarito', true).not('commentary', 'ilike', '%Take-Home%');
const { count: supaGabNullComm } = await supabase.from('questions_revalida').select('*', { count: 'exact', head: true }).eq('has_gabarito', true).is('commentary', null);

console.log('\nSupabase questions_revalida:', { supaTotal, supaGab, supaOuro, supaGabSemOuro, supaGabNullComm });

