import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const t = line.trim();
    if (t && !t.startsWith('#')) {
      const idx = t.indexOf('=');
      if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    }
  });
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkResolvedVsPending() {
  const insts = ['AMP', 'HMMSJP', 'Foz do Iguaçu', 'Angelina Caron', 'UEM'];

  for (const inst of insts) {
    const { data: all, count: total } = await supabase
      .from('questions')
      .select('id, year, correct_answer', { count: 'exact' })
      .ilike('institution', '%' + inst + '%');

    const pending = (all || []).filter(q => !q.correct_answer || q.correct_answer.trim() === '');
    const resolved = (all || []).filter(q => q.correct_answer && q.correct_answer.trim() !== '');

    console.log(`\n=== ${inst} ===`);
    console.log(`Total: ${total} | Resolvidas: ${resolved.length} (${((resolved.length/total)*100).toFixed(1)}%) | Pendentes: ${pending.length}`);

    const pendingYears = {};
    pending.forEach(q => pendingYears[q.year] = (pendingYears[q.year] || 0) + 1);
    console.log('Pendentes por ano:', pendingYears);

    const resolvedYears = {};
    resolved.forEach(q => resolvedYears[q.year] = (resolvedYears[q.year] || 0) + 1);
    console.log('Resolvidas por ano:', resolvedYears);
  }
}

checkResolvedVsPending();
