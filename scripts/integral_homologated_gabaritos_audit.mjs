import fs from 'fs';
import path from 'path';

const BASE_DIR = process.cwd();
const DATA_DIR = path.join(BASE_DIR, 'data');

const QUESTION_FILES = [
  { spec: 'cirurgia', name: 'Cirurgia Geral', file: 'cirurgia_final_questions.json' },
  { spec: 'clinica_medica', name: 'Clínica Médica', file: 'clinica_medica_final_questions.json' },
  { spec: 'ginecologia', name: 'Ginecologia', file: 'ginecologia_final_questions.json' },
  { spec: 'medicina_preventiva', name: 'Medicina Preventiva', file: 'medicina_preventiva_final_questions.json' },
  { spec: 'obstetricia', name: 'Obstetrícia', file: 'obstetricia_final_questions.json' },
  { spec: 'pediatria', name: 'Pediatria', file: 'pediatria_final_questions.json' },
  { spec: 'urologia', name: 'Urologia', file: 'urologia_final_questions.json' }
];

function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function textSimilarity(a, b) {
  const na = normalizeText(a);
  const nb = normalizeText(b);
  if (!na || !nb) return 0.0;
  if (na === nb) return 1.0;
  const wa = new Set(na.split(' '));
  const wb = new Set(nb.split(' '));
  let inter = 0;
  for (const w of wa) {
    if (wb.has(w)) inter++;
  }
  const union = wa.size + wb.size - inter;
  return union > 0 ? inter / union : 0.0;
}

function getOptionText(options, letter) {
  if (!options || !Array.isArray(options) || !letter) return '';
  const clean = letter.trim().toUpperCase();
  const opt = options.find(o => (o.letter || o.id || '').trim().toUpperCase() === clean);
  return opt ? (opt.text || '') : '';
}

