import fs from 'fs';
import path from 'path';

const files = [
  'data/cirurgia_final_questions.json',
  'data/clinica_medica_final_questions.json',
  'data/ginecologia_final_questions.json',
  'data/obstetricia_final_questions.json',
  'data/pediatria_final_questions.json',
  'data/medicina_preventiva_final_questions.json',
  'data/urologia_final_questions.json'
];

function normTipo(t) {
  if (!t || t.trim() === '' || t.trim() === 'Prova 1') return 'Prova 1 / Regular';
  return t.trim();
}

function escapeCsv(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatOptions(options) {
  if (!Array.isArray(options) || options.length === 0) return '';
  return options
    .map(opt => `${opt.letter || ''}) ${opt.text || ''}`.trim())
    .join(' \n ');
}

console.log('--- Iniciando processamento do banco de questões ---');

const examsMap = new Map();
const seenIds = new Set();
let duplicatesSkipped = 0;

for (const filePath of files) {
  if (!fs.existsSync(filePath)) {
    console.warn(`Arquivo não encontrado: ${filePath}`);
    continue;
  }
  console.log(`Carregando: ${filePath}`);
  const list = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  for (const q of list) {
    if (!q.id) continue;
    if (seenIds.has(q.id)) {
      duplicatesSkipped++;
      continue;
    }
    seenIds.add(q.id);

    const inst = (q.institution || 'Não informada').trim();
    const banca = (q.banca || inst).trim();
    const year = Number(q.year) || 0;
    const tipo = normTipo(q.tipo_prova || q.tipoProva);

    const examKey = [inst, banca, year, tipo].join(' | ');

    if (!examsMap.has(examKey)) {
      examsMap.set(examKey, {
        instituicao: inst,
        banca: banca,
        ano: year,
        tipo_prova: tipo,
        total_questoes: 0,
        com_gabarito: 0,
        anuladas: 0,
        discursivas: 0,
        faltam: 0,
        missingQuestions: []
      });
    }

    const exam = examsMap.get(examKey);
    exam.total_questoes++;

    const isAnulada = Boolean(q.isAnulada || q.is_anulada);
    const isDissertativa = q.type === 'Discursiva' || q.type === 'Dissertativa' || (!q.options || q.options.length === 0);
    const ans = (q.correctAnswer || q.correct_answer || '').trim();

    if (isAnulada) {
      exam.anuladas++;
    } else if (isDissertativa) {
      exam.discursivas++;
    } else if (ans) {
      exam.com_gabarito++;
    } else {
      exam.faltam++;
      exam.missingQuestions.push(q);
    }
  }
}

console.log(`\nQuestões únicas processadas: ${seenIds.size.toLocaleString('pt-BR')}`);
console.log(`Duplicatas ignoradas entre arquivos: ${duplicatesSkipped.toLocaleString('pt-BR')}`);
console.log(`Total de provas únicas (Inst x Banca x Ano x Tipo): ${examsMap.size.toLocaleString('pt-BR')}`);

// 1. Gerar CSV Geral: data/relatorio_provas_instituicoes_ano.csv
const csv1Headers = [
  'instituicao',
  'banca',
  'ano',
  'tipo_prova',
  'total_questoes_unicas',
  'com_gabarito_valido',
  'anuladas_oficiais',
  'discursivas_segunda_fase',
  'total_auditadas_resolvidas',
  'faltam_gabaritos',
  'percentual_cobertura'
];

const csv1Lines = [csv1Headers.join(',')];

// Ordenar por Instituição, depois Ano descendente, depois Banca
const sortedExams = Array.from(examsMap.values()).sort((a, b) => {
  if (a.instituicao.localeCompare(b.instituicao) !== 0) {
    return a.instituicao.localeCompare(b.instituicao);
  }
  if (b.ano !== a.ano) return b.ano - a.ano;
  return a.banca.localeCompare(b.banca);
});

let grandTotal = 0;
let grandWithAns = 0;
let grandAnuladas = 0;
let grandDiscursivas = 0;
let grandFaltam = 0;

for (const e of sortedExams) {
  const auditadas = e.com_gabarito + e.anuladas + e.discursivas;
  const pct = e.total_questoes > 0 ? ((auditadas / e.total_questoes) * 100).toFixed(1) : '0.0';

  grandTotal += e.total_questoes;
  grandWithAns += e.com_gabarito;
  grandAnuladas += e.anuladas;
  grandDiscursivas += e.discursivas;
  grandFaltam += e.faltam;

  csv1Lines.push([
    escapeCsv(e.instituicao),
    escapeCsv(e.banca),
    escapeCsv(e.ano),
    escapeCsv(e.tipo_prova),
    escapeCsv(e.total_questoes),
    escapeCsv(e.com_gabarito),
    escapeCsv(e.anuladas),
    escapeCsv(e.discursivas),
    escapeCsv(auditadas),
    escapeCsv(e.faltam),
    escapeCsv(pct + '%')
  ].join(','));
}

const csv1Path = path.resolve('data/relatorio_provas_instituicoes_ano.csv');
fs.writeFileSync(csv1Path, '\ufeff' + csv1Lines.join('\n'), 'utf8');
console.log(`✅ CSV 1 gerado: ${csv1Path} (${sortedExams.length} linhas)`);

// 2. Gerar CSV com Enunciados das Questões Faltantes (onde 1 <= faltam <= 10)
const csv2Headers = [
  'instituicao',
  'banca',
  'ano',
  'tipo_prova',
  'faltam_na_prova',
  'questao_id',
  'codigo',
  'especialidade',
  'tema',
  'foco',
  'subfoco',
  'enunciado',
  'opcoes'
];

const csv2Lines = [csv2Headers.join(',')];
let exportedQuestionsCount = 0;
let targetExamsCount = 0;

for (const e of sortedExams) {
  if (e.faltam > 0 && e.faltam <= 10) {
    targetExamsCount++;
    for (const q of e.missingQuestions) {
      exportedQuestionsCount++;
      csv2Lines.push([
        escapeCsv(e.instituicao),
        escapeCsv(e.banca),
        escapeCsv(e.ano),
        escapeCsv(e.tipo_prova),
        escapeCsv(e.faltam),
        escapeCsv(q.id || ''),
        escapeCsv(q.code || ''),
        escapeCsv(q.especialidade || q.specialty || ''),
        escapeCsv(q.tema || ''),
        escapeCsv(q.foco || ''),
        escapeCsv(q.subfoco || ''),
        escapeCsv(q.statement || ''),
        escapeCsv(formatOptions(q.options))
      ].join(','));
    }
  }
}

const csv2Path = path.resolve('data/questoes_faltantes_max10.csv');
fs.writeFileSync(csv2Path, '\ufeff' + csv2Lines.join('\n'), 'utf8');
console.log(`✅ CSV 2 gerado: ${csv2Path} (${exportedQuestionsCount} questões em ${targetExamsCount} provas)`);

// 3. Salvar resumo em JSON para geração do Relatório Markdown
const summary = {
  dataGeracao: new Date().toISOString(),
  totalQuestoesUnicas: grandTotal,
  totalAuditadas: grandWithAns + grandAnuladas + grandDiscursivas,
  totalGabaritosValidos: grandWithAns,
  totalAnuladas: grandAnuladas,
  totalDiscursivas: grandDiscursivas,
  totalFaltantes: grandFaltam,
  percentualAuditado: (((grandWithAns + grandAnuladas + grandDiscursivas) / grandTotal) * 100).toFixed(2),
  totalProvasUnicas: sortedExams.length,
  provasZeroFaltantes: sortedExams.filter(e => e.faltam === 0).length,
  provasMax10Faltantes: targetExamsCount,
  questoesMax10Faltantes: exportedQuestionsCount
};

fs.writeFileSync('data/relatorio_provas_resumo.json', JSON.stringify(summary, null, 2), 'utf8');
console.log('✅ Resumo JSON salvo em data/relatorio_provas_resumo.json');
