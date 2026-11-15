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

async function checkAmpYears() {
  const { data, count, error } = await supabase
    .from('questions')
    .select('id, code, year, correct_answer', { count: 'exact' })
    .ilike('code', 'AMP%');

  console.log('Total AMP no Supabase:', count);
  const byYear = {};
  const missingByYear = {};
  data.forEach(q => {
    byYear[q.year] = (byYear[q.year] || 0) + 1;
    if (!q.correct_answer || q.correct_answer.trim() === '') {
      missingByYear[q.year] = (missingByYear[q.year] || 0) + 1;
    }
  });
  console.log('Total AMP por ano:', byYear);
  console.log('Pendentes AMP por ano:', missingByYear);
}

checkAmpYears().catch(console.error);
