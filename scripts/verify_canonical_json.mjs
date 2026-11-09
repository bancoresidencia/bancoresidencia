import fs from 'fs';

const raw = fs.readFileSync('data/catalogo_arvore_canonica_completa.json', 'utf8');
const data = JSON.parse(raw);

console.log('=== AUDITORIA DO JSON GERADO (data/catalogo_arvore_canonica_completa.json) ===');
console.log('Metadados:', data.metadata);

let totalSubSub = 0;
let artificialCount = 0;
const globalFocos = new Map();
const temasNaEsp = new Map();

data.hierarquia_padrao.forEach(esp => {
  const eName = esp.especialidade;
  temasNaEsp.set(eName, new Set());

  esp.temas.forEach(t => {
    if (temasNaEsp.get(eName).has(t.tema)) {
      console.log(`[TEMA DUPLICADO EM ${eName}]:`, t.tema);
    }
    temasNaEsp.get(eName).add(t.tema);

    t.focos.forEach(f => {
      if (!globalFocos.has(f.foco)) globalFocos.set(f.foco, []);
      globalFocos.get(f.foco).push(`${eName} > ${t.tema}`);

      f.subfocos.forEach(s => {
        if (s.subfoco.includes(': Diagnóstico e Conduta') || s.subfoco.includes(': Diagnóstico e Tratamento')) {
          artificialCount++;
          console.log('[SUBFOCO ARTIFICIAL]:', s.subfoco);
        }
        totalSubSub += s.sub_subfocos.length;
      });
    });
  });
});

console.log('Subfocos artificiais encontrados:', artificialCount);
console.log('Total de Sub-subfocos apurados:', totalSubSub);

console.log('\n--- Focos que aparecem em mais de 1 local ---');
let cruzadosCount = 0;
for (const [foco, locs] of globalFocos.entries()) {
  if (locs.length > 1) {
    cruzadosCount++;
    console.log(`- "${foco}":`);
    locs.forEach(l => console.log(`    ${l}`));
  }
}
console.log('Total de focos cruzados:', cruzadosCount);
