import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
  console.log('--- AUDITORIA DETALHADA DE GABARITOS ---');

  // 1. Total no Supabase
  const { count: totalQuestions, error: errTotal } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true });

  console.log('Total de questões cadastradas no Supabase:', totalQuestions);

  // 2. Com gabarito preenchido (não nulo e não vazio)
  const { count: totalComGabarito, error: errGab } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .neq('correct_answer', '');

  console.log('Total com gabarito preenchido (não vazio):', totalComGabarito);

  // 3. Distribuição por Especialidade de questões com gabarito
  const { data: rows, error: errRows } = await supabase
    .from('questions')
    .select('especialidade, correct_answer, banca, year')
    .neq('correct_answer', '')
    .limit(10000);

  const bySpec = {};
  const byBanca = {};
  if (rows) {
    rows.forEach(r => {
      const spec = r.especialidade || 'Não informada';
      bySpec[spec] = (bySpec[spec] || 0) + 1;
      const b = r.banca || 'Outra';
      byBanca[b] = (byBanca[b] || 0) + 1;
    });
  }

  console.log('\nDistribuição por Especialidade (Supabase):');
  Object.entries(bySpec).sort((a,b) => b[1] - a[1]).forEach(([spec, count]) => {
    console.log(` • ${spec.padEnd(25)}: ${count}`);
  });

  console.log('\nTop 10 Bancas das questões com gabarito:');
  Object.entries(byBanca).sort((a,b) => b[1] - a[1]).slice(0, 10).forEach(([b, count]) => {
    console.log(` • ${b.padEnd(25)}: ${count}`);
  });

  // 4. Arquivos locais em data/ (ouro / auditoria local)
  console.log('\n--- ARQUIVOS LOCAIS DE QUESTÕES AUDITADAS (ÂNCORA DE OURO) ---');
  const files = [
    'data/urologia_final_questions.json',
    'data/ginecologia_final_questions.json',
    'data/cirurgia_final_questions.json',
    'data/obstetricia_final_questions.json',
    'data/pediatria_final_questions.json',
    'data/medicina_preventiva_final_questions.json',
    'data/clinica_medica_final_questions.json'
  ];

  for (const f of files) {
    if (fs.existsSync(f)) {
      const qs = JSON.parse(fs.readFileSync(f, 'utf8'));
      const withAns = qs.filter(q => (q.correctAnswer || q.correct_answer || '').trim().length > 0).length;
      console.log(` • ${f.padEnd(45)}: ${qs.length} total | ${withAns} com gabarito`);
    }
  }

  // 5. Livros de Gabaritos no Drive / Knowledge
  console.log('\n--- BASE DE CONHECIMENTO (APOSTILAS / LIVROS DE GABARITOS DRIVE) ---');
  const gabDir = 'data/knowledge/gabarito_das_questoes';
  if (fs.existsSync(gabDir)) {
    const specs = fs.readdirSync(gabDir);
    let totalGabFiles = 0;
    specs.forEach(s => {
      const p = `${gabDir}/${s}`;
      if (fs.statSync(p).isDirectory()) {
        const c = fs.readdirSync(p).length;
        totalGabFiles += c;
        console.log(` • ${s.padEnd(25)}: ${c} arquivos/apostilas`);
      }
    });
    console.log(` Total de apostilas de gabaritos baixadas: ${totalGabFiles}`);
  }
}

main().catch(console.error);
