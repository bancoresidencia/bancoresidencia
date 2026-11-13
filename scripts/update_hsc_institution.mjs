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

async function updateHscInstitution() {
  console.log('Atualizando instituicao das questoes HSC para "Hospital São Camilo - São Camilo SP"...');
  
  const { data, error } = await supabase
    .from('questions')
    .update({ institution: 'Hospital São Camilo - São Camilo SP' })
    .ilike('code', 'HSC%')
    .select('id, code, institution');

  if (error) {
    console.error('Erro no update:', error.message);
    return;
  }

  console.log(`Sucesso: ${data.length} questoes atualizadas com sucesso para "Hospital São Camilo - São Camilo SP".`);
}

updateHscInstitution();
