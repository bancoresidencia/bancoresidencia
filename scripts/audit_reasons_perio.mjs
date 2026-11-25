import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve('.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(l => {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
  });
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY);
const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

async function main() {
  // 1. Detalhar as 270 questões de Perioperatório em Supabase questions_direto sem Padrão-Ouro
  let allSupa = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from('questions_direto')
      .select('id, code, tema, foco, commentary, has_gabarito, correct_answer, is_anulada, images, options')
      .ilike('tema', '%Perioperat%')
      .range(from, from + 999);
    if (error || !data || data.length === 0) break;
    allSupa.push(...data);
    if (data.length < 1000) break;
    from += 1000;
  }

  const buckets = {
    ouro: 0,
    legado_elegivel_cirurgia_nao_iniciada: 0,
    legado_com_imagem: 0,
    legado_sem_gabarito: 0,
    vazio_elegivel_cirurgia_nao_iniciada: 0,
    vazio_com_imagem: 0,
    vazio_sem_gabarito: 0,
    options_sem_explicacao_mesmo_com_ouro: 0,
    comentario_sem_takehome_mas_gerado_por_llm_antigo: 0
  };

  const legadoSamples = [];
  const vazioComGabSamples = [];

  for (const r of allSupa) {
    const comm = (r.commentary || '').trim();
    const isOuro = comm.includes('Take-Home');
    const isLegado = !isOuro && comm.length > 50;
    const isVazio = comm.length <= 50;
    const hasImg = Array.isArray(r.images) && r.images.length > 0;
    const hasGab = r.has_gabarito === true || ['A','B','C','D','E'].includes((r.correct_answer || '').toUpperCase().trim()) || r.is_anulada === true;

    if (isOuro) {
      buckets.ouro++;
      // Check if options also have explanations
      const opts = Array.isArray(r.options) ? r.options : [];
      if (opts.length > 0 && !opts.some(o => o.explanation && o.explanation.trim().length > 10)) {
        buckets.options_sem_explicacao_mesmo_com_ouro++;
      }
      continue;
    }

    if (isLegado) {
      if (comm.includes('Alternativa') || comm.includes('**')) {
        buckets.comentario_sem_takehome_mas_gerado_por_llm_antigo++;
      }
      if (!hasGab) buckets.legado_sem_gabarito++;
      else if (hasImg) buckets.legado_com_imagem++;
      else {
        buckets.legado_elegivel_cirurgia_nao_iniciada++;
        if (legadoSamples.length < 5) legadoSamples.push({ code: r.code, foco: r.foco, preview: comm.slice(0, 100).replace(/\n/g, ' ') });
      }
    } else if (isVazio) {
      if (!hasGab) buckets.vazio_sem_gabarito++;
      else if (hasImg) buckets.vazio_com_imagem++;
      else {
        buckets.vazio_elegivel_cirurgia_nao_iniciada++;
        if (vazioComGabSamples.length < 5) vazioComGabSamples.push({ code: r.code, foco: r.foco, ans: r.correct_answer });
      }
    }
  }

  console.log('=== ANATOMIA DAS 2.444 QUESTÕES DE PERIOPERATÓRIO (Supabase questions_direto) ===');
  console.table(buckets);
  console.log('\nExemplos de Legado elegível (esperando vez da Cirurgia):');
  console.table(legadoSamples);
  console.log('\nExemplos de Vazio com gabarito elegível (esperando vez da Cirurgia):');
  console.table(vazioComGabSamples);

  // 2. Check SQLite totals for how many Ouro commentaries were produced overall and per specialty + check if commentary without Take-Home exists
  console.log('\n=== PADRAO OURO vs LEGADO EM SQLITE POR ESPECIALIDADE (TODAS AS MODALIDADES) ===');
  const allSpec = db.prepare(`
    SELECT 
      modalidade,
      COUNT(*) as total,
      SUM(CASE WHEN commentary LIKE '%Take-Home%' THEN 1 ELSE 0 END) as ouro_com_take_home,
      SUM(CASE WHEN commentary IS NOT NULL AND length(trim(commentary)) > 50 AND commentary NOT LIKE '%Take-Home%' THEN 1 ELSE 0 END) as legado_ou_sem_tag,
      SUM(CASE WHEN commentary IS NULL OR length(trim(commentary)) <= 50 THEN 1 ELSE 0 END) as vazio
    FROM questions_curated_staging
    GROUP BY modalidade
  `).all();
  console.table(allSpec);

  // 3. Also inspect Cirurgia Geral in Acesso Direto specifically: how many are in each bucket?
  const cirurgiaDireto = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN commentary LIKE '%Take-Home%' THEN 1 ELSE 0 END) as ouro,
      SUM(CASE WHEN commentary IS NOT NULL AND length(trim(commentary)) > 50 AND commentary NOT LIKE '%Take-Home%' AND ((UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E')) OR is_anulada = 1) THEN 1 ELSE 0 END) as legado_com_gabarito,
      SUM(CASE WHEN (commentary IS NULL OR length(trim(commentary)) <= 50) AND ((UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E')) OR is_anulada = 1) THEN 1 ELSE 0 END) as vazio_com_gabarito,
      SUM(CASE WHEN (UPPER(TRIM(correct_answer)) NOT IN ('A','B','C','D','E') OR correct_answer IS NULL) AND (is_anulada IS NULL OR is_anulada = 0) THEN 1 ELSE 0 END) as sem_gabarito_total
    FROM questions_curated_staging
    WHERE modalidade = 'Acesso Direto' AND especialidade = 'Cirurgia Geral'
  `).get();
  console.log('\n=== CIRURGIA GERAL (ACESSO DIRETO) NO SQLITE ===');
  console.log(cirurgiaDireto);
}

main().catch(console.error);
