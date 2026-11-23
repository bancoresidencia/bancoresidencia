import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const trimmed = l.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const [k, ...v] = trimmed.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase.from('questions').select('id, images').eq('id', '2c76416e-283e-4e5d-9c95-6b7849f82d39').single();
  console.log('Result for clean UUID in questions:');
  console.log('Data:', data);
  console.log('Error:', error);
}

test().catch(console.error);
