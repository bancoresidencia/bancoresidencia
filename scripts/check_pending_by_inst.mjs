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

async function checkPendingByInst() {
  const targets = [
    { name: 'Mário Gatti', query: 'institution.ilike.%Mário Gatti%,code.ilike.%HMG%' },
    { name: 'AMP Paraná', query: 'institution.ilike.%AMP%,code.ilike.%AMP%' },
    { name: 'ENARE', query: 'institution.ilike.%ENARE%,code.ilike.%ENARE%' },
    { name: 'SES-GO', query: 'institution.ilike.%SES-GO%,code.ilike.%SESGO%' },
    { name: 'Santa Casa SP', query: 'institution.ilike.%Santa Casa de Misericórdia de São Paulo%,code.ilike.%SCMSP%' }
  ];

  for (const t of targets) {
    const { count } = await supabase
      .from('questions')
      .select('id', { count: 'exact', head: true })
      .or(t.query)
      .or('correct_answer.is.null,correct_answer.eq.');
    console.log(`${t.name}: ${count} pendentes`);
  }
}

checkPendingByInst().catch(console.error);
