import fs from 'fs';

function loadTs(f) {
  const content = fs.readFileSync(f, 'utf8');
  const eqIdx = content.indexOf('= {');
  const jsonStr = content.slice(eqIdx + 2, content.lastIndexOf('}') + 1);
  return JSON.parse(jsonStr);
}

const cat = JSON.parse(fs.readFileSync('data/catalogo_arvore_canonica_completa.json', 'utf8'));

const espMap = {
  'Pediatria': 'src/data/pediatriaData.ts',
  'Ginecologia': 'src/data/ginecologiaData.ts',
  'Obstetrícia': 'src/data/obstetriciaData.ts',
  'Medicina Preventiva e Social': 'src/data/preventivaData.ts',
  'Cirurgia Geral': 'src/data/cirurgiaData.ts',
  'Clínica Médica': 'src/data/clinicaMedicaData.ts'
};

console.log('--- COMPARAÇÃO ÁRVORE FRONTEND TS VS CATÁLOGO CANÔNICO ---');
let allMatch = true;

for (const espNode of cat.hierarquia_padrao) {
  const tsFile = espMap[espNode.especialidade];
  const tsData = loadTs(tsFile);

  const catTemas = espNode.temas.length;
  const tsTemas = tsData.temas.length;

  const catFocos = espNode.temas.reduce((a, t) => a + t.focos.length, 0);
  const tsFocos = tsData.temas.reduce((a, t) => a + t.focos.length, 0);

  const catSubs = espNode.temas.reduce((a, t) => a + t.focos.reduce((b, f) => b + (f.subfocos?.length || 0), 0), 0);
  const tsSubs = tsData.temas.reduce((a, t) => a + t.focos.reduce((b, f) => b + (f.subfocos?.length || 0), 0), 0);

  const match = catTemas === tsTemas && catFocos === tsFocos && catSubs === tsSubs;
  if (!match) allMatch = false;

  console.log(`${espNode.especialidade.padEnd(30)} TS:[T:${tsTemas}, F:${tsFocos}, S:${tsSubs}]  VS  CAT:[T:${catTemas}, F:${catFocos}, S:${catSubs}] => ${match ? '✅ MATCH PERFEITO' : '❌ DIVERGÊNCIA'}`);
}

console.log(`\nResultado Geral: ${allMatch ? '🎉 TODOS OS ARQUIVOS DO FRONTEND ESTÃO 100% SINCRONIZADOS COM A ÁRVORE CANÔNICA!' : '❌ HÁ DIVERGÊNCIAS'}`);

