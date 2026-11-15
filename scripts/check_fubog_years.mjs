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

async function run() {
  const { data } = await supabase.from('questions')
    .select('year')
    .ilike('institution', '%FUBOG%')
    .or('correct_answer.is.null,correct_answer.eq.');
    
  const byYear = {};
  (data || []).forEach(d => byYear[d.year] = (byYear[d.year] || 0) + 1);
  console.log('Pending FUBOG by Year in Supabase:', byYear);

  // Now let's check SES-GO by Year in Supabase
  const { data: sesgo } = await supabase.from('questions')
    .select('year')
    .ilike('institution', '%SES-GO%')
    .or('correct_answer.is.null,correct_answer.eq.');
    
  const sesByYear = {};
  (sesgo || []).forEach(d => sesByYear[d.year] = (sesByYear[d.year] || 0) + 1);
  console.log('Pending SES-GO by Year in Supabase:', sesByYear);
}

run().catch(console.error);
