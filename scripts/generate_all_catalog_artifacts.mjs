import fs from 'fs';
import path from 'path';

const BASE_DIR = 'c:/bancoresidencia/bancoresidencia';
const raw = fs.readFileSync(path.join(BASE_DIR, 'data/catalogo_arvore_canonica_completa.json'), 'utf8');
const data = JSON.parse(raw);

console.log('Gerando catálogos individuais (JSON e MD) e mestre MD...');

// Mapeamento de nomes de arquivo
const specFileMap = {
  'Pediatria': { json: 'catalogo_pediatria.json', md: 'catalogo_pediatria.md', ts: 'src/data/pediatriaData.ts', exportName: 'pediatriaHierarchy' },
  'Ginecologia': { json: 'catalogo_ginecologia.json', md: 'catalogo_ginecologia.md', ts: 'src/data/ginecologiaData.ts', exportName: 'ginecologiaHierarchy' },
  'Obstetrícia': { json: 'catalogo_obstetricia.json', md: 'catalogo_obstetricia.md', ts: 'src/data/obstetriciaData.ts', exportName: 'obstetriciaHierarchy' },
  'Medicina Preventiva e Social': { json: 'catalogo_medicina_preventiva.json', md: 'catalogo_medicina_preventiva.md', ts: 'src/data/preventivaData.ts', exportName: 'preventivaHierarchy' },
  'Cirurgia Geral': { json: 'catalogo_cirurgia_geral.json', md: 'catalogo_cirurgia_geral.md', ts: 'src/data/cirurgiaData.ts', exportName: 'cirurgiaHierarchy' },
  'Clínica Médica': { json: 'catalogo_clinica_medica.json', md: 'catalogo_clinica_medica.md', ts: 'src/data/clinicaMedicaData.ts', exportName: 'clinicaMedicaHierarchy' }
};

function generateMarkdownForSpecialty(esp) {
  let md = `# Catálogo Canônico Oficial — ${esp.especialidade}\n`;
  md += `## Banco Residência • Versão Definitiva 2.1 (Calibrado 132.947 Questões)\n\n`;
  
  const temasCount = esp.temas.length;
  const focosCount = esp.temas.reduce((s, t) => s + t.focos.length, 0);
  const subfocosCount = esp.temas.reduce((s, t) => s + t.focos.reduce((s2, f) => s2 + f.subfocos.length, 0), 0);
  const subSubCount = esp.temas.reduce((s, t) => s + t.focos.reduce((s2, f) => s2 + f.subfocos.reduce((s3, sf) => s3 + sf.sub_subfocos.length, 0), 0), 0);

  md += `> **Métricas:** ${temasCount} Temas • ${focosCount} Focos • ${subfocosCount} Subfocos • ${subSubCount} Sub-subfocos\n\n`;
  md += `---\n\n`;

  esp.temas.forEach((t, tIdx) => {
    md += `### ${tIdx + 1}. Tema: ${t.tema}\n\n`;
    t.focos.forEach((f, fIdx) => {
      md += `#### ${tIdx + 1}.${fIdx + 1} Foco: ${f.foco}\n\n`;
      f.subfocos.forEach((sf, sfIdx) => {
        const qStr = sf.questoes_est ? ` *(${sf.questoes_est} questões estimadas)*` : '';
        md += `* **Subfoco:** ${sf.subfoco}${qStr}\n`;
        if (sf.sub_subfocos && sf.sub_subfocos.length > 0) {
          sf.sub_subfocos.forEach(ss => {
            md += `  * ↳ \`${ss}\`\n`;
          });
        }
      });
      md += `\n`;
    });
  });

  return md;
}

