#!/usr/bin/env node

/**
 * scripts/cross_match_hardwork_all.mjs
 * 
 * Motor de Cruzamento Semântico e Auditoria de Gabaritos em Todo o Acervo
 * HardworQ (183k questões) × Banco Residência (133k questões)
 * 
 * Princípios Fundamentais:
 *   1. O casamento de gabarito é determinado estritamente pelo TEXTO DA ALTERNATIVA CORRETA,
 *      e não unicamente pela letra (neutralizando variações de caderno/cores).
 *   2. Desambiguação de enunciados com vinhetas clínicas idênticas via tokens finais e sobreposição de opções.
 *   3. Separação rigorosa entre:
 *      - Concordância perfeita (mesma letra + mesmo texto)
 *      - Permutação de caderno (letras distintas, mesmo texto)
 *      - Divergência real de gabarito (textos com resoluções clínicas opostas)
 *      - Divergência de anulação (uma fonte anulada, outra ativa)
 *      - Recuperação de gabaritos órfãos (banco sem resposta, suprido pelo Hardwork)
 *      - Enriquecimento de imagens (banco sem imagem, Hardwork com imagem)
 *      - Questões inéditas do Hardwork para expansão futura
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const DATA_DIR = path.join(ROOT_DIR, 'data');
const HW_PROVAS_DIR = path.join(DATA_DIR, 'hardwork', 'provas');
const OUT_DIR = path.join(DATA_DIR, 'audit_hardwork');

// ==========================================
// FUNÇÕES DE NORMALIZAÇÃO E SIMILARIDADE
// ==========================================
function norm(text) {
  if (!text) return '';
  return text.normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/<[^>]*>/g, ' ')
    .replace(/^[a-e]\s*[\)\.\-\:]\s*/i, '') // remove prefixos 'a) ', 'A - '
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function extractAcronym(str) {
  if (!str) return '';
  const match = str.match(/^([A-Z0-9\/\-]+)\s*[\-\–\—\:]/i);
  if (match) return norm(match[1]);
  const words = str.split(' ');
  if (words.length === 1) return norm(words[0]);
  return norm(str.slice(0, 15));
}

function getTokens(text) {
  if (!text) return new Set();
  const words = norm(text).split(' ').filter(w => w.length >= 3);
  return new Set(words);
}

function jaccard(setA, setB) {
  if (!setA || !setB || setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const elem of setA) {
    if (setB.has(elem)) intersection++;
  }
  return intersection / (setA.size + setB.size - intersection);
}

function getCorrectOptionText(q) {
  const ans = String(q.correctAnswer || q.correct_answer || '').trim().toUpperCase();
  if (!ans || ans === 'ANULADA' || ans.includes('ANUL')) return '';
  const opt = (q.options || []).find(o => String(o.letter || o.id || '').trim().toUpperCase() === ans);
  return opt ? (opt.text || '').trim() : '';
}

function compareOptionTexts(textA, textB) {
  const nA = norm(textA);
  const nB = norm(textB);
  if (!nA || !nB) return false;

  // 1. Igualdade exata após normalização
  if (nA === nB) return true;

  // 2. Contenção ou prefixos idênticos longos
  if (nA.length >= 15 && nB.length >= 15) {
    if (nA.includes(nB) || nB.includes(nA)) return true;
    const prefixA = nA.slice(0, 35);
    const prefixB = nB.slice(0, 35);
    if (prefixA === prefixB && prefixA.length >= 20) return true;
  }

  // 3. Similaridade Jaccard dos tokens de alternativa
  const tokensA = getTokens(nA);
  const tokensB = getTokens(nB);
  if (tokensA.size >= 3 && tokensB.size >= 3) {
    const sim = jaccard(tokensA, tokensB);
    if (sim >= 0.80) return true;
  }

  return false;
}

function countOptionsOverlap(optsA, optsB) {
  if (!optsA || !optsB || optsA.length === 0 || optsB.length === 0) return 0;
  let matches = 0;
  for (const a of optsA) {
    const tA = a.text || '';
    if (!tA) continue;
    for (const b of optsB) {
      const tB = b.text || '';
      if (!tB) continue;
      if (compareOptionTexts(tA, tB)) {
        matches++;
        break;
      }
    }
  }
  return matches;
}

