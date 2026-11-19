import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const [output, mode] = process.argv.slice(2);
const all = mode === '--all';
if (!output) {
  throw new Error('Uso: node --env-file=.env.local scripts/export_pending_answer_keys.mjs <amostra.json>');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const cohorts = [
  { table: 'questions_direto', board: 'SES-GO', size: 60 },
  { table: 'questions_revalida', board: 'INEP Revalida', size: 35 },
  { table: 'questions_direto', board: 'UNICAMP/HC', size: 5 },
];
const fields = 'id,code,institution,banca,year,modalidade,especialidade,type,is_anulada,statement,options,images,has_gabarito,updated_at';
const seed = 'homologacao-oficial-piloto-v1';
const year = 2026;

function sampleRank(id) {
  return createHash('sha256').update(seed).update(id).digest('hex');
}

async function sampleCohort({ table, board, size }) {
  const eligible = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase.from(table)
      .select('id')
      .eq('banca', board)
      .eq('year', year)
      .eq('has_gabarito', false)
      .or('is_anulada.eq.false,is_anulada.is.null')
      .order('id')
      .range(offset, offset + 499);
    if (error) throw new Error(`Falha na consulta de ${board}: ${error.code}`);
    eligible.push(...data);
    if (data.length < 500) break;
  }
  if (eligible.length < size) {
    throw new Error(`Amostra insuficiente de ${board}: ${eligible.length} de ${size}`);
  }
  const ids = eligible.map(({ id }) => ({ id, rank: sampleRank(id) }))
    .sort((a, b) => a.rank.localeCompare(b.rank))
    .slice(0, size)
    .map(({ id }) => id);
  const { data, error } = await supabase.from(table)
    .select(fields)
    .in('id', ids)
    .eq('banca', board)
    .eq('year', year)
    .eq('has_gabarito', false)
    .or('is_anulada.eq.false,is_anulada.is.null');
  if (error || data.length !== size) {
    throw new Error(`Não foi possível confirmar a elegibilidade da amostra de ${board}`);
  }
  const byId = new Map(data.map(row => [row.id, row]));
  const questions = ids.map(id => ({ ...byId.get(id), table }));
  return { board, eligible: eligible.length, questions };
}

async function readPending(table) {
  const rows = [];
  let cursor;
  for (;;) {
    let query = supabase.from(table).select(fields)
      .eq('has_gabarito', false)
      .or('is_anulada.eq.false,is_anulada.is.null')
      .order('id').limit(500);
    if (cursor) query = query.gt('id', cursor);
    const { data, error } = await query;
    if (error) throw new Error(`Falha na consulta de ${table}: ${error.code}`);
    rows.push(...data.map(row => ({ ...row, table })));
    if (data.length < 500) return rows;
    cursor = data.at(-1).id;
  }
}

const tables = ['questions_direto', 'questions_rplus', 'questions_revalida', 'questions_titulo'];
const sample = all
  ? await Promise.all(tables.map(async table => {
    const questions = await readPending(table);
    return { board: table, eligible: questions.length, questions };
  }))
  : await Promise.all(cohorts.map(sampleCohort));
const questions = sample.flatMap(cohort => cohort.questions);
if (new Set(questions.map(q => q.id)).size !== questions.length || (!all && questions.length !== 100)) {
  throw new Error('Quantidade de questões inesperada ou IDs repetidos');
}
await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify({
  captured_at: new Date().toISOString(),
  seed,
  mode: all ? 'integral' : 'piloto',
  cohorts: sample.map(({ board, eligible, questions: rows }) => ({ board, eligible, selected: rows.length })),
  questions,
}, null, 2) + '\n', { flag: 'wx' });
console.log(`${questions.length} questões pendentes exportadas para ${output}.`);
