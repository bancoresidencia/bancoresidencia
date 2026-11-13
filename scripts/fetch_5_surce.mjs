import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function fetchSurce() {
  const codes = [
    'SURCE-2024-CLM-18350',
    'SURCE-2022-CIR-13527',
    'SURCE-2022-CIR-7272',
    'SURCE-2022-CIR-5868',
    'SURCE-2022-CLM-2248'
  ];
  const { data, error } = await supabase.from('questions').select('*').in('code', codes);
  if (error) { console.error(error); return; }
  fs.writeFileSync('data/sample_5_surce.json', JSON.stringify(data, null, 2));
  console.log(`Saved ${data.length} SURCE questions to data/sample_5_surce.json`);
}

fetchSurce();

