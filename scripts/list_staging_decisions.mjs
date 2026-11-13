import fs from 'fs';

const staging = JSON.parse(fs.readFileSync('data/staging_homologados_85pct.json', 'utf8'));
console.log('Total decisions:', staging.decisoes.length);
staging.decisoes.forEach((d, idx) => {
  console.log(`${idx + 1}. [${d.code}] Ano: ${d.ano} | Gab: ${d.gabaritoMapeadoNoBanco} | Caderno: ${d.caderno} Q${d.qNum}`);
});
