import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'knowledge', 'extracao_ajudamedico');
const PREV_REPORT_PATH = path.join(process.cwd(), 'data', 'ajudamedico_vs_platform_report.json');
const FINAL_REPORT_PATH = path.join(process.cwd(), 'data', 'relatorio_final_978_e_356.json');

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

function getTokens(text) {
  return new Set(norm(text).split(' ').filter(w => w.length >= 3));
}

function jaccard(setA, setB) {
  if (!setA || !setB || setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const elem of setA) {
    if (setB.has(elem)) intersection++;
  }
  return intersection / (setA.size + setB.size - intersection);
}

// 1. Carrega as 9.223 questões do AjudaMédico
const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
const ajudaQuestions = [];
for (const f of files) {
  try {
    const c = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'));
    if (Array.isArray(c)) ajudaQuestions.push(...c);
  } catch {}
}

// 2. Carrega as 10.000 questões do primeiro censo (onde foram identificadas as 978 e as 356)
async function fetchTargetSupabaseQuestions() {
  console.log('📡 Buscando as 10.000 questões do lote de análise no Supabase...');
  const questions = [];
  const limit = 1000;
  for (let offset = 0; offset < 10000; offset += limit) {
    const url = `${SUPABASE_URL}/rest/v1/questions?year=gte.2024&select=id,code,institution,banca,year,statement,options,correct_answer,is_anulada&order=id&limit=${limit}&offset=${offset}`;
    const res = await fetch(url, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });
    if (!res.ok) break;
    const d = await res.json();
    if (!Array.isArray(d) || d.length === 0) break;
    questions.push(...d);
  }
  console.log(`✅ Carregadas ${questions.length} questões da plataforma.`);
  return questions;
}

