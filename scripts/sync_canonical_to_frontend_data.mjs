import fs from 'fs';
import path from 'path';

const catalogFile = path.resolve('data/catalogo_arvore_canonica_completa.json');
const catalog = JSON.parse(fs.readFileSync(catalogFile, 'utf8'));

const espMap = {
  'Clínica Médica': {
    file: 'src/data/clinicaMedicaData.ts',
    varName: 'clinicaMedicaHierarchy'
  },
  'Cirurgia Geral': {
    file: 'src/data/cirurgiaData.ts',
    varName: 'cirurgiaHierarchy'
  },
  'Pediatria': {
    file: 'src/data/pediatriaData.ts',
    varName: 'pediatriaHierarchy'
  },
  'Obstetrícia': {
    file: 'src/data/obstetriciaData.ts',
    varName: 'obstetriciaHierarchy'
  },
  'Ginecologia': {
    file: 'src/data/ginecologiaData.ts',
    varName: 'ginecologiaHierarchy'
  },
  'Medicina Preventiva e Social': {
    file: 'src/data/preventivaData.ts',
    varName: 'preventivaHierarchy'
  }
};

const updatedHierarchies = [];

for (const espNode of catalog.hierarquia_padrao) {
  const espName = espNode.especialidade;
  const config = espMap[espName];
  if (!config) {
    console.warn(`Aviso: Especialidade '${espName}' não mapeada em espMap.`);
    continue;
  }

  // Sanitize structure for frontend
  const cleanedHierarchy = {
    especialidade: espName,
    temas: espNode.temas.map(t => ({
      tema: t.tema,
      focos: t.focos.map(f => ({
        foco: f.foco,
        subfocos: (f.subfocos || []).map(s => {
          if (typeof s === 'string') return s;
          const node = { subfoco: s.subfoco };
          if (s.sub_subfocos && s.sub_subfocos.length > 0) {
            node.sub_subfocos = s.sub_subfocos;
          }
          return node;
        })
      }))
    }))
  };

  updatedHierarchies.push(cleanedHierarchy);

  const fileContent = `import { SpecialtyHierarchy } from '@/types';\n\nexport const ${config.varName}: SpecialtyHierarchy = ${JSON.stringify(cleanedHierarchy, null, 2)};\n`;
  fs.writeFileSync(config.file, fileContent, 'utf8');
  console.log(`✅ Atualizado: ${config.file} (${config.varName}) - ${cleanedHierarchy.temas.length} temas, ${cleanedHierarchy.temas.reduce((a, t) => a + t.focos.length, 0)} focos`);
}

// Atualizar src/data/hierarquiaCompletaFiltros.json
const fullHierarchyExport = {
  metadata: {
    ...catalog.metadata,
    updated_at: new Date().toISOString()
  },
  hierarquia_padrao: updatedHierarchies
};

fs.writeFileSync('src/data/hierarquiaCompletaFiltros.json', JSON.stringify(fullHierarchyExport, null, 2), 'utf8');
console.log('✅ Atualizado: src/data/hierarquiaCompletaFiltros.json');
