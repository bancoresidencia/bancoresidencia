import fs from 'fs';

const pth = 'data/staging_homologados_85pct.json';
if (fs.existsSync(pth)) {
  const data = JSON.parse(fs.readFileSync(pth, 'utf8'));
  console.log('Total homologados em staging_homologados_85pct.json:', data.totalHomologados || (data.decisoes && data.decisoes.length));
  if (data.decisoes && data.decisoes.length > 0) {
    console.log('Amostra de 3 decisões:', data.decisoes.slice(0, 3));
    const porInst = {};
    for (const d of data.decisoes) {
      porInst[d.instituicao || d.banca || 'sem inst'] = (porInst[d.instituicao || d.banca || 'sem inst'] || 0) + 1;
    }
    console.log('Por instituição:', porInst);
  }
} else {
  console.log('Não existe.');
}
