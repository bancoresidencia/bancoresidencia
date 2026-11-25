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

const sqlStats = db.prepare(`
  SELECT COUNT(*) as total, SUM(CASE WHEN commentary LIKE '%Take-Home%' THEN 1 ELSE 0 END) as ouro
  FROM questions_curated_staging WHERE modalidade = 'Revalida'
`).get();

const { count: supaGab } = await supabase.from('questions_revalida').select('id', { count: 'exact', head: true }).eq('has_gabarito', true);
const { count: supaGabOuro } = await supabase.from('questions_revalida').select('id', { count: 'exact', head: true }).eq('has_gabarito', true).ilike('commentary', '%Take-Home%');
const { count: supaDissTotal } = await supabase.from('questions_revalida').select('id', { count: 'exact', head: true }).eq('type', 'Dissertativa').eq('has_gabarito', true);
const { count: supaDissOuro } = await supabase.from('questions_revalida').select('id', { count: 'exact', head: true }).eq('type', 'Dissertativa').eq('has_gabarito', true).ilike('commentary', '%Take-Home%');

console.log('SQLite Revalida (SSOT):', sqlStats);
console.log('Supabase questions_revalida:', { supaGab, supaGabOuro, supaDissTotal, supaDissOuro });
