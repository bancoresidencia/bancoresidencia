import fs from 'fs';
import path from 'path';

// 1. Carregar catálogo oficial de provas
const catalogPath = path.join(process.cwd(), 'src', 'data', 'officialExamsData.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const instMap = new Map(catalog.institutions.map((i) => [i.id, i]));

console.log('--- Censo Detalhado de Integridade de Editais e Gaps de Provas ---');
console.log(`Total de Instituições: ${catalog.institutions.length}`);
console.log(`Total de Exames: ${catalog.exams.length}`);

// Conjunto de editais oficiais padrão reconhecidos no Brasil
const STANDARD_TIERS = [120, 100, 80, 75, 60, 50, 45, 40, 30, 25];

function findClosestTier(total) {
  let closest = STANDARD_TIERS[0];
  let minDiff = Math.abs(total - closest);
  for (const tier of STANDARD_TIERS) {
    const diff = Math.abs(total - tier);
    if (diff < minDiff) {
      minDiff = diff;
      closest = tier;
    }
  }
  return { tier: closest, diff: minDiff };
}

const audit = {
  total: catalog.exams.length,
  exactEditalCount: 0,       // qCount bate exatamente com um edital padrão
  annulledReconciliation: 0, // qCount + annulledCount bate exatamente com um edital padrão
  trueOcrGaps: [],           // faltam de 1 a 8 questões para fechar um edital padrão
  customSpecialEdital: []    // provas com formatos específicos ou fragmentados
};

for (const exam of catalog.exams) {
  const inst = instMap.get(exam.locationId);
  const instName = inst?.shortName || inst?.name || 'Desconhecida';
  const qCount = exam.questionCount || 0;
  const annCount = exam.annulledCount || 0;
  const sumCount = qCount + annCount;

  if (STANDARD_TIERS.includes(qCount)) {
    audit.exactEditalCount++;
  } else if (STANDARD_TIERS.includes(sumCount)) {
    audit.annulledReconciliation++;
  } else {
    const { tier, diff } = findClosestTier(sumCount);
    if (diff > 0 && diff <= 8 && sumCount < tier) {
      audit.trueOcrGaps.push({
        id: exam.id,
        institution: instName,
        year: exam.year,
        booklet: exam.booklet,
        modality: exam.modality,
        questionCount: qCount,
        annulledCount: annCount,
        sum: sumCount,
        expectedTier: tier,
        missingQuestions: tier - sumCount
      });
    } else {
      audit.customSpecialEdital.push({
        id: exam.id,
        institution: instName,
        year: exam.year,
        booklet: exam.booklet,
        modality: exam.modality,
        questionCount: qCount,
        annulledCount: annCount,
        sum: sumCount
      });
    }
  }
}

console.log(`\n1. Exames com contagem exata de edital (100, 80, 75, 50, etc.): ${audit.exactEditalCount}`);
console.log(`2. Exames reconciliados por anulações (qCount + anuladas = edital): ${audit.annulledReconciliation}`);
console.log(`3. Exames com gaps reais de extração OCR/PDF (1 a 8 faltantes): ${audit.trueOcrGaps.length}`);
console.log(`4. Exames em formatos específicos / fragmentados: ${audit.customSpecialEdital.length}`);

// Salvar relatório Markdown e JSON
const outDir = path.join(process.cwd(), 'docs');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const mdContent = `# 📋 Censo Estruturado de Integridade de Editais e Gaps de Provas

> **Data de Emissão:** 01/11/2026  
> **Escopo:** Análise e classificação de todos os 2.261 cadernos oficiais cadastrados.

---

## 1. Quadro Geral de Diagnóstico

| Categoria | Volume | % do Acervo | Diagnóstico e Ação |
| :--- | :---: | :---: | :--- |
| **1. Contagem Exata de Edital** | **${audit.exactEditalCount}** | **${((audit.exactEditalCount / audit.total) * 100).toFixed(1)}%** | O número de questões no banco bate 100% com o padrão oficial (100, 80, 75, 50, etc.). |
| **2. Reconciliados por Anulação** | **${audit.annulledReconciliation}** | **${((audit.annulledReconciliation / audit.total) * 100).toFixed(1)}%** | As questões ativas somadas às anuladas fecham exatamente o edital. **Ação de UI:** Exibir total nominal. |
| **3. Gaps Reais de OCR / Extração** | **${audit.trueOcrGaps.length}** | **${((audit.trueOcrGaps.length / audit.total) * 100).toFixed(1)}%** | Faltam de 1 a 8 questões para fechar o caderno (falha em imagens/tabelas no OCR antigo). **Ação:** Reprocessar via Gemini Vision. |
| **4. Editais Específicos / Fragmentados** | **${audit.customSpecialEdital.length}** | **${((audit.customSpecialEdital.length / audit.total) * 100).toFixed(1)}%** | Provas de módulos complementares ou editais regionais atípicos. |
| **Total Analisado** | **${audit.total}** | **100%** | Universo de provas no banco |

---

## 2. Amostra de Provas com Gaps Reais de OCR (Alvo do Gemini Vision)

| ID | Instituição | Ano | Caderno | Questões no Banco | Anuladas | Soma | Edital Previsto | Faltantes |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
${audit.trueOcrGaps.slice(0, 30).map(g => `| \`${g.id}\` | ${g.institution} | ${g.year} | ${g.booklet || 'Geral'} | ${g.questionCount} | ${g.annulledCount} | ${g.sum} | ${g.expectedTier} questões | **${g.missingQuestions}** |`).join('\n')}

---

## 3. Diretrizes de Correção Aplicadas
1. **Frontend / UX:** O card de provas calcula o total nominal da prova e adiciona badges informativas sobre questões anuladas e editais diferenciados.
2. **Pipeline Gemini Vision:** Scripts específicos recuperam apenas as páginas dos itens faltantes das ${audit.trueOcrGaps.length} provas mapeadas.
`;

fs.writeFileSync(path.join(outDir, 'relatorio_auditoria_gaps_e_editais.md'), mdContent, 'utf8');

// Salvar também JSON de dados para consumo pelo pipeline de reprocessamento
fs.writeFileSync(
  path.join(process.cwd(), 'src', 'data', 'examGapsAudit.json'),
  JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total: audit.total,
      exactEditalCount: audit.exactEditalCount,
      annulledReconciliation: audit.annulledReconciliation,
      trueOcrGapsCount: audit.trueOcrGaps.length,
      customSpecialEditalCount: audit.customSpecialEdital.length
    },
    trueOcrGaps: audit.trueOcrGaps
  }, null, 2),
  'utf8'
);

console.log('Relatórios gerados em docs/relatorio_auditoria_gaps_e_editais.md e src/data/examGapsAudit.json com sucesso!');
