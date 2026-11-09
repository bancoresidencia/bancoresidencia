import fs from 'fs';

const data = JSON.parse(fs.readFileSync('data/catalogo_arvore_canonica_completa.json', 'utf8'));

console.log('=== DISTRIBUIÇÃO HIERÁRQUICA CANÔNICA (79 TEMAS) ===\n');

let totalTemas = 0;
let totalFocos = 0;
let totalSubfocos = 0;
let totalSubSubs = 0;

const focosPerTema = [];
const subfocosPerFoco = [];
const subsubsPerFoco = [];
const subsubsPerSubfoco = [];

data.hierarquia_padrao.forEach(esp => {
  console.log('-------------------------------------------------------------------------------------------------------------------------');
  console.log(`ESPECIALIDADE: ${esp.especialidade} (${esp.temas.length} temas)`);
  console.log('-------------------------------------------------------------------------------------------------------------------------');
  
  esp.temas.forEach((t, tIdx) => {
    totalTemas++;
    const numFocos = t.focos.length;
    focosPerTema.push(numFocos);
    
    let temaSubfocos = 0;
    let temaSubSubs = 0;
    
    t.focos.forEach(f => {
      totalFocos++;
      const numSub = f.subfocos.length;
      subfocosPerFoco.push(numSub);
      temaSubfocos += numSub;
      
      let focoSubSubs = 0;
      f.subfocos.forEach(s => {
        totalSubfocos++;
        const numSS = s.sub_subfocos ? s.sub_subfocos.length : 0;
        subsubsPerSubfoco.push(numSS);
        focoSubSubs += numSS;
        totalSubSubs += numSS;
      });
      subsubsPerFoco.push(focoSubSubs);
      temaSubSubs += focoSubSubs;
    });
    
    const mediaSubPorFoco = (temaSubfocos / numFocos).toFixed(1);
    const mediaSSPorFoco = (temaSubSubs / numFocos).toFixed(1);
    console.log(`  ${(tIdx+1).toString().padStart(2, ' ')}. ${t.tema.padEnd(56, ' ')} | Focos: ${numFocos.toString().padStart(2, ' ')} | Subfocos: ${temaSubfocos.toString().padStart(3, ' ')} (méd ${mediaSubPorFoco}/foco) | Sub-subs: ${temaSubSubs.toString().padStart(3, ' ')} (méd ${mediaSSPorFoco}/foco)`);
  });
});

console.log('\n=========================================================================================================================');
console.log('RESUMO ESTATÍSTICO GLOBAL:');
console.log('=========================================================================================================================');
const avg = arr => (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(2);
const min = arr => Math.min(...arr);
const max = arr => Math.max(...arr);

console.log(`1. FOCOS POR TEMA:`);
console.log(`   - Média: ${avg(focosPerTema)} focos por tema`);
console.log(`   - Mínimo: ${min(focosPerTema)} | Máximo: ${max(focosPerTema)}`);

console.log(`\n2. SUBFOCOS POR FOCO:`);
console.log(`   - Média: ${avg(subfocosPerFoco)} subfocos por foco`);
console.log(`   - Mínimo: ${min(subfocosPerFoco)} | Máximo: ${max(subfocosPerFoco)}`);

console.log(`\n3. SUB-SUBFOCOS POR FOCO:`);
console.log(`   - Média: ${avg(subsubsPerFoco)} sub-subfocos por foco`);
console.log(`   - Mínimo: ${min(subsubsPerFoco)} | Máximo: ${max(subsubsPerFoco)}`);

console.log(`\n4. SUB-SUBFOCOS POR SUBFOCO:`);
console.log(`   - Média: ${avg(subsubsPerSubfoco)} sub-subfocos por subfoco`);
console.log(`   - Mínimo: ${min(subsubsPerSubfoco)} | Máximo: ${max(subsubsPerSubfoco)}`);

console.log(`\n5. INVARIANTE N >= 2 (Nenhum nó filho único):`);
console.log(`   - Focos com < 2 subfocos: ${subfocosPerFoco.filter(n => n < 2).length}`);
console.log(`   - Subfocos com < 2 sub-subfocos: ${subsubsPerSubfoco.filter(n => n < 2).length}`);

