import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const t = line.trim();
    if (t && !t.startsWith('#')) {
      const idx = t.indexOf('=');
      if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    }
  });
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkPendingSesGo() {
  const { data: pending } = await supabase
    .from('questions')
    .select('id, code, year, especialidade, statement')
    .ilike('institution', '%SES-GO%')
    .or('correct_answer.is.null,correct_answer.eq.');

  const byYear = {};
  pending.forEach(q => {
    byYear[q.year] = (byYear[q.year] || 0) + 1;
  });
  console.log('Total pending SES-GO:', pending.length);
  console.log('By Year:', byYear);
  
  console.log('\nSamples:');
  pending.slice(0, 10).forEach(q => {
    console.log(`[${q.year}] [${q.code}] (${q.especialidade}): ${q.statement.slice(0, 90)}...`);
  });
}

checkPendingSesGo();
