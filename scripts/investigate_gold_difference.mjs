import { DatabaseSync } from 'node:sqlite';
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
const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

async function investigateDifference() {
  console.log('='.repeat(80));
  console.log('🔍 INVESTIGAÇÃO DA DIFERENÇA DOS 80.000+ COMENTÁRIOS PADRÃO-OURO');
  console.log('='.repeat(80));

  // 1. Quantas questões Ouro existem em TODAS as modalidades em questions_curated_staging?
  const byModalidade = db.prepare(`
    SELECT modalidade, 
           count(*) as total,
           sum(CASE WHEN commentary LIKE '%Take-Home%' THEN 1 ELSE 0 END) as gold
    FROM questions_curated_staging
    GROUP BY modalidade
  `).all();
  console.log('\n1. Padrão-Ouro por Modalidade em questions_curated_staging:');
  console.table(byModalidade);

  // 2. Quantas questões Ouro existem na tabela canônica 'questions' do Supabase?
  const { count: goldInQuestionsTable } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .ilike('commentary', '%Take-Home%');

  console.log(`\n2. Padrão-Ouro na tabela canônica 'questions' do Supabase: ${goldInQuestionsTable?.toLocaleString('pt-BR')}`);

  // 3. E nos arquivos locais de especialidades (data/*_final_questions.json)?
  const localFiles = [
    { name: 'Obstetrícia', path: 'data/obstetricia_final_questions.json' },
    { name: 'Ginecologia', path: 'data/ginecologia_final_questions.json' },
    { name: 'Pediatria', path: 'data/pediatria_final_questions.json' },
    { name: 'Clínica Médica', path: 'data/clinica_medica_final_questions.json' },
    { name: 'Cirurgia', path: 'data/cirurgia_final_questions.json' },
    { name: 'Urologia', path: 'data/urologia_final_questions.json' }
  ];

  let localGoldTotal = 0;
  console.log('\n3. Padrão-Ouro nos arquivos locais gerados pelos workers:');
  for (const f of localFiles) {
    if (fs.existsSync(f.path)) {
      const data = JSON.parse(fs.readFileSync(f.path, 'utf8'));
      const gold = data.filter(q => q.commentary && (q.commentary.includes('Take-Home Message:') || q.commentary.includes('Take-Home'))).length;
      console.log(` - ${f.name.padEnd(20)}: ${gold.toLocaleString('pt-BR')} comentários Ouro`);
      localGoldTotal += gold;
    }
  }
  console.log(` -> TOTAL LOCAL PADRÃO-OURO: ${localGoldTotal.toLocaleString('pt-BR')}`);

  // 4. Quantas das questões de Pediatria locais (22.144) estão com o comentário ouro em questions_direto?
  const pedLocal = JSON.parse(fs.readFileSync('data/pediatria_final_questions.json', 'utf8'));
  const pedGold = pedLocal.filter(q => q.commentary && q.commentary.includes('Take-Home'));
  const samplePedIds = pedGold.slice(0, 100).map(q => q.id);

  const { data: supaDiretoPedSample } = await supabase
    .from('questions_direto')
    .select('id, commentary')
    .in('id', samplePedIds);

  const matchedGold = supaDiretoPedSample ? supaDiretoPedSample.filter(q => q.commentary && q.commentary.includes('Take-Home')).length : 0;
  console.log(`\n4. Amostra de 100 Pediatrias locais em questions_direto:`);
  console.log(` - Encontradas no questions_direto: ${supaDiretoPedSample?.length || 0} de 100`);
  console.log(` - Dessas, quantas JÁ estão com Padrão-Ouro em questions_direto: ${matchedGold} de 100`);
}

investigateDifference();

