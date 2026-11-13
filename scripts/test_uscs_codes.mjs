import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const k = trimmed.slice(0, idx).trim();
      const v = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      env[k] = v;
    }
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testUscsCodes() {
  const { data: u25 } = await supabase.from('questions')
    .select('id, code, especialidade, statement, options')
    .ilike('institution', '%São Caetano%')
    .eq('year', 2025);

  const { data: u26 } = await supabase.from('questions')
    .select('id, code, especialidade, statement, options')
    .ilike('institution', '%São Caetano%')
    .eq('year', 2026);

  console.log('USCS 2025 total in DB:', u25?.length);
  console.log('USCS 2026 total in DB:', u26?.length);

  // Group by especialidade
  const bySpec25 = {};
  u25?.forEach(q => bySpec25[q.especialidade] = (bySpec25[q.especialidade] || 0) + 1);
  console.log('USCS 2025 by spec:', bySpec25);

  const bySpec26 = {};
  u26?.forEach(q => bySpec26[q.especialidade] = (bySpec26[q.especialidade] || 0) + 1);
  console.log('USCS 2026 by spec:', bySpec26);
}

testUscsCodes();
