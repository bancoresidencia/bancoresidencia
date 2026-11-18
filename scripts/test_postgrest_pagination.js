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

async function testFetch() {
  const r1 = await supabase.from('questions').select('id', { count: 'exact' }).or('correct_answer.is.null,correct_answer.eq.').range(0, 999);
  console.log('Range 0-999:', r1.data.length, 'Total Count:', r1.count);
  const r2 = await supabase.from('questions').select('id').or('correct_answer.is.null,correct_answer.eq.').range(1000, 1999);
  console.log('Range 1000-1999:', r2.data.length);
  const r3 = await supabase.from('questions').select('id').or('correct_answer.is.null,correct_answer.eq.').range(2000, 2999);
  console.log('Range 2000-2999:', r3.data.length);
}
testFetch();