// ==========================================
// CARREGAMENTO DO ACERVO BANCO RESIDÊNCIA
// ==========================================
function loadBancoResidenciaCatalog() {
  console.log('📡 Carregando todo o acervo consolidado do Banco Residência...');
  console.time('Tempo de Carregamento');

  const specialtyFiles = [
    'cirurgia_final_questions.json',
    'clinica_medica_final_questions.json',
    'pediatria_final_questions.json',
    'ginecologia_final_questions.json',
    'obstetricia_final_questions.json',
    'medicina_preventiva_final_questions.json',
    'nefrologia_final_questions.json',
    'urologia_final_questions.json',
    'all_homologated_questions_gold.json'
  ];

  const uniqueQuestionsMap = new Map();
  const codeIndex = new Map();
  const fullStatementIndex = new Map(); // normStatement -> Array of items
  const prefix80Index = new Map();       // prefix80 -> Array of items
  const blockIndex = new Map();          // blockKey -> Array of items

  let loadedTotal = 0;

  for (const fileName of specialtyFiles) {
    const filePath = path.join(DATA_DIR, fileName);
    if (!fs.existsSync(filePath)) continue;

    try {
      const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (!Array.isArray(questions)) continue;

      for (const q of questions) {
        if (!q || !q.id) continue;
        loadedTotal++;

        if (uniqueQuestionsMap.has(q.id)) continue; // Evita duplicidade entre cadernos

        const correctAns = String(q.correctAnswer || q.correct_answer || '').trim().toUpperCase();
        const isAnulada = Boolean(
          q.isAnulada || q.is_anulada || correctAns === 'ANULADA' || correctAns.includes('ANUL')
        );
        const correctText = getCorrectOptionText(q);
        const normStatement = norm(q.statement);
        const pref80 = normStatement.slice(0, 80);
        const instNorm = norm(q.institution || q.banca || '');
        const instAcronym = extractAcronym(q.institution || q.banca || '');
        const year = parseInt(q.year || 0, 10) || 0;

        const item = {
          id: q.id,
          code: q.code || '',
          institution: q.institution || q.banca || 'Não informada',
          banca: q.banca || q.institution || '',
          year: year,
          especialidade: q.especialidade || q.specialty || '',
          tema: q.tema || '',
          statement: q.statement || '',
          normStatement: normStatement,
          pref80: pref80,
          statementTokens: getTokens(q.statement),
          options: q.options || [],
          correctAnswer: isAnulada ? 'ANULADA' : correctAns,
          correctText: correctText,
          isAnulada: isAnulada,
          hasImages: Boolean((q.images && q.images.length > 0) || q.imageUrl),
          sourceFile: fileName,
          matchedWithHw: false
        };

        uniqueQuestionsMap.set(q.id, item);

        // 1. Index por Código
        if (item.code) {
          const cNorm = norm(item.code);
          if (cNorm && !codeIndex.has(cNorm)) {
            codeIndex.set(cNorm, item);
          }
        }

        // 2. Index por Enunciado Completo Normalizado (suporta colisões em array)
        if (normStatement.length >= 25) {
          let list = fullStatementIndex.get(normStatement);
          if (!list) {
            list = [];
            fullStatementIndex.set(normStatement, list);
          }
          list.push(item);
        }

        // 3. Index por Prefixo de 80 chars (suporta vinhetas compartilhadas em array)
        if (pref80.length >= 25) {
          let list = prefix80Index.get(pref80);
          if (!list) {
            list = [];
            prefix80Index.set(pref80, list);
          }
          list.push(item);
        }

        // 4. Index por Bloco [Instituição/Sigla + Ano]
        if (year > 0) {
          if (instNorm) {
            const blockKey = `${instNorm}_${year}`;
            let bList = blockIndex.get(blockKey);
            if (!bList) {
              bList = [];
              blockIndex.set(blockKey, bList);
            }
            bList.push(item);
          }
          if (instAcronym && instAcronym !== instNorm) {
            const acKey = `${instAcronym}_${year}`;
            let aList = blockIndex.get(acKey);
            if (!aList) {
              aList = [];
              blockIndex.set(acKey, aList);
            }
            aList.push(item);
          }
        }
      }
    } catch (err) {
      console.warn(`⚠️ Erro ao ler ${fileName}: ${err.message}`);
    }
  }

  console.timeEnd('Tempo de Carregamento');
  console.log(`✅ Banco Residência: ${uniqueQuestionsMap.size.toLocaleString('pt-BR')} questões únicas indexadas.`);
  console.log(`   Índice de Códigos: ${codeIndex.size.toLocaleString('pt-BR')} entradas`);
  console.log(`   Índice de Enunciados Completos: ${fullStatementIndex.size.toLocaleString('pt-BR')} chaves`);
  console.log(`   Índice de Prefixos (80 chars): ${prefix80Index.size.toLocaleString('pt-BR')} chaves`);
  console.log(`   Blocos [Inst+Ano]: ${blockIndex.size.toLocaleString('pt-BR')} blocos`);
  console.log('--------------------------------------------------------');

  return {
    questionsMap: uniqueQuestionsMap,
    codeIndex,
    fullStatementIndex,
    prefix80Index,
    blockIndex
  };
}

