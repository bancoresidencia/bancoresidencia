import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

async function checkSample() {
  const inst = 'PSU-MG - Processo Seletivo Unificado de Minas Gerais';
  for (const y of [2025, 2024, 2023]) {
    const url = `${SUPABASE_URL}/rest/v1/questions?institution=eq.${encodeURIComponent(inst)}&year=eq.${y}&select=id,year,especialidade,correct_answer,commentary,statement&limit=3`;
    const res = await fetch(url, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });
    const data = await res.json();
    console.log(`\nSample ${y} questions:`);
    data.forEach(q => {
      console.log('ID:', q.id, 'Spec:', q.especialidade, 'Ans:', q.correct_answer, 'Comm:', q.commentary?.slice(0, 60));
      console.log('Stmt:', q.statement?.slice(0, 160).replace(/\n/g, ' '));
    });
  }
}

checkSample().catch(console.error);
