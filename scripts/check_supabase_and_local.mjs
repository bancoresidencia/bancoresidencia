import { createClient } from '@supabase/supabase-js';
import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

// 1. Carrega variáveis de ambiente
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
}

const url = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('=== TESTE DE CONEXÃO SUPABASE ===');
console.log('URL:', url);
console.log('Service Role Key presente?', Boolean(serviceKey), serviceKey ? `(${serviceKey.slice(0, 15)}... len=${serviceKey.length})` : '');
console.log('Anon Key presente?', Boolean(anonKey), anonKey ? `(${anonKey.slice(0, 15)}... len=${anonKey.length})` : '');

const supabase = createClient(url, serviceKey || anonKey);

async function checkSupabase() {
  const tables = ['questions', 'questions_expansion_direto', 'questions_curated_staging', 'questions_direto'];
  const results = {};

  for (const t of tables) {
    try {
      const { count, error } = await supabase.from(t).select('id', { count: 'exact', head: true });
      if (error) {
        results[t] = { status: 'ERROR', error: error.message || error.code || JSON.stringify(error) };
      } else {
        // Checa quantos tem Take-Home no Supabase se count > 0
        const { count: padraoCount, error: errP } = await supabase
          .from(t)
          .select('id', { count: 'exact', head: true })
          .ilike('commentary', '%Take-Home%');
        results[t] = { 
          status: 'OK', 
          total: count, 
          padraoOuro: errP ? `Erro checando Padrão-Ouro: ${errP.message}` : padraoCount 
        };
      }
    } catch (e) {
      results[t] = { status: 'EXCEPTION', error: e.message };
    }
  }

  console.log('\n--- TABELAS SUPABASE REMOTO ---');
  console.log(JSON.stringify(results, null, 2));
}

function checkLocal() {
  console.log('\n=== STATUS DA BASE LOCAL SQLITE (Single Source of Truth) ===');
  const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
  
  const totStaging = db.prepare('SELECT count(*) as c FROM questions_curated_staging').get().c;
  const totPadraoStaging = db.prepare("SELECT count(*) as c FROM questions_curated_staging WHERE commentary LIKE '%Take-Home%'").get().c;
  
  const diretoTotal = db.prepare("SELECT count(*) as c FROM questions_curated_staging WHERE modalidade = 'Acesso Direto'").get().c;
  const diretoPadrao = db.prepare("SELECT count(*) as c FROM questions_curated_staging WHERE modalidade = 'Acesso Direto' AND commentary LIKE '%Take-Home%'").get().c;

  const specs = db.prepare(`
    SELECT 
      COALESCE(especialidade, 'Não Definida') as especialidade,
      count(*) as total,
      sum(CASE WHEN commentary LIKE '%Take-Home%' THEN 1 ELSE 0 END) as padrao_ouro,
      sum(CASE WHEN (correct_answer IN ('A','B','C','D','E') OR is_anulada = 1) AND (commentary NOT LIKE '%Take-Home%' OR commentary IS NULL) AND (has_images = 0 OR has_images IS NULL) THEN 1 ELSE 0 END) as pendentes_texto_com_gabarito,
      sum(CASE WHEN (correct_answer IN ('A','B','C','D','E') OR is_anulada = 1) AND (commentary NOT LIKE '%Take-Home%' OR commentary IS NULL) AND has_images = 1 THEN 1 ELSE 0 END) as pendentes_imagem_com_gabarito,
      sum(CASE WHEN (correct_answer NOT IN ('A','B','C','D','E') AND (is_anulada = 0 OR is_anulada IS NULL)) THEN 1 ELSE 0 END) as sem_gabarito
    FROM questions_curated_staging 
    WHERE modalidade = 'Acesso Direto'
    GROUP BY especialidade
    ORDER BY pendentes_texto_com_gabarito DESC
  `).all();

  console.log({
    totStaging,
    totPadraoStaging,
    coberturaGlobal: ((totPadraoStaging / totStaging) * 100).toFixed(2) + '%',
    diretoTotal,
    diretoPadrao,
    coberturaDireto: ((diretoPadrao / diretoTotal) * 100).toFixed(2) + '%'
  });

  console.log('\n--- ESPECIALIDADES NO ACESSO DIRETO (LOCAL) ---');
  console.table(specs);
}

async function run() {
  await checkSupabase();
  checkLocal();
}

run();
