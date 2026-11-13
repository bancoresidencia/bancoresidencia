import fs from 'fs';

const staging = JSON.parse(fs.readFileSync('data/staging_homologados_85pct.json', 'utf8'));
console.log(`================================================================================`);
console.log(`RELATÓRIO DE AUDITORIA DO STAGING LOCAL (ZERO COMMITS NO SUPABASE)`);
console.log(`Total Homologados: ${staging.totalHomologados}`);
console.log(`Última Atualização: ${staging.ultimaAtualizacao}`);
console.log(`================================================================================\n`);

const byCaderno = {};
const byBanca = {};
const byAno = {};

staging.decisoes.forEach((d, i) => {
  const b = d.code.split('-')[0];
  byBanca[b] = (byBanca[b] || 0) + 1;
  byCaderno[d.caderno] = (byCaderno[d.caderno] || 0) + 1;
  byAno[d.ano] = (byAno[d.ano] || 0) + 1;
});

console.log('--- DISTRIBUIÇÃO POR BANCA ---');
console.table(byBanca);

console.log('\n--- DISTRIBUIÇÃO POR CADERNO OFICIAL ---');
console.table(byCaderno);

console.log('\n--- DISTRIBUIÇÃO POR ANO ---');
console.table(byAno);

console.log('\n--- LISTA COMPLETA DAS 40 QUESTÕES HOMOLOGADAS ---');
staging.decisoes.forEach((d, i) => {
  console.log(`${(i+1).toString().padStart(2, '0')}. [${d.code}] Ano: ${d.ano} | Caderno: ${d.caderno} Q#${d.qNum} | GB: ${d.gabaritoOficialExtraido} | Sim Stmt: ${(d.similaridadeEnunciado*100).toFixed(1)}% | Sim Opt: ${(d.similaridadeAlternativa*100).toFixed(1)}%`);
});

