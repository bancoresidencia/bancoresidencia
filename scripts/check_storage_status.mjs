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

async function check() {
  console.log('--- STATUS DO STORAGE E BANCO SUPABASE ---');
  
  // 1. Storage
  const { data: files, error: sErr } = await supabase.storage
    .from('questoes')
    .list('migrated-medevo', { limit: 100 });

  if (sErr) {
    console.error('Erro no Storage:', sErr.message);
  } else {
    console.log(`Arquivos presentes na pasta 'migrated-medevo': ${files ? files.length : 0}`);
    if (files && files.length > 0) {
      console.log('Primeiros 3 arquivos no Storage:', files.slice(0, 3).map(f => f.name));
    }
  }

  // 2. Banco questions
  const { data: sampleQuestions, error: qErr } = await supabase
    .from('questions')
    .select('id, code, statement')
    .ilike('statement', '%api.medevo.com.br%')
    .limit(5);

  if (qErr) {
    console.error('Erro no Banco:', qErr.message);
  } else {
    console.log(`Amostra de questões com link medevo no statement após o reset: ${sampleQuestions.length}`);
  }

  console.log('-------------------------------------------');
}

check().catch(console.error);

