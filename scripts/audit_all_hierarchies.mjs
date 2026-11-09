import fs from 'fs';
import path from 'path';

const BASE_DIR = 'c:/bancoresidencia/bancoresidencia';
const hJsonPath = path.join(BASE_DIR, 'src/data/hierarquiaCompletaFiltros.json');
const hJson = JSON.parse(fs.readFileSync(hJsonPath, 'utf8'));

console.log('=== AUDITORIA COMPLETA DE TODAS AS ESPECIALIDADES ===');

const hPadrao = hJson.hierarquia_padrao;

hPadrao.forEach(esp => {
  console.log(`\n======================================================`);
  console.log(`ESPECIALIDADE: ${esp.especialidade} (${esp.temas.length} temas)`);
  console.log(`======================================================`);
  
  // 1. Temas sobrepostos
  const temaList = esp.temas.map(t => t.tema);
  for (let i = 0; i < temaList.length; i++) {
    for (let j = i + 1; j < temaList.length; j++) {
      const t1 = temaList[i].toLowerCase();
      const t2 = temaList[j].toLowerCase();
      if (t1 === t2) {
        console.log(`  [TEMA EXATAMENTE DUPLICADO]: "${temaList[i]}"`);
      } else if (t1.includes(t2) || t2.includes(t1)) {
        console.log(`  [TEMA SOBREPOSTO]:\n    1: "${temaList[i]}"\n    2: "${temaList[j]}"`);
      }
    }
  }

  // 2. Focos
  const focoList = [];
  let totalSubfocos = 0;
  let totalArtificiais = 0;
  const artificialExamples = [];

  esp.temas.forEach(t => {
    t.focos.forEach(f => {
      focoList.push({ tema: t.tema, foco: f.foco, subfocos: f.subfocos });
      f.subfocos.forEach(sf => {
        totalSubfocos++;
        const sfName = typeof sf === 'string' ? sf : sf.subfoco;
        if (sfName.includes(': Diagnóstico e Conduta') || sfName.includes(': Diagnóstico e Tratamento')) {
          totalArtificiais++;
          if (artificialExamples.length < 3) {
            artificialExamples.push(`Foco: "${f.foco}" -> Subfoco: "${sfName}"`);
          }
        }
      });
    });
  });

  // Focos duplicados
  for (let i = 0; i < focoList.length; i++) {
    for (let j = i + 1; j < focoList.length; j++) {
      const f1 = focoList[i].foco.toLowerCase().trim();
      const f2 = focoList[j].foco.toLowerCase().trim();
      if (f1 === f2) {
        console.log(`  [FOCO DUPLICADO]: "${focoList[i].foco}"\n    em Tema 1: "${focoList[i].tema}"\n    em Tema 2: "${focoList[j].tema}"`);
      }
    }
  }

  console.log(`  Total focos: ${focoList.length}`);
  console.log(`  Total subfocos: ${totalSubfocos}`);
  console.log(`  Subfocos artificiais (: Diagnóstico e Conduta): ${totalArtificiais}`);
  if (artificialExamples.length > 0) {
    console.log(`  Exemplos de artificiais:`);
    artificialExamples.forEach(ex => console.log(`    - ${ex}`));
  }
});

console.log('\n======================================================');
console.log('5. DETALHE DO FOCO MALFORMADO "Clínica" EM PEDIATRIA:');

const ped = hPadrao.find(e => e.especialidade === 'Pediatria');
ped.temas.forEach(t => {
  t.focos.forEach(f => {
    if (f.foco === 'Clínica' || f.subfocos.some(sf => (typeof sf === 'string' ? sf : sf.subfoco).startsWith(':'))) {
      console.log('Tema:', t.tema);
      console.log('Foco:', f.foco);
      console.log('Subfocos:', f.subfocos);
    }
  });
});
