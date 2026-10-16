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

async function auditThree() {
  const gold = JSON.parse(fs.readFileSync('data/all_homologated_questions_gold.json', 'utf8'));
  const bancas = [
    { name: 'HU-FMJ (Jundiaí - VUNESP)', filter: d => (d.code || '').startsWith('HUFMJ-') },
    { name: 'UFRJ / HUCFF (Rio de Janeiro)', filter: d => (d.code || '').startsWith('UFRJ') },
    { name: 'UFRGS / HCPA (FAURGS Porto Alegre)', filter: d => (d.code || '').startsWith('UFRGS') }
  ];

  const headers = { 'apikey': SERVICE_KEY, 'Authorization': 'Bearer ' + SERVICE_KEY };

  for (const b of bancas) {
    const items = gold.filter(b.filter);
    let filled = 0;
    let empty = 0;
    let notFound = 0;

    for (let i = 0; i < items.length; i += 50) {
      const chunk = items.slice(i, i + 50);
      const ids = chunk.map(c => c.id);
      const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?id=in.(${ids.join(',')})&select=id,correct_answer`, { headers });
      const rows = await res.json();
      if (Array.isArray(rows)) {
        for (const r of rows) {
          if (r.correct_answer && r.correct_answer.trim().length > 0) filled++;
          else empty++;
        }
        notFound += (chunk.length - rows.length);
      }
    }
    console.log(`[AUDITORIA] ${b.name}: ${filled} homologadas ativas no Supabase (de ${items.length} candidatas), vazias: ${empty}, não encontradas: ${notFound}`);
  }
}
auditThree();
