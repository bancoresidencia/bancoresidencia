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

async function listRPCs() {
  // Test common RPCs or check schema
  const rpcs = [
    'exec_sql',
    'execute_sql',
    'run_sql',
    'sql',
    'get_faceted_question_counts',
    'batch_update_taxonomy'
  ];
  for (const r of rpcs) {
    const { error } = await client.rpc(r, {});
    console.log(`RPC ${r}:`, error ? error.message : 'EXISTS!');
  }
}

listRPCs().catch(console.error);
