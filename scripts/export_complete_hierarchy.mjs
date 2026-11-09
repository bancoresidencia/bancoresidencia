import fs from 'fs';
import path from 'path';

function loadHierarchy(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const eqIdx = content.indexOf('= {');
  const jsonStr = content.slice(eqIdx + 2, content.lastIndexOf('}') + 1);
  return JSON.parse(jsonStr);
}

const files = [
  'src/data/clinicaMedicaData.ts',
  'src/data/cirurgiaData.ts',
  'src/data/pediatriaData.ts',
  'src/data/obstetriciaData.ts',
  'src/data/ginecologiaData.ts',
  'src/data/preventivaData.ts'
];

const hierarquia = files.map(f => loadHierarchy(f));

// Também carregamos as contagens de questões para enriquecer a hierarquia
let hierarchyQuestionCounts = null;
try {
  const countsContent = fs.readFileSync('src/data/hierarchyCounts.ts', 'utf8');
  const semiMatch = countsContent.match(/export const hierarchyQuestionCounts = (\{[\s\S]*?\n\};)/);
  if (semiMatch) {
    const rawJson = semiMatch[1].slice(0, -1);
    hierarchyQuestionCounts = JSON.parse(rawJson);
  }
} catch (err) {
  console.warn('Aviso: Não foi possível carregar contagens:', err.message);
}

const summary = {};
let totalTemas = 0;
let totalFocos = 0;
let totalSubfocos = 0;

const hierarquiaEnriquecida = hierarquia.map(h => {
  const espName = h.especialidade;
  const tCount = h.temas.length;
  const fCount = h.temas.reduce((acc, t) => acc + t.focos.length, 0);
  const sCount = h.temas.reduce((acc, t) => acc + t.focos.reduce((a, f) => a + (f.subfocos?.length || 0), 0), 0);
  
  const questoesEsp = hierarchyQuestionCounts?.especialidades?.[espName] || 0;

  summary[espName] = {
    questoes: questoesEsp,
    temas: tCount,
    focos: fCount,
    subfocos: sCount
  };

  totalTemas += tCount;
  totalFocos += fCount;
  totalSubfocos += sCount;

  return {
    especialidade: espName,
    questoes_total: questoesEsp,
    total_temas: tCount,
    total_focos: fCount,
    total_subfocos: sCount,
    temas: h.temas.map(t => {
      const questoesTema = hierarchyQuestionCounts?.temas?.[t.tema] || 0;
      return {
        tema: t.tema,
        questoes_tema: questoesTema,
        total_focos: t.focos.length,
        total_subfocos: t.focos.reduce((acc, f) => acc + (f.subfocos?.length || 0), 0),
        focos: t.focos.map(f => {
          const questoesFoco = hierarchyQuestionCounts?.focos?.[f.foco] || 0;
          return {
            foco: f.foco,
            questoes_foco: questoesFoco,
            total_subfocos: f.subfocos?.length || 0,
            subfocos: (f.subfocos || []).map(s => {
              const questoesSub = hierarchyQuestionCounts?.subfocos?.[s] || 0;
              return {
                subfoco: s,
                questoes_subfoco: questoesSub
              };
            })
          };
        })
      };
    })
  };
});

const resultJson = {
  metadata: {
    versao: '1.0.0',
    descricao: 'Hierarquia clínica completa de filtros de questões médicas (Especialidade > Tema > Foco > Subfoco)',
    data_geracao: new Date().toISOString(),
    total_especialidades: hierarquia.length,
    total_temas: totalTemas,
    total_focos: totalFocos,
    total_subfocos: totalSubfocos,
    estatisticas_por_especialidade: summary
  },
  // Formato hierárquico padrão compatível com SpecialtyHierarchy
  hierarquia_padrao: hierarquia.map(h => ({
    especialidade: h.especialidade,
    temas: h.temas.map(t => ({
      tema: t.tema,
      focos: t.focos.map(f => ({
        foco: f.foco,
        subfocos: (f.subfocos || []).map(s => typeof s === 'string' ? s : s.subfoco)
      }))
    }))
  })),
  // Formato enriquecido com métricas de questões por nível
  hierarquia_enriquecida: hierarquiaEnriquecida
};

