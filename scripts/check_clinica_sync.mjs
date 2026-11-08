import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) {
      let val = v.join('=').trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      env[k.trim()] = val;
    }
  });
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const qs = JSON.parse(fs.readFileSync('data/clinica_medica_final_questions.json', 'utf8'));
  const withComm = qs.filter(q => q.commentary && q.commentary.length >= 200);
  console.log('Total local com comentário em Clínica Médica:', withComm.length);

  let missingInSupa = 0;
  const BATCH = 100;
  const sample = withComm.slice(0, 2000);
  for (let i = 0; i < sample.length; i += BATCH) {
    const chunk = sample.slice(i, i + BATCH);
    const ids = chunk.map(q => q.id);
    const { data } = await supabase.from('questions').select('id, commentary').in('id', ids);
    const map = new Map((data || []).map(d => [d.id, d.commentary]));
    for (const q of chunk) {
      const c = map.get(q.id);
      if (!c || c.length < 200) missingInSupa++;
    }
  }
  console.log(`De 2.000 questões locais testadas, ${missingInSupa} não tinham comentário completo no Supabase.`);
}
check();

