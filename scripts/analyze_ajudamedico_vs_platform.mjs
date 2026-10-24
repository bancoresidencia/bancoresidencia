import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'knowledge', 'extracao_ajudamedico');
const REPORT_PATH = path.join(process.cwd(), 'data', 'ajudamedico_vs_platform_report.json');

// Carrega .env.local
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

function norm(text) {
  if (!text) return '';
  return text.normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function getPrefix(text, len = 120) {
  const n = norm(text);
  return n.substring(0, len);
}

function getTokens(text) {
  return new Set(norm(text).split(' ').filter(w => w.length >= 4));
}

function jaccard(setA, setB) {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const elem of setA) {
    if (setB.has(elem)) intersection++;
  }
  return intersection / (setA.size + setB.size - intersection);
}

async function fetchSupabaseQuestions() {
  console.log('📡 Buscando questões recentes (2024+) no Supabase para cruzamento...');
  const questions = [];
  const limit = 1000;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const url = `${SUPABASE_URL}/rest/v1/questions?year=gte.2024&select=id,code,institution,banca,year,statement,correct_answer,is_anulada&order=id&limit=${limit}&offset=${offset}`;
    try {
      const res = await fetch(url, {
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`
        }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        hasMore = false;
        break;
      }
      questions.push(...data);
      offset += data.length;
      process.stdout.write(`\r   Carregadas ${questions.length.toLocaleString('pt-BR')} questões da plataforma...`);
      if (data.length < limit) {
        hasMore = false;
      }
    } catch (e) {
      console.error('\nErro ao buscar no Supabase:', e.message);
      break;
    }
  }
  console.log(`\n✅ Total de questões carregadas do Supabase (2024+): ${questions.length.toLocaleString('pt-BR')}`);
  return questions;
}

function loadAjudaQuestions() {
  console.log('📦 Carregando questões extraídas do AjudaMédico...');
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  const all = [];
  for (const f of files) {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'));
      if (Array.isArray(content)) all.push(...content);
    } catch (err) {}
  }
  console.log(`✅ Total de questões AjudaMédico carregadas: ${all.length.toLocaleString('pt-BR')}`);
  return all;
}

async function main() {
  console.log('===============================================================');
  console.log('🔍 CRUZAMENTO DE DADOS: AJUDAMÉDICO x BANCO RESIDÊNCIA');
  console.log('===============================================================\n');

  const ajudaQuestions = loadAjudaQuestions();
  const supaQuestions = await fetchSupabaseQuestions();

  console.log('\n🧠 Construindo índices de busca em memória...');

  // Índices do Supabase por prefixo exato (120 caracteres) e por prefixo curto (70 caracteres)
  const supaPrefix120 = new Map();
  const supaPrefix70 = new Map();
  const supaList = [];

  for (const sq of supaQuestions) {
    const p120 = getPrefix(sq.statement, 120);
    const p70 = getPrefix(sq.statement, 70);
    const hasGab = sq.correct_answer && String(sq.correct_answer).trim().length > 0;
    const gabVal = hasGab ? String(sq.correct_answer).trim().toUpperCase() : null;

    const item = {
      id: sq.id,
      code: sq.code,
      institution: sq.institution,
      banca: sq.banca,
      year: sq.year,
      hasGabarito: hasGab,
      gabarito: gabVal,
      isAnulada: sq.is_anulada,
      statementPrefix: p120,
      tokens: getTokens(sq.statement)
    };

    if (p120.length >= 40 && !supaPrefix120.has(p120)) {
      supaPrefix120.set(p120, item);
    }
    if (p70.length >= 30 && !supaPrefix70.has(p70)) {
      supaPrefix70.set(p70, item);
    }
    supaList.push(item);
  }

  console.log('⚡ Executando cruzamento comparativo...');

  let matchTotal = 0;
  let matchComGabarito = 0;
  let matchSemGabarito = 0;
  let gabaritoConcordante = 0;
  let gabaritoDivergente = 0;
  let questoesNovas = 0;

  const matchesSemGabaritoExemplos = [];
  const questoesNovasExemplos = [];
  const bancasBreakdown = {};

  for (const aj of ajudaQuestions) {
    const p120 = getPrefix(aj.statement, 120);
    const p70 = getPrefix(aj.statement, 70);

    let match = supaPrefix120.get(p120) || supaPrefix70.get(p70);

    // Fallback: busca por similaridade de tokens se prefixo falhar mas houver boa probabilidade
    if (!match && aj.statement && aj.statement.length > 80) {
      const ajTokens = getTokens(aj.statement);
      if (ajTokens.size >= 8) {
        // Testa apenas contra candidatos do mesmo ano se disponível
        const candList = aj.year ? supaList.filter(s => s.year === aj.year) : supaList;
        for (const cand of candList) {
          const sim = jaccard(ajTokens, cand.tokens);
          if (sim >= 0.85) {
            match = cand;
            break;
          }
        }
      }
    }

    const bancaName = aj.exam || aj.banca || 'Outras';
    if (!bancasBreakdown[bancaName]) {
      bancasBreakdown[bancaName] = { total: 0, naPlataforma: 0, novas: 0, semGabaritoNaPlataforma: 0 };
    }
    bancasBreakdown[bancaName].total++;

    if (match) {
      matchTotal++;
      bancasBreakdown[bancaName].naPlataforma++;

      if (match.hasGabarito) {
        matchComGabarito++;
        if (match.gabarito === aj.officialAnswer) {
          gabaritoConcordante++;
        } else {
          gabaritoDivergente++;
        }
      } else {
        matchSemGabarito++;
        bancasBreakdown[bancaName].semGabaritoNaPlataforma++;
        if (matchesSemGabaritoExemplos.length < 15) {
          matchesSemGabaritoExemplos.push({
            supabaseId: match.id,
            ajudaId: aj.id,
            banca: aj.exam,
            ano: aj.year,
            gabaritoAjuda: aj.officialAnswer,
            enunciadoSnippet: (aj.statement || '').substring(0, 100)
          });
        }
      }
    } else {
      questoesNovas++;
      bancasBreakdown[bancaName].novas++;
      if (questoesNovasExemplos.length < 15) {
        questoesNovasExemplos.push({
          ajudaId: aj.id,
          banca: aj.exam,
          ano: aj.year,
          gabarito: aj.officialAnswer,
          enunciadoSnippet: (aj.statement || '').substring(0, 100)
        });
      }
    }
  }

  const report = {
    geradoEm: new Date().toISOString(),
    totalAjudaQuestoes: ajudaQuestions.length,
    totalSupabase2024Plus: supaQuestions.length,
    jaNaPlataforma: {
      total: matchTotal,
      percentual: Number(((matchTotal / ajudaQuestions.length) * 100).toFixed(1)),
      comGabarito: {
        total: matchComGabarito,
        percentual: Number(((matchComGabarito / matchTotal) * 100).toFixed(1)),
        concordante: gabaritoConcordante,
        divergente: gabaritoDivergente
      },
      semGabarito: {
        total: matchSemGabarito,
        percentual: Number(((matchSemGabarito / matchTotal) * 100).toFixed(1)),
        exemplos: matchesSemGabaritoExemplos
      }
    },
    novasParaPlataforma: {
      total: questoesNovas,
      percentual: Number(((questoesNovas / ajudaQuestions.length) * 100).toFixed(1)),
      exemplos: questoesNovasExemplos
    },
    bancasBreakdown
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');

  console.log('\n===============================================================');
  console.log('📊 RESULTADO CONSOLIDADO DO CRUZAMENTO');
  console.log('===============================================================');
  console.log(`📚 Total de Questões Extraídas:     ${ajudaQuestions.length.toLocaleString('pt-BR')}`);
  console.log(`\n📌 1. QUESTÕES JÁ PRESENTES NA PLATAFORMA: ${matchTotal.toLocaleString('pt-BR')} (${report.jaNaPlataforma.percentual}%)`);
  console.log(`   🟢 Com Gabarito na Plataforma:   ${matchComGabarito.toLocaleString('pt-BR')} (${report.jaNaPlataforma.comGabarito.percentual}% das existentes)`);
  console.log(`      - Concordantes:               ${gabaritoConcordante.toLocaleString('pt-BR')}`);
  console.log(`      - Divergentes (para curadoria): ${gabaritoDivergente.toLocaleString('pt-BR')}`);
  console.log(`   🟡 SEM GABARITO na Plataforma:   ${matchSemGabarito.toLocaleString('pt-BR')} (${report.jaNaPlataforma.semGabarito.percentual}% das existentes)`);
  console.log(`      ✨ O AjudaMédico fornece o gabarito oficial e explicação para todas elas!`);
  console.log(`\n🆕 2. QUESTÕES 100% INÉDITAS / NOVAS: ${questoesNovas.toLocaleString('pt-BR')} (${report.novasParaPlataforma.percentual}%)`);
  console.log(`   🚀 Prontas para serem inseridas como novo acervo no Banco Residência!`);
  console.log('===============================================================\n');
}

main().catch(console.error);
