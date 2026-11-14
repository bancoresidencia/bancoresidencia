import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkFafipa() {
  const { data, error } = await supabase
    .from('questions')
    .select('id, code, institution, banca, year, correct_answer')
    .or('institution.ilike.%FAFIPA%,institution.ilike.%HMMSJP%,banca.ilike.%FAFIPA%,code.ilike.%HMMSJP%,code.ilike.%FAFIPA%')
    .or('correct_answer.is.null,correct_answer.eq.');

  if (error) {
    console.error(error);
    return;
  }

  console.log(`Total pendentes FAFIPA / HMMSJP: ${data.length}`);
  const byYear = {};
  for (const q of data) {
    const k = `${q.institution} | ${q.year}`;
    byYear[k] = (byYear[k] || 0) + 1;
  }
  console.log('Distribuição:', byYear);
  if (data.length > 0) {
    console.log('Amostra de 3:', data.slice(0, 3));
  }
}

checkFafipa().catch(console.error);
