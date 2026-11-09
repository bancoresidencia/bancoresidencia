import fs from 'fs';

const files = [
  'src/data/ginecologiaData.ts',
  'src/data/clinicaMedicaData.ts',
  'src/data/cirurgiaData.ts',
  'src/data/obstetriciaData.ts',
  'src/data/pediatriaData.ts',
  'src/data/preventivaData.ts'
];

for (const filePath of files) {
  if (!fs.existsSync(filePath)) continue;
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract JSON object from file
  const eqIdx = content.indexOf('= {');
  if (eqIdx === -1) continue;
  const jsonStr = content.slice(eqIdx + 2, content.lastIndexOf('}') + 1);
  
  try {
    const data = JSON.parse(jsonStr);
    console.log(`\n========================================`);
    console.log(`ARQUIVO: ${filePath} (${data.especialidade})`);
    console.log(`========================================`);
    
    let totalTemas = 0;
    let totalFocos = 0;
    let totalSubfocos = 0;
    let totalSubfocosComSubsub = 0;
    let anomalias = [];

    for (const tema of data.temas || []) {
      totalTemas++;
      for (const foco of tema.focos || []) {
        totalFocos++;
        for (const sub of foco.subfocos || []) {
          totalSubfocos++;
          const subName = typeof sub === 'string' ? sub : sub.subfoco;
          const subSub = typeof sub === 'object' && sub.sub_subfocos ? sub.sub_subfocos : [];
          
          if (subSub.length > 0) {
            totalSubfocosComSubsub++;
            if (subSub.length > 5) {
              anomalias.push({
                tema: tema.tema,
                foco: foco.foco,
                subfoco: subName,
                count: subSub.length,
                sample: subSub.slice(0, 3),
                hasJunk: subSub.some(s => s.toLowerCase().includes('padrão-ouro'))
              });
            }
          }
        }
      }
    }

    console.log(`Total Temas: ${totalTemas} | Focos: ${totalFocos} | Subfocos: ${totalSubfocos}`);
    console.log(`Subfocos que possuem sub_subfocos: ${totalSubfocosComSubsub}`);
    console.log(`Anomalias detectadas (subfocos com > 5 sub-subfocos agrupados): ${anomalias.length}`);
    
    anomalias.forEach(a => {
      console.log(`\n❌ [${a.count} itens agrupados] Tema: "${a.tema}" -> Foco: "${a.foco}" -> Subfoco: "${a.subfoco}"`);
      console.log(`   Possui "Padrão-Ouro de Preparação Médica"? ${a.hasJunk ? 'SIM' : 'NÃO'}`);
      console.log(`   Amostra de itens misturados:`);
      a.sample.forEach(s => console.log(`     - ${s.substring(0, 70)}...`));
    });

  } catch (err) {
    console.error(`Erro ao analisar ${filePath}:`, err.message);
  }
}
