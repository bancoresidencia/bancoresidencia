import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const t = line.trim();
  if (t && !t.startsWith('#')) {
    const idx = t.indexOf('=');
    if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  }
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectTargetPendings() {
  console.log('--- Buscando pendencias dos alvos solicitados ---');

  const targets = [
    { label: 'FUBOG', patterns: [{ col: 'institution', val: '%FUBOG%' }, { col: 'code', val: '%FUBOG%' }] },
    { label: 'IOG', patterns: [{ col: 'institution', val: '%IOG%' }, { col: 'code', val: '%IOG%' }] },
    { label: 'HMMSJP (Paraná)', patterns: [{ col: 'institution', val: '%HMMSJP%' }, { col: 'code', val: '%HMMSJP%' }] },
    { label: 'UEM (Paraná)', patterns: [{ col: 'institution', val: '%UEM%' }, { col: 'code', val: '%UEM%' }] },
    { label: 'Mário Gatti (Campinas)', patterns: [{ col: 'institution', val: '%GATTI%' }, { col: 'code', val: '%GATTI%' }] },
    { label: 'Samaritano Campinas', patterns: [{ col: 'institution', val: '%SAMARITANO%' }, { col: 'code', val: '%SAMARITANO%' }] },
  ];

  const results = {};

  for (const tgt of targets) {
    const map = new Map();
    for (const pat of tgt.patterns) {
      const { data, error } = await supabase
        .from('questions')
        .select('id, code, institution, year, especialidade, correct_answer')
        .or('correct_answer.is.null,correct_answer.eq.')
        .ilike(pat.col, pat.val)
        .limit(2000);

      if (error) {
        console.error(`Erro buscando ${tgt.label} (${pat.col} ilike ${pat.val}):`, error.message);
        continue;
      }
      if (data) {
        for (const q of data) {
          map.set(q.id, q);
        }
      }
    }

    const pending = Array.from(map.values());
    const byYear = {};
    const byInstName = {};
    const sampleCodes = [];

    for (const q of pending) {
      const y = q.year || 'SemAno';
      byYear[y] = (byYear[y] || 0) + 1;
      byInstName[q.institution] = (byInstName[q.institution] || 0) + 1;
      if (sampleCodes.length < 5) sampleCodes.push({ code: q.code, year: q.year, inst: q.institution, esp: q.especialidade });
    }

    results[tgt.label] = {
      pending: pending.length,
      byYear,
      byInstName,
      sampleCodes,
    };
  }

  console.log(JSON.stringify(results, null, 2));
}

inspectTargetPendings();
