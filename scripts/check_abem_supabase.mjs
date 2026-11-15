import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      }
    }
  });
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkAbemSupabase() {
  const { data, count, error } = await supabase
    .from('questions')
    .select('id, code, year, institution, correct_answer', { count: 'exact' })
    .ilike('code', 'ABEM%');

  console.log('Total com code ABEM%:', count);
  if (data && data.length > 0) {
    const withAns = data.filter(q => q.correct_answer);
    const missing = data.filter(q => !q.correct_answer);
    console.log(`Com gabarito: ${withAns.length} | Sem gabarito: ${missing.length}`);
    console.log('Exemplo:', data[0]);
  } else {
    console.log('Nenhuma questão encontrada com code ABEM%. Tentando TPN%...');
    const { data: data2, count: count2 } = await supabase
      .from('questions')
      .select('id, code, year, institution, correct_answer', { count: 'exact' })
      .ilike('code', 'TPN%');
    console.log('Total com code TPN%:', count2);
    if (data2 && data2.length > 0) {
      console.log('Exemplo TPN:', data2[0]);
    }
  }
}

checkAbemSupabase().catch(console.error);
