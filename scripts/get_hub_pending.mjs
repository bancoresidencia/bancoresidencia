import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      }
    }
  });
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log('Buscando questões pendentes de UnB / HUB / SES-DF 2016...');
  
  const { data, error } = await supabase
    .from('questions')
    .select('id, code, institution, year, especialidade, statement, options')
    .or('institution.ilike.%HUB%,institution.ilike.%UnB%,institution.ilike.%SES-DF%')
    .eq('year', 2016)
    .or('correct_answer.is.null,correct_answer.eq.');

  if (error) {
    console.error('Erro na query:', error);
    return;
  }

  console.log(`Total pendentes encontradas: ${data.length}`);
  fs.writeFileSync('data/pending_hub_2016.json', JSON.stringify(data, null, 2), 'utf8');
  
  for (let i = 0; i < Math.min(5, data.length); i++) {
    const q = data[i];
    console.log(`\n[${i+1}] ID: ${q.id} | Code: ${q.code} | Inst: ${q.institution} | Spec: ${q.specialty}`);
    console.log(`Enunciado: ${q.statement.slice(0, 120)}...`);
    console.log(`Opções: ${JSON.stringify(q.options)}`);
  }
}

main().catch(console.error);
