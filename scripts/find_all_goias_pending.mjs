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

async function findPendingGoias() {
  // Query pending questions from Goiás institutions or with SESGO/FUBOG in code
  const { data, error } = await supabase
    .from('questions')
    .select('id, code, institution, year, especialidade, statement, options')
    .or('correct_answer.is.null,correct_answer.eq.')
    .or('institution.ilike.%SES-GO%,institution.ilike.%FUBOG%,institution.ilike.%IOG%,institution.ilike.%Goiás%,institution.ilike.%Goias%,code.ilike.%SESGO%');

  if (error) {
    console.error(error);
    return;
  }

  console.log(`Total Goiás pending questions: ${data.length}`);
  const byInstYear = {};
  data.forEach(q => {
    const k = `${q.institution} (${q.year})`;
    byInstYear[k] = (byInstYear[k] || 0) + 1;
  });
  console.log('Breakdown by institution and year:', byInstYear);
}

findPendingGoias();
