import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

async function checkIds() {
  const gold = JSON.parse(fs.readFileSync('data/all_homologated_questions_gold.json', 'utf8'));
  
  // Pick 5 from PSU-MG, 5 from AMP, 5 from AMRIGS, 5 from Einstein, 5 from SES-DF
  const targets = [
    'PSU-MG - Processo Seletivo Unificado de Minas Gerais',
    'AMP - Associação Médica do Paraná',
    'AMRIGS - Associação Médica do Rio Grande do Sul',
    'HIAE/Einstein - Hospital Israelita Albert Einstein (SP)',
    'SES-DF - Secretaria de Estado de Saúde do Distrito Federal'
  ];

  for (const t of targets) {
    const subset = gold.filter(q => q.institution === t).slice(0, 3);
    console.log(`\nTesting ${t}:`);
    for (const q of subset) {
      const url = `${SUPABASE_URL}/rest/v1/questions?id=eq.${q.id}&select=id,institution,year,especialidade,statement,correct_answer,commentary`;
      const res = await fetch(url, {
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`
        }
      });
      const data = await res.json();
      if (data && data.length > 0) {
        const row = data[0];
        console.log(`  MATCH: ID=${q.id} | Year=${row.year} | Spec=${row.especialidade} | DB Ans=${row.correct_answer} | Gold Ans=${q.correct_answer}`);
      } else {
        console.log(`  NOT FOUND: ID=${q.id}`);
      }
    }
  }
}

checkIds().catch(console.error);
