import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve('.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      }
    }
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SECRET_KEY || env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const SPECS = [
  ['questions_direto', 'Acesso Direto'],
  ['questions_revalida', 'Revalida'],
  ['questions_rplus', 'R+'],
  ['questions_titulo', 'Título de Especialista']
];

async function countTable(tbl) {
  const tiers = { padrao_ouro: 0, comentada_parcial: 0, nao_comentada: 0 };
  let total = 0, last = null;
  while (true) {
    let q = supabase.from(tbl).select('id,commentary_tier').order('id', { ascending: true }).limit(1000);
    if (last) q = q.gt('id', last);
    const { data, error } = await q;
    if (error) throw new Error(`${tbl}: ${error.message}`);
    if (!data || !data.length) break;
    for (const r of data) {
      total++;
      const t = r.commentary_tier || 'nao_comentada';
      tiers[t] = (tiers[t] || 0) + 1;
    }
    last = data[data.length - 1].id;
    if (data.length < 1000) break;
  }
  return { total, tiers };
}

async function testCounts() {
  console.log('Testing Supabase commentary_tier & study_question_index counts...');
  for (const [t, mod] of SPECS) {
    const { total, tiers } = await countTable(t);
    const { count: idxGold } = await supabase
      .from('study_question_index')
      .select('id', { count: 'exact', head: true })
      .eq('catalog_modality', mod)
      .eq('has_gold_commentary', true);

    console.log(`Table: ${t} (${mod})`);
    console.log(`  Total: ${total.toLocaleString('pt-BR')}`);
    console.log(`  Padrão Ouro: ${tiers.padrao_ouro.toLocaleString('pt-BR')} (Índice: ${(idxGold ?? 0).toLocaleString('pt-BR')})`);
    console.log(`  Parciais:    ${tiers.comentada_parcial.toLocaleString('pt-BR')}`);
    console.log(`  Não coment.: ${tiers.nao_comentada.toLocaleString('pt-BR')}`);
  }
}

testCounts().catch(console.error);

