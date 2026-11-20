import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@supabase/supabase-js';

const modalities = ['Acesso Direto', 'R+', 'Revalida', 'Título de Especialista'];
const canonicalId = /^(?:questions(?:_expansion_(?:direto|r_plus|revalida|titulo_especialista)|_revalida_base)?_)?([a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12})$/i;
const batchSize = 500;
const apply = process.argv.includes('--apply');
const database = new DatabaseSync('data/supabase_tables/supabase_tables.db', { readOnly: true });
const candidates = database.prepare(`
  SELECT id, correct_answer, is_anulada, commentary
  FROM questions_curated_staging
  WHERE modalidade = ? AND commentary_tier = 'padrao_ouro'
    AND (is_anulada = 1 OR lower(trim(correct_answer)) NOT IN ('', 'null'))
    AND lower(trim(commentary)) NOT IN ('', 'null')
  ORDER BY id
`);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (apply && (!url || !serviceKey)) throw new Error('Credenciais de serviço do Supabase ausentes.');
const supabase = apply ? createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
}) : null;

for (const modality of modalities) {
  const byId = new Map();
  const conflicts = new Set();
  const totals = { curated: 0, unsupported_id: 0, conflict: 0 };
  for (const row of candidates.iterate(modality)) {
    totals.curated++;
    const id = /^pdr_\d+$/.test(row.id) ? row.id : canonicalId.exec(row.id)?.[1].toLowerCase();
    if (!id) {
      totals.unsupported_id++;
      continue;
    }
    if (conflicts.has(id)) continue;
    const candidate = {
      id,
      answer: row.correct_answer?.trim().toUpperCase() ?? null,
      annulled: row.is_anulada === 1,
      commentary_hash: createHash('sha256').update(row.commentary).digest('hex')
    };
    const previous = byId.get(id);
    if (previous && (previous.commentary_hash !== candidate.commentary_hash
        || previous.answer !== candidate.answer || previous.annulled !== candidate.annulled)) {
      byId.delete(id);
      conflicts.add(id);
    } else {
      byId.set(id, candidate);
    }
  }

  totals.conflict = conflicts.size;
  console.log(modality, { ...totals, candidates: byId.size });
  if (!supabase) continue;

  const results = {};
  const rows = Array.from(byId.values());
  for (let start = 0; start < rows.length; start += batchSize) {
    const batch = rows.slice(start, start + batchSize);
    const { data, error } = await supabase.rpc('stage_study_gold_approvals', {
      p_modality: modality,
      p_candidates: batch
    });
    if (error || data?.length !== batch.length) {
      throw new Error(`Falha ao sincronizar ${modality} após ${start} registros (${error?.code ?? 'resposta incompleta'}).`);
    }
    for (const row of data) results[row.result] = (results[row.result] ?? 0) + 1;
    if (start % (batchSize * 20) === 0) console.log(modality, start + batch.length, 'processadas');
  }
  console.log(modality, results);
}

database.close();
