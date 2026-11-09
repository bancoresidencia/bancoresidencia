import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const [k, ...v] = l.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
}
const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testUpdate() {
  const qId = '626762af-9b0f-48f7-8f79-d39292b53034';
  const t0 = Date.now();
  const { error } = await client
    .from('questions')
    .update({
      tema: 'Imunizações',
      foco: 'Indicações e Momento Ideal para Vacinação',
      subfoco: 'Calendário Vacinal da Criança: PNI'
    })
    .eq('id', qId);

  console.log('Update result:', { error: error?.message, elapsedMs: Date.now() - t0 });
}

testUpdate().catch(console.error);
