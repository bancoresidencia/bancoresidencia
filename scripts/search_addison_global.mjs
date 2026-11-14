import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function searchGlobal() {
  const { data } = await supabase
    .from('questions')
    .select('id, code, institution, banca, year, correct_answer')
    .ilike('statement', '%Paciente de 45 anos, com diagnóstico prévio de Doença de Addison%');

  console.log('Busca global Addison:', data);
}

searchGlobal().catch(console.error);
