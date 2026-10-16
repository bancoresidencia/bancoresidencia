import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const homologadasMap = {
  'AMRIGS - Associação Médica do Rio Grande do Sul': 572,
  'AMP - Associação Médica do Paraná': 442,
  'PSU-MG - Processo Seletivo Unificado de Minas Gerais': 420,
  'HIAE/Einstein - Hospital Israelita Albert Einstein (SP)': 355,
  'UERJ/HUPE - Hospital Universitário Pedro Ernesto (RJ)': 343,
  'SES-RJ - Secretaria de Estado de Saúde do Rio de Janeiro': 320,
  'UEL - Hospital Universitário de Londrina (PR)': 319,
  'Santa Casa de Belo Horizonte (MG)': 311,
  'HU-FMJ - Hospital Universitário da Faculdade de Medicina de Jundiaí (SP)': 287,
  'SES-DF - Secretaria de Estado de Saúde do Distrito Federal': 280,
  'CERMAM - Comissão Estadual de Residência Médica do Amazonas': 280,
  'HSL/Sírio - Hospital Sírio-Libanês (SP)': 251,
  'Universidade de Ribeirão Preto': 247,
  'Universidade do Estado do Pará - Belém': 242,
  'Pontifícia Universidade Católica do Paraná - Campus Curitiba': 240,
  'SES-GO - Secretaria de Estado de Saúde de Goiás': 236,
  'Fundação Universidade Federal de Ciências da Saúde de Porto Alegre': 236,
  'INTO - Instituto Nacional de Traumatologia e Ortopedia Jamil Haddad (RJ)': 232,
  'UFPR/HC - Complexo Hospital de Clínicas da UFPR (PR)': 219,
  'Universidade Estadual do Piauí - Campus Teresina': 214,
  'HAC - Hospital Angelina Caron (PR)': 204,
  'Pontifícia Universidade Católica de São Paulo - Campus Sorocaba': 200,
  'PSU-GO - Processo Seletivo Unificado de Goiás': 198,
  'UFG/HC - Hospital das Clínicas da UFG - Goiânia (GO)': 180,
  'HPP - Hospital Infantil Pequeno Príncipe (PR)': 162,
  'Universidade do Estado do Rio Grande do Norte': 156,
  'IPSEMG - Instituto de Previdência dos Servidores de Minas Gerais': 149,
  'Faculdade de Ciências Médicas de Minas Gerais': 149,
  'SURCE - Seleção Unificada para Residência Médica no Estado do Ceará': 107,
  'UNICAMP/HC - Hospital de Clínicas da Unicamp - Campinas (SP)': 55,
  'UFRJ/HUCFF - Hospital Universitário Clementino Fraga Filho (RJ)': 47,
  'UFRGS/HCPA - Hospital de Clínicas de Porto Alegre (RS)': 44
};

async function main() {
  console.log("================================================================================");
  console.log("OBTENDO CONTAGEM TOTAL NA PLATAFORMA (SUPABASE) POR INSTITUIÇÃO");
  console.log("================================================================================");

  const entries = Object.entries(homologadasMap);
  const rows = [];

  for (const [inst, homologadas] of entries) {
    const url = `${SUPABASE_URL}/rest/v1/questions?institution=eq.${encodeURIComponent(inst)}&select=id`;
    try {
      const res = await fetch(url, {
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Range': '0-0',
          'Prefer': 'count=exact'
        }
      });
      const cr = res.headers.get('content-range');
      console.log(`[DEBUG] ${inst} status:`, res.status, 'content-range:', cr);
      const total = cr ? parseInt(cr.split('/')[1], 10) : 0;
      const pct = total > 0 ? ((homologadas / total) * 100).toFixed(1) + '%' : '0.0%';

      rows.push({
        instituicao: inst,
        homologadas,
        total_plataforma: total,
        pct_cobertura: pct
      });

      console.log(`• ${inst.padEnd(65)} : ${homologadas.toString().padStart(4)} / ${total.toString().padStart(4)} (${pct})`);
    } catch (err) {
      console.error(`Erro ao consultar ${inst}:`, err.message);
    }
  }

  console.log("\n================================================================================");
  console.log("JSON RESULTANTE:");
  console.log(JSON.stringify(rows, null, 2));
}

main().catch(console.error);
