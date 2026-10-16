import fs from 'fs';

const mapping = JSON.parse(fs.readFileSync('data/mapeamento_instituicoes_gabaritos.json', 'utf8'));

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

console.log("=== COMPARATIVO HOMOLOGADAS vs CATALOGADO NA PLATAFORMA ===");
let totalHomolog = 0;
let totalPlatform = 0;

for (const [inst, homCount] of Object.entries(homologadasMap)) {
  const match = mapping.find(m => m.instituicao === inst);
  const platTotal = match ? match.total_questoes : 'N/D';
  totalHomolog += homCount;
  if (match) totalPlatform += platTotal;
  console.log(`• ${inst.padEnd(65)} : Homologadas=${homCount.toString().padStart(4)} | Na Plataforma=${platTotal.toString().padStart(4)}`);
}

console.log(`\nTOTAL GERAL DO LOTE: Homologadas=${totalHomolog} | Na Plataforma (subset catalogado)=${totalPlatform}`);
