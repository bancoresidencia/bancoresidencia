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

async function countHomologadas() {
  console.log("================================================================================");
  console.log("CONTAGEM EXATA NO SUPABASE — TODAS AS ESPECIALIDADES HOMOLOGADAS (LOTE 2)");
  console.log("================================================================================");

  let grandTotal = 0;

  for (const inst of lote2Institutions) {
    let count = 0;
    let offset = 0;
    while (true) {
      const url = `${SUPABASE_URL}/rest/v1/questions?institution=eq.${encodeURIComponent(inst)}&commentary=ilike.*Gabarito%20Oficial%20Homologado*&select=id&limit=250&offset=${offset}`;
      const res = await fetch(url, {
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`
        }
      });
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) break;
      count += data.length;
      offset += 250;
      if (data.length < 250) break;
    }
    grandTotal += count;
    console.log(`• ${inst.padEnd(65)} : ${count} homologadas`);
  }

  console.log("================================================================================");
  console.log(`TOTAL GERAL REAL HOMOLOGADO NO SUPABASE: ${grandTotal} questões!`);
  console.log("================================================================================");
}

countHomologadas().catch(console.error);
