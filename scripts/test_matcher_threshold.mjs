import fs from 'fs';

function norm(text) {
  if (!text) return '';
  return text.normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function getTokens(text) {
  // Remove stopwords comuns de enunciados
  const stopwords = new Set(['qual', 'onde', 'como', 'para', 'com', 'por', 'sobre', 'esse', 'essa', 'este', 'esta', 'foram', 'sera', 'pode', 'mais', 'menos', 'entre', 'quando', 'caso', 'sobre', 'todos', 'todas', 'qualquer']);
  return new Set(norm(text).split(' ').filter(w => w.length >= 4 && !stopwords.has(w)));
}

async function testThresholds() {
  const pending = JSON.parse(fs.readFileSync('data/lote2_pending_index.json', 'utf8'));
  console.log(`Carregadas ${pending.length} questões pendentes.`);

  const gineco = JSON.parse(fs.readFileSync('data/ginecologia_final_questions.json', 'utf8'));
  const uro = JSON.parse(fs.readFileSync('data/urologia_final_questions.json', 'utf8'));

  const goldTokens = [];
  function addGold(item) {
    if (!item.correct_answer || !item.statement) return;
    const ans = item.correct_answer.trim().toUpperCase();
    if (!['A', 'B', 'C', 'D', 'E', 'ANULADA'].includes(ans)) return;
    goldTokens.push({
      statement: item.statement,
      tokens: getTokens(item.statement),
      correct_answer: ans,
      commentary: item.commentary,
      banca: item.banca || item.institution || '',
      year: item.year || 0
    });
  }
  gineco.forEach(addGold);
  uro.forEach(addGold);

  console.log(`Indexados ${goldTokens.length} gabaritos com enunciados completos.`);

  let matches35 = 0;
  let matches30 = 0;
  let matches40 = 0;

  for (let i = 0; i < Math.min(pending.length, 3000); i++) {
    const q = pending[i];
    if (!q.statement || q.statement.length < 30) continue;
    const qTokens = getTokens(q.statement);
    if (qTokens.size < 5) continue;

    for (const g of goldTokens) {
      let common = 0;
      for (const t of qTokens) {
        if (g.tokens.has(t)) common++;
      }
      const score = common / (qTokens.size + g.tokens.size - common);
      if (score >= 0.40) matches40++;
      else if (score >= 0.35) matches35++;
      else if (score >= 0.30) matches30++;
    }
  }

  console.log(`Resultados na amostra (3000 pendentes):`);
  console.log(`  • Score >= 0.40: ${matches40}`);
  console.log(`  • Score 0.35 - 0.39: ${matches35}`);
  console.log(`  • Score 0.30 - 0.34: ${matches30}`);
}

testThresholds();
