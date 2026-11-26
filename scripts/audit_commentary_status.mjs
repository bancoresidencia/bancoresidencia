import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve('.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(l => {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
  });
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Credenciais do Supabase ausentes no .env.local.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

const PH_RE = /(comentario em elaboracao|comentário em elaboração|em construcao|em construção|aguardando revisao|aguardando revisão|placeholder|lorem ipsum|todo:|fixme|\bnull\b|nao informado|não informado)/i;

function hasImageAsset(r) {
  if (Array.isArray(r.images) && r.images.length > 0) return true;
  const st = String(r.statement || '');
  return /!\[.*?\]\((https?:\/\/[^\s)]+|\/images\/[^\s)]+|[^\s)]+\.(?:png|jpe?g|webp|gif))/i.test(st);
}

async function fetchShard(tbl, cols, gte, lt) {
  const rows = [];
  let last = gte;
  let first = true;
  while (true) {
    let q = supabase.from(tbl).select(cols).order('id', { ascending: true }).limit(1000);
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
    rows.push(...data);
    last = data[data.length - 1].id;
    if (data.length < 1000) break;
  }
  return rows;
}

async function fetchAllSharded(tbl, cols, isDireto) {
  if (!isDireto) return fetchShard(tbl, cols, null, null);
  const parts = await Promise.all([
    fetchShard(tbl, cols, '', '55'),
    fetchShard(tbl, cols, '55', 'aa'),
    fetchShard(tbl, cols, 'aa', 'ff'),
    fetchShard(tbl, cols, 'ff', null)
  ]);
  return parts.flat();
}

