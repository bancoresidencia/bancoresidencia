import fs from 'fs';

const gold = JSON.parse(fs.readFileSync('data/all_homologated_questions_gold.json', 'utf8'));
const lote1Keywords = ['ENARE', 'SUS-SP', 'SES-PE', 'Santa Casa de Misericórdia de São Paulo', 'USP', 'FUVEST', 'IAMSPE', 'UNESP', 'FMABC', 'UNIFESP', 'INEP', 'Revalida INEP'];
const lote2Done = [
  'AMRIGS - Associação Médica do Rio Grande do Sul',
  'AMP - Associação Médica do Paraná',
  'PSU-MG - Processo Seletivo Unificado de Minas Gerais',
  'HIAE/Einstein - Hospital Israelita Albert Einstein (SP)',
  'UERJ/HUPE - Hospital Universitário Pedro Ernesto (RJ)',
  'UEL - Hospital Universitário de Londrina (PR)',
  'SES-DF - Secretaria de Estado de Saúde do Distrito Federal',
  'SES-GO - Secretaria de Estado de Saúde de Goiás',
  'SURCE - Seleção Unificada para Residência Médica no Estado do Ceará',
  'UNICAMP/HC - Hospital de Clínicas da Unicamp - Campinas (SP)',
  'UFRJ/HUCFF - Hospital Universitário Clementino Fraga Filho (RJ)',
  'UFRGS/HCPA - Hospital de Clínicas de Porto Alegre (RS)'
];

const counts = {};
for (const q of gold) {
  const inst = q.institution || 'Desconhecida';
  const isLote1 = lote1Keywords.some(kw => inst.includes(kw));
  const isDone = lote2Done.includes(inst);
  if (!isLote1 && !isDone) {
    counts[inst] = (counts[inst] || 0) + 1;
  }
}

console.log('Instituições adicionais (não Lote 1 e ainda não sincronizadas) com >= 40 questões:');
for (const [k, v] of Object.entries(counts).filter(([k,v]) => v >= 40).sort((a,b) => b[1] - a[1])) {
  console.log(`  ${k}: ${v}`);
}
