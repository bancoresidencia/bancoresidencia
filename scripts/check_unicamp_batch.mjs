import fs from 'fs';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

async function checkBatch() {
  const gold = JSON.parse(fs.readFileSync('data/all_homologated_questions_gold.json', 'utf8'));
  const unicamp = gold.filter(d => (d.institution || '').toLowerCase().includes('unicamp') || (d.code || '').toLowerCase().includes('unicamp'));
  
  let filled = 0;
  let empty = 0;
  const toUpdate = [];

  const headers = { 'apikey': SERVICE_KEY, 'Authorization': 'Bearer ' + SERVICE_KEY };

  for (let i = 0; i < unicamp.length; i += 50) {
    const chunk = unicamp.slice(i, i + 50);
    const ids = chunk.map(c => c.id);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?id=in.(${ids.join(',')})&select=id,correct_answer`, { headers });
    const rows = await res.json();
    if (Array.isArray(rows)) {
      for (const r of rows) {
        if (r.correct_answer && r.correct_answer.trim().length > 0) {
          filled++;
        } else {
          empty++;
          const match = chunk.find(c => c.id === r.id);
          if (match && match.correct_answer) {
            toUpdate.push({ id: r.id, correct_answer: match.correct_answer });
          }
        }
      }
    }
  }
  console.log(`UNICAMP no Supabase: ${filled} já preenchidas | ${empty} vazias que precisam ser atualizadas.`);
  console.log(`Total a atualizar: ${toUpdate.length}`);
}
checkBatch();