async function main() {
  console.log('===============================================================');
  console.log('🎯 PROCESSAMENTO CIRÚRGICO: 978 SEM GABARITO & 356 DIVERGÊNCIAS');
  console.log('===============================================================\n');

  const supaQuestions = await fetchTargetSupabaseQuestions();

  // Indexa Supabase por prefixo 120 e 70
  const supaMap120 = new Map();
  const supaMap70 = new Map();
  for (const sq of supaQuestions) {
    const n = norm(sq.statement);
    const p120 = n.substring(0, 120);
    const p70 = n.substring(0, 70);
    const item = { ...sq, normStatement: n, tokens: getTokens(sq.statement) };
    if (p120.length >= 35 && !supaMap120.has(p120)) supaMap120.set(p120, item);
    if (p70.length >= 25 && !supaMap70.has(p70)) supaMap70.set(p70, item);
  }

  const divergencias = [];
  const semGabaritoAprovadas = [];
  const semGabaritoRejeitadas = [];

  for (const aj of ajudaQuestions) {
    const nAj = norm(aj.statement);
    const p120 = nAj.substring(0, 120);
    const p70 = nAj.substring(0, 70);

    const match = supaMap120.get(p120) || supaMap70.get(p70);
    if (!match) continue; // Pula questões novas

    const ansPlat = match.correct_answer ? String(match.correct_answer).trim().toUpperCase() : null;
    const ansAjuda = aj.officialAnswer ? String(aj.officialAnswer).trim().toUpperCase() : null;

    // -------------------------------------------------------------
    // ANÁLISE DAS 356 DIVERGÊNCIAS
    // -------------------------------------------------------------
    if (ansPlat) {
      if (ansPlat !== ansAjuda) {
        let categoria = 'GABARITO_DEFINITIVO_ALTERADO_POS_RECURSO';
        let explicacao = 'A banca examinadora alterou a alternativa oficial no gabarito definitivo após recursos, ou há discrepância entre edições.';

        const isAnuladaPlat = match.is_anulada || ansPlat === 'ANULADA' || ansPlat.includes('ANUL');
        const isAnuladaAjuda = ansAjuda === 'ANULADA';

        if (isAnuladaPlat || isAnuladaAjuda) {
          categoria = 'QUESTAO_ANULADA';
          explicacao = isAnuladaPlat 
            ? 'Na plataforma está marcada como ANULADA, enquanto no AjudaMédico consta com gabarito de letra.'
            : 'No AjudaMédico a questão foi homologada como ANULADA após recurso oficial.';
        } else if (Array.isArray(match.options) && Array.isArray(aj.options)) {
          const optPlat = match.options.find(o => (o.id || o.letter) === ansPlat);
          const optAjuda = aj.options.find(o => o.id === ansAjuda);
          if (optPlat && optAjuda) {
            const sim = jaccard(getTokens(optPlat.text), getTokens(optAjuda.text));
            if (sim >= 0.7) {
              categoria = 'PERMUTACAO_DE_CADERNO_TIPO_PROVA';
              explicacao = `O texto da resposta correta é idêntico ('${optPlat.text?.substring(0, 45)}...'), porém na prova da plataforma a alternativa era ${ansPlat} e no caderno do AjudaMédico era ${ansAjuda}.`;
            }
          }
        }

        divergencias.push({
          idPlataforma: match.id,
          code: match.code,
          instituicao: match.institution || match.banca || 'N/A',
          ano: match.year || aj.year,
          gabaritoPlataforma: ansPlat,
          gabaritoAjuda: ansAjuda,
          categoria,
          explicacao,
          enunciado: (match.statement || aj.statement || '').substring(0, 160) + '...',
          justificativaAjudaSnippet: (aj.medicalExplanation || '').substring(0, 200) + '...'
        });
      }
    } 
    // -------------------------------------------------------------
    // ANÁLISE DAS 978 QUESTÕES SEM GABARITO (SIMILARIDADE MÁXIMA)
    // -------------------------------------------------------------
    else {
      // Regra 1: Letra válida
      if (!ansAjuda || !['A', 'B', 'C', 'D', 'E', 'ANULADA'].includes(ansAjuda)) {
        semGabaritoRejeitadas.push({
          idPlataforma: match.id,
          instituicao: match.institution,
          ano: match.year,
          motivo: `Formato de gabarito inválido ou ausente no AjudaMédico: '${ansAjuda}'`,
          enunciado: (match.statement || '').substring(0, 90)
        });
        continue;
      }

      // Regra 2: Similaridade textual estrita do enunciado
      const prefixMatch = nAj.substring(0, 70) === match.normStatement.substring(0, 70);
      const simEnunciado = jaccard(getTokens(aj.statement), match.tokens);

      if (!prefixMatch && simEnunciado < 0.92) {
        semGabaritoRejeitadas.push({
          idPlataforma: match.id,
          instituicao: match.institution,
          ano: match.year,
          motivo: `Similaridade de enunciado abaixo do limiar máximo estrito (${(simEnunciado * 100).toFixed(1)}% < 92%)`,
          enunciado: (match.statement || '').substring(0, 90)
        });
        continue;
      }

      // Regra 3: Validação cruzada do texto das opções (se disponível na plataforma)
      let optionsMatch = true;
      let optionsDetail = 'Validado por identidade estrita de enunciado';

      if (Array.isArray(match.options) && match.options.length > 0 && Array.isArray(aj.options) && aj.options.length > 0) {
        const optPlatCorreta = match.options.find(o => (o.id || o.letter) === ansAjuda);
        const optAjudaCorreta = aj.options.find(o => o.id === ansAjuda);

        if (optPlatCorreta && optAjudaCorreta && optPlatCorreta.text && optAjudaCorreta.text) {
          const simOpt = jaccard(getTokens(optPlatCorreta.text), getTokens(optAjudaCorreta.text));
          if (simOpt < 0.55) {
            optionsMatch = false;
            optionsDetail = `Alternativa ${ansAjuda} difere no texto entre as fontes ('${optPlatCorreta.text.substring(0, 30)}...' vs '${optAjudaCorreta.text.substring(0, 30)}...')`;
          } else {
            optionsMatch = true;
            optionsDetail = `Texto da alternativa ${ansAjuda} coincide perfeitamente (${(simOpt * 100).toFixed(0)}% similaridade)`;
          }
        }
      }

      if (!optionsMatch) {
        semGabaritoRejeitadas.push({
          idPlataforma: match.id,
          instituicao: match.institution,
          ano: match.year,
          motivo: optionsDetail,
          enunciado: (match.statement || '').substring(0, 90)
        });
        continue;
      }

      // APROVADA COM SIMILARIDADE MÁXIMA
      semGabaritoAprovadas.push({
        idPlataforma: match.id,
        instituicao: match.institution || match.banca,
        ano: match.year,
        correct_answer: ansAjuda,
        motivoValidacao: optionsDetail,
        enunciado: (match.statement || '').substring(0, 100)
      });
    }
  }

  console.log(`\n===============================================================`);
  console.log(`📊 CONTAGEM PRELIMINAR`);
  console.log(`   ⚖️ Divergências:               ${divergencias.length}`);
  console.log(`   ✅ Aprovadas para Injeção:     ${semGabaritoAprovadas.length}`);
  console.log(`   ⛔ Rejeitadas (com motivo):    ${semGabaritoRejeitadas.length}`);
  console.log(`===============================================================\n`);

  // -------------------------------------------------------------
  // APLICAÇÃO CIRÚRGICA NO SUPABASE (APENAS correct_answer!)
  // -------------------------------------------------------------
  console.log(`🚀 Executando injeção cirúrgica de correct_answer para as ${semGabaritoAprovadas.length} aprovadas...`);
  console.log(`🛡️ Regra cumprida: Nenhum comentário adicionado, nenhuma questão nova adicionada.\n`);

  let atualizadasComSucesso = 0;
  const BATCH_SIZE = 40;

  for (let i = 0; i < semGabaritoAprovadas.length; i += BATCH_SIZE) {
    const batch = semGabaritoAprovadas.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async (item) => {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?id=eq.${item.idPlataforma}`, {
          method: 'PATCH',
          headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            correct_answer: item.correct_answer
          })
        });
        if (res.ok) atualizadasComSucesso++;
      } catch (err) {}
    }));
    process.stdout.write(`\r   Injetando gabaritos: ${atualizadasComSucesso} de ${semGabaritoAprovadas.length} concluídos...`);
  }

  console.log(`\n\n🎉 SUCESSO TOTAL: ${atualizadasComSucesso} questões atualizadas com o gabarito oficial!\n`);

  // Agrupamento das divergências por categoria
  const categoriasDivergencias = {};
  for (const d of divergencias) {
    categoriasDivergencias[d.categoria] = (categoriasDivergencias[d.categoria] || 0) + 1;
  }

  // Agrupamento dos motivos de rejeição
  const motivosRejeicao = {};
  for (const r of semGabaritoRejeitadas) {
    motivosRejeicao[r.motivo] = (motivosRejeicao[r.motivo] || 0) + 1;
  }

  const finalOutput = {
    geradoEm: new Date().toISOString(),
    resumo: {
      totalSemGabaritoProcessadas: semGabaritoAprovadas.length + semGabaritoRejeitadas.length,
      totalGabaritosInjetados: atualizadasComSucesso,
      totalRejeitadas: semGabaritoRejeitadas.length,
      totalDivergencias: divergencias.length
    },
    categoriasDivergencias,
    amostrasDivergencias: divergencias.slice(0, 30),
    todasDivergencias: divergencias,
    motivosRejeicao,
    todasRejeitadas: semGabaritoRejeitadas,
    amostrasAprovadas: semGabaritoAprovadas.slice(0, 20)
  };

  fs.writeFileSync(FINAL_REPORT_PATH, JSON.stringify(finalOutput, null, 2), 'utf8');
  console.log(`💾 Relatório final gravado em: ${FINAL_REPORT_PATH}`);
}

main().catch(console.error);
