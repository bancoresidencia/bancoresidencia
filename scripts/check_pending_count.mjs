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

async function check() {
  const { count: total } = await supabase.from('questions').select('id', { count: 'exact', head: true });
  const { count: nullCount } = await supabase.from('questions').select('id', { count: 'exact', head: true }).is('correct_answer', null);
  const { count: emptyCount } = await supabase.from('questions').select('id', { count: 'exact', head: true }).eq('correct_answer', '');
  const pending = (nullCount || 0) + (emptyCount || 0);
  const withAnswer = (total || 0) - pending;
  console.log(`Total: ${total} | Com Gabarito: ${withAnswer} (${((withAnswer/total)*100).toFixed(2)}%) | Pendentes: ${pending}`);
}

check().catch(console.error);
