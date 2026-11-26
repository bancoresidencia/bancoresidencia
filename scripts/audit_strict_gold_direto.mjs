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

const PH_RE = /(comentario em elaboracao|comentário em elaboração|em construcao|em construção|aguardando revisao|aguardando revisão|placeholder|lorem ipsum|todo:|fixme|\bnull\b|nao informado|não informado)/i;

async function fetchShard(gte, lt) {
  const out = [];
  let last = gte;
  let first = true;
  while (true) {
    let q = supabase
      .from('questions_direto')
      .select('id,especialidade,type,has_gabarito,commentary_tier,options,images')
      .order('id', { ascending: true })
      .limit(1000);
    if (last !== null) q = (first && gte !== null) ? q.gte('id', last) : q.gt('id', last);
    if (lt !== null) q = q.lt('id', lt);
    first = false;
    let data, error;
    for (let a = 1; a <= 4; a++) {
      ({ data, error } = await q);
      if (!error) break;
      await new Promise(r => setTimeout(r, 300 * a));
    }
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;
    out.push(...data);
    last = data[data.length - 1].id;
    if (data.length < 1000) break;
  }
  return out;
}

async function run() {
  const shards = await Promise.all([
    fetchShard('', '55'),
    fetchShard('55', 'aa'),
    fetchShard('aa', 'ff'),
    fetchShard('ff', null)
  ]);
  const allRows = shards.flat();

  const map = new Map();
  for (const r of allRows) {
    const esp = r.especialidade || 'Não Definida';
    if (!map.has(esp)) {
      map.set(esp, {
        especialidade: esp,
        total: 0,
        homologadas: 0,
        goldTotal: 0,
        goldFull: 0,
        goldLote1b: 0,
        parciais: 0,
        faltamGoldTotal: 0,
        faltamTextoPuro: 0,
        faltamComImagem: 0
      });
    }
    const st = map.get(esp);
    st.total++;
    const hasGab = r.has_gabarito === true;
    const tier = r.commentary_tier || 'nao_comentada';
    const opts = Array.isArray(r.options) ? r.options : [];
    const expls = opts.filter(o => String(o?.explanation || '').trim().length >= 15 && !PH_RE.test(String(o?.explanation || ''))).length;
    const isDisc = opts.length === 0 || /(discurs|dissert|aberta)/i.test(String(r.type || ''));
    const hasImg = Array.isArray(r.images) && r.images.length > 0;

    if (hasGab) st.homologadas++;
    if (tier === 'padrao_ouro') {
      st.goldTotal++;
      if (!isDisc && expls === 0) st.goldLote1b++;
      else st.goldFull++;
    } else if (tier === 'comentada_parcial') {
      st.parciais++;
    }
    if (hasGab && tier !== 'padrao_ouro') {
      st.faltamGoldTotal++;
      if (hasImg) st.faltamComImagem++;
      else st.faltamTextoPuro++;
    }
  }

  const rows = Array.from(map.values()).sort((a, b) => b.homologadas - a.homologadas);
  const formatted = rows.map(r => ({
    especialidade: r.especialidade,
    total: r.total,
    homologadas: r.homologadas,
    padraoOuro: r.goldTotal,
    '4/4+Disc': r.goldFull,
    '3Pilares': r.goldLote1b,
    parciais: r.parciais,
    pctOuro: ((r.goldTotal / (r.homologadas || 1)) * 100).toFixed(1) + '%',
    faltamOuroTotal: r.faltamGoldTotal,
    faltamTextoPuro: r.faltamTextoPuro,
    faltamComImagem: r.faltamComImagem
  }));

  console.log('='.repeat(100));
  console.log(`📊 CENSO ESTRITO SELO ABSOLUTO PADRÃO-OURO: questions_direto (${allRows.length.toLocaleString('pt-BR')} questões no Supabase)`);
  console.log('='.repeat(100));
  console.table(formatted);

  const totals = rows.reduce((acc, r) => {
    acc.total += r.total;
    acc.homologadas += r.homologadas;
    acc.gold += r.goldTotal;
    acc.goldFull += r.goldFull;
    acc.goldLote1b += r.goldLote1b;
    acc.parciais += r.parciais;
    acc.faltamTotal += r.faltamGoldTotal;
    acc.faltamTxt += r.faltamTextoPuro;
    acc.faltamImg += r.faltamComImagem;
    return acc;
  }, { total: 0, homologadas: 0, gold: 0, goldFull: 0, goldLote1b: 0, parciais: 0, faltamTotal: 0, faltamTxt: 0, faltamImg: 0 });

  console.log('\n📌 TOTAIS GERAIS (questions_direto):');
  console.log(` - Total na Tabela             : ${totals.total.toLocaleString('pt-BR')}`);
  console.log(` - Total Homologadas (c/ gab.) : ${totals.homologadas.toLocaleString('pt-BR')}`);
  console.log(` - Selo Padrão-Ouro Ativo      : ${totals.gold.toLocaleString('pt-BR')} (${((totals.gold / totals.homologadas) * 100).toFixed(2)}% das homologadas | Completo: ${totals.goldFull.toLocaleString('pt-BR')} | 3 Pilares: ${totals.goldLote1b.toLocaleString('pt-BR')})`);
  console.log(` - Comentadas Parciais         : ${totals.parciais.toLocaleString('pt-BR')}`);
  console.log(` - FALTAM PADRÃO-OURO (homol.) : ${totals.faltamTotal.toLocaleString('pt-BR')} (${((totals.faltamTotal / totals.homologadas) * 100).toFixed(2)}%)`);
  console.log(`   └─ Texto Puro (Fila IA)     : ${totals.faltamTxt.toLocaleString('pt-BR')}`);
  console.log(`   └─ Com Imagens (Multimodal) : ${totals.faltamImg.toLocaleString('pt-BR')}`);
}

run().catch(err => {
  console.error('❌ ERRO:', err.message);
  process.exit(1);
});
