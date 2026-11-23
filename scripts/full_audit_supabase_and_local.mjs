import { createClient } from '@supabase/supabase-js';
import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function auditSupabase() {
  console.log('=== 1. AUDITORIA DIRETA NO SUPABASE REMOTO ===');
  
  // Total em questions_direto
  const { count: totDireto, error: errTot } = await supabase
    .from('questions_direto')
    .select('id', { count: 'exact', head: true });

  // Com comentário não-nulo em questions_direto
  const { count: comComentarioDireto, error: errC } = await supabase
    .from('questions_direto')
    .select('id', { count: 'exact', head: true })
    .not('commentary', 'is', null);

  // Com Take-Home em questions_direto
  const { count: padraoOuroDireto, error: errP } = await supabase
    .from('questions_direto')
    .select('id', { count: 'exact', head: true })
    .ilike('commentary', '%Take-Home%');

  // Total e comentários em questions
  const { count: totQuestions } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true });

  const { count: comComentarioQuestions } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .not('commentary', 'is', null);

  const { count: padraoOuroQuestions } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .ilike('commentary', '%Take-Home%');

  // Amostra de resoluções recentes em questions_direto
  const { data: recentSamples, error: errSample } = await supabase
    .from('questions_direto')
    .select('code, especialidade, tema, commentary, updated_at')
    .not('commentary', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(3);

  console.log({
    tabelaQuestionsDireto: {
      total: totDireto,
      comComentario: comComentarioDireto,
      padraoOuroTakeHome: padraoOuroDireto,
      coberturaPercent: ((padraoOuroDireto / totDireto) * 100).toFixed(2) + '%'
    },
    tabelaQuestions: {
      total: totQuestions,
      comComentario: comComentarioQuestions,
      padraoOuroTakeHome: padraoOuroQuestions,
      coberturaPercent: ((padraoOuroQuestions / totQuestions) * 100).toFixed(2) + '%'
    }
  });

  if (recentSamples && recentSamples.length > 0) {
    console.log('\n--- AMOSTRA RECENTE GRAVADA NO SUPABASE ---');
    recentSamples.forEach((s, idx) => {
      console.log(`[Amostra ${idx + 1}] Código: ${s.code} | Esp: ${s.especialidade} | Tema: ${s.tema}`);
      console.log(`Comentário (primeiros 200 chars): ${s.commentary.slice(0, 200)}...`);
      console.log(`Possui Take-Home? ${s.commentary.includes('Take-Home') ? 'SIM' : 'NÃO'}`);
    });
  }
}

function auditLocal() {
  console.log('\n=== 2. APANHADO GERAL POR ESPECIALIDADE (ACESSO DIRETO - SSOT LOCAL) ===');
  const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

  const query = `
    SELECT 
      COALESCE(especialidade, 'Não Definida') as especialidade,
      count(*) as total,
      sum(CASE WHEN commentary LIKE '%Take-Home%' THEN 1 ELSE 0 END) as padrao_ouro,
      sum(CASE WHEN (correct_answer IN ('A','B','C','D','E') OR is_anulada = 1) AND (commentary NOT LIKE '%Take-Home%' OR commentary IS NULL) AND (has_images = 0 OR has_images IS NULL) THEN 1 ELSE 0 END) as pendentes_texto_com_gabarito,
      sum(CASE WHEN (correct_answer IN ('A','B','C','D','E') OR is_anulada = 1) AND (commentary NOT LIKE '%Take-Home%' OR commentary IS NULL) AND has_images = 1 THEN 1 ELSE 0 END) as pendentes_imagem_com_gabarito,
      sum(CASE WHEN (correct_answer NOT IN ('A','B','C','D','E') AND (is_anulada = 0 OR is_anulada IS NULL)) THEN 1 ELSE 0 END) as sem_gabarito_oficial
    FROM questions_curated_staging 
    WHERE modalidade = 'Acesso Direto'
    GROUP BY especialidade
    ORDER BY total DESC
  `;

  const specs = db.prepare(query).all();

  const totalDireto = specs.reduce((acc, s) => acc + s.total, 0);
  const padraoOuroDireto = specs.reduce((acc, s) => acc + s.padrao_ouro, 0);
  const pendentesTexto = specs.reduce((acc, s) => acc + s.pendentes_texto_com_gabarito, 0);
  const pendentesImagem = specs.reduce((acc, s) => acc + s.pendentes_imagem_com_gabarito, 0);
  const semGabarito = specs.reduce((acc, s) => acc + s.sem_gabarito_oficial, 0);

  console.log('\n--- CONSOLIDAÇÃO GERAL ACESSO DIRETO ---');
  console.log({
    totalAcessoDireto: totalDireto,
    concluidasPadraoOuro: padraoOuroDireto,
    coberturaPadraoOuroPercent: ((padraoOuroDireto / totalDireto) * 100).toFixed(2) + '%',
    faltamTextoPuroComGabarito: pendentesTexto,
    faltamComImagemComGabarito: pendentesImagem,
    semGabaritoOficialDaBanca: semGabarito
  });

  console.log('\n--- TABELA POR ESPECIALIDADE ---');
  console.table(specs.map(s => ({
    Especialidade: s.especialidade,
    Total: s.total,
    'Padrão-Ouro': s.padrao_ouro,
    'Faltam (Texto)': s.pendentes_texto_com_gabarito,
    'Faltam (Imagem)': s.pendentes_imagem_com_gabarito,
    'Sem Gabarito': s.sem_gabarito_oficial,
    'Cobertura %': ((s.padrao_ouro / s.total) * 100).toFixed(1) + '%'
  })));
}

async function run() {
  await auditSupabase();
  auditLocal();
}

run();
