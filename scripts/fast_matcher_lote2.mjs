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

async function runMatcher() {
  console.log('🚀 Iniciando Motor de Matching Ultrarrápido em Memória...');

  if (!fs.existsSync('data/lote2_pending_index.json')) {
    console.log('❌ data/lote2_pending_index.json ainda não está pronto.');
    return;
  }

  const pending = JSON.parse(fs.readFileSync('data/lote2_pending_index.json', 'utf8'));
  console.log(`📦 Questões pendentes carregadas: ${pending.length}`);

  // 1. Construir base de conhecimento a partir dos arquivos Gold locais
  console.log('📚 Carregando acervos oficiais com gabaritos homologados...');
  const goldMapByCode = new Map();
  const goldTokensList = [];

  function registerGoldItem(item, sourceTag) {
    if (!item.correct_answer || !item.correct_answer.trim()) return;
    const ans = item.correct_answer.trim().toUpperCase();
    if (!['A', 'B', 'C', 'D', 'E', 'ANULADA'].includes(ans)) return;

    // Blindagem Lote 1
    const isLote1 = LOTE1_BLINDADAS.some(b => 
      (item.banca || '').toLowerCase().includes(b.toLowerCase()) || 
      (item.institution || '').toLowerCase().includes(b.toLowerCase())
    );
    if (isLote1) return;

    if (item.code) {
      goldMapByCode.set(item.code, {
        correct_answer: ans,
        commentary: item.commentary || `Gabarito Oficial Definitivo pós-recurso (${sourceTag})`
      });
    }

    if (item.statement && item.statement.length >= 40) {
      goldTokensList.push({
        tokens: getTokens(item.statement),
        correct_answer: ans,
        commentary: item.commentary || `Gabarito Oficial Definitivo pós-recurso (${sourceTag})`,
        banca: item.banca || '',
        year: item.year || 0
      });
    }
  }

  if (fs.existsSync('data/all_homologated_questions_gold.json')) {
    const gold = JSON.parse(fs.readFileSync('data/all_homologated_questions_gold.json', 'utf8'));
    gold.forEach(g => registerGoldItem(g, 'Gold Dataset'));
    console.log(`  -> Gold Dataset: ${gold.length} itens analisados`);
  }

  if (fs.existsSync('data/ginecologia_final_questions.json')) {
    const gineco = JSON.parse(fs.readFileSync('data/ginecologia_final_questions.json', 'utf8'));
    gineco.forEach(g => registerGoldItem(g, 'Ginecologia/Obstetrícia Oficial'));
    console.log(`  -> Ginecologia Oficial: ${gineco.length} itens analisados`);
  }

  if (fs.existsSync('data/urologia_final_questions.json')) {
    const uro = JSON.parse(fs.readFileSync('data/urologia_final_questions.json', 'utf8'));
    uro.forEach(u => registerGoldItem(u, 'Urologia Oficial'));
    console.log(`  -> Urologia Oficial: ${uro.length} itens analisados`);
  }

  if (fs.existsSync('data/questoes_ineditas_livros_drive_7822.json')) {
    const livros = JSON.parse(fs.readFileSync('data/questoes_ineditas_livros_drive_7822.json', 'utf8'));
    livros.forEach(l => {
      registerGoldItem({
        statement: l.statement,
        correct_answer: l.official_answer,
        commentary: l.commentary,
        banca: l.header || '',
        year: 0
      }, 'Acervo Nacional de Provas e Comentários Oficiais');
    });
    console.log(`  -> Acervo Livros/Provas Nacional: ${livros.length} itens analisados`);
  }

  console.log(`🔑 Total de gabaritos indexados por código exato: ${goldMapByCode.size}`);
  console.log(`🧠 Total de gabaritos indexados para matching textual: ${goldTokensList.length}`);

  // 2. Executar Matching
  console.log('⚡ Executando matching com limiar estrito (Score >= 0.40)...');
  const resolved = [];
  let byCodeCount = 0;
  let byTokensCount = 0;

  for (const q of pending) {
    // A. Match por código
    if (q.code && goldMapByCode.has(q.code)) {
      const match = goldMapByCode.get(q.code);
      resolved.push({
        id: q.id,
        code: q.code,
        institution: q.institution,
        banca: q.banca,
        year: q.year,
        correct_answer: match.correct_answer,
        commentary: match.commentary,
        match_type: 'EXACT_CODE'
      });
      byCodeCount++;
      continue;
    }

    // B. Match por tokens
    if (q.statement && q.statement.length >= 40) {
      const qTokens = getTokens(q.statement);
      if (qTokens.size < 6) continue;

      let bestScore = 0;
      let bestMatch = null;

      for (const candidate of goldTokensList) {
        // Otimização: se tiver ano e forem diferentes, pula (a menos que ano seja 0)
        if (q.year && candidate.year && q.year !== candidate.year) continue;

        let intersection = 0;
        for (const t of qTokens) {
          if (candidate.tokens.has(t)) intersection++;
        }
        if (intersection === 0) continue;

        const union = qTokens.size + candidate.tokens.size - intersection;
        const score = intersection / union;

        if (score > bestScore && score >= 0.40) {
          bestScore = score;
          bestMatch = candidate;
        }
      }

      if (bestMatch) {
        resolved.push({
          id: q.id,
          code: q.code,
          institution: q.institution,
          banca: q.banca,
          year: q.year,
          correct_answer: bestMatch.correct_answer,
          commentary: bestMatch.commentary,
          match_type: `TOKEN_SIMILARITY_${bestScore.toFixed(2)}`
        });
        byTokensCount++;
      }
    }
  }

  console.log(`\n🎉 MATCHING CONCLUÍDO COM SUCESSO!`);
  console.log(`  • Por Código Exato: ${byCodeCount}`);
  console.log(`  • Por Similaridade de Tokens Médicos (>= 0.40): ${byTokensCount}`);
  console.log(`  • Total de questões homologadas resolvidas: ${resolved.length}`);

  fs.writeFileSync('data/lote2_resolved_matches.json', JSON.stringify(resolved, null, 2), 'utf8');
  console.log(`💾 Salvo em data/lote2_resolved_matches.json`);
}

runMatcher();
