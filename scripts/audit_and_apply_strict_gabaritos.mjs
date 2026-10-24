import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'knowledge', 'extracao_ajudamedico');
const REPORT_PATH = path.join(process.cwd(), 'data', 'auditoria_divergencias_e_gabaritos_estritos.json');

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

// 1. Carrega as 9.223 questões do AjudaMédico
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
  console.log(`✅ Total de questões AjudaMédico: ${all.length.toLocaleString('pt-BR')}`);
  return all;
}

// 2. Carrega todas as questões 2024+ do Supabase via Keyset Pagination
async function fetchAllSupabaseQuestions() {
  console.log('📡 Buscando acervo da plataforma (2024+) no Supabase via keyset pagination...');
  const questions = [];
  let lastId = null;
  const limit = 1000;
  let hasMore = true;

  while (hasMore) {
    let url = `${SUPABASE_URL}/rest/v1/questions?year=gte.2024&order=id.asc&limit=${limit}&select=id,code,institution,banca,year,statement,options,correct_answer,is_anulada`;
    if (lastId) {
      url += `&id=gt.${lastId}`;
    }

    try {
      const res = await fetch(url, {
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`
        }
      });
      if (!res.ok) {
        console.warn(`Alerta HTTP ${res.status}`);
        break;
      }
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        hasMore = false;
        break;
      }
      questions.push(...data);
      lastId = data[data.length - 1].id;
      process.stdout.write(`\r   Carregadas ${questions.length.toLocaleString('pt-BR')} questões da plataforma...`);
      if (data.length < limit) {
        hasMore = false;
      }
    } catch (e) {
      console.error('Erro na requisição:', e.message);
      break;
    }
  }
  console.log(`\n✅ Total de questões carregadas do Supabase (2024+): ${questions.length.toLocaleString('pt-BR')}`);
  return questions;
}

async function main() {
  console.log('===============================================================');
  console.log('🔬 AUDITORIA E ATUALIZAÇÃO ESTRITA DE GABARITOS');
  console.log(`🛡️ Modo: ${isApply ? '🚀 APLICAÇÃO ATIVA NO SUPABASE' : '🔍 DRY-RUN (SOMENTE AUDITORIA)'}`);
  console.log('🛡️ Regras: Máxima similaridade | Sem comentários | Sem novas questões');
  console.log('===============================================================\n');

  const ajudaQuestions = loadAjudaQuestions();
  const supaQuestions = await fetchAllSupabaseQuestions();

  console.log('🧠 Indexando questões da plataforma por prefixos normalizados...');
  const map100 = new Map();
  const map70 = new Map();
  const map50 = new Map();

  for (const sq of supaQuestions) {
    const n = norm(sq.statement);
    const p100 = n.substring(0, 100);
    const p70 = n.substring(0, 70);
    const p50 = n.substring(0, 50);

    const item = {
      ...sq,
      normStatement: n,
      tokens: getTokens(sq.statement)
    };

    if (p100.length >= 35 && !map100.has(p100)) map100.set(p100, item);
    if (p70.length >= 30 && !map70.has(p70)) map70.set(p70, item);
    if (p50.length >= 25 && !map50.has(p50)) map50.set(p50, item);
  }

  console.log('⚡ Cruzando dados com validação rigorosa de similaridade...');

  const divergencias = [];
  const aprovadosParaAtualizar = [];
  const rejeitadosComMotivo = [];

  for (const aj of ajudaQuestions) {
    const nAj = norm(aj.statement);
    const p100 = nAj.substring(0, 100);
    const p70 = nAj.substring(0, 70);
    const p50 = nAj.substring(0, 50);

    // Busca rápida nos mapas de prefixo
    const match = map100.get(p100) || map70.get(p70) || map50.get(p50);

    if (!match) continue; // Questão nova — ignorada conforme solicitado

    const ansPlat = match.correct_answer ? String(match.correct_answer).trim().toUpperCase() : null;
    const ansAjuda = aj.officialAnswer ? String(aj.officialAnswer).trim().toUpperCase() : null;

    // -------------------------------------------------------------
    // CASO A: Questão já possuía gabarito -> Análise de Divergência
    // -------------------------------------------------------------
    if (ansPlat) {
      if (ansPlat !== ansAjuda) {
        let tipo = 'GABARITO_DISTINTO_BANCA_OU_RECURSO';
        let explicacaoDivergencia = 'Divergência direta entre a resposta cadastrada na plataforma e o gabarito oficial homologado.';

        const isAnuladaPlat = match.is_anulada || ansPlat === 'ANULADA' || ansPlat.includes('ANUL');
        const isAnuladaAjuda = ansAjuda === 'ANULADA' || (aj.is_anulada === true);

        if (isAnuladaPlat || isAnuladaAjuda) {
          tipo = 'ANULACAO_DE_QUESTAO';
          explicacaoDivergencia = isAnuladaPlat 
            ? 'Plataforma registrou como ANULADA, enquanto AjudaMédico manteve a letra da banca.' 
            : 'AjudaMédico registrou como ANULADA após recurso, enquanto Plataforma manteve o gabarito preliminar.';
        } else if (Array.isArray(match.options) && Array.isArray(aj.options)) {
          // Verifica se a resposta em texto é a mesma, mas mudou de letra (troca de caderno / prova diferente)
          const optPlat = match.options.find(o => (o.id || o.letter) === ansPlat);
          const optAjuda = aj.options.find(o => o.id === ansAjuda);
          if (optPlat && optAjuda) {
            const simText = jaccard(getTokens(optPlat.text), getTokens(optAjuda.text));
            if (simText >= 0.75) {
              tipo = 'PERMUTACAO_DE_CADERNO_PROVA';
              explicacaoDivergencia = `Mesma resposta em texto (${optPlat.text?.substring(0, 50)}...), mas a letra era ${ansPlat} no caderno da plataforma e ${ansAjuda} no caderno do AjudaMédico.`;
            }
          }
        }

        divergencias.push({
          idPlataforma: match.id,
          idAjuda: aj.id,
          instituicaoPlataforma: match.institution || match.banca,
          instituicaoAjuda: aj.exam || aj.banca,
          ano: match.year || aj.year,
          gabaritoPlataforma: ansPlat,
          gabaritoAjuda: ansAjuda,
          tipoDivergencia: tipo,
          explicacaoDivergencia,
          enunciado: (match.statement || aj.statement || '').substring(0, 150) + '...',
          justificativaAjuda: (aj.medicalExplanation || '').substring(0, 200) + '...'
        });
      }
    }
    // -------------------------------------------------------------
    // CASO B: Questão NÃO tinha gabarito -> Candidata a Atualização
    // -------------------------------------------------------------
    else {
      // 1. Validação de letra válida
      if (!ansAjuda || !['A', 'B', 'C', 'D', 'E', 'ANULADA'].includes(ansAjuda)) {
        rejeitadosComMotivo.push({
          idPlataforma: match.id,
          idAjuda: aj.id,
          instituicao: match.institution,
          motivo: `Gabarito ausente ou formato inválido no AjudaMédico: '${ansAjuda}'`,
          enunciado: (match.statement || '').substring(0, 90)
        });
        continue;
      }

      // 2. Validação de similaridade do enunciado
      const simEnunciado = jaccard(getTokens(aj.statement), match.tokens);
      const prefixMatch = nAj.substring(0, 60) === match.normStatement.substring(0, 60);

      if (!prefixMatch && simEnunciado < 0.90) {
        rejeitadosComMotivo.push({
          idPlataforma: match.id,
          idAjuda: aj.id,
          instituicao: match.institution,
          motivo: `Similaridade de enunciado abaixo do limiar estrito (${(simEnunciado * 100).toFixed(1)}% < 90%)`,
          enunciado: (match.statement || '').substring(0, 90)
        });
        continue;
      }

      // 3. Validação de consistência das alternativas (se existirem na plataforma)
      let optionsValid = true;
      let optionsDetail = 'Sem array de opções na plataforma (validação por enunciado estrito)';

      if (Array.isArray(match.options) && match.options.length > 0 && Array.isArray(aj.options) && aj.options.length > 0) {
        const targetOptAjuda = aj.options.find(o => o.id === ansAjuda);
        const targetOptPlat = match.options.find(o => (o.id || o.letter) === ansAjuda);

        if (targetOptAjuda && targetOptPlat && targetOptAjuda.text && targetOptPlat.text) {
          const simOpt = jaccard(getTokens(targetOptAjuda.text), getTokens(targetOptPlat.text));
          if (simOpt < 0.60) {
            optionsValid = false;
            optionsDetail = `Alternativa ${ansAjuda} difere em texto: '${targetOptPlat.text.substring(0, 40)}' vs '${targetOptAjuda.text.substring(0, 40)}'`;
          } else {
            optionsValid = true;
            optionsDetail = `Alternativa ${ansAjuda} confirmada com ${(simOpt * 100).toFixed(0)}% de similaridade textual`;
          }
        }
      }

      if (!optionsValid) {
        rejeitadosComMotivo.push({
          idPlataforma: match.id,
          idAjuda: aj.id,
          instituicao: match.institution,
          motivo: optionsDetail,
          enunciado: (match.statement || '').substring(0, 90)
        });
        continue;
      }

      // APROVADA: similaridade máxima atestada!
      aprovadosParaAtualizar.push({
        idPlataforma: match.id,
        idAjuda: aj.id,
        institution: match.institution || match.banca,
        year: match.year,
        correct_answer: ansAjuda,
        motivoValidacao: optionsDetail,
        enunciado: (match.statement || '').substring(0, 100)
      });
    }
  }

  // Agrupamento de divergências por categoria
  const resumoDivergencias = {};
  for (const d of divergencias) {
    resumoDivergencias[d.tipoDivergencia] = (resumoDivergencias[d.tipoDivergencia] || 0) + 1;
  }

  // Se modo for --apply, executa o PATCH cirúrgico no Supabase
  let totalAtualizados = 0;
  if (isApply && aprovadosParaAtualizar.length > 0) {
    console.log(`\n🚀 INICIANDO ATUALIZAÇÃO CIRÚRGICA DE ${aprovadosParaAtualizar.length} GABARITOS NO SUPABASE...`);
    console.log('🛡️ Apenas o campo "correct_answer" será modificado. Comentários e enunciados permanecem intactos.\n');

    const BATCH_SIZE = 50;
    for (let i = 0; i < aprovadosParaAtualizar.length; i += BATCH_SIZE) {
      const chunk = aprovadosParaAtualizar.slice(i, i + BATCH_SIZE);
      for (const item of chunk) {
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
            totalAtualizados++;
          } else {
            console.warn(`Erro ao atualizar ${item.idPlataforma}: HTTP ${res.status}`);
          }
        } catch (err) {
          console.error(`Falha no item ${item.idPlataforma}:`, err.message);
        }
      }
      process.stdout.write(`\r   Progresso: ${totalAtualizados} de ${aprovadosParaAtualizar.length} gabaritos atualizados...`);
    }
    console.log(`\n✅ Atualização concluída com sucesso: ${totalAtualizados} questões atualizadas.`);
  }

  // Salva relatório detalhado
  const relatorio = {
    geradoEm: new Date().toISOString(),
    modo: isApply ? 'APPLY' : 'DRY_RUN',
    divergencias: {
      total: divergencias.length,
      resumoPorTipo: resumoDivergencias,
      exemplosDetalhados: divergencias.slice(0, 30)
    },
    gabaritosFaltantes: {
      totalAprovados: aprovadosParaAtualizar.length,
      totalRejeitados: rejeitadosComMotivo.length,
      totalAplicados: totalAtualizados,
      exemplosAprovados: aprovadosParaAtualizar.slice(0, 15),
      todosRejeitadosComMotivo: rejeitadosComMotivo
    }
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(relatorio, null, 2), 'utf8');

  console.log('\n===============================================================');
  console.log('📊 RELATÓRIO CONSOLIDADO: DIVERGÊNCIAS E GABARITOS');
  console.log('===============================================================');
  console.log(`⚖️ Total de Divergências Encontradas: ${divergencias.length}`);
  for (const [t, c] of Object.entries(resumoDivergencias)) {
    console.log(`   - [${t}]: ${c} questões`);
  }
  console.log(`\n🎯 Questões sem Gabarito APROVADAS (Similaridade Máxima): ${aprovadosParaAtualizar.length}`);
  console.log(`⛔ Questões REJEITADAS (Inconsistência de Opções ou Similaridade Baixa): ${rejeitadosComMotivo.length}`);
  if (isApply) {
    console.log(`🎉 Questões Efetivamente Atualizadas no Supabase: ${totalAtualizados}`);
  } else {
    console.log(`ℹ️ Modo DRY-RUN concluído. Nenhum dado foi alterado.`);
  }
  console.log(`📁 Relatório completo gravado em: ${REPORT_PATH}`);
  console.log('===============================================================\n');
}

main().catch(console.error);