async function runAudit() {
  console.log('='.repeat(100));
  console.log('🔍 AUDITORIA INTEGRAL DE GABARITOS HOMOLOGADOS — DIAGNÓSTICO PROFUNDO DE INCONGRUÊNCIAS');
  console.log('MODO: LEITURA ESTRITA (100% AUDITORIA, ZERO ALTERAÇÕES NO BANCO)');
  console.log('='.repeat(100));

  // 1. Carregar Checkpoints de Referência
  console.log('\n📦 [1/5] Carregando bases de referência e checkpoints padrão-ouro...');
  
  let goldAllMap = new Map();
  if (fs.existsSync(path.join(DATA_DIR, 'all_homologated_questions_gold.json'))) {
    const goldAll = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'all_homologated_questions_gold.json'), 'utf8'));
    for (const g of goldAll) {
      if (g.id) goldAllMap.set(g.id, g);
    }
    console.log(`  • all_homologated_questions_gold: ${goldAllMap.size} questões`);
  }

  let driveGoldMap = new Map();
  if (fs.existsSync(path.join(DATA_DIR, 'drive_thematic_homologated_gold.json'))) {
    const driveGold = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'drive_thematic_homologated_gold.json'), 'utf8'));
    for (const d of driveGold) {
      if (d.id) driveGoldMap.set(d.id, d);
    }
    console.log(`  • drive_thematic_homologated_gold: ${driveGoldMap.size} questões`);
  }

  let checkpointGineco = new Map();
  if (fs.existsSync(path.join(DATA_DIR, 'checkpoints', 'ginecologia_gold_anchors_complete.json'))) {
    const cg = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'checkpoints', 'ginecologia_gold_anchors_complete.json'), 'utf8'));
    for (const g of cg) if (g.id) checkpointGineco.set(g.id, g);
    console.log(`  • checkpoint Ginecologia: ${checkpointGineco.size} questões`);
  }

  let checkpointUro = new Map();
  if (fs.existsSync(path.join(DATA_DIR, 'checkpoints', 'urologia_gold_anchors_complete.json'))) {
    const cu = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'checkpoints', 'urologia_gold_anchors_complete.json'), 'utf8'));
    for (const u of cu) if (u.id) checkpointUro.set(u.id, u);
    console.log(`  • checkpoint Urologia: ${checkpointUro.size} questões`);
  }

  // 2. Estatísticas Consolidadas
  const totalStats = {
    totalScanned: 0,
    homologatedWithAnswer: 0,
    officialAnuladas: 0,
    dissertativas: 0,
    pendingNoAnswer: 0,
    // Categorias de Incongruência:
    cat1_letterOutOfRange: [],
    cat2_optionIsCorrectMismatch: [],
    cat3_anuladaConflicts: [],
    cat4_malformedAnswer: [],
    cat5_commentaryExplicitDifferentKey: [],
    cat6_commentaryPerAlternativeMismatch: [],
    cat7_commentaryMentionAnuladaActiveKey: [],
    cat8_commentaryMentionRetificacao: [],
    cat9_goldReferenceMismatch: [],
    cat10_driveReferenceMismatch: [],
    cat11_placeholderCommentary: []
  };

  const allQuestionsMap = new Map(); // id -> question
  const statementHashIndex = new Map(); // hash -> list of questions

  console.log('\n📦 [2/5] Analisando questões das 7 especialidades...');

  for (const qf of QUESTION_FILES) {
    const fpath = path.join(DATA_DIR, qf.file);
    if (!fs.existsSync(fpath)) {
      console.log(`  ⚠️ Arquivo não encontrado: ${qf.file}`);
      continue;
    }

    console.log(`\n  👉 Processando [${qf.name}] (${qf.file})...`);
    const questions = JSON.parse(fs.readFileSync(fpath, 'utf8'));
    totalStats.totalScanned += questions.length;

    let specWithAns = 0;
    let specAnuladas = 0;
    let specDissert = 0;
    let specPending = 0;

    for (const q of questions) {
      const qid = q.id;
      const rawAns = (q.correct_answer || q.correctAnswer || '').trim();
      const ansUpper = rawAns.toUpperCase();
      const isAnul = Boolean(q.is_anulada || q.isAnulada || ansUpper === 'ANULADA');
      const isDissert = q.type === 'Dissertativa' || (!q.options || q.options.length === 0) || ansUpper === 'DISCURSIVA';

      if (isAnul) {
        specAnuladas++;
        totalStats.officialAnuladas++;
      } else if (isDissert) {
        specDissert++;
        totalStats.dissertativas++;
      } else if (ansUpper && ['A', 'B', 'C', 'D', 'E'].includes(ansUpper)) {
        specWithAns++;
        totalStats.homologatedWithAnswer++;
      } else {
        specPending++;
        totalStats.pendingNoAnswer++;
      }

      // Guardar no mapa geral
      allQuestionsMap.set(qid, { ...q, _spec: qf.name });

      // Indexar para duplicatas
      const cleanStmt = normalizeText(q.statement || '');
      if (cleanStmt.length >= 30) {
        const stmtKey = `${cleanStmt.slice(0, 70)}_${q.year || ''}_${normalizeText(q.institution || q.banca || '').slice(0, 15)}`;
        if (!statementHashIndex.has(stmtKey)) statementHashIndex.set(stmtKey, []);
        statementHashIndex.get(stmtKey).push({
          id: qid,
          code: q.code,
          spec: qf.name,
          institution: q.institution,
          banca: q.banca,
          year: q.year,
          ans: ansUpper,
          isAnul,
          options: q.options
        });
      }

      // Se for questão pendente (sem gabarito) ou discursiva pura, não é gabarito homologado com suspeita,
      // a menos que tenha incoerência flagrante. Vamos focar nos gabaritos homologados e ativos!
      const opts = q.options || [];
      const optLetters = opts.map(o => (o.letter || o.id || '').trim().toUpperCase()).filter(Boolean);
      const comm = (q.commentary || '').trim();
      const commLower = comm.toLowerCase();

      // CAT 1: Letra do gabarito fora das opções disponíveis
      if (!isAnul && !isDissert && ansUpper && optLetters.length > 0 && !optLetters.includes(ansUpper)) {
        totalStats.cat1_letterOutOfRange.push({
          id: qid,
          code: q.code,
          spec: qf.name,
          institution: q.institution,
          year: q.year,
          current_answer: ansUpper,
          available_options: optLetters,
          statement_snippet: (q.statement || '').slice(0, 100)
        });
      }

      // CAT 2: Opção com is_correct: true diferente de correct_answer
      if (!isAnul && !isDissert && ansUpper && opts.length > 0) {
        const markedCorrectOpts = opts.filter(o => o.is_correct === true || o.isCorrect === true);
        if (markedCorrectOpts.length > 0) {
          const markedLetters = markedCorrectOpts.map(o => (o.letter || o.id || '').trim().toUpperCase());
          if (!markedLetters.includes(ansUpper)) {
            totalStats.cat2_optionIsCorrectMismatch.push({
              id: qid,
              code: q.code,
              spec: qf.name,
              institution: q.institution,
              year: q.year,
              current_answer: ansUpper,
              option_marked_correct: markedLetters.join(', '),
              statement_snippet: (q.statement || '').slice(0, 100)
            });
          }
        }
      }

      // CAT 3: Conflito de Anuladas
      // Caso 3a: correct_answer é ANULADA mas is_anulada é false
      if ((ansUpper === 'ANULADA' || ansUpper === 'CANCELADA' || ansUpper === 'X') && !q.is_anulada) {
        totalStats.cat3_anuladaConflicts.push({
          id: qid,
          code: q.code,
          spec: qf.name,
          type: 'FLAG_FALSE_BUT_ANSWER_ANULADA',
          current_answer: rawAns,
          is_anulada: q.is_anulada
        });
      }
      // Caso 3b: is_anulada é true, mas tem correct_answer ativa A-E sem indicação clara
      if (q.is_anulada && ['A', 'B', 'C', 'D', 'E'].includes(ansUpper)) {
        // Se a justificativa não explica por que mantém a letra ou se é realmente anulada
        totalStats.cat3_anuladaConflicts.push({
          id: qid,
          code: q.code,
          spec: qf.name,
          type: 'FLAG_TRUE_BUT_HAS_ACTIVE_LETTER',
          current_answer: ansUpper,
          is_anulada: true
        });
      }

      // CAT 4: Resposta mal formatada
      if (rawAns && !['A', 'B', 'C', 'D', 'E', 'ANULADA', 'DISCURSIVA'].includes(ansUpper)) {
        totalStats.cat4_malformedAnswer.push({
          id: qid,
          code: q.code,
          spec: qf.name,
          raw_answer: rawAns
        });
      }

      // CAT 5: Comentário declara explicitamente outro gabarito
      // Exemplos comuns:
      // "Gabarito: B" / "Gabarito Oficial: C" / "Resposta: A" / "Gabarito preliminar: D"
      if (!isAnul && !isDissert && ['A', 'B', 'C', 'D', 'E'].includes(ansUpper) && comm.length > 0) {
        // Regex para capturar declaração de gabarito nas primeiras 200 posições ou no início de parágrafo
        const gabHeaderMatch = comm.match(/(?:gabarito|resposta|gabarito oficial|gabarito definitivo)[\s:]+(?:alternativa\s+)?([A-E])\b/i);
        if (gabHeaderMatch) {
          const declaredLetter = gabHeaderMatch[1].toUpperCase();
          if (declaredLetter !== ansUpper) {
            // Verificar se o texto da opção declarada existe
            const declaredOptText = getOptionText(opts, declaredLetter);
            const currentOptText = getOptionText(opts, ansUpper);
            totalStats.cat5_commentaryExplicitDifferentKey.push({
              id: qid,
              code: q.code,
              spec: qf.name,
              institution: q.institution,
              banca: q.banca,
              year: q.year,
              current_answer: ansUpper,
              current_text: currentOptText.slice(0, 80),
              declared_answer: declaredLetter,
              declared_text: declaredOptText.slice(0, 80),
              commentary_snippet: gabHeaderMatch[0] + ' ... ' + comm.slice(gabHeaderMatch.index, gabHeaderMatch.index + 120).replace(/\n/g, ' ')
            });
          }
        }
      }

      // CAT 6: Comentário detalhado por alternativa indicando que outra é a Correta
      // Exemplo:
      // "A letra A está incorreta... A letra B está correta... A letra C está incorreta..."
      // Ou "Alternativa A: Incorreta... Alternativa B: Correta..."
      if (!isAnul && !isDissert && ['A', 'B', 'C', 'D', 'E'].includes(ansUpper) && comm.length > 0) {
        const corretaMatches = [];
        const altRegex = /(?:alternativa|letra|op[çc][ãa]o)\s+["'“]?([A-E])["'”]?\s*(?:[:\-–]\s*|est[aá]\s+)?(?:é\s+a\s+|esta\s+)?correta\b/gi;
        let m;
        while ((m = altRegex.exec(comm)) !== null) {
          corretaMatches.push(m[1].toUpperCase());
        }
        // Se encontramos declarações consistentes de que apenas uma alternativa é correta e não é a atual:
        const uniqueCorreta = [...new Set(corretaMatches)];
        if (uniqueCorreta.length === 1 && uniqueCorreta[0] !== ansUpper) {
          // Confirmar que não está em lista de CAT 5 já registrada
          const already = totalStats.cat5_commentaryExplicitDifferentKey.some(c => c.id === qid);
          if (!already) {
            totalStats.cat6_commentaryPerAlternativeMismatch.push({
              id: qid,
              code: q.code,
              spec: qf.name,
              institution: q.institution,
              banca: q.banca,
              year: q.year,
              current_answer: ansUpper,
              suspected_answer: uniqueCorreta[0],
              commentary_snippet: comm.slice(0, 160).replace(/\n/g, ' ')
            });
          }
        }
      }

      // CAT 7: Comentário indica questão ANULADA pela banca, mas a questão está ativa com letra
      if (!isAnul && ['A', 'B', 'C', 'D', 'E'].includes(ansUpper) && comm.length > 0) {
        const mentionsAnulada = (
          commLower.includes('questão anulada') ||
          commLower.includes('foi anulada pela banca') ||
          commLower.includes('anulada pela organizadora') ||
          commLower.includes('gabarito definitivo anulou') ||
          commLower.includes('recurso deferido para anulação') ||
          commLower.includes('questão cancelada') ||
          commLower.includes('gabarito: anulada') ||
          commLower.includes('gabarito oficial: anulada')
        );
        if (mentionsAnulada) {
          totalStats.cat7_commentaryMentionAnuladaActiveKey.push({
            id: qid,
            code: q.code,
            spec: qf.name,
            institution: q.institution,
            year: q.year,
            current_answer: ansUpper,
            commentary_snippet: comm.slice(0, 180).replace(/\n/g, ' ')
          });
        }
      }

      // CAT 8: Comentário indica retificação / alteração de gabarito
      if (!isAnul && comm.length > 0) {
        const mentionsRetif = (
          commLower.includes('alterou o gabarito') ||
          commLower.includes('retificou o gabarito') ||
          commLower.includes('mudança de gabarito') ||
          commLower.includes('gabarito alterado de')
        );
        if (mentionsRetif) {
          totalStats.cat8_commentaryMentionRetificacao.push({
            id: qid,
            code: q.code,
            spec: qf.name,
            institution: q.institution,
            year: q.year,
            current_answer: ansUpper,
            commentary_snippet: comm.slice(0, 180).replace(/\n/g, ' ')
          });
        }
      }

      // CAT 9: Divergência com Base Ouro (all_homologated_questions_gold)
      const gold = goldAllMap.get(qid);
      if (gold) {
        const goldAns = (gold.official_answer || gold.correct_answer || gold.correctAnswer || '').trim().toUpperCase();
        if (goldAns && ['A', 'B', 'C', 'D', 'E', 'ANULADA'].includes(goldAns)) {
          const goldIsAnul = goldAns === 'ANULADA';
          if (goldIsAnul !== isAnul || (!isAnul && ansUpper !== goldAns)) {
            // Verificar se as opções têm o mesmo texto ou se é caderno embaralhado
            const currentText = getOptionText(opts, ansUpper);
            const goldText = getOptionText(gold.options, goldAns);
            const sim = textSimilarity(currentText, goldText);
            totalStats.cat9_goldReferenceMismatch.push({
              id: qid,
              code: q.code,
              spec: qf.name,
              institution: q.institution,
              year: q.year,
              current_answer: isAnul ? 'ANULADA' : ansUpper,
              gold_answer: goldAns,
              is_text_matching: sim >= 0.85,
              text_similarity: sim.toFixed(2),
              current_text: currentText.slice(0, 80),
              gold_text: goldText.slice(0, 80)
            });
          }
        }
      }

      // CAT 10: Divergência com Base Drive (drive_thematic_homologated_gold)
      const drive = driveGoldMap.get(qid);
      if (drive) {
        const driveAns = (drive.official_answer || '').trim().toUpperCase();
        if (driveAns && ['A', 'B', 'C', 'D', 'E'].includes(driveAns)) {
          if (!isAnul && ansUpper !== driveAns) {
            totalStats.cat10_driveReferenceMismatch.push({
              id: qid,
              code: q.code,
              spec: qf.name,
              book: drive.book,
              current_answer: ansUpper,
              drive_answer: driveAns,
              drive_commentary_snippet: (drive.commentary || '').slice(0, 140).replace(/\n/g, ' ')
            });
          }
        }
      }

      // CAT 11: Comentários placeholder / provisórios
      if (commLower.includes('em processo de homologação') || commLower.includes('aguardando homologação')) {
        totalStats.cat11_placeholderCommentary.push({
          id: qid,
          code: q.code,
          spec: qf.name
        });
      }
    }

    console.log(`    • Total: ${questions.length} | Com Gabarito: ${specWithAns} | Anuladas: ${specAnuladas} | Discursivas: ${specDissert} | Pendentes: ${specPending}`);
  }

  // 3. Auditoria de Questões Idênticas com Gabarito Divergente (Intra-Bank Duplicates)
  console.log('\n📦 [3/5] Analisando consistência intra-banco de questões idênticas...');
  const duplicateDivergences = [];
  for (const [key, qList] of statementHashIndex.entries()) {
    if (qList.length > 1) {
      // Comparar se todos que têm gabarito têm a mesma resposta
      const withAnsList = qList.filter(q => q.ans && ['A', 'B', 'C', 'D', 'E'].includes(q.ans));
      if (withAnsList.length > 1) {
        const firstAns = withAnsList[0].ans;
        const hasDiff = withAnsList.some(q => q.ans !== firstAns);
        if (hasDiff) {
          // Verificar se o texto da opção é o mesmo (caderno embaralhado) ou se é gabarito discordante
          const texts = withAnsList.map(q => ({
            id: q.id,
            spec: q.spec,
            ans: q.ans,
            optText: getOptionText(q.options, q.ans)
          }));
          const firstText = texts[0].optText;
          const isTextEqual = texts.every(t => textSimilarity(t.optText, firstText) >= 0.85);

          duplicateDivergences.push({
            statement_key: key,
            is_scrambled_caderno: isTextEqual,
            questions: texts
          });
        }
      }
    }
  }

  console.log(`  • Questões idênticas com letras diferentes: ${duplicateDivergences.length}`);
  const realDupConflicts = duplicateDivergences.filter(d => !d.is_scrambled_caderno);
  const scrambledDupCadernos = duplicateDivergences.filter(d => d.is_scrambled_caderno);
  console.log(`    - Conflitos reais de conteúdo (textos diferentes): ${realDupConflicts.length}`);
  console.log(`    - Casos de cadernos distintos (mesmo texto, letras alternadas): ${scrambledDupCadernos.length}`);

  // 4. Consolidação Geral de Suspeitas
  console.log('\n' + '='.repeat(100));
  console.log('📊 CONSOLIDAÇÃO GERAL DA AUDITORIA INTEGRAL:');
  console.log('='.repeat(100));
  console.log(`• Universo Total de Questões:                  ${totalStats.totalScanned.toLocaleString('pt-BR')}`);
  console.log(`• Múltipla Escolha Homologada:                 ${totalStats.homologatedWithAnswer.toLocaleString('pt-BR')}`);
  console.log(`• Anuladas Oficiais Identificadas:             ${totalStats.officialAnuladas.toLocaleString('pt-BR')}`);
  console.log(`• Discursivas (2ª Fase / Sem alternativas):    ${totalStats.dissertativas.toLocaleString('pt-BR')}`);
  console.log(`• Pendentes / Sem Gabarito:                    ${totalStats.pendingNoAnswer.toLocaleString('pt-BR')}`);
  console.log('-'.repeat(100));
  console.log(`🚨 INCONGRUÊNCIAS E GABARITOS SUSPEITOS IDENTIFICADOS:`);
  console.log(`  1. Letra fora das opções disponíveis:         ${totalStats.cat1_letterOutOfRange.length}`);
  console.log(`  2. Flag is_correct em opção diferente:        ${totalStats.cat2_optionIsCorrectMismatch.length}`);
  console.log(`  3. Conflitos de Anulação (flag vs status):    ${totalStats.cat3_anuladaConflicts.length}`);
  console.log(`  4. Gabaritos Mal formatados / Inválidos:      ${totalStats.cat4_malformedAnswer.length}`);
  console.log(`  5. Comentário declara explicitamente outra letra: ${totalStats.cat5_commentaryExplicitDifferentKey.length}`);
  console.log(`  6. Comentário passo-a-passo indica outra como correta: ${totalStats.cat6_commentaryPerAlternativeMismatch.length}`);
  console.log(`  7. Comentário cita Anulação mas questão está ativa: ${totalStats.cat7_commentaryMentionAnuladaActiveKey.length}`);
  console.log(`  8. Comentário menciona Retificação de Gabarito: ${totalStats.cat8_commentaryMentionRetificacao.length}`);
  console.log(`  9. Divergências com Checkpoint Ouro (Gold):   ${totalStats.cat9_goldReferenceMismatch.length}`);
  console.log(` 10. Divergências com Base de Livros (Drive):   ${totalStats.cat10_driveReferenceMismatch.length}`);
  console.log(` 11. Questões idênticas com gabaritos conflitantes: ${realDupConflicts.length}`);
  console.log(` 12. Comentários placeholder ('em homologação'): ${totalStats.cat11_placeholderCommentary.length}`);
  console.log('='.repeat(100));

  // Salvar relatório JSON completo com todos os detalhes
  const report = {
    generated_at: new Date().toISOString(),
    summary: {
      totalQuestions: totalStats.totalScanned,
      homologatedWithAnswer: totalStats.homologatedWithAnswer,
      officialAnuladas: totalStats.officialAnuladas,
      dissertativas: totalStats.dissertativas,
      pendingNoAnswer: totalStats.pendingNoAnswer,
      counts: {
        cat1_letterOutOfRange: totalStats.cat1_letterOutOfRange.length,
        cat2_optionIsCorrectMismatch: totalStats.cat2_optionIsCorrectMismatch.length,
        cat3_anuladaConflicts: totalStats.cat3_anuladaConflicts.length,
        cat4_malformedAnswer: totalStats.cat4_malformedAnswer.length,
        cat5_commentaryExplicitDifferentKey: totalStats.cat5_commentaryExplicitDifferentKey.length,
        cat6_commentaryPerAlternativeMismatch: totalStats.cat6_commentaryPerAlternativeMismatch.length,
        cat7_commentaryMentionAnuladaActiveKey: totalStats.cat7_commentaryMentionAnuladaActiveKey.length,
        cat8_commentaryMentionRetificacao: totalStats.cat8_commentaryMentionRetificacao.length,
        cat9_goldReferenceMismatch: totalStats.cat9_goldReferenceMismatch.length,
        cat10_driveReferenceMismatch: totalStats.cat10_driveReferenceMismatch.length,
        duplicateRealConflicts: realDupConflicts.length,
        duplicateScrambledCadernos: scrambledDupCadernos.length,
        placeholderCommentary: totalStats.cat11_placeholderCommentary.length
      }
    },
    details: {
      letterOutOfRange: totalStats.cat1_letterOutOfRange,
      optionIsCorrectMismatch: totalStats.cat2_optionIsCorrectMismatch,
      anuladaConflicts: totalStats.cat3_anuladaConflicts,
      malformedAnswer: totalStats.cat4_malformedAnswer,
      commentaryExplicitDifferentKey: totalStats.cat5_commentaryExplicitDifferentKey,
      commentaryPerAlternativeMismatch: totalStats.cat6_commentaryPerAlternativeMismatch,
      commentaryMentionAnuladaActiveKey: totalStats.cat7_commentaryMentionAnuladaActiveKey,
      commentaryMentionRetificacao: totalStats.cat8_commentaryMentionRetificacao,
      goldReferenceMismatch: totalStats.cat9_goldReferenceMismatch,
      driveReferenceMismatch: totalStats.cat10_driveReferenceMismatch,
      duplicateRealConflicts: realDupConflicts,
      duplicateScrambledCadernos: scrambledDupCadernos
    }
  };

  const outPath = path.join(DATA_DIR, 'relatorio_auditoria_integral_gabaritos.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\n📄 Relatório detalhado salvo com sucesso em: ${outPath}`);
}

runAudit().catch(err => {
  console.error('❌ Erro na execução da auditoria:', err);
  process.exit(1);
});
