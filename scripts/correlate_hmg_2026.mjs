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

const GABARITOS = {
  TIPO_1: [
    'A','A','C','B','B','D','A','D','A','-', // 1-10
    'B','A','A','B','B','-','D','B','C','-', // 11-20
    '-','D','B','B','C','C','A','D','C','D', // 21-30
    'A','A','B','A','B','D','C','-','D','C', // 31-40
    'C','A','C','B','A','C','D','-','A','-', // 41-50
    'C','D','D','C','C','C','A','C','B','B', // 51-60
    'D','B','C','A','C','B','A','D','B','D', // 61-70
    'C','A','D','C','C','A','-','A','C','C', // 71-80
    'B','C','D','D','A','C','A','B','-','-', // 81-90
    'D','A','C','C','D','A','D','B','C','A'  // 91-100
  ],
  TIPO_2: [
    'A','A','-','D','B','-','A','C','-','A', // 1-10
    'D','A','B','B','D','B','B','A','B','C', // 11-20
    '-','A','D','C','B','C','A','D','D','C', // 21-30
    'D','D','A','C','B','C','A','-','B','B', // 31-40
    'C','D','C','A','B','B','D','-','B','A', // 41-50
    'A','-','C','A','C','C','C','C','D','C', // 51-60
    'D','A','A','-','A','C','A','D','C','B', // 61-70
    'B','D','C','C','B','C','C','A','D','C', // 71-80
    'B','A','A','D','D','A','A','-','C','C', // 81-90
    'B','-','D','A','D','C','C','B','C','D'  // 91-100
  ],
  TIPO_3: [
    'A','-','B','B','C','B','-','A','A','B', // 1-10
    '-','C','A','B','B','D','A','D','A','D', // 11-20
    '-','C','B','B','C','B','D','A','A','D', // 21-30
    'A','D','B','A','-','D','C','D','C','C', // 31-40
    'C','B','B','C','A','C','C','D','D','-', // 41-50
    'C','B','D','C','C','A','-','C','A','A', // 51-60
    'D','C','A','C','C','A','C','A','A','D', // 61-70
    'C','C','D','C','A','B','B','D','-','B', // 71-80
    'A','B','D','D','A','D','A','A','-','A', // 81-90
    'D','C','C','B','C','B','C','C','D','-'  // 91-100
  ]
};

async function checkCorrelations() {
  const { data, error } = await supabase
    .from('questions')
    .select('id, code, tipo_prova, especialidade, tema, foco, statement, options, correct_answer')
    .ilike('code', 'HMG%')
    .eq('year', 2026);

  if (error) {
    console.error('Error:', error);
    return;
  }

  // Sort questions by code
  data.sort((a, b) => a.code.localeCompare(b.code));

  console.log('Sample sorted questions:');
  for (let i = 0; i < 10; i++) {
    console.log(`${i}: ${data[i].code} (${data[i].especialidade}) -> ans: ${data[i].correct_answer || 'NONE'}`);
  }

  // Also group by specialty in code order
  const areas = ['CIR', 'CLM', 'GIN', 'OBS', 'PED', 'MPS'];
  for (const ar of areas) {
    const subset = data.filter(q => q.code.includes(`-${ar}-`));
    subset.sort((a, b) => a.code.localeCompare(b.code));
    console.log(`\nArea ${ar} (total ${subset.length}):`);
    console.log(subset.map(q => `${q.code.split('-')[3]}:${q.correct_answer || '?'}`).join(' '));
  }
}

checkCorrelations();
