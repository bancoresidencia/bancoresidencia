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
  console.log('=== COMPARATIVO SQLITE vs SUPABASE (questions_direto) — PERIOPERATÓRIO E METABOLOGIA ===');
  
  // Fetch all Perioperatório e Metabologia rows from Supabase questions_direto (paginated)
  let allSupa = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from('questions_direto')
      .select('id, code, tema, foco, commentary, has_gabarito, correct_answer, images')
      .ilike('tema', '%Perioperat%')
      .range(from, from + 999);
    if (error) { console.error('Supabase error:', error); break; }
    if (!data || data.length === 0) break;
    allSupa.push(...data);
    if (data.length < 1000) break;
    from += 1000;
  }

  let supaOuro = 0, supaLegado = 0, supaVazio = 0, supaSemGabarito = 0;
  let mismatchOuroLocalVsSupaEmptyOrLegacy = 0;
  const mismatchExamples = [];

  const supaMap = new Map();
  for (const r of allSupa) {
    supaMap.set(r.id, r);
    const comm = (r.commentary || '').trim();
    const isOuro = comm.includes('Take-Home');
    const isLegado = !isOuro && comm.length > 50;
    const isVazio = comm.length <= 50;
    if (isOuro) supaOuro++;
    else if (isLegado) supaLegado++;
    else supaVazio++;
    if (!r.has_gabarito) supaSemGabarito++;
  }

  console.log(`Supabase questions_direto (Tema ~ Perioperatório): Total=${allSupa.length} | Ouro=${supaOuro} | Legado=${supaLegado} | Vazio=${supaVazio} | SemGabarito=${supaSemGabarito}`);

  // Compare with SQLite
  const sqliteRows = db.prepare(`
    SELECT id, code, tema, foco, commentary, correct_answer, is_anulada
    FROM questions_curated_staging
    WHERE modalidade = 'Acesso Direto' AND tema LIKE '%Perioperat%'
  `).all();

  let sqliteOuro = 0, sqliteLegado = 0, sqliteVazio = 0;
  for (const s of sqliteRows) {
    const comm = (s.commentary || '').trim();
    const isOuro = comm.includes('Take-Home');
    const isLegado = !isOuro && comm.length > 50;
    if (isOuro) sqliteOuro++;
    else if (isLegado) sqliteLegado++;
    else sqliteVazio++;

    const uuidMatch = s.id.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    const plainUuid = uuidMatch ? uuidMatch[0] : s.id;
    const supaRow = supaMap.get(plainUuid);
    if (isOuro && supaRow) {
      const supaComm = (supaRow.commentary || '').trim();
      if (!supaComm.includes('Take-Home')) {
        mismatchOuroLocalVsSupaEmptyOrLegacy++;
        if (mismatchExamples.length < 5) {
          mismatchExamples.push({ code: s.code, sqliteId: s.id, plainUuid, supaStatus: supaComm.length > 50 ? 'LEGADO' : 'VAZIO' });
        }
      }
    }
  }

  console.log(`SQLite staging (Tema ~ Perioperatório): Total=${sqliteRows.length} | Ouro=${sqliteOuro} | Legado=${sqliteLegado} | Vazio=${sqliteVazio}`);
  console.log(`⚠️ DESSINCRONIA (Ouro no SQLite local, mas Legado/Vazio no Supabase questions_direto): ${mismatchOuroLocalVsSupaEmptyOrLegacy}`);
  if (mismatchExamples.length > 0) console.table(mismatchExamples);

  // Also check overall Supabase questions_direto breakdown via RPC or sampling
  console.log('\n=== AMOSTRAGEM GLOBAL DO SUPABASE questions_direto (por especialidade) ===');
  const specs = ['Clínica Médica', 'Pediatria', 'Cirurgia Geral', 'Medicina Preventiva e Social', 'Obstetrícia', 'Ginecologia'];
  for (const esp of specs) {
    const { count: tot } = await supabase.from('questions_direto').select('*', { count: 'exact', head: true }).eq('especialidade', esp);
    const { count: gab } = await supabase.from('questions_direto').select('*', { count: 'exact', head: true }).eq('especialidade', esp).eq('has_gabarito', true);
    const { count: emptyC } = await supabase.from('questions_direto').select('*', { count: 'exact', head: true }).eq('especialidade', esp).or('commentary.is.null,commentary.eq.""');
    console.log(`${esp}: total=${tot} | com_gabarito=${gab} | sem_comentario=${emptyC}`);
  }
}

main().catch(console.error);
