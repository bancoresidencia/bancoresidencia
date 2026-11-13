import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

const tables = [
  'questions_direto',
  'questions_revalida',
  'questions_rplus',
  'questions_titulo'
];

async function runInstitutionsAudit() {
  console.log('=== AUDITORIA DE BANCAS E INSTITUIÇÕES NO SUPABASE ===\n');

  for (const t of tables) {
    console.log(`\n--- Tabela: ${t} ---`);
    
    // Testar se RPC ou agregação funciona, ou buscar amostras de bancas distintas
    // Podemos fazer paginação de bancas ou query
    const { data, error } = await supabase
      .from(t)
      .select('banca, institution')
      .limit(10000);

    if (error) {
      console.error(`Erro em ${t}:`, error.message);
      continue;
    }

    const bancas = new Map();
    const institutions = new Map();

    for (const r of data) {
      const b = (r.banca || 'SEM_BANCA').trim();
      const inst = (r.institution || 'SEM_INSTITUICAO').trim();
      bancas.set(b, (bancas.get(b) || 0) + 1);
      institutions.set(inst, (institutions.get(inst) || 0) + 1);
    }

    console.log(`Total amostrado: ${data.length}`);
    console.log(`Bancas distintas encontradas (${bancas.size}):`);
    const sortedBancas = Array.from(bancas.entries()).sort((a,b) => b[1] - a[1]);
    sortedBancas.slice(0, 20).forEach(([b, c]) => console.log(`  - "${b}": ${c}`));
    if (sortedBancas.length > 20) console.log(`  ... e mais ${sortedBancas.length - 20} bancas`);

    console.log(`Instituições distintas encontradas (${institutions.size}):`);
    const sortedInst = Array.from(institutions.entries()).sort((a,b) => b[1] - a[1]);
    sortedInst.slice(0, 15).forEach(([inst, c]) => console.log(`  - "${inst}": ${c}`));
  }
}

runInstitutionsAudit().catch(console.error);

