import fs from 'fs';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const [k, ...v] = l.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

const rep = JSON.parse(fs.readFileSync('data/relatorio_auditoria_profunda_completa.json', 'utf8'));
const sampleIds = rep.camada6_missing_ans.slice(0, 15).map(m => m.id);

const res = await fetch(`${url}/rest/v1/questions?id=in.(${sampleIds.join(',')})&select=id,code,correct_answer,is_anulada`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` }
});
const data = await res.json();
console.log('Sample in Supabase (15 items):');
data.forEach(d => console.log(' ', d.id, d.code, 'ans:', JSON.stringify(d.correct_answer), 'anul:', d.is_anulada));

