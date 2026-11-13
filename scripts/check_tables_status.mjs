import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkTables() {
  const tableNames = [
    'questions',
    'questions_direto',
    'questions_expansion_direto',
    'questions_revalida',
    'questions_expansion_revalida',
    'questions_titulo',
    'questions_expansion_titulo_especialista',
    'questions_rplus',
    'questions_expansion_r_plus',
    'questions_curated_staging'
  ];

  console.log('='.repeat(70));
  console.log('🔍 VERIFICAÇÃO DE TABELAS NO SUPABASE REMOTO:');
  console.log('='.repeat(70));

  for (const t of tableNames) {
    const { count, error } = await supabase.from(t).select('id', { count: 'exact', head: true });
    if (error) {
      console.log(`❌ ${t.padEnd(40)}: NÃO ENCONTRADA (${error.message})`);
    } else {
      console.log(`✅ ${t.padEnd(40)}: ENCONTRADA (${count} registros)`);
    }
  }

  // Verificar também se existem arquivos locais
  console.log('\n' + '='.repeat(70));
  console.log('📁 VERIFICAÇÃO DE ARQUIVOS LOCAIS (data/ ou data/supabase_tables):');
  console.log('='.repeat(70));
  const dirs = ['data', 'data/supabase_tables'];
  for (const d of dirs) {
    if (fs.existsSync(d)) {
      const files = fs.readdirSync(d);
      for (const f of files) {
        if (f.endsWith('.json') || f.endsWith('.db')) {
          const stats = fs.statSync(`${d}/${f}`);
          console.log(`- ${d}/${f} (${(stats.size / (1024 * 1024)).toFixed(2)} MB)`);
        }
      }
    }
  }
}

checkTables();

