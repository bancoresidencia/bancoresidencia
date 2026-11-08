import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectCommentaryTypes() {
  console.log('--- ANÁLISE DOS COMENTÁRIOS DE GINECO, CLÍNICA E OBSTETRÍCIA ---');

  for (const spec of ['Ginecologia', 'Obstetrícia', 'Clínica Médica']) {
    const { count: totalSpec } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('especialidade', spec);
    const { count: withComm } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('especialidade', spec).not('commentary', 'is', null).neq('commentary', '');
    const { count: takeHomeExact } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('especialidade', spec).like('commentary', '%Take-Home Message%');
    const { count: referencias } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('especialidade', spec).like('commentary', '%Referências%');
    const { count: diretrizes } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('especialidade', spec).like('commentary', '%Diretriz%');
    const { count: semComm } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('especialidade', spec).or('commentary.is.null,commentary.eq.');

    console.log(`\n🏥 ${spec} (Total no Banco: ${totalSpec}):`);
    console.log(` - Com comentário no banco: ${withComm} (${((withComm/totalSpec)*100).toFixed(1)}%)`);
    console.log(` - Sem comentário no banco: ${semComm} (${((semComm/totalSpec)*100).toFixed(1)}%)`);
    console.log(`   * Contém 'Take-Home Message': ${takeHomeExact} (${((takeHomeExact/totalSpec)*100).toFixed(1)}%)`);
    console.log(`   * Contém 'Referências': ${referencias}`);
    console.log(`   * Contém 'Diretriz': ${diretrizes}`);
  }

  // Agora vamos analisar os arquivos locais dessas 3 especialidades
  console.log('\n======================================================================');
  console.log('📂 ANÁLISE DOS ARQUIVOS LOCAIS (CANÔNICOS)');
  console.log('======================================================================');

  const localFiles = [
    { spec: 'Ginecologia', path: 'data/ginecologia_final_questions.json' },
    { spec: 'Obstetrícia', path: 'data/obstetricia_final_questions.json' },
    { spec: 'Clínica Médica', path: 'data/clinica_medica_final_questions.json' }
  ];

  for (const lf of localFiles) {
    if (!fs.existsSync(lf.path)) continue;
    const list = JSON.parse(fs.readFileSync(lf.path, 'utf8'));
    let localWithComm = 0;
    let localWithTakeHome = 0;
    let localWithFinalComm = 0;

    for (const q of list) {
      if (q.commentary && q.commentary.trim().length > 0) localWithComm++;
      if (q.takeHomeMessage || (q.commentary && q.commentary.includes('Take-Home Message'))) localWithTakeHome++;
      if (q.finalCommentary) localWithFinalComm++;
    }

    console.log(`\n📄 ${lf.spec} (${lf.path}):`);
    console.log(` - Total local: ${list.length}`);
    console.log(` - Com comentário local: ${localWithComm} (${((localWithComm/list.length)*100).toFixed(1)}%)`);
    console.log(` - Com Take-Home / Padrão-Ouro: ${localWithTakeHome} (${((localWithTakeHome/list.length)*100).toFixed(1)}%)`);
    console.log(` - Com finalCommentary: ${localWithFinalComm}`);
  }
}

inspectCommentaryTypes().catch(console.error);