// ==========================================
// MOTOR DE BUSCA MULTI-ESTÁGIO COM DESAMBIGUAÇÃO
// ==========================================
function findBestMatch(hwQ, indexes) {
  const { codeIndex, fullStatementIndex, prefix80Index, blockIndex } = indexes;

  // Nível 1: Match Determinístico por Código
  if (hwQ.code) {
    const cNorm = norm(hwQ.code);
    const match = codeIndex.get(cNorm);
    if (match) return { match, method: 'N1_EXACT_CODE' };
  }

  const hwStatement = norm(hwQ.statement);
  const hwPref80 = hwStatement.slice(0, 80);
  const hwTokens = getTokens(hwQ.statement);
  const hwOptions = hwQ.options || [];

  // Nível 2: Match por Enunciado Completo Normalizado
  if (hwStatement.length >= 25) {
    const fullCandidates = fullStatementIndex.get(hwStatement);
    if (fullCandidates && fullCandidates.length > 0) {
      if (fullCandidates.length === 1) {
        return { match: fullCandidates[0], method: 'N2_FULL_STATEMENT' };
      }
      // Se múltiplos enunciados idênticos, desambigua por sobreposição de alternativas
      let bestMatch = fullCandidates[0];
      let maxOverlap = -1;
      for (const cand of fullCandidates) {
        const overlap = countOptionsOverlap(hwOptions, cand.options);
        if (overlap > maxOverlap) {
          maxOverlap = overlap;
          bestMatch = cand;
        }
      }
      return { match: bestMatch, method: 'N2_FULL_STATEMENT_DISAMBIGUATED' };
    }
  }

  // Nível 3: Match por Prefixo de 80 caracteres com Desambiguação de Vinhetas
  if (hwPref80.length >= 25) {
    const prefCandidates = prefix80Index.get(hwPref80);
    if (prefCandidates && prefCandidates.length > 0) {
      if (prefCandidates.length === 1) {
        const cand = prefCandidates[0];
        const sim = jaccard(hwTokens, cand.statementTokens);
        // Exige similaridade alta para evitar falso positivo em vinhetas curtas
        if (sim >= 0.70 || countOptionsOverlap(hwOptions, cand.options) >= 2) {
          return { match: cand, method: 'N3_PREFIX_80' };
        }
      } else {
        // Múltiplos candidatos compartilhando o mesmo caso clínico/vinheta
        let bestCandidate = null;
        let bestScore = 0;

        for (const cand of prefCandidates) {
          const sim = jaccard(hwTokens, cand.statementTokens);
          const overlap = countOptionsOverlap(hwOptions, cand.options);
          // Score composto: similaridade de tokens + bônus de alternativas coincidentes
          const score = (sim * 10) + (overlap * 5);

          if (score > bestScore && (overlap >= 2 || sim >= 0.85)) {
            bestScore = score;
            bestCandidate = cand;
          }
        }

        if (bestCandidate) {
          return { match: bestCandidate, method: 'N3_PREFIX_80_DISAMBIGUATED' };
        }
      }
    }
  }

  // Nível 4: Match Fuzzy dentro do Bloco [Instituição / Sigla + Ano]
  const instNorm = norm(hwQ.institution || hwQ.banca || '');
  const instAcronym = extractAcronym(hwQ.institution || hwQ.banca || '');
  const year = parseInt(hwQ.year || 0, 10) || 0;

  if (year > 0 && (instNorm || instAcronym)) {
    const candidateKeys = [];
    if (instNorm) candidateKeys.push(`${instNorm}_${year}`);
    if (instAcronym) candidateKeys.push(`${instAcronym}_${year}`);

    for (const blockKey of candidateKeys) {
      const blockList = blockIndex.get(blockKey);
      if (blockList && blockList.length > 0 && hwTokens.size >= 8) {
        let bestSim = 0;
        let bestCandidate = null;

        for (const candidate of blockList) {
          const sim = jaccard(hwTokens, candidate.statementTokens);
          if (sim > bestSim) {
            bestSim = sim;
            bestCandidate = candidate;
          }
        }

        if (bestSim >= 0.82 && bestCandidate) {
          const overlap = countOptionsOverlap(hwOptions, bestCandidate.options);
          if (overlap >= 2 || bestSim >= 0.90) {
            return { match: bestCandidate, method: 'N4_FUZZY_BLOCK', similarity: bestSim };
          }
        }
      }
    }
  }

  return { match: null, method: 'NONE' };
}

