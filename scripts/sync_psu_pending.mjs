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

async function syncPSU() {
  const gold = JSON.parse(fs.readFileSync('data/all_homologated_questions_gold.json', 'utf8'));
  const psuGold = gold.filter(d => 
    ((d.code || '').startsWith('PSUMG-') || (d.banca || '') === 'PSU-MG') &&
    d.id && d.correct_answer && d.correct_answer.trim().length > 0
  );
  console.log(`PSU-MG com ID e gabarito no gold: ${psuGold.length}`);

  const headers = {
    'apikey': SERVICE_KEY,
    'Authorization': 'Bearer ' + SERVICE_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  };

  // Buscar status atual no Supabase em lotes de 50
  let needUpdate = [];
  for (let i = 0; i < psuGold.length; i += 50) {
    const chunk = psuGold.slice(i, i + 50);
    const ids = chunk.map(c => c.id);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?id=in.(${ids.join(',')})&select=id,correct_answer`, {
      headers: { 'apikey': SERVICE_KEY, 'Authorization': 'Bearer ' + SERVICE_KEY }
    });
    const rows = await res.json();
    if (Array.isArray(rows)) {
      for (const r of rows) {
        if (!r.correct_answer || r.correct_answer.trim().length === 0) {
          const match = chunk.find(c => c.id === r.id);
          if (match && match.correct_answer) {
            needUpdate.push({ id: r.id, correct_answer: match.correct_answer, commentary: match.commentary || 'Gabarito Oficial Definitivo pós-recurso PSU-MG / AREMG' });
          }
        }
      }
    }
  }

  console.log(`Questões do PSU-MG pendentes no Supabase para atualizar: ${needUpdate.length}`);

  if (needUpdate.length > 0) {
    let updated = 0;
    for (const item of needUpdate) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?id=eq.${item.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          correct_answer: item.correct_answer,
          commentary: item.commentary
        })
      });
      if (res.ok) updated++;
    }
    console.log(`✅ Sucesso: ${updated} questões do PSU-MG foram atualizadas no Supabase com gabarito oficial!`);
  }
}
syncPSU();
