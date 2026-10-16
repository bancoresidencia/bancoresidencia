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
  'Faculdade de Medicina de Marília': 190,
  'CMC - Fundação Centro Médico de Campinas (SP)': 184,
  'UFG/HC - Hospital das Clínicas da UFG - Goiânia (GO)': 180,
  'Universidade de Taubaté - UNITAU': 171,
  'HPP - Hospital Infantil Pequeno Príncipe (PR)': 162,
  'Universidade do Estado do Rio Grande do Norte': 156,
  'IPSEMG - Instituto de Previdência dos Servidores de Minas Gerais': 149,
  'Faculdade de Ciências Médicas de Minas Gerais': 149,
  'HSL PUCRS - Hospital São Lucas da PUCRS (RS)': 135,
  'HMG - Hospital Municipal Dr. Mário Gatti - Campinas (SP)': 135,
  'SURCE - Seleção Unificada para Residência Médica no Estado do Ceará': 107,
  'UNICAMP/HC - Hospital de Clínicas da Unicamp - Campinas (SP)': 55,
  'UFRJ/HUCFF - Hospital Universitário Clementino Fraga Filho (RJ)': 47,
  'UFRGS/HCPA - Hospital de Clínicas de Porto Alegre (RS)': 44
};

async function main() {
  console.log("================================================================================");
  console.log("COMPARATIVO OFICIAL: HOMOLOGADAS vs TOTAL GERAL NA PLATAFORMA (130 MIL QUESTÕES)");
  console.log("================================================================================");

  const results = [];
  let grandHomologadas = 0;
  let grandTotal130k = 0;

  for (const [inst, homCount] of Object.entries(homologadasMap)) {
    const url = `${SUPABASE_URL}/rest/v1/questions?institution=eq.${encodeURIComponent(inst)}&select=id`;
    try {
      const res = await fetch(url, {
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Range': '0-0',
          'Prefer': 'count=planned'
        }
      });
      const cr = res.headers.get('content-range');
      const total130k = cr ? parseInt(cr.split('/')[1], 10) : 0;
      const pct = total130k > 0 ? ((homCount / total130k) * 100).toFixed(1) + '%' : 'N/A';

      grandHomologadas += homCount;
      grandTotal130k += total130k;

      results.push({
        instituicao: inst,
        homologadas: homCount,
        total130k: total130k,
        pct: pct
      });

      console.log(`• ${inst.padEnd(65)} : Homologadas=${homCount.toString().padStart(4)} | Total no Banco 130k=${total130k.toString().padStart(5)} (${pct.padStart(6)})`);
    } catch (e) {
      console.error(`Erro ao consultar ${inst}:`, e.message);
    }
  }

  const overallPct = grandTotal130k > 0 ? ((grandHomologadas / grandTotal130k) * 100).toFixed(1) + '%' : 'N/A';

  console.log("\n================================================================================");
  console.log(`TOTAL CONSOLIDADO LOTE 2:`);
  console.log(`  Questões Homologadas Oficiais: ${grandHomologadas}`);
  console.log(`  Total no Banco de 130 Mil:     ${grandTotal130k}`);
  console.log(`  Taxa de Cobertura Global:      ${overallPct}`);
  console.log("================================================================================");

  fs.writeFileSync('data/comparativo_homologadas_vs_130k.json', JSON.stringify(results, null, 2), 'utf8');
}

main().catch(console.error);