// ==========================================
// EXECUTOR PRINCIPAL DO CRUZAMENTO
// ==========================================
async function main() {
  console.log('========================================================');
  console.log('⚡ MOTOR DE CRUZAMENTO SEMÂNTICO E AUDITORIA GERAL');
  console.log('   HardworQ (183k) × Banco Residência (133k)');
  console.log('   Critério Determinante: TEXTO DAS ALTERNATIVAS');
  console.log('========================================================');

  const indexes = loadBancoResidenciaCatalog();
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const hwFiles = fs.readdirSync(HW_PROVAS_DIR).filter(f => f.endsWith('.json'));
  console.log(`📦 Processando ${hwFiles.length.toLocaleString('pt-BR')} provas do catálogo HardworQ...`);

  // Estatísticas de Auditoria
  const stats = {
    totalHwQuestoes: 0,
    totalPareadas: 0,
    a1_concordanciaPerfeita: 0,
    a2_permutacaoCaderno: 0,
    b1_anulacaoDivergente: 0,
    b2_divergenciaReal: 0,
    e1_gabaritoPreenchidoHw: 0,
    e2_gabaritoAusenteHw: 0,
    c1_enriquecimentoImagem: 0,
    d1_questoesIneditasHw: 0
  };

  const divergenciasReais = [];
  const permutacoesCaderno = [];
  const divergenciasAnulacao = [];
  const gabaritosPreenchidosHw = [];
  const oportunidadesImagem = [];
  const questoesIneditasHw = [];

  console.time('Tempo Total de Cruzamento');

  for (let fileIdx = 0; fileIdx < hwFiles.length; fileIdx++) {
    const f = hwFiles[fileIdx];
    const filePath = path.join(HW_PROVAS_DIR, f);

    let provaData = null;
    try {
      provaData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      continue;
    }

    const questoes = provaData.questoes || [];

    for (const hwQ of questoes) {
      stats.totalHwQuestoes++;

      const { match, method } = findBestMatch(hwQ, indexes);

      if (!match) {
        // Questão existe no Hardwork mas não está no acervo da plataforma
        stats.d1_questoesIneditasHw++;
        if (questoesIneditasHw.length < 5000) {
          questoesIneditasHw.push({
            idHardwork: hwQ.id,
            code: hwQ.code,
            institution: hwQ.institution,
            year: hwQ.year,
            tipoProva: hwQ.tipoProva,
            statementSnippet: (hwQ.statement || '').slice(0, 140) + '...',
            correctAnswer: hwQ.correctAnswer
          });
        }
        continue;
      }

      stats.totalPareadas++;
      match.matchedWithHw = true;

      const ansPlat = match.correctAnswer;
      const ansHw = String(hwQ.correctAnswer || '').trim().toUpperCase();

      const textPlat = match.correctText;
      const textHw = getCorrectOptionText(hwQ);

      const isAnuladaPlat = match.isAnulada || ansPlat === 'ANULADA';
      const isAnuladaHw = hwQ.isAnulada || ansHw === 'ANULADA';

      // 1. Verificação de Anulação Consensual
      if (isAnuladaPlat && isAnuladaHw) {
        stats.a1_concordanciaPerfeita++;
        continue;
      }

      // 2. Verificação de Anulação Divergente (Preliminar vs Definitivo)
      if (isAnuladaPlat !== isAnuladaHw) {
        stats.b1_anulacaoDivergente++;
        divergenciasAnulacao.push({
          idPlataforma: match.id,
          idHardwork: hwQ.id,
          codePlataforma: match.code,
          codeHardwork: hwQ.code,
          institution: match.institution,
          year: match.year,
          gabaritoPlataforma: ansPlat,
          gabaritoHardwork: ansHw,
          statusAnuladaPlat: isAnuladaPlat,
          statusAnuladaHw: isAnuladaHw,
          enunciado: (match.statement || hwQ.statement || '').slice(0, 150) + '...'
        });
        continue;
      }

      // 3. Verificação de Gabarito Ausente na Plataforma (Recuperação Órfã)
      if (!ansPlat && ansHw) {
        stats.e1_gabaritoPreenchidoHw++;
        if (gabaritosPreenchidosHw.length < 5000) {
          gabaritosPreenchidosHw.push({
            idPlataforma: match.id,
            idHardwork: hwQ.id,
            codePlataforma: match.code,
            institution: match.institution,
            year: match.year,
            gabaritoHardwork: ansHw,
            textoHardwork: textHw,
            enunciado: (match.statement || '').slice(0, 150) + '...'
          });
        }
        continue;
      }

      // 4. Verificação de Gabarito Ausente no Hardwork
      if (ansPlat && !ansHw) {
        stats.e2_gabaritoAusenteHw++;
        continue;
      }

      // 5. Comparação Semântica do TEXTO da alternativa correta
      const isTextMatch = compareOptionTexts(textPlat, textHw);

      if (isTextMatch) {
        if (ansPlat === ansHw) {
          // CASO A1: Mesma Letra E Mesmo Texto
          stats.a1_concordanciaPerfeita++;
        } else {
          // CASO A2: Letras Diferentes, MAS MESMO TEXTO (Permutação de Caderno)
          stats.a2_permutacaoCaderno++;
          permutacoesCaderno.push({
            idPlataforma: match.id,
            idHardwork: hwQ.id,
            codePlataforma: match.code,
            codeHardwork: hwQ.code,
            institution: match.institution,
            year: match.year,
            letraPlataforma: ansPlat,
            letraHardwork: ansHw,
            textoCorretoCompartilhado: textPlat || textHw,
            diagnostico: 'Permutação de caderno (mesmo gabarito clínico em letras diferentes)'
          });
        }
      } else {
        // CASO B2: Divergência Real de Gabarito Clínico
        stats.b2_divergenciaReal++;
        divergenciasReais.push({
          idPlataforma: match.id,
          idHardwork: hwQ.id,
          codePlataforma: match.code,
          codeHardwork: hwQ.code,
          institution: match.institution,
          year: match.year,
          letraPlataforma: ansPlat,
          textoPlataforma: textPlat,
          letraHardwork: ansHw,
          textoHardwork: textHw,
          enunciado: (match.statement || hwQ.statement || '').slice(0, 160) + '...',
          matchMethod: method
        });
      }

      // 6. Oportunidade de Enriquecimento de Imagens
      const hwHasImg = Boolean(hwQ.imageUrl || (hwQ.images && hwQ.images.length > 0));
      if (!match.hasImages && hwHasImg) {
        stats.c1_enriquecimentoImagem++;
        oportunidadesImagem.push({
          idPlataforma: match.id,
          idHardwork: hwQ.id,
          codePlataforma: match.code,
          institution: match.institution,
          year: match.year,
          imageUrl: hwQ.imageUrl || (hwQ.images && hwQ.images[0]) || '',
          enunciado: (match.statement || '').slice(0, 120) + '...'
        });
      }
    }

    if ((fileIdx + 1) % 300 === 0 || fileIdx === hwFiles.length - 1) {
      const pct = Math.round(((fileIdx + 1) / hwFiles.length) * 100);
      console.log(`⏳ [${fileIdx + 1}/${hwFiles.length}] (${pct}%) Provas | Pareadas: ${stats.totalPareadas.toLocaleString('pt-BR')} | Conc. Perfeita: ${stats.a1_concordanciaPerfeita.toLocaleString('pt-BR')} | Permutações: ${stats.a2_permutacaoCaderno.toLocaleString('pt-BR')} | Div. Reais: ${stats.b2_divergenciaReal.toLocaleString('pt-BR')}`);
    }
  }

  console.timeEnd('Tempo Total de Cruzamento');
  console.log('--------------------------------------------------------');

  // Gravação dos Relatórios
  console.log('💾 Gravando relatórios de auditoria em data/audit_hardwork/...');

  const taxaConcordancia = stats.totalPareadas > 0
    ? (((stats.a1_concordanciaPerfeita + stats.a2_permutacaoCaderno) / stats.totalPareadas) * 100).toFixed(2) + '%'
    : '0%';

  fs.writeFileSync(
    path.join(OUT_DIR, 'relatorio_geral_resumo.json'),
    JSON.stringify({
      dataAuditoria: new Date().toISOString(),
      totais: stats,
      percentualPareamento: ((stats.totalPareadas / stats.totalHwQuestoes) * 100).toFixed(2) + '%',
      taxaConcordanciaGabaritosMedicos: taxaConcordancia,
      detalhesTaxonomia: {
        concordanciaPerfeita: stats.a1_concordanciaPerfeita,
        permutacaoCaderno: stats.a2_permutacaoCaderno,
        divergenciaReal: stats.b2_divergenciaReal,
        divergenciaAnulacao: stats.b1_anulacaoDivergente,
        gabaritoPreenchidoHw: stats.e1_gabaritoPreenchidoHw,
        gabaritoAusenteHw: stats.e2_gabaritoAusenteHw,
        enriquecimentoImagens: stats.c1_enriquecimentoImagem,
        questoesIneditasHw: stats.d1_questoesIneditasHw
      }
    }, null, 2),
    'utf8'
  );

  fs.writeFileSync(
    path.join(OUT_DIR, 'divergencias_reais_gabarito.json'),
    JSON.stringify(divergenciasReais, null, 2),
    'utf8'
  );

  fs.writeFileSync(
    path.join(OUT_DIR, 'permutacoes_caderno.json'),
    JSON.stringify(permutacoesCaderno, null, 2),
    'utf8'
  );

  fs.writeFileSync(
    path.join(OUT_DIR, 'divergencias_anulacao.json'),
    JSON.stringify(divergenciasAnulacao, null, 2),
    'utf8'
  );

  fs.writeFileSync(
    path.join(OUT_DIR, 'gabaritos_preenchidos_pelo_hw.json'),
    JSON.stringify(gabaritosPreenchidosHw, null, 2),
    'utf8'
  );

  fs.writeFileSync(
    path.join(OUT_DIR, 'oportunidades_enriquecimento_imagens.json'),
    JSON.stringify(oportunidadesImagem, null, 2),
    'utf8'
  );

  fs.writeFileSync(
    path.join(OUT_DIR, 'catalogo_questoes_ineditas.json'),
    JSON.stringify(questoesIneditasHw, null, 2),
    'utf8'
  );

  console.log('========================================================');
  console.log('🏁 RESULTADO CONSOLIDADO DO CRUZAMENTO DE TODO O ACERVO:');
  console.log(`   Total de questões no HardworQ: ${stats.totalHwQuestoes.toLocaleString('pt-BR')}`);
  console.log(`   Questões pareadas com o Banco Residência: ${stats.totalPareadas.toLocaleString('pt-BR')} (${((stats.totalPareadas / stats.totalHwQuestoes) * 100).toFixed(1)}%)`);
  console.log(`   Taxa de Concordância Médica Real: ${taxaConcordancia}`);
  console.log(`   ----------------------------------------------------`);
  console.log(`   ✅ Concordância Perfeita (Mesma Letra + Mesmo Texto): ${stats.a1_concordanciaPerfeita.toLocaleString('pt-BR')}`);
  console.log(`   🔄 Permutação de Caderno (Letras Diferentes, MESMO TEXTO): ${stats.a2_permutacaoCaderno.toLocaleString('pt-BR')}`);
  console.log(`   ⚠️ Divergências Reais de Gabarito (Textos Distintos): ${stats.b2_divergenciaReal.toLocaleString('pt-BR')}`);
  console.log(`   ⚖️ Divergências de Anulação (Preliminar vs Definitivo): ${stats.b1_anulacaoDivergente.toLocaleString('pt-BR')}`);
  console.log(`   🎯 Gabaritos Preenchidos pelo HW (Banco sem resposta): ${stats.e1_gabaritoPreenchidoHw.toLocaleString('pt-BR')}`);
  console.log(`   🖼️ Oportunidades de Enriquecimento de Imagens: ${stats.c1_enriquecimentoImagem.toLocaleString('pt-BR')}`);
  console.log(`   🆕 Questões Inéditas para Expansão: ${stats.d1_questoesIneditasHw.toLocaleString('pt-BR')}`);
  console.log('========================================================');
}

main().catch(err => {
  console.error('💥 Erro fatal no cruzamento:', err);
  process.exit(1);
});
