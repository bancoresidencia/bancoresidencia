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

async function checkFubog() {
  const { data, count, error } = await supabase.from('questions')
    .select('id, code, year, statement, options', { count: 'exact' })
    .ilike('institution', '%fubog%')
    .or('correct_answer.is.null,correct_answer.eq.');
  console.log('Pending FUBOG in Supabase:', count);
  if (data && data.length) {
    console.log('Sample code:', data[0].code);
    console.log('Sample year:', data[0].year);
    console.log('Sample stmt:', data[0].statement.slice(0, 120));
  }
}
checkFubog();
