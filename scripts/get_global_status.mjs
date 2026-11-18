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

async function check() {
  const { count: pendingCount } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .or('correct_answer.is.null,correct_answer.eq.');

  const { count: totalCount } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true });

  const resolved = totalCount - pendingCount;
  const pct = (resolved / totalCount) * 100;
  console.log('=== METRICAS SUPABASE LIVE ===');
  console.log('Total Questoes:', totalCount);
  console.log('Gabaritos Confirmados:', resolved, `(${pct.toFixed(2)}%)`);
  console.log('Pendencias Restantes:', pendingCount);
}
check();
