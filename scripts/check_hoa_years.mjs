import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkHoaYears() {
  const { data } = await supabase.from('questions').select('id, code, year, correct_answer').ilike('code', 'HOA%').or('correct_answer.is.null,correct_answer.eq.');
  const yr = {};
  data.forEach(q => { yr[q.year] = (yr[q.year] || 0) + 1; });
  console.log('HOA pendentes por ano:', yr);
}
checkHoaYears().catch(console.error);

