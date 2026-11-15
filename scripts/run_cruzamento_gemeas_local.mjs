import { DatabaseSync } from 'node:sqlite';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// 1. Carrega variáveis de ambiente
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      }
    }
  });
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// 2. Normalizador de Texto e Algoritmos de Hash/Similaridade
function normalizeText(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getMd5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

function getPrefixKey(normStr, numWords = 8) {
  const words = normStr.split(' ').filter(Boolean);
  return words.slice(0, numWords).join(' ');
}

function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0;

  const w1 = s1.split(' ');
  const w2 = s2.split(' ');
  const set1 = new Set(w1);
  const set2 = new Set(w2);

  let intersection = 0;
  for (const w of set1) {
    if (set2.has(w)) intersection++;
  }
  const dice = (2 * intersection) / (set1.size + set2.size);
  return Math.round(dice * 100) / 100;
}

function parseOptions(optionsField) {
  if (!optionsField) return [];
  if (Array.isArray(optionsField)) return optionsField;
  try {
    const parsed = JSON.parse(optionsField);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

// 3. Execução Principal do Cruzamento Local de Gêmeas
async function main() {
  console.log('========================================================================');
  console.log('⚡ INICIANDO CRUZAMENTO LOCAL DE QUESTÕES GÊMEAS (OFFLINE)');
  console.log('   Alvo: Comparar 10.397 pendências contra 121.532 gabaritos homologados');
  console.log('   Tecnologia: Indexação Hash O(1) em SQLite Local (Zero Carga no Supabase)');
  console.log('   Regra: Dual-Gate Rigoroso (Enunciado >= 90% & Alternativa >= 90%)');
  console.log('   Segurança: Zero Commits sem autorização do usuário');
  console.log('========================================================================\n');

  const startTime = Date.now();

  // 3.1 Abrir banco SQLite local
  console.log('📂 [1/4] Carregando acervo local de questões gabaritadas de data/questoes_132k.db...');
  const db = new DatabaseSync('data/questoes_132k.db');

  const rows = db.prepare(`
    SELECT id, code, institution, banca, year, statement, options, correct_answer, commentary
    FROM questions
    WHERE correct_answer IS NOT NULL AND trim(correct_answer) != ''
  `).all();

  console.log(`   -> ${rows.length.toLocaleString('pt-BR')} questões com gabarito carregadas da base local.`);

  // 3.2 Construir índices na memória
  console.log('🧠 [2/4] Indexando por Hash MD5 e Prefixos de 8 palavras...');
  const exactHashMap = new Map();
  const prefixMap = new Map();

  for (const row of rows) {
    const norm = normalizeText(row.statement);
    if (!norm || norm.length < 20) continue;

    const hash = getMd5(norm);
    if (!exactHashMap.has(hash)) {
      exactHashMap.set(hash, []);
    }
    exactHashMap.get(hash).push(row);

    const prefix = getPrefixKey(norm, 8);
    if (prefix) {
      if (!prefixMap.has(prefix)) {
        prefixMap.set(prefix, []);
      }
      prefixMap.get(prefix).push(row);
    }
  }

  console.log(`   -> Índice MD5: ${exactHashMap.size.toLocaleString('pt-BR')} chaves únicas.`);
  console.log(`   -> Índice Prefixo: ${prefixMap.size.toLocaleString('pt-BR')} baldes criados.`);

  // 3.3 Carregar pendências do Supabase (paginado, leve)
  console.log('📥 [3/4] Baixando lista de pendências oficiais do Supabase...');
  let pendingQuestions = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase.from('questions')
      .select('id, code, institution, year, statement, options')
      .or('correct_answer.is.null,correct_answer.eq.')
      .range(from, from + pageSize - 1);

    if (error || !data || data.length === 0) break;
    pendingQuestions = pendingQuestions.concat(data);
    from += pageSize;
    if (data.length < pageSize) break;
  }
  console.log(`   -> ${pendingQuestions.length.toLocaleString('pt-BR')} pendências baixadas para cruzamento.`);

  // 3.4 Cruzar pendências com o índice local
  console.log('⚡ [4/4] Executando cruzamento algorítmico e auditoria Dual-Gate...');
  const homologadas = [];
  const quarentenaDivergencias = [];
  let matchesExatos = 0;
  let matchesPorPrefixo = 0;

  for (let i = 0; i < pendingQuestions.length; i++) {
    const pend = pendingQuestions[i];
    const norm = normalizeText(pend.statement);
    if (!norm || norm.length < 20) continue;

    const hash = getMd5(norm);
    let candidates = exactHashMap.get(hash);
    let matchType = 'exato_100pct';

    if (candidates && candidates.length > 0) {
      matchesExatos++;
    } else {
      const prefix = getPrefixKey(norm, 8);
      const bucket = prefixMap.get(prefix);
      if (bucket && bucket.length > 0) {
        // Filtra por similaridade >= 0.90
        candidates = bucket.filter(c => calculateSimilarity(pend.statement, c.statement) >= 0.90);
        if (candidates.length > 0) {
          matchesPorPrefixo++;
          matchType = 'similaridade_90pct';
        }
      }
    }

    if (!candidates || candidates.length === 0) continue;

    // Auditar candidatos e encontrar alternativa vencedora
    const pendOpts = parseOptions(pend.options);
    if (pendOpts.length === 0) continue;

    // Verificar se todos os candidatos concordam ou pegar o de maior peso
    for (const cand of candidates) {
      // Ignora auto-comparação se mesmo ID
      if (cand.id === pend.id) continue;

      const candOpts = parseOptions(cand.options);
      const candAnswer = (cand.correct_answer || '').trim().toUpperCase();
      if (!candAnswer) continue;

      // Localizar o texto da alternativa vencedora no candidato
      let candWinningText = '';
      if (candAnswer === 'ANULADA') {
        candWinningText = 'ANULADA';
      } else {
        const winningOpt = candOpts.find(o => (o.letter || '').toUpperCase() === candAnswer);
        if (winningOpt) {
          candWinningText = winningOpt.text || '';
        }
      }

      if (!candWinningText) continue;

      // Agora encontrar qual alternativa na pendente possui esse texto exato (>= 90%)
      let matchedLetterInPending = null;
      let winningOptSim = 0;

      if (candAnswer === 'ANULADA') {
        matchedLetterInPending = 'ANULADA';
        winningOptSim = 1.0;
      } else {
        for (const pOpt of pendOpts) {
          const sim = calculateSimilarity(pOpt.text, candWinningText);
          if (sim >= 0.90) {
            matchedLetterInPending = (pOpt.letter || '').toUpperCase();
            winningOptSim = sim;
            break;
          }
        }
      }

      if (matchedLetterInPending) {
        const stmtSim = calculateSimilarity(pend.statement, cand.statement);
        homologadas.push({
          question_id: pend.id,
          code: pend.code,
          institution: pend.institution,
          year: pend.year,
          correct_answer: matchedLetterInPending,
          commentary: cand.commentary || `Gabarito homologado via cruzamento de questão gêmea com ${cand.institution} (${cand.year}) - Código: ${cand.code}.`,
          twin_source_id: cand.id,
          twin_source_code: cand.code,
          twin_institution: cand.institution,
          twin_year: cand.year,
          twin_original_letter: candAnswer,
          statement_similarity: stmtSim,
          option_similarity: winningOptSim,
          match_type: matchType,
          homologated_at: new Date().toISOString()
        });
        break; // Homologou com sucesso esta pendência
      }
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  // 3.5 Salvar resultados em Staging
  const stagingFile = path.resolve('data/staging_questoes_gemeas_locais.json');
  fs.writeFileSync(stagingFile, JSON.stringify(homologadas, null, 2), 'utf8');

  console.log('\n========================================================================');
  console.log(`🎉 CRUZAMENTO CONCLUÍDO EM APENAS ${elapsed} SEGUNDOS!`);
  console.log('========================================================================');
  console.log(`📊 Pendências Analisadas: ${pendingQuestions.length.toLocaleString('pt-BR')}`);
  console.log(`🎯 Gêmeas com Enunciado 100% Idêntico: ${matchesExatos}`);
  console.log(`🔎 Gêmeas com Enunciado >= 90% Similar: ${matchesPorPrefixo}`);
  console.log(`✅ TOTAL DE QUESTÕES HOMOLOGADAS DUAL-GATE: ${homologadas.length.toLocaleString('pt-BR')}`);
  console.log(`📁 Arquivo de Staging Gerado: data/staging_questoes_gemeas_locais.json`);
  console.log('🔒 Zero commits automáticos no Supabase. Tudo seguro para aprovação.');
  console.log('========================================================================\n');
}

main().catch(console.error);
