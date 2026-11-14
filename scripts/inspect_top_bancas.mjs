import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectTopBancas() {
  const insts = [
    'SEMUSA (SMS) Macaé',
    'HEAA-FMC - Hospital Escola Álvaro Alvim (RJ)',
    'HAS - Hospital Adventista Silvestre (RJ)',
    'HSL Brasília - Hospital Sírio-Libanês Brasília (DF)',
    'Santa Casa de Maceió (AL)',
    'HVV - Hospital Vaz Monteiro - Lavras (MG)'
  ];

  for (const inst of insts) {
    const { data } = await supabase
      .from('questions')
      .select('id, code, institution, banca, year, correct_answer')
      .eq('institution', inst)
      .limit(3);

    if (data && data.length > 0) {
      console.log(`\n=== ${inst} ===`);
      console.log(`Banca: ${data[0].banca} | Ano: ${data[0].year} | Code prefix: ${data[0].code.split('-')[0]}`);
    }
  }
}

inspectTopBancas().catch(console.error);
