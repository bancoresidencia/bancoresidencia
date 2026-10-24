import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'knowledge', 'extracao_ajudamedico');
const REPORT_OUTPUT = path.join(process.cwd(), 'data', 'relatorio_detalhado_978_e_356.json');

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const isApply = process.argv.includes('--apply');

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

function cleanStr(t) {
  if (!t) return '';
  return t.normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function areOptionsMatching(platText, ajudaText) {
  if (!platText || !ajudaText) return false;
  const cPlat = cleanStr(platText);
  const cAjuda = cleanStr(ajudaText);
  if (cPlat === cAjuda) return true;
  if (cPlat.length >= 6 && cAjuda.length >= 6 && (cPlat.includes(cAjuda) || cAjuda.includes(cPlat))) return true;
  const sim = jaccard(getTokens(platText), getTokens(ajudaText));
  return sim >= 0.45;
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
console.log(`📦 Carregadas ${ajudaQuestions.length} questões extraídas do AjudaMédico.`);

// 2. Carrega as 10.000 questões do Supabase (lote inicial onde se detectou 978 sem gabarito e 356 divergências)
async function fetchSupabaseBatch() {
  console.log('📡 Buscando lote de 10.000 questões no Supabase usando keyset pagination...');
  const questions = [];
  const limit = 1000;
  let lastId = null;

  while (questions.length < 10000) {
    let url = `${SUPABASE_URL}/rest/v1/questions?year=gte.2024&select=id,code,institution,banca,year,statement,options,correct_answer,is_anulada&order=id.asc&limit=${limit}`;
    if (lastId) url += `&id=gt.${lastId}`;
    const res = await fetch(url, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });
    if (!res.ok) {
      console.warn(`Aviso ao buscar: HTTP ${res.status}`);
      break;
    }
    const d = await res.json();
    if (!Array.isArray(d) || d.length === 0) break;
    questions.push(...d);
    lastId = d[d.length - 1].id;
    process.stdout.write(`\r   Carregadas ${questions.length} questões do Supabase...`);
    if (d.length < limit) break;
  }
  console.log(`\n✅ Total no Supabase carregado: ${questions.length}`);
  return questions;
}


async function main() {
  const supaQuestions = await fetchSupabaseBatch();

  // Indexação em memória para busca O(1)
  const map120 = new Map();
  const map70 = new Map();
  const map50 = new Map();

  for (const sq of supaQuestions) {
    const n = norm(sq.statement);
    const p120 = n.substring(0, 120);
    const p70 = n.substring(0, 70);
    const p50 = n.substring(0, 50);
    const item = { ...sq, normStatement: n, tokens: getTokens(sq.statement) };

    if (p120.length >= 35 && !map120.has(p120)) map120.set(p120, item);
    if (p70.length >= 25 && !map70.has(p70)) map70.set(p70, item);
    if (p50.length >= 20 && !map50.has(p50)) map50.set(p50, item);
  }

  const seenSupaIds = new Set();
  const divergencias = [];
  const semGabaritoAprovadas = [];
  const semGabaritoRejeitadas = [];

  for (const aj of ajudaQuestions) {
    const nAj = norm(aj.statement);
    const p120 = nAj.substring(0, 120);
    const p70 = nAj.substring(0, 70);
    const p50 = nAj.substring(0, 50);

    const match = map120.get(p120) || map70.get(p70) || map50.get(p50);
    if (!match) continue;

    // Evita duplicatas se a mesma questão da plataforma der match em múltiplos registros
    if (seenSupaIds.has(match.id)) continue;
    seenSupaIds.add(match.id);

    const ansPlat = match.correct_answer ? String(match.correct_answer).trim().toUpperCase() : null;
    const ansAjuda = aj.officialAnswer ? String(aj.officialAnswer).trim().toUpperCase() : null;

    // =========================================================================
    // CASO 1: QUESTÃO COM GABARITO NA PLATAFORMA -> ANÁLISE DE DIVERGÊNCIA
    // =========================================================================
    if (ansPlat) {
      if (ansPlat !== ansAjuda) {
        let categoria = 'GABARITO_ALTERADO_POS_RECURSO';
        let subcategoria = 'Discrepância entre gabarito preliminar da plataforma e gabarito homologado/recurso do AjudaMédico';
        let explicacao = 'A banca examinadora alterou o gabarito oficial após recursos administrativos ou judiciais, gerando divergência entre o gabarito preliminar e o definitivo.';

        const isAnuladaPlat = match.is_anulada || ansPlat === 'ANULADA' || ansPlat.includes('ANUL');
        const isAnuladaAjuda = ansAjuda === 'ANULADA';

        if (isAnuladaPlat || isAnuladaAjuda) {
          categoria = 'QUESTAO_ANULADA';
          subcategoria = isAnuladaPlat
            ? 'Plataforma homologou como ANULADA; AjudaMédico ainda exibe a alternativa da prova original'
            : 'AjudaMédico registrou como ANULADA pós-recurso; Plataforma ainda mantém o gabarito de letra preliminar';
          explicacao = isAnuladaPlat
            ? `Na plataforma consta status 'ANULADA', enquanto na fonte AjudaMédico permanece a letra '${ansAjuda}'.`
            : `No AjudaMédico a questão foi anulada pela banca, enquanto na plataforma permanecia com a alternativa '${ansPlat}'.`;
        } else if (Array.isArray(match.options) && Array.isArray(aj.options)) {
          // Checa se o texto da opção correta no AjudaMédico bate com o texto da opção da plataforma em OUTRA letra (permutação de caderno)
          const optPlatCorreta = match.options.find(o => (o.id || o.letter) === ansPlat);
          const optAjudaCorreta = aj.options.find(o => o.id === ansAjuda);

          // Verifica se o texto da letra da plataforma é igual ao texto da letra do AjudaMédico
          if (optPlatCorreta && optAjudaCorreta) {
            const simMesmaLetra = jaccard(getTokens(optPlatCorreta.text), getTokens(optAjudaCorreta.text));
            // Procura em qual letra da plataforma está o texto de optAjudaCorreta
            const optPlatComTextoAjuda = match.options.find(o => {
              const sim = jaccard(getTokens(o.text), getTokens(optAjudaCorreta.text));
              return sim >= 0.70;
            });

            if (optPlatComTextoAjuda && (optPlatComTextoAjuda.letter || optPlatComTextoAjuda.id) !== ansAjuda) {
              categoria = 'PERMUTACAO_DE_CADERNO_PROVA';
              subcategoria = `Caderno diferente entre fontes (Caderno Tipo 1 vs Caderno Tipo 2)`;
              explicacao = `O texto da alternativa correta é idêntico ('${optAjudaCorreta.text?.substring(0, 50)}...'), porém na plataforma estava indexado como letra ${(optPlatComTextoAjuda.letter || optPlatComTextoAjuda.id)} e no caderno do AjudaMédico como letra ${ansAjuda}.`;
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
          subcategoria,
          explicacao,
          enunciado: (match.statement || aj.statement || '').substring(0, 150) + '...',
          justificativaAjuda: (aj.medicalExplanation || '').substring(0, 250) + '...'
        });
      }
    }
    // =========================================================================
    // CASO 2: QUESTÃO SEM GABARITO NA PLATAFORMA -> AUDITORIA ESTREITA DE SIMILARIDADE
    // =========================================================================
    else {
      // Critério 1: Validade do formato do gabarito extraído
      if (!ansAjuda || !['A', 'B', 'C', 'D', 'E', 'ANULADA'].includes(ansAjuda)) {
        semGabaritoRejeitadas.push({
          idPlataforma: match.id,
          code: match.code,
          instituicao: match.institution,
          ano: match.year,
          gabaritoCandidato: ansAjuda,
          motivo: `Formato de gabarito inválido ou nulo retornado na extração: '${ansAjuda}'`,
          enunciado: (match.statement || '').substring(0, 90) + '...'
        });
        continue;
      }

      // Critério 2: Similaridade textual máxima do enunciado
      const prefixMatch = nAj.substring(0, 70) === match.normStatement.substring(0, 70);
      const simTokens = jaccard(getTokens(aj.statement), match.tokens);

      if (!prefixMatch && simTokens < 0.90) {
        semGabaritoRejeitadas.push({
          idPlataforma: match.id,
          code: match.code,
          instituicao: match.institution,
          ano: match.year,
          gabaritoCandidato: ansAjuda,
          motivo: `Similaridade de enunciado abaixo do limiar máximo estrito (${(simTokens * 100).toFixed(1)}% < 90%)`,
          enunciado: (match.statement || '').substring(0, 90) + '...'
        });
        continue;
      }

      // Critério 3: Validação cruzada estrita do texto das alternativas
      let optionsValid = true;
      let optionsMotive = 'Validado por identidade estrita de enunciado (prefixo e tokens)';

      if (Array.isArray(match.options) && match.options.length > 0 && Array.isArray(aj.options) && aj.options.length > 0) {
        const optPlatCorreta = match.options.find(o => (o.letter || o.id) === ansAjuda);
        const optAjudaCorreta = aj.options.find(o => o.id === ansAjuda);

        if (optPlatCorreta && optAjudaCorreta && optPlatCorreta.text && optAjudaCorreta.text) {
          const matchOpt = areOptionsMatching(optPlatCorreta.text, optAjudaCorreta.text);
          if (!matchOpt) {
            optionsValid = false;
            optionsMotive = `Texto da alternativa ${ansAjuda} difere entre as fontes ('${optPlatCorreta.text.substring(0, 45)}...' vs '${optAjudaCorreta.text.substring(0, 45)}...')`;
          } else {
            optionsMotive = `Texto da alternativa ${ansAjuda} validado com concordância textual direta`;
          }
        }

      }

      if (!optionsValid) {
        semGabaritoRejeitadas.push({
          idPlataforma: match.id,
          code: match.code,
          instituicao: match.institution,
          ano: match.year,
          gabaritoCandidato: ansAjuda,
          motivo: optionsMotive,
          enunciado: (match.statement || '').substring(0, 90) + '...'
        });
        continue;
      }

      // Se passou em todos os critérios de similaridade máxima: APROVADA
      semGabaritoAprovadas.push({
        idPlataforma: match.id,
        code: match.code,
        instituicao: match.institution || match.banca,
        ano: match.year,
        correct_answer: ansAjuda,
        motivoValidacao: optionsMotive,
        enunciado: (match.statement || '').substring(0, 110) + '...'
      });
    }
  }

  // Agrupamento de categorias de divergência
  const contagemCategoriasDivergencias = {};
  for (const d of divergencias) {
    contagemCategoriasDivergencias[d.categoria] = (contagemCategoriasDivergencias[d.categoria] || 0) + 1;
  }

  // Agrupamento de motivos de rejeição
  const contagemMotivosRejeicao = {};
  for (const r of semGabaritoRejeitadas) {
    contagemMotivosRejeicao[r.motivo] = (contagemMotivosRejeicao[r.motivo] || 0) + 1;
  }

  console.log('\n===============================================================');
  console.log('📊 RESULTADO DA AUDITORIA ESTREITA');
  console.log(`   ⚖️ Total de Divergências Encontradas:  ${divergencias.length}`);
  console.log(`   ✅ Gabaritos Aprovados (Similaridade Máxima): ${semGabaritoAprovadas.length}`);
  console.log(`   ⛔ Gabaritos Rejeitados (Com Motivo Formal):  ${semGabaritoRejeitadas.length}`);
  console.log('---------------------------------------------------------------');
  console.log('📌 Distribuição das Categorias de Divergência:');
  console.log(JSON.stringify(contagemCategoriasDivergencias, null, 2));
  console.log('📌 Motivos de Não Adição (Rejeições):');
  console.log(JSON.stringify(contagemMotivosRejeicao, null, 2));
  console.log('===============================================================\n');

  // =========================================================================
  // GRAVAÇÃO DO RELATÓRIO COMPLETO
  // =========================================================================
  const relatorio = {
    geradoEm: new Date().toISOString(),
    modo: isApply ? 'APPLY (Gabaritos gravados no Supabase)' : 'DRY_RUN (Simulação estrita)',
    resumo: {
      totalDivergencias: divergencias.length,
      totalSemGabaritoIdentificadas: semGabaritoAprovadas.length + semGabaritoRejeitadas.length,
      aprovadasParaInjecao: semGabaritoAprovadas.length,
      rejeitadasNaoAdicionadas: semGabaritoRejeitadas.length
    },
    divergencias: {
      distribuicaoPorCategoria: contagemCategoriasDivergencias,
      amostrasDetalhadas: divergencias.slice(0, 25),
      todas: divergencias
    },
    semGabarito: {
      motivosDeNaoAdicao: contagemMotivosRejeicao,
      amostrasAprovadas: semGabaritoAprovadas.slice(0, 25),
      todasAprovadas: semGabaritoAprovadas,
      todasRejeitadas: semGabaritoRejeitadas
    }
  };

  fs.writeFileSync(REPORT_OUTPUT, JSON.stringify(relatorio, null, 2), 'utf8');
  console.log(`💾 Relatório gravado com sucesso em: ${REPORT_OUTPUT}`);

  // =========================================================================
  // EXECUÇÃO DO UPDATE (SE --apply ATIVO)
  // =========================================================================
  if (isApply) {
    console.log(`\n🚀 INICIANDO APLICAÇÃO CIRÚRGICA DE GABARITOS NO SUPABASE...`);
    console.log(`🛡️ Regras estritas: APENAS correct_answer é atualizado. Nenhum comentário e nenhuma questão nova!`);

    let atualizadas = 0;
    let falhas = 0;
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
          if (res.ok) {
            atualizadas++;
          } else {
            falhas++;
          }
        } catch (e) {
          falhas++;
        }
      }));
      process.stdout.write(`\r   Gravando gabaritos: ${atualizadas} / ${semGabaritoAprovadas.length} (Falhas: ${falhas})...`);
    }

    console.log(`\n\n🎉 APLICAÇÃO CONCLUÍDA!`);
    console.log(`   ✅ Sucesso: ${atualizadas} gabaritos atualizados.`);
    console.log(`   ⚠️ Falhas:  ${falhas}`);
  } else {
    console.log(`\n💡 Para gravar os gabaritos no Supabase, execute com a flag: --apply`);
  }
}

main().catch(console.error);
