import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const idx = line.indexOf('=');
  if (idx > -1) {
    const k = line.slice(0, idx).trim();
    let v = line.slice(idx + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[k] = v;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const res1 = await supabase.from('questions').select('id', { count: 'exact', head: true });
  console.log('Total bruto:', res1.count, res1.error?.message);

  const res2 = await supabase.from('questions').select('id', { count: 'exact', head: true }).not('correct_answer', 'is', null);
  console.log('Com correct_answer nao nulo:', res2.count, res2.error?.message);

  // Let's test a sample of correct_answer values
  const { data: sample, error: errSample } = await supabase.from('questions').select('correct_answer, is_anulada, especialidade').limit(10);
  console.log('Sample rows:', sample);
}

test().catch(console.error);
