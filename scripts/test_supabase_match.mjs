import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY);
const all = JSON.parse(fs.readFileSync('data/clinica_direto_questions.json', 'utf8'));
const sample = all[0];

console.log('Sample from JSON:', { id: sample.id, code: sample.code, tema: sample.tema });

async function testMatch() {
  const { data: d1, error: e1 } = await supabase.from('questions_direto').select('id, code').eq('id', sample.id);
  console.log('Match by id in questions_direto:', d1 ? d1.length : 0, e1 ? e1.message : '');

  const { data: d2, error: e2 } = await supabase.from('questions_direto').select('id, code').eq('code', sample.code);
  console.log('Match by code in questions_direto:', d2 ? d2.length : 0, e2 ? e2.message : '');

  const { data: d3, error: e3 } = await supabase.from('questions').select('id, code').eq('id', sample.id);
  console.log('Match by id in questions:', d3 ? d3.length : 0, e3 ? e3.message : '');
}

testMatch();
