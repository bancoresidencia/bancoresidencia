#!/usr/bin/env node

/**
 * scripts/extract_hardwork.mjs
 * 
 * Pipeline de Extração de Questões, Gabaritos e Comentários do HardworQ
 * Mapeamento direto para a tipagem Question do Banco Residência.
 * 
 * Uso:
 *   node scripts/extract_hardwork.mjs --test          # Teste piloto (3 provas)
 *   node scripts/extract_hardwork.mjs --limit 10      # Extrai 10 provas
 *   node scripts/extract_hardwork.mjs --prova 3523    # Extrai prova específica
 *   node scripts/extract_hardwork.mjs --full          # Extrai todo o catálogo com checkpoint
 *   node scripts/extract_hardwork.mjs --dry-run       # Apenas simula sem salvar
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// ==========================================
// CONFIGURAÇÃO DE ACESSO & ENDPOINTS
// ==========================================
const BASE_URL = 'https://extensivo.hardworkmedicina.api.br/';
const BEARER_TOKEN = process.env.HARDWORK_BEARER || 'YzJjNTZkYjMtMGQwNS00NGJiLTk5YzUtZjJhN2E4ODlmNjdl';
const USER_TOKEN = process.env.HARDWORK_USER_TOKEN || 'NjRENkJBNTE2NDJGNDkxNUE1RUI=';

const HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${BEARER_TOKEN}`,
  'UserToken': USER_TOKEN,
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

const DATA_DIR = path.join(ROOT_DIR, 'data', 'hardwork');
const PROVAS_DIR = path.join(DATA_DIR, 'provas');
const CHECKPOINT_FILE = path.join(DATA_DIR, 'checkpoint.json');
const PROVAS_CATALOG_FILE = path.join(DATA_DIR, 'provas_catalog.json');

// ==========================================
// UTILITÁRIOS
// ==========================================
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    limit: null,
    provaId: null,
    full: false,
    dryRun: false,
    delayMs: 250,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--test') {
      options.limit = 3;
    } else if (arg === '--limit' && args[i + 1]) {
      options.limit = parseInt(args[++i], 10);
    } else if (arg === '--prova' && args[i + 1]) {
      options.provaId = parseInt(args[++i], 10);
    } else if (arg === '--full') {
      options.full = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--delay' && args[i + 1]) {
      options.delayMs = parseInt(args[++i], 10);
    }
  }

  return options;
}

function loadCheckpoint() {
  if (fs.existsSync(CHECKPOINT_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf-8'));
    } catch (e) {
      console.warn('⚠️ Falha ao ler checkpoint. Criando novo estado.');
    }
  }
  return {
    completedProvaIds: [],
    failedProvaIds: [],
    totalQuestoesExtraidas: 0,
    lastUpdate: null,
  };
}

function saveCheckpoint(checkpoint) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  checkpoint.lastUpdate = new Date().toISOString();
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2), 'utf-8');
}

// ==========================================
// MAPEAMENTO PARA BANCO RESIDÊNCIA
// ==========================================
const NUMBER_TO_LETTER = {
  '1': 'A',
  '2': 'B',
  '3': 'C',
  '4': 'D',
  '5': 'E',
};

function mapModalidade(grupo) {
  const g = String(grupo || '').toUpperCase();
  if (g.includes('R3') || g.includes('R4') || g.includes('R+')) {
    if (g.includes('CM') || g.includes('CLINICA')) return 'R+ Clínica Médica';
    if (g.includes('CIRURGIA')) return 'R+ Cirurgia';
    if (g.includes('PED')) return 'R+ Pediatria';
    if (g.includes('GO')) return 'R+ Ginecologia e Obstetrícia';
    return 'Residência Médica';
  }
  if (g.includes('REVALIDA')) return 'Revalida';
  return 'Residência Médica';
}

export function normalizeQuestion(hwQ, provaMeta) {
  const isAnulada = Boolean(hwQ.anulada);

  // Mapear opções
  const options = (hwQ.alternativas || []).map((alt) => {
    const rawLetter = String(alt.letra || '').trim();
    const mappedLetter = NUMBER_TO_LETTER[rawLetter] || rawLetter || 'A';
    return {
      letter: mappedLetter,
      text: (alt.alternativa || '').trim(),
    };
  });

  // Identificar alternativa correta
  let correctAnswer = '';
  if (isAnulada) {
    correctAnswer = 'ANULADA';
  } else {
    const correctOpt = (hwQ.alternativas || []).find((a) => a.correta === true);
    if (correctOpt) {
      const rawLetter = String(correctOpt.letra || '').trim();
      correctAnswer = NUMBER_TO_LETTER[rawLetter] || rawLetter;
    }
  }

  const instName = provaMeta?.instituicao || hwQ.prova?.instituicao || 'Não informada';
  const year = parseInt(provaMeta?.ano || hwQ.prova?.ano || 0, 10) || new Date().getFullYear();
  const grupo = provaMeta?.grupo || hwQ.prova?.grupo || 'R1';
  const modalidade = mapModalidade(grupo);

  return {
    id: `hw-${hwQ.id}`,
    code: hwQ.codigo || `HW-${hwQ.id}`,
    institution: instName,
    banca: instName,
    year: year,
    tipoProva: provaMeta?.nome || hwQ.prova?.nome || grupo,
    modalidade: modalidade,
    especialidade: 'Clínica Médica', // Será enriquecido por taxonomia
    tema: 'Geral',
    foco: 'Geral',
    subfoco: 'Geral',
    difficulty: 'Médio',
    type: 'Múltipla escolha',
    isAnulada: isAnulada,
    statement: (hwQ.enunciado || '').trim(),
    options: options,
    correctAnswer: correctAnswer,
    commentary: '', // Descartado conforme diretriz: sem justificativas/comentários de professores terceiros
    imageUrl: hwQ.imagem ? hwQ.imagem.trim() : undefined,
    images: hwQ.imagem ? [hwQ.imagem.trim()] : [],
    rawHardwork: {
      id: hwQ.id,
      provaId: provaMeta?.id,
    }
  };
}

// ==========================================
// OPERAÇÕES DE REDE
// ==========================================
async function fetchCatalog() {
  if (fs.existsSync(PROVAS_CATALOG_FILE)) {
    try {
      const cached = JSON.parse(fs.readFileSync(PROVAS_CATALOG_FILE, 'utf-8'));
      if (Array.isArray(cached) && cached.length > 0) {
        console.log(`📦 Usando catálogo em cache: ${cached.length} provas.`);
        return cached;
      }
    } catch (e) {}
  }

  console.log('📡 Buscando catálogo de provas na API HardworQ...');
  const res = await fetch(`${BASE_URL}provas`, { headers: HEADERS });
  if (!res.ok) {
    throw new Error(`Erro HTTP ao buscar catálogo de provas: ${res.status}`);
  }
  const json = await res.json();
  if (!json.ok || !Array.isArray(json.obj)) {
    throw new Error(`Resposta inválida da API ao buscar provas: ${JSON.stringify(json)}`);
  }

  const catalog = json.obj;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(PROVAS_CATALOG_FILE, JSON.stringify(catalog, null, 2), 'utf-8');
  console.log(`✅ Catálogo recebido com sucesso: ${catalog.length} provas cadastradas.`);
  return catalog;
}

async function fetchQuestoesDaProva(provaId, retries = 3) {
  const url = `${BASE_URL}provas/${provaId}/questoes`;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: HEADERS });
      if (res.status === 404) return [];
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.ok && Array.isArray(json.obj)) {
        return json.obj;
      }
      return [];
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(1000 * attempt);
    }
  }
  return [];
}

// ==========================================
// EXECUTOR PRINCIPAL
// ==========================================
async function main() {
  const options = parseArgs();
  console.log('========================================================');
  console.log('🚀 HARDWORQ EXTRACTOR — BANCO RESIDÊNCIA');
  console.log('========================================================');
  console.log(`Configuração:`, {
    limit: options.limit ?? 'Todos',
    provaId: options.provaId ?? 'Nenhum (em lote)',
    dryRun: options.dryRun,
    delayMs: options.delayMs
  });

  fs.mkdirSync(PROVAS_DIR, { recursive: true });

  const catalog = await fetchCatalog();
  let checkpoint = loadCheckpoint();

  let targetProvas = [];

  if (options.provaId) {
    const found = catalog.find((p) => p.id === options.provaId);
    targetProvas = found ? [found] : [{ id: options.provaId, nome: `Prova ${options.provaId}` }];
  } else {
    // Filtrar já extraídas
    const completedSet = new Set(checkpoint.completedProvaIds);
    targetProvas = catalog.filter((p) => !completedSet.has(p.id));

    if (options.limit && options.limit > 0) {
      targetProvas = targetProvas.slice(0, options.limit);
    }
  }

  console.log(`📋 Provas selecionadas para esta execução: ${targetProvas.length}`);
  if (targetProvas.length === 0) {
    console.log('✨ Nenhuma prova pendente para extração. Processo finalizado.');
    return;
  }

  let totalQuestionsExtracted = 0;
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < targetProvas.length; i++) {
    const prova = targetProvas[i];
    const indexStr = `[${i + 1}/${targetProvas.length}]`;
    const provaNomeCurto = (prova.nome || prova.codigo || `ID ${prova.id}`).slice(0, 60);

    try {
      const rawQuestoes = await fetchQuestoesDaProva(prova.id);

      const normalizedQuestoes = rawQuestoes.map((q) => normalizeQuestion(q, prova));
      const withAnswer = normalizedQuestoes.filter((q) => q.correctAnswer && q.correctAnswer.length > 0).length;

      if (!options.dryRun) {
        const outFilePath = path.join(PROVAS_DIR, `prova_${prova.id}.json`);
        fs.writeFileSync(outFilePath, JSON.stringify({
          provaMeta: prova,
          totalQuestoes: normalizedQuestoes.length,
          questoes: normalizedQuestoes,
        }, null, 2), 'utf-8');

        checkpoint.completedProvaIds.push(prova.id);
        checkpoint.totalQuestoesExtraidas += normalizedQuestoes.length;
        saveCheckpoint(checkpoint);
      }

      totalQuestionsExtracted += normalizedQuestoes.length;
      successCount++;

      console.log(`⏳ ${indexStr} Prova #${prova.id} (${provaNomeCurto}) -> ✅ ${normalizedQuestoes.length} questões (gabaritos: ${withAnswer})`);

      if ((i + 1) % 50 === 0 || i === targetProvas.length - 1) {
        console.log(`📊 [PROGRESSO]: ${i + 1}/${targetProvas.length} provas processadas | Total acumulado: ${checkpoint.totalQuestoesExtraidas} questões`);
      }
    } catch (err) {
      failCount++;
      console.log(`❌ ${indexStr} Prova #${prova.id} (${provaNomeCurto}) -> Erro: ${err.message}`);
      checkpoint.failedProvaIds.push({ id: prova.id, error: err.message, date: new Date().toISOString() });
      if (!options.dryRun) saveCheckpoint(checkpoint);
    }

    if (i < targetProvas.length - 1 && options.delayMs > 0) {
      await sleep(options.delayMs);
    }
  }

  console.log('========================================================');
  console.log('🏁 RESUMO DA EXECUÇÃO:');
  console.log(`   Provas processadas com sucesso: ${successCount}`);
  console.log(`   Provas com falha: ${failCount}`);
  console.log(`   Total de questões coletadas: ${totalQuestionsExtracted}`);
  console.log(`   Checkpoint atualizado em: ${CHECKPOINT_FILE}`);
  console.log(`   Diretório de saída: ${PROVAS_DIR}`);
  console.log('========================================================');
}

// Execução se chamado diretamente
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('💥 Erro fatal no executor:', err);
    process.exit(1);
  });
}

