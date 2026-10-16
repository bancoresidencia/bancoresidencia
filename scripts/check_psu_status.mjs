import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { count: total } = await supabase.from('questions').select('*', { count: 'exact', head: true }).ilike('banca', '%AREMG%');
  const { count: homol } = await supabase.from('questions').select('*', { count: 'exact', head: true }).ilike('banca', '%AREMG%').not('correct_answer', 'is', null);
  console.log(`PSU-MG / AREMG -> Total: ${total} | Homologadas: ${homol} | Taxa: ${((homol/total)*100).toFixed(1)}%`);
}

check();
