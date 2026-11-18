import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const t = l.trim();
  if (t && !t.startsWith('#')) {
    const idx = t.indexOf('=');
    if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  }
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkUnicamp() {
  const { data: q } = await supabase.from('questions').select('code, statement, options, correct_answer').eq('code', 'UNICAMPHC-2021-CIR-19746').single();
  console.log('UNICAMP Q:', q?.code);
  console.log('Statement:', q?.statement);
  console.log('Options:', q?.options);
  console.log('Correct Answer:', q?.correct_answer);
}

checkUnicamp();