// 1. Gerar arquivos por especialidade
data.hierarquia_padrao.forEach(esp => {
  const meta = specFileMap[esp.especialidade];
  if (!meta) return;

  // JSON em data/
  const jsonPath = path.join(BASE_DIR, 'data', meta.json);
  fs.writeFileSync(jsonPath, JSON.stringify(esp, null, 2), 'utf8');
  console.log(`[JSON] Criado: ${meta.json}`);

  // MD em docs/
  const mdPath = path.join(BASE_DIR, 'docs', meta.md);
  const mdContent = generateMarkdownForSpecialty(esp);
  fs.writeFileSync(mdPath, mdContent, 'utf8');
  console.log(`[MD] Criado: ${meta.md}`);

  // TS em src/data/
  const tsPath = path.join(BASE_DIR, meta.ts);
  const tsContent = `import { SpecialtyHierarchy } from '@/types';\n\nexport const ${meta.exportName}: SpecialtyHierarchy = ${JSON.stringify(esp, null, 2)};\n`;
  fs.writeFileSync(tsPath, tsContent, 'utf8');
  console.log(`[TS] Atualizado: ${meta.ts}`);
});

// 2. Gerar docs/catalogo_mestre_geral.md
let mestreMd = `# Catálogo Mestre Canônico Geral de Especialidades Médicas\n`;
mestreMd += `## Banco Residência • Arquitetura Taxonômica Unificada de 132.947 Questões\n`;
mestreMd += `### Versão Definitiva 2.1 (Zero Lixeiras • Zero Sufixos Artificiais • 5 Níveis Estritos)\n\n`;
mestreMd += `| Especialidade | Temas | Focos | Subfocos | Sub-subfocos |\n`;
mestreMd += `| :--- | :---: | :---: | :---: | :---: |\n`;

data.hierarquia_padrao.forEach(esp => {
  const t = esp.temas.length;
  const f = esp.temas.reduce((s, tm) => s + tm.focos.length, 0);
  const sf = esp.temas.reduce((s, tm) => s + tm.focos.reduce((s2, fc) => s2 + fc.subfocos.length, 0), 0);
  const ss = esp.temas.reduce((s, tm) => s + tm.focos.reduce((s2, fc) => s2 + fc.subfocos.reduce((s3, sub) => s3 + sub.sub_subfocos.length, 0), 0), 0);
  mestreMd += `| **${esp.especialidade}** | ${t} | ${f} | ${sf} | ${ss} |\n`;
});

mestreMd += `| **TOTAL GERAL** | **${data.metadata.total_temas}** | **${data.metadata.total_focos}** | **${data.metadata.total_subfocos}** | **${data.metadata.total_sub_subfocos}** |\n\n`;
mestreMd += `---\n\n`;

data.hierarquia_padrao.forEach(esp => {
  mestreMd += `\n# Especialidade: ${esp.especialidade}\n\n`;
  esp.temas.forEach((t, tIdx) => {
    mestreMd += `## ${tIdx + 1}. Tema: ${t.tema}\n\n`;
    t.focos.forEach((f, fIdx) => {
      mestreMd += `### ${tIdx + 1}.${fIdx + 1} Foco: ${f.foco}\n\n`;
      f.subfocos.forEach(sf => {
        const qStr = sf.questoes_est ? ` *(${sf.questoes_est}q)*` : '';
        mestreMd += `* **Subfoco:** ${sf.subfoco}${qStr}\n`;
        sf.sub_subfocos.forEach(ss => {
          mestreMd += `  * ↳ \`${ss}\`\n`;
        });
      });
      mestreMd += `\n`;
    });
  });
});

fs.writeFileSync(path.join(BASE_DIR, 'docs/catalogo_mestre_geral.md'), mestreMd, 'utf8');
console.log(`[MESTRE MD] Criado: docs/catalogo_mestre_geral.md`);

// 3. Atualizar src/data/hierarquiaCompletaFiltros.json
fs.writeFileSync(path.join(BASE_DIR, 'src/data/hierarquiaCompletaFiltros.json'), JSON.stringify(data, null, 2), 'utf8');
console.log(`[FRONTEND JSON] Atualizado com sucesso: src/data/hierarquiaCompletaFiltros.json`);
