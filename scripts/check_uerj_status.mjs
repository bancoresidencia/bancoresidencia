import fs from 'fs';
import path from 'path';
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

async function checkPendingUerj() {
  const { data: pending } = await supabase
    .from('questions')
    .select('id, code, institution, year, statement')
    .or('correct_answer.is.null,correct_answer.eq.')
    .ilike('institution', '%UERJ%');

  console.log('Total pending UERJ in Supabase:', pending?.length || 0);
  const byYear = {};
  (pending || []).forEach(q => byYear[q.year] = (byYear[q.year] || 0) + 1);
  console.log('By Year:', byYear);
}

checkPendingUerj();

