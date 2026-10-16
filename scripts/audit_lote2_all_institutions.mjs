import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const lote2Institutions = [
  'UERJ/HUPE - Hospital Universitário Pedro Ernesto (RJ)',
  'SES-GO - Secretaria de Estado de Saúde de Goiás',
  'SURCE - Seleção Unificada para Residência Médica no Estado do Ceará',
  'PSU-MG - Processo Seletivo Unificado de Minas Gerais',
  'AMP - Associação Médica do Paraná',
  'AMRIGS - Associação Médica do Rio Grande do Sul',
  'HIAE/Einstein - Hospital Israelita Albert Einstein (SP)',
  'SES-DF - Secretaria de Estado de Saúde do Distrito Federal',
  'UEL - Hospital Universitário de Londrina (PR)',
  'UNICAMP/HC - Hospital de Clínicas da Unicamp - Campinas (SP)',
  'UFRJ/HUCFF - Hospital Universitário Clementino Fraga Filho (RJ)',
  'UFRGS/HCPA - Hospital de Clínicas de Porto Alegre (RS)'
];

const gold = JSON.parse(fs.readFileSync('data/all_homologated_questions_gold.json', 'utf8'));

async function audit() {
  console.log("================================================================================");
  console.log("BALANÇO GERAL DE HOMOLOGAÇÃO OFICIAL DO LOTE 2 NO SUPABASE");
  console.log("================================================================================");
  
  let grandTotal = 0;
  let grandHomologadas = 0;

  for (const inst of lote2Institutions) {
    const goldInst = gold.filter(q => q.institution === inst);
    
    // Check all questions of this institution present in gold
    let homologadas = 0;
    const batchSize = 50;
    for (let i = 0; i < goldInst.length; i += batchSize) {
      const chunk = goldInst.slice(i, i + batchSize);
      const ids = chunk.map(q => q.id);
      const url = `${SUPABASE_URL}/rest/v1/questions?id=in.(${ids.join(',')})&select=id,commentary`;
      const res = await fetch(url, {
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`
        }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        for (const row of data) {
          if (row.commentary && row.commentary.includes('Gabarito Oficial Homologado')) {
            homologadas++;
          }
        }
      }
    }

    grandTotal += goldInst.length;
    grandHomologadas += homologadas;
    console.log(`• ${inst.padEnd(65)} : ${homologadas.toString().padStart(4)} / ${goldInst.length.toString().padStart(4)} homologadas`);
  }

  console.log("================================================================================");
  console.log(`TOTAL GERAL LOTE 2: ${grandHomologadas} questões homologadas com gabarito oficial definitivo!`);
  console.log("================================================================================");
}

audit().catch(console.error);
