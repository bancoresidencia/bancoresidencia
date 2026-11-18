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
  const { data, error } = await supabase
    .from('questions')
    .select('id, code, institution, year, especialidade, statement, options')
    .or('institution.ilike.%SES-GO%,code.ilike.%SESGO%')
    .or('correct_answer.is.null,correct_answer.eq.');

  if (error) {
    console.error('Erro:', error);
    return;
  }

  console.log(`Total pendências SES-GO encontradas: ${data.length}`);
  const byYear = {};
  for (const q of data) {
    byYear[q.year] = (byYear[q.year] || 0) + 1;
  }
  console.log('Distribuição por ano:', byYear);
  fs.writeFileSync('data/pending_sesgo_all.json', JSON.stringify(data, null, 2), 'utf8');
  
  if (data.length > 0) {
    console.log('\nPrimeira pendência:');
    console.log(data[0].code, data[0].year, data[0].especialidade);
    console.log(data[0].statement.slice(0, 100));
  }
}

main().catch(console.error);
