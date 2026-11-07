import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const [k, ...v] = l.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectColumns() {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('id', '17004dcf-f0b1-4106-8196-56a2b471ca7a')
    .single();

  if (error) {
    console.error('Erro:', error);
  } else {
    console.log('Columns in questions table:', Object.keys(data));
    console.log('Current sample record:', JSON.stringify(data, null, 2));
  }
}

inspectColumns().catch(console.error);

