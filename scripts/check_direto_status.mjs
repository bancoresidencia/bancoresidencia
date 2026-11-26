import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const t = l.trim();
    if (!t || t.startsWith('#')) return;
    const i = t.indexOf('=');
    if (i > 0) env[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^['"]|['"]$/g, '');
  });
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const specs = ['Pediatria', 'Cirurgia Geral', 'Ginecologia', 'Obstetrícia', 'Clínica Médica', 'Medicina Preventiva e Social'];

async function fetchShard(tbl, gte, lt) {
  const out = [];
  let last = gte;
  let first = true;
  while (true) {
    let q = supabase.from(tbl).select('id,especialidade,has_gabarito,commentary_tier,images').order('id', { ascending: true }).limit(1000);
    if (last !== null) q = (first && gte !== null) ? q.gte('id', last) : q.gt('id', last);
    if (lt !== null) q = q.lt('id', lt);
    first = false;
    let data, error;
    for (let a = 1; a <= 4; a++) {
      ({ data, error } = await q);
      if (!error) break;
      await new Promise(r => setTimeout(r, 300 * a));
    }
    if (error) throw new Error(`${tbl}: ${error.message}`);
    if (!data || data.length === 0) break;
    out.push(...data);
    last = data[data.length - 1].id;
    if (data.length < 1000) break;
  }
  return out;
}

async function run() {
  const shards = await Promise.all([
    fetchShard('questions_direto', '', '55'),
    fetchShard('questions_direto', '55', 'aa'),
    fetchShard('questions_direto', 'aa', 'ff'),
    fetchShard('questions_direto', 'ff', null),
    fetchShard('questions_rplus', null, null)
  ]);

  const all = shards.flat();
  const bySpec = new Map();
  for (const s of specs) bySpec.set(s, { total: 0, ouro: 0, parciais: 0, faltamGab: 0, faltamTxt: 0 });

  for (const r of all) {
    const s = r.especialidade || 'Outras';
    if (!bySpec.has(s)) bySpec.set(s, { total: 0, ouro: 0, parciais: 0, faltamGab: 0, faltamTxt: 0 });
    const st = bySpec.get(s);
    st.total++;
    const tier = r.commentary_tier || 'nao_comentada';
    if (tier === 'padrao_ouro') st.ouro++;
    else if (tier === 'comentada_parcial') st.parciais++;
    if (r.has_gabarito === true && tier !== 'padrao_ouro') {
      st.faltamGab++;
      const hasImg = Array.isArray(r.images) && r.images.length > 0;
      if (!hasImg) st.faltamTxt++;
    }
  }

  console.log('=== ACESSO DIRETO + R+ POR ESPECIALIDADE (SELO ABSOLUTO SUPABASE LIVE) ===');
  const rows = [];
  for (const [s, st] of bySpec.entries()) {
    if (st.total === 0) continue;
    rows.push({
      especialidade: s,
      total: st.total,
      padrao_ouro: st.ouro,
      parciais: st.parciais,
      faltam_com_gabarito: st.faltamGab,
      faltam_texto_puro: st.faltamTxt,
      perc_ouro: `${((st.ouro / st.total) * 100).toFixed(1)}%`
    });
  }
  rows.sort((a, b) => b.total - a.total);
  console.table(rows);
}

run().catch(err => { console.error(err); process.exit(1); });
