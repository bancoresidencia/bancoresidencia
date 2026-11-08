import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const files = [
  { name: 'Obstetrícia', path: 'data/obstetricia_final_questions.json', supaName: 'Obstetrícia' },
  { name: 'Ginecologia', path: 'data/ginecologia_final_questions.json', supaName: 'Ginecologia' },
  { name: 'Clínica Médica', path: 'data/clinica_medica_final_questions.json', supaName: 'Clínica Médica' },
  { name: 'Pediatria', path: 'data/pediatria_final_questions.json', supaName: 'Pediatria' },
  { name: 'Cirurgia', path: 'data/cirurgia_final_questions.json', supaName: 'Cirurgia' },
  { name: 'Preventiva', path: 'data/medicina_preventiva_final_questions.json', supaName: 'Medicina Preventiva e Social' }
];

async function run() {
  console.log('='.repeat(80));
  console.log('🔍 AUDITORIA: COMENTÁRIOS LOCAIS X SUPABASE (BASE ATIVA)');
  console.log('='.repeat(80));

  for (const f of files) {
    if (!fs.existsSync(f.path)) continue;
    const qs = JSON.parse(fs.readFileSync(f.path, 'utf8'));
    const localWithComm = qs.filter(q => q.commentary && q.commentary.length > 200);

    // Consulta total no Supabase com comentário para a especialidade
    const { count: supaCommCount } = await supabase
      .from('questions')
      .select('id', { count: 'exact', head: true })
      .eq('especialidade', f.supaName)
      .not('commentary', 'is', null)
      .neq('commentary', '');

    const { count: supaGoldCount } = await supabase
      .from('questions')
      .select('id', { count: 'exact', head: true })
      .eq('especialidade', f.supaName)
      .like('commentary', '%Take-Home Message:%');

    const diff = localWithComm.length - (supaCommCount || 0);

    console.log(`\n📌 Especialidade: [ ${f.name} ]`);
    console.log(`   - Local com comentário (>= 200 carac): ${localWithComm.length.toLocaleString('pt-BR')}`);
    console.log(`   - Supabase com qualquer comentário:    ${(supaCommCount || 0).toLocaleString('pt-BR')}`);
    console.log(`   - Supabase com Padrão-Ouro estrito:    ${(supaGoldCount || 0).toLocaleString('pt-BR')}`);
    console.log(`   - Diferença Bruta (Local - Supabase):  ${diff > 0 ? `+${diff} pendentes de sync` : `${diff} (Sincronizado)`}`);
  }
}

run();

