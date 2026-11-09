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

async function check() {
  const { data, error } = await client.from('question_facets').select('*').limit(1);
  console.log('question_facets test:', { exists: !error, error: error?.message, sample: data?.[0] });
}

check().catch(console.error);