async function run() {
  const t0 = Date.now();
  console.log('='.repeat(92));
  console.log('🛡️  ANDAMENTO REAL DE COMENTÁRIOS — SELO ABSOLUTO PADRÃO OURO (SUPABASE LIVE)');
  console.log('='.repeat(92));

  const specs = [
    { tbl: 'questions_direto', mod: 'Acesso Direto', sharded: true },
    { tbl: 'questions_rplus', mod: 'R+', sharded: false },
    { tbl: 'questions_revalida', mod: 'Revalida', sharded: false },
    { tbl: 'questions_titulo', mod: 'Título de Especialista', sharded: false }
  ];

  const modRows = [];
  const diretoBySpec = new Map();
  let gTotal = 0, gHom = 0, gGold = 0, gGold4 = 0, gGold3 = 0, gParcial = 0, gSemComm = 0, gPendTxt = 0, gPendImg = 0;

  for (const sp of specs) {
    const rows = await fetchAllSharded(sp.tbl, 'id,especialidade,type,has_gabarito,commentary_tier,options,images', sp.sharded);
    let total = rows.length, hom = 0, gold = 0, gold4 = 0, gold3 = 0, parcial = 0, semComm = 0, pendTxt = 0, pendImg = 0;

    for (const r of rows) {
      const opts = Array.isArray(r.options) ? r.options : [];
      const expls = opts.filter(o => String(o?.explanation || '').trim().length >= 15 && !PH_RE.test(String(o?.explanation || ''))).length;
      const isDisc = opts.length === 0 || /(discurs|dissert|aberta)/i.test(String(r.type || ''));
      const tier = r.commentary_tier || 'nao_comentada';
      const hasGab = r.has_gabarito === true;
      const img = hasImageAsset(r);

      if (hasGab) hom++;
      if (tier === 'padrao_ouro') {
        gold++;
        if (!isDisc && expls === 0) gold3++; else gold4++;
      } else if (tier === 'comentada_parcial') {
        parcial++;
      } else {
        semComm++;
      }

      if (hasGab && tier !== 'padrao_ouro') {
        if (img) pendImg++; else pendTxt++;
      }

      if (sp.tbl === 'questions_direto') {
        const esp = (r.especialidade || 'Sem Especialidade').trim();
        if (!diretoBySpec.has(esp)) {
          diretoBySpec.set(esp, { total: 0, hom: 0, ouro: 0, ouro4: 0, ouro3: 0, parcial: 0, pendTxt: 0, pendImg: 0 });
        }
        const st = diretoBySpec.get(esp);
        st.total++;
        if (hasGab) st.hom++;
        if (tier === 'padrao_ouro') {
          st.ouro++;
          if (!isDisc && expls === 0) st.ouro3++; else st.ouro4++;
        } else if (tier === 'comentada_parcial') {
          st.parcial++;
        }
        if (hasGab && tier !== 'padrao_ouro') {
          if (img) st.pendImg++; else st.pendTxt++;
        }
      }
    }

    gTotal += total; gHom += hom; gGold += gold; gGold4 += gold4; gGold3 += gold3;
    gParcial += parcial; gSemComm += semComm; gPendTxt += pendTxt; gPendImg += pendImg;

    modRows.push({
      Modalidade: sp.mod,
      Total: total,
      Homologadas: hom,
      'Padrão Ouro': gold,
      '4/4 ou Disc.': gold4,
      '3 Pilares (0/N)': gold3,
      Parciais: parcial,
      'Não Coment.': semComm,
      '% Ouro/Hom.': hom > 0 ? ((gold / hom) * 100).toFixed(1) + '%' : '0.0%',
      'Fila IA Txt': pendTxt,
      'Fila IA Img': pendImg
    });
  }

  console.log('\n=== 1. RESUMO POR MODALIDADE (SUPABASE CANÔNICO) ===');
  console.table(modRows);

  console.log('\n=== 2. ACESSO DIRETO POR ESPECIALIDADE ===');
  const specTable = Array.from(diretoBySpec.entries())
    .map(([esp, st]) => ({
      Especialidade: esp,
      Total: st.total,
      Homologadas: st.hom,
      'Padrão Ouro': st.ouro,
      '4/4+Disc': st.ouro4,
      '3 Pilares': st.ouro3,
      Parciais: st.parcial,
      '% Ouro/Hom.': st.hom > 0 ? ((st.ouro / st.hom) * 100).toFixed(1) + '%' : '0.0%',
      'Fila IA Txt': st.pendTxt,
      'Fila IA Img': st.pendImg
    }))
    .sort((a, b) => b.Total - a.Total);
  console.table(specTable);

  const { data: rpcCount } = await supabase.rpc('query_study_questions', { p_filters: { only_commented: true }, p_mode: 'count' });
  console.log('\n=== 3. CONSOLIDADO GLOBAL ===');
  console.log(`• Total Canônico         : ${gTotal.toLocaleString('pt-BR')} (Homologadas: ${gHom.toLocaleString('pt-BR')})`);
  console.log(`• Selo Padrão Ouro Total : ${gGold.toLocaleString('pt-BR')} (${((gGold / gHom) * 100).toFixed(2)}% das homologadas | 4/4+Disc: ${gGold4.toLocaleString('pt-BR')} | Lote 1B 3-pilares: ${gGold3.toLocaleString('pt-BR')})`);
  console.log(`• RPC Índice (Ouro live) : ${(rpcCount?.total ?? '?').toLocaleString('pt-BR')}`);
  console.log(`• Comentadas Parciais    : ${gParcial.toLocaleString('pt-BR')} (inclui sem gabarito, legadas, só alternativas, falta PE/TH)`);
  console.log(`• Sem Comentário         : ${gSemComm.toLocaleString('pt-BR')}`);
  console.log(`• Fila Elegível IA       : ${(gPendTxt + gPendImg).toLocaleString('pt-BR')} (Texto puro: ${gPendTxt.toLocaleString('pt-BR')} | Multimodal img: ${gPendImg.toLocaleString('pt-BR')})`);
  console.log(`⏱️  Tempo de auditoria: ${((Date.now() - t0) / 1000).toFixed(1)}s\n`);
}

run().catch(err => {
  console.error('❌ ERRO:', err.message);
  process.exit(1);
});
