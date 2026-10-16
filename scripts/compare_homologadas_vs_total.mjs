import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const institutions = [
  'AMRIGS - Associação Médica do Rio Grande do Sul',
  'AMP - Associação Médica do Paraná',
  'PSU-MG - Processo Seletivo Unificado de Minas Gerais',
  'HIAE/Einstein - Hospital Israelita Albert Einstein (SP)',
  'UERJ/HUPE - Hospital Universitário Pedro Ernesto (RJ)',
  'SES-RJ - Secretaria de Estado de Saúde do Rio de Janeiro',
  'UEL - Hospital Universitário de Londrina (PR)',
  'Santa Casa de Belo Horizonte (MG)',
  'HU-FMJ - Hospital Universitário da Faculdade de Medicina de Jundiaí (SP)',
  'SES-DF - Secretaria de Estado de Saúde do Distrito Federal',
  'CERMAM - Comissão Estadual de Residência Médica do Amazonas',
  'HSL/Sírio - Hospital Sírio-Libanês (SP)',
  'Universidade de Ribeirão Preto',
  'Universidade do Estado do Pará - Belém',
  'Pontifícia Universidade Católica do Paraná - Campus Curitiba',
  'SES-GO - Secretaria de Estado de Saúde de Goiás',
  'Fundação Universidade Federal de Ciências da Saúde de Porto Alegre',
  'INTO - Instituto Nacional de Traumatologia e Ortopedia Jamil Haddad (RJ)',
  'UFPR/HC - Complexo Hospital de Clínicas da UFPR (PR)',
  'Universidade Estadual do Piauí - Campus Teresina',
  'HAC - Hospital Angelina Caron (PR)',
  'Pontifícia Universidade Católica de São Paulo - Campus Sorocaba',
  'PSU-GO - Processo Seletivo Unificado de Goiás',
  'UFG/HC - Hospital das Clínicas da UFG - Goiânia (GO)',
  'HPP - Hospital Infantil Pequeno Príncipe (PR)',
  'Universidade do Estado do Rio Grande do Norte',
  'IPSEMG - Instituto de Previdência dos Servidores de Minas Gerais',
  'Faculdade de Ciências Médicas de Minas Gerais',
  'SURCE - Seleção Unificada para Residência Médica no Estado do Ceará',
  'UNICAMP/HC - Hospital de Clínicas da Unicamp - Campinas (SP)',
  'UFRJ/HUCFF - Hospital Universitário Clementino Fraga Filho (RJ)',
  'UFRGS/HCPA - Hospital de Clínicas de Porto Alegre (RS)'
];

async function countInstitution(inst) {
  let total = 0;
  let homologadas = 0;
  let offset = 0;
  const pageSize = 250;

  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/questions?institution=eq.${encodeURIComponent(inst)}&select=id,commentary&limit=${pageSize}&offset=${offset}`;
    try {
      const res = await fetch(url, {
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`
        }
      });
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) break;
      total += data.length;
      for (const q of data) {
        if (q.commentary && q.commentary.includes('Gabarito Oficial Homologado')) {
          homologadas++;
        }
      }
      if (data.length < pageSize) break;
      offset += pageSize;
    } catch (e) {
      console.error(`Erro ao contar ${inst}:`, e.message);
      break;
    }
  }

  return { total, homologadas };
}

async function main() {
  console.log("================================================================================");
  console.log("COMPARATIVO: HOMOLOGADAS vs TOTAL NA PLATAFORMA (POR INSTITUIÇÃO)");
  console.log("================================================================================");

  const results = [];

  for (const inst of institutions) {
    const t0 = Date.now();
    const { total, homologadas } = await countInstitution(inst);
    const pct = total > 0 ? ((homologadas / total) * 100).toFixed(1) + '%' : '0.0%';
    const duration = ((Date.now() - t0) / 1000).toFixed(1);
    
    results.push({
      institution: inst,
      homologadas,
      total,
      pct
    });

    console.log(`• ${inst.padEnd(65)} : ${homologadas.toString().padStart(4)} / ${total.toString().padStart(4)} (${pct}) [${duration}s]`);
  }

  console.log("\n================================================================================");
  console.log("JSON FINAL PARA EXIBIÇÃO:");
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