// 1. Grava JSON em data/ e src/data/
if (!fs.existsSync('data')) fs.mkdirSync('data');
fs.writeFileSync('data/hierarquia_completa_filtros.json', JSON.stringify(resultJson, null, 2), 'utf8');
fs.writeFileSync('src/data/hierarquiaCompletaFiltros.json', JSON.stringify(resultJson, null, 2), 'utf8');

// 2. Grava formato tabular CSV em data/ (UTF-8 com BOM para Excel)
const csvRows = ['Especialidade,Tema,Foco,Subfoco,Questoes_Subfoco,Questoes_Foco,Questoes_Tema,Questoes_Especialidade'];
for (const esp of hierarquiaEnriquecida) {
  for (const tema of esp.temas) {
    for (const foco of tema.focos) {
      if (foco.subfocos && foco.subfocos.length > 0) {
        for (const sub of foco.subfocos) {
          csvRows.push([
            esp.especialidade,
            tema.tema,
            foco.foco,
            sub.subfoco,
            sub.questoes_subfoco,
            foco.questoes_foco,
            tema.questoes_tema,
            esp.questoes_total
          ].map(v => typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v).join(','));
        }
      } else {
        csvRows.push([
          esp.especialidade,
          tema.tema,
          foco.foco,
          '',
          0,
          foco.questoes_foco,
          tema.questoes_tema,
          esp.questoes_total
        ].map(v => typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v).join(','));
      }
    }
  }
}

fs.writeFileSync('data/hierarquia_completa_filtros.csv', '\uFEFF' + csvRows.join('\r\n'), 'utf8');

// 3. Grava Markdown estruturado em docs/ para consulta humana rápida
let md = `# Hierarquia Clínica Completa dos Filtros

> Documento gerado automaticamente com toda a taxonomia clínica de 4 níveis (**Especialidade**, **Tema**, **Foco**, **Subfoco**) utilizada pelos filtros da plataforma.

## Sumário Executivo

| Especialidade | Questões na Base | Temas | Focos | Subfocos |
| :--- | :---: | :---: | :---: | :---: |
`;

for (const [esp, stat] of Object.entries(summary)) {
  md += `| **${esp}** | ${stat.questoes.toLocaleString('pt-BR')} | ${stat.temas} | ${stat.focos} | ${stat.subfocos} |\n`;
}

md += `| **TOTAL** | **132.965+** | **${totalTemas}** | **${totalFocos}** | **${totalSubfocos}** |\n\n`;

md += `## Detalhamento Completo por Especialidade\n\n`;

for (const esp of hierarquiaEnriquecida) {
  md += `### 🩺 ${esp.especialidade} (${esp.questoes_total.toLocaleString('pt-BR')} questões)\n\n`;
  for (const tema of esp.temas) {
    md += `#### 📁 Tema: ${tema.tema} (${tema.questoes_tema.toLocaleString('pt-BR')} questões, ${tema.total_focos} focos)\n\n`;
    for (const foco of tema.focos) {
      md += `- **🎯 Foco:** ${foco.foco} *(${foco.questoes_foco.toLocaleString('pt-BR')} q.)*\n`;
      if (foco.subfocos && foco.subfocos.length > 0) {
        for (const sub of foco.subfocos) {
          md += `  - 🔹 *Subfoco:* ${sub.subfoco} *(${sub.questoes_subfoco} q.)*\n`;
        }
      }
    }
    md += '\n';
  }
  md += '\n---\n\n';
}

if (!fs.existsSync('docs')) fs.mkdirSync('docs');
fs.writeFileSync('docs/hierarquia_completa_filtros.md', md, 'utf8');

console.log('✅ Exportação concluída com sucesso!');
console.log(`- JSON (data): data/hierarquia_completa_filtros.json (${(fs.statSync('data/hierarquia_completa_filtros.json').size / 1024).toFixed(1)} KB)`);
console.log(`- JSON (src/data): src/data/hierarquiaCompletaFiltros.json (${(fs.statSync('src/data/hierarquiaCompletaFiltros.json').size / 1024).toFixed(1)} KB)`);
console.log(`- CSV (data): data/hierarquia_completa_filtros.csv (${(fs.statSync('data/hierarquia_completa_filtros.csv').size / 1024).toFixed(1)} KB, ${csvRows.length - 1} linhas)`);
console.log(`- Markdown (docs): docs/hierarquia_completa_filtros.md (${(fs.statSync('docs/hierarquia_completa_filtros.md').size / 1024).toFixed(1)} KB)`);

