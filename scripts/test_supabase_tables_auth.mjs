import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = env.SUPABASE_SECRET_KEY;

const supabase = createClient(url, secretKey);

async function testTables() {
  const tables = [
    'questions',
    'questions_expansion_direto',
    'questions_expansion_r_plus',
    'questions_expansion_revalida',
    'questions_expansion_titulo_especialista',
    'questions_curated_staging',
    'questions_direto'
  ];

  for (const t of tables) {
    const { count, error } = await supabase.from(t).select('id', { count: 'exact', head: true });
    if (error) {
      console.log(`❌ ${t}: ${error.message} (${error.code})`);
    } else {
      console.log(`✅ ${t}: ${count} linhas`);
    }
  }
}

testTables();
