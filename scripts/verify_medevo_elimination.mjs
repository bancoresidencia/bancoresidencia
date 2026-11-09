import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const env = {};
  if (fs.existsSync('.env.local')) {
    const lines = fs.readFileSync('.env.local', 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim().replace(/^['\"]|['\"]$/g, '');
        env[key] = val;
      }
    }
  }
  return env;
}

const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log('--- VERIFICAÇÃO FORENSE NO SUPABASE ---');

  const { data: imgUrlHits, error: err1 } = await supabase
    .from('questions')
    .select('id, code, image_url')
    .ilike('image_url', '%medevo%')
    .limit(50);

  if (err1) console.error('Erro ao verificar image_url:', err1.message);
  else console.log(`Questões com 'medevo' no campo image_url: ${imgUrlHits.length}`);

  const { data: statementHits, error: err2 } = await supabase
    .from('questions')
    .select('id, code')
    .ilike('statement', '%api.medevo.com.br%')
    .limit(50);

  if (err2) console.error('Erro ao verificar statement:', err2.message);
  else console.log(`Questões com 'api.medevo.com.br' no campo statement: ${statementHits.length}`);

  const { data: commentaryHits, error: err3 } = await supabase
    .from('questions')
    .select('id, code')
    .ilike('commentary', '%api.medevo.com.br%')
    .limit(50);

  if (err3) console.error('Erro ao verificar commentary:', err3.message);
  else console.log(`Questões com 'api.medevo.com.br' no campo commentary: ${commentaryHits.length}`);

  console.log('----------------------------------------');
}

run().catch(console.error);
