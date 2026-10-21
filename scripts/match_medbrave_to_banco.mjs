import fs from 'fs';
import path from 'path';

const MEDBRAVE_FILE = path.join(process.cwd(), 'data', 'medbrave_questions_full.json');
const REPORT_OUTPUT = path.join(process.cwd(), 'docs', 'relatorio_cruzamento_medbrave.md');

function normalizeText(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/<[^>]+>/g, '') // remove HTML tags
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const ORDER_TO_LETTER = ['A', 'B', 'C', 'D', 'E'];

async function main() {
  console.log('===============================================================');
  console.log('🔍 CRUZAMENTO DE GABARITOS MEDBRAVE -> BANCO RESIDÊNCIA');
  console.log('===============================================================');

  if (!fs.existsSync(MEDBRAVE_FILE)) {
    console.error(`❌ Arquivo ${MEDBRAVE_FILE} não encontrado. Execute npm run extract:medbrave primeiro.`);
    process.exit(1);
  }

  console.log('📖 Carregando base do MedBrave...');
  const mbQuestions = JSON.parse(fs.readFileSync(MEDBRAVE_FILE, 'utf8'));
  console.log(`📊 Total de questões coletadas no MedBrave: ${mbQuestions.length.toLocaleString('pt-BR')}`);

  // Indexa por fingerprint normalizado
  const mbIndex = new Map();
  let withAnswer = 0;
  let withComment = 0;

  for (const q of mbQuestions) {
    const cleanStmt = normalizeText(q.statement);
    if (!cleanStmt || cleanStmt.length < 20) continue;

    // Acha a alternativa correta
    let correctLetter = null;
    if (q.alternatives && Array.isArray(q.alternatives)) {
      const correctOpt = q.alternatives.find(a => a.isCorrect === true);
      if (correctOpt) {
        correctLetter = ORDER_TO_LETTER[correctOpt.order] || null;
      }
    }

    if (correctLetter) withAnswer++;
    const comment = q.professorComment || q.explanation || null;
    if (comment) withComment++;

    // Chave primária: primeiros 80 caracteres do enunciado normalizado
    const prefixKey = cleanStmt.slice(0, 80);
    if (!mbIndex.has(prefixKey)) {
      mbIndex.set(prefixKey, []);
    }
    mbIndex.get(prefixKey).push({
      id: q.id,
      year: q.year,
      source: q.source,
      cleanStmt,
      correctLetter,
      comment,
      alternatives: q.alternatives
    });
  }

  console.log(`✅ Questões indexadas no MedBrave: ${mbIndex.size.toLocaleString('pt-BR')} chaves distintas`);
  console.log(`   Com gabarito identificado: ${withAnswer.toLocaleString('pt-BR')}`);
  console.log(`   Com comentário detalhado: ${withComment.toLocaleString('pt-BR')}`);

  console.log('\n💡 Motor de cruzamento pronto para ser executado contra o banco de questões.');
}

main().catch(err => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
