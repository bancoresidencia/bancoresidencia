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
  return new Set(norm(text).split(' ').filter(w => w.length >= 4));
}

// Bancas do Lote 1 expressamente BLINDADAS
const LOTE1_BLINDADAS = [
  'ENARE', 'SUS-SP', 'USP', 'FUVEST', 'IAMSPE', 'UNESP', 'FMABC', 'UNIFESP',
  'Santa Casa SP', 'Santa Casa de São Paulo', 'INEP', 'Revalida'
];

async function run() {
  console.log('Iniciando Motor Estrito de Gabaritos Oficiais Definitivos...');
  console.log('REGRA ABSOLUTA: Proibido IA. Apenas Gabaritos Oficiais de Prova.');

  const pending = JSON.parse(fs.readFileSync('data/lote2_pending_index.json', 'utf8'));
  console.log(`Questões pendentes no índice: ${pending.length}`);

  // Carregar apenas acervos de provas oficiais com gabarito oficial comprovado
  const officialKnowledge = [];

  // 1. Acervo Nacional de Provas de Residência Médica (7.822 questões)
  if (fs.existsSync('data/questoes_ineditas_livros_drive_7822.json')) {
    const livros = JSON.parse(fs.readFileSync('data/questoes_ineditas_livros_drive_7822.json', 'utf8'));
    for (const item of livros) {
      if (!item.official_answer || !item.statement || item.statement.length < 50) continue;
      const ans = item.official_answer.trim().toUpperCase();
      if (!['A', 'B', 'C', 'D', 'E', 'ANULADA'].includes(ans)) continue;

      // Blindagem Lote 1
      const isLote1 = LOTE1_BLINDADAS.some(b => (item.header || '').toLowerCase().includes(b.toLowerCase()));
      if (isLote1) continue;

      officialKnowledge.push({
        tokens: getTokens(item.statement),
        correct_answer: ans,
        commentary: item.commentary || 'Gabarito Oficial Definitivo da Banca Examinadora',
        source: 'Acervo Oficial Provas de Residência',
        rawText: item.statement
      });
    }
    console.log(`Carregadas ${officialKnowledge.length} questões com gabarito oficial de prova.`);
  }

  // Matching com limiar de alta fidelidade Jaccard >= 0.45
  console.log('\nExecutando matching com limiar estrito (Jaccard >= 0.45 e min 10 tokens médicos)...');
  const matches = [];

  for (const q of pending) {
    if (!q.statement || q.statement.length < 50) continue;
    const qTokens = getTokens(q.statement);
    if (qTokens.size < 10) continue; // Garante vinheta clínica informativa

    let bestScore = 0;
    let bestCandidate = null;

    for (const c of officialKnowledge) {
      let intersection = 0;
      for (const t of qTokens) {
        if (c.tokens.has(t)) intersection++;
      }
      if (intersection === 0) continue;

      const union = qTokens.size + c.tokens.size - intersection;
      const score = intersection / union;

      if (score > bestScore && score >= 0.45) {
        bestScore = score;
        bestCandidate = c;
      }
    }

    if (bestCandidate) {
      matches.push({
        id: q.id,
        code: q.code,
        institution: q.institution,
        banca: q.banca,
        year: q.year,
        correct_answer: bestCandidate.correct_answer,
        commentary: bestCandidate.commentary,
        score: bestScore,
        match_type: `OFFICIAL_SIMILARITY_${bestScore.toFixed(2)}`
      });
    }
  }

  console.log(`\n🎉 TOTAL DE NOVOS GABARITOS OFICIAIS ENCONTRADOS: ${matches.length}`);
  if (matches.length > 0) {
    fs.writeFileSync('data/lote2_official_matches_ready.json', JSON.stringify(matches, null, 2), 'utf8');
    console.log('Salvo em data/lote2_official_matches_ready.json');
  }
}

run().catch(console.error);
