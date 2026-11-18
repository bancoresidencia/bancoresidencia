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
    .limit(1);

  if (error) {
    console.error('Erro:', error);
  } else {
    console.log('Columns in questions table:', Object.keys(data[0]));
    console.log('Sample record (first 5 keys):', Object.entries(data[0]).slice(0, 10));
  }
}

inspectColumns().catch(console.error);

