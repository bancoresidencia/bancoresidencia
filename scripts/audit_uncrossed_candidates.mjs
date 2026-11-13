import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkPending() {
  console.log('Auditing pending questions for institutions with local PDFs...');

  const prefixes = [
    { label: 'SES-GO', filter: 'SESGO%' },
    { label: 'ENARE', filter: 'ENARE%' },
    { label: 'REVALIDA', filter: 'REVAL%' },
    { label: 'SURCE', filter: 'SURCE%' },
    { label: 'USCS', filter: 'USCS%' },
    { label: 'MARIO GATTI', filter: 'HMG%' },
    { label: 'UERJ', filter: 'UERJ%' },
    { label: 'UNICAMP', filter: 'UNICAMP%' },
    { label: 'HMMSJP (AMP)', filter: 'HMMSJP%' },
    { label: 'PMFI (AMP)', filter: 'PMFI%' },
    { label: 'SMSFOZ (AMP)', filter: 'SMSFOZ%' },
    { label: 'SMSCURITIBA (AMP)', filter: 'SMSCURITIBA%' },
    { label: 'AMP', filter: 'AMP%' }
  ];

  for (const p of prefixes) {
    const { data, count, error } = await supabase
      .from('questions')
      .select('id, code, year, correct_answer', { count: 'exact' })
      .ilike('code', p.filter);

    if (error) {
      console.error(`Error ${p.label}:`, error.message);
      continue;
    }

    const total = data.length;
    const pending = data.filter(q => !q.correct_answer || q.correct_answer.trim() === '');
    const years = {};
    pending.forEach(q => { years[q.year] = (years[q.year] || 0) + 1; });

    console.log(`[${p.label}] Total: ${total} | Sem Gabarito: ${pending.length} | Anos pendentes:`, years);
  }
}

checkPending().catch(console.error);
