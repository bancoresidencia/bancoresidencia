import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve('.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  lines.forEach(l => {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) {
      let val = v.join('=').trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      env[k.trim()] = val;
    }
  });
}

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

const rowAll = db.prepare(`
  SELECT count(*) as total,
         sum(case when commentary is not null and length(trim(commentary)) > 50 then 1 else 0 end) as com_coment
  FROM questions_curated_staging
  WHERE lower(especialidade) LIKE '%cirurg%'
`).get();

const rowDireto = db.prepare(`
  SELECT count(*) as total,
         sum(case when commentary is not null and length(trim(commentary)) > 50 then 1 else 0 end) as com_coment
  FROM questions_curated_staging
  WHERE lower(especialidade) LIKE '%cirurg%'
    AND (modalidade = 'Acesso Direto' OR modalidade IS NULL)
`).get();

console.log('Cirurgia (Global SQLite):', rowAll);
console.log('Cirurgia (Acesso Direto SQLite):', rowDireto);

if (fs.existsSync('data/cirurgia_direto_questions.json')) {
  const cirurgiaJson = JSON.parse(fs.readFileSync('data/cirurgia_direto_questions.json', 'utf8'));
  console.log('data/cirurgia_direto_questions.json total itens:', cirurgiaJson.length);
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (SUPABASE_URL && SUPABASE_KEY) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const { count: sbDiretoTotal } = await supabase
    .from('questions_direto')
    .select('id', { count: 'exact', head: true })
    .ilike('especialidade', '%cirurg%');
  
  const { count: sbDiretoComent } = await supabase
    .from('questions_direto')
    .select('id', { count: 'exact', head: true })
    .ilike('especialidade', '%cirurg%')
    .not('commentary', 'is', null);

  console.log('Supabase questions_direto Cirurgia:', { total: sbDiretoTotal, com_coment: sbDiretoComent });
}
