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

async function checkLocalMatches() {
  console.log('Verificando questões pendentes no banco para as bancas com PDFs locais:');

  const targets = [
    { name: 'UERJ', filter: q => q.ilike('banca', '%UERJ%') },
    { name: 'UNICAMP', filter: q => q.ilike('banca', '%UNICAMP%') },
    { name: 'SURCE', filter: q => q.ilike('banca', '%SURCE%') },
    { name: 'PSU-MG / AREMG', filter: q => q.or('banca.ilike.%PSU-MG%,banca.ilike.%AREMG%') },
    { name: 'SES-GO', filter: q => q.ilike('institution', '%SES-GO%') },
    { name: 'ENARE', filter: q => q.ilike('banca', '%ENARE%') },
    { name: 'INEP / Revalida', filter: q => q.ilike('institution', '%INEP%') },
    { name: 'ABEM', filter: q => q.ilike('institution', '%ABEM%') },
    { name: 'USCS', filter: q => q.ilike('institution', '%São Caetano%') }
  ];

  for (const t of targets) {
    let q = supabase.from('questions')
      .select('id, year', { count: 'exact' })
      .or('correct_answer.is.null,correct_answer.eq.');
    q = t.filter(q);
    const { count, data } = await q;
    const years = {};
    for (const d of data || []) {
      years[d.year] = (years[d.year] || 0) + 1;
    }
    console.log(`- ${t.name.padEnd(20)}: ${String(count).padStart(5)} pendentes | Anos:`, years);
  }
}

checkLocalMatches();
