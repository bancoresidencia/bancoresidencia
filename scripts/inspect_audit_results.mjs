import fs from 'fs';

const data = JSON.parse(fs.readFileSync('data/cruzamento_ultimas_provas_audit.json', 'utf8'));
console.log('Hubs:', Object.keys(data.hubs));
console.log('Resumo:', data.resumoTotal);
console.log('\nMatches SES-GO encontrados:');
for (const m of data.hubs['SES-GO'].detalhes) {
  console.log(`- ${m.code} (${m.year} ${m.especialidade}) -> Q#${m.qNum} GB=${m.gabaritoOficial} (Stmt: ${(m.stmtSim*100).toFixed(1)}%, Opt: ${(m.optSim*100).toFixed(1)}%)`);
  console.log(`  Enunciado: ${m.statementSnippet}...`);
}
