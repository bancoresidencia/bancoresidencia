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

async function checkHSL() {
  const headers = {
    'apikey': SERVICE_KEY,
    'Authorization': 'Bearer ' + SERVICE_KEY
  };

  const url = `${SUPABASE_URL}/rest/v1/questions?or=(institution.ilike.*HSL*,institution.ilike.*Sirio*,institution.ilike.*Sírio*,banca.ilike.*HSL*,banca.ilike.*Sirio*,banca.ilike.*Sírio*)&select=id,code,institution,banca,year,correct_answer,statement&limit=2000`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    console.error('Erro na query:', res.status, await res.text());
    return;
  }
  const items = await res.json();
  console.log(`Total de questões HSL / Sírio retornadas: ${items.length}`);

  const byYear = {};
  for (const q of items) {
    const y = q.year ?? 'sem_ano';
    if (!byYear[y]) byYear[y] = { total: 0, comGabarito: 0, semGabarito: 0, insts: new Set(), exemplos: [] };
    byYear[y].total++;
    byYear[y].insts.add(q.institution || q.banca);
    if (q.correct_answer && q.correct_answer.trim() !== '') {
      byYear[y].comGabarito++;
    } else {
      byYear[y].semGabarito++;
      if (byYear[y].exemplos.length < 3) byYear[y].exemplos.push(q);
    }
  }

  console.log('\nDistribuição por Ano no Supabase:');
  console.table(Object.entries(byYear).map(([y, d]) => ({
    ano: y,
    total: d.total,
    comGabarito: d.comGabarito,
    semGabarito: d.semGabarito,
    instituicoes: Array.from(d.insts).join(' | ').slice(0, 50)
  })));

  // Checar especificamente ano 2027 ou similar
  for (const y of Object.keys(byYear)) {
    if (y === '2027' || Number(y) >= 2026 || byYear[y].semGabarito > 0) {
      console.log(`\n=== Detalhe Ano ${y} (Sem Gabarito: ${byYear[y].semGabarito}) ===`);
      for (const ex of byYear[y].exemplos) {
        console.log(`- ID: ${ex.id} | Code: ${ex.code} | Inst: ${ex.institution || ex.banca}`);
        console.log(`  Statement: ${(ex.statement || '').slice(0, 160)}...`);
      }
    }
  }
}

checkHSL();
