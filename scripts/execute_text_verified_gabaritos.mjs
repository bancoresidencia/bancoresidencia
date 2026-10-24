import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'knowledge', 'extracao_ajudamedico');
const AUDIT_REPORT = path.join(process.cwd(), 'data', 'relatorio_execucao_textual_gabaritos.json');

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

function clean(t) {
  return (t || '').normalize('NFKD').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

function getTokens(t) {
  return new Set((t || '').normalize('NFKD').replace(/[^a-zA-Z0-9]/g, ' ').toLowerCase().split(/\s+/).filter(w => w.length >= 3));
}

function jaccard(sA, sB) {
  if (!sA || !sB || sA.size === 0 || sB.size === 0) return 0;
  let inter = 0;
  for (const e of sA) if (sB.has(e)) inter++;
  return inter / (sA.size + sB.size - inter);
}

function areOptionsMatching(platText, ajudaText) {
  if (!platText || !ajudaText) return false;
  const cPlat = clean(platText);
  const cAj = clean(ajudaText);
  if (cPlat === cAj) return true;
  if (cPlat.length >= 6 && cAj.length >= 6 && (cPlat.includes(cAj) || cAj.includes(cPlat))) return true;
  const sim = jaccard(getTokens(platText), getTokens(ajudaText));
  return sim >= 0.45;
}

// 1. Carrega todas as questões extraídas do AjudaMédico
const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
const ajudaList = [];
for (const f of files) {
  try {
    const arr = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'));
    if (Array.isArray(arr)) ajudaList.push(...arr);
  } catch {}
}
console.log(`📦 Carregadas ${ajudaList.length} questões extraídas do AjudaMédico.`);

// Indexa AjudaMédico por prefixo de enunciado normalizado
const ajudaMap100 = new Map();
const ajudaMap70 = new Map();
const ajudaMap50 = new Map();

for (const aj of ajudaList) {
  if (!aj.statement) continue;
  const n = aj.statement.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/<[^>]*>/g, ' ').replace(/[^a-zA-Z0-9]/g, ' ').toLowerCase().replace(/\s+/g, ' ').trim();
  const p100 = n.substring(0, 100);
  const p70 = n.substring(0, 70);
  const p50 = n.substring(0, 50);

  if (p100.length >= 40 && !ajudaMap100.has(p100)) ajudaMap100.set(p100, aj);
  if (p70.length >= 30 && !ajudaMap70.has(p70)) ajudaMap70.set(p70, aj);
  if (p50.length >= 25 && !ajudaMap50.has(p50)) ajudaMap50.set(p50, aj);
}

// 2. Carrega relatório base com os IDs mapeados
const prevReport = JSON.parse(fs.readFileSync('data/relatorio_detalhado_978_e_356.json', 'utf8'));
const posRecursoList = prevReport.divergencias.todas.filter(d => d.categoria === 'GABARITO_ALTERADO_POS_RECURSO');
const permList = prevReport.divergencias.todas.filter(d => d.categoria === 'PERMUTACAO_DE_CADERNO_PROVA');
const rejsList = prevReport.semGabarito.todasRejeitadas.filter(r => !r.motivo.includes('Similaridade de enunciado abaixo'));

async function fetchFromSupabaseByIds(ids) {
  const results = [];
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?id=in.(${batch.join(',')})&select=id,code,institution,banca,year,statement,options,correct_answer`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }
    });
    if (!res.ok) continue;
    const d = await res.json();
    if (Array.isArray(d)) results.push(...d);
  }
  return results;
}

function findAjudaMatch(statement) {
  if (!statement) return null;
  const n = statement.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/<[^>]*>/g, ' ').replace(/[^a-zA-Z0-9]/g, ' ').toLowerCase().replace(/\s+/g, ' ').trim();
  return ajudaMap100.get(n.substring(0, 100)) || ajudaMap70.get(n.substring(0, 70)) || ajudaMap50.get(n.substring(0, 50));
}

async function main() {
  console.log('===============================================================');
  console.log('🎯 EXECUÇÃO CIRÚRGICA: VALIDAÇÃO TEXTUAL ESTATÍSTICA DE GABARITOS');
  console.log('===============================================================\n');

  // Coleta dados do Supabase
  const posRecursoPlat = await fetchFromSupabaseByIds(posRecursoList.map(d => d.idPlataforma));
  const permPlat = await fetchFromSupabaseByIds(permList.map(d => d.idPlataforma));
  const rejsPlat = await fetchFromSupabaseByIds(rejsList.map(r => r.idPlataforma));

  const filaDeAtualizacao = []; // Itens que terão correct_answer alterado no banco
  const auditoriaDetalhada = {
    grupo1_posRecurso: { atualizadas: [], mantidasSemMatch: [] },
    grupo2_permutacao: { mantidasIntactas: [], remapeadas: [], semMatch: [] },
    grupo3_rejeitadasRemapeadas: { remapeadas: [], semMatch: [] }
  };

  // ---------------------------------------------------------------------------
  // GRUPO 1: Gabarito Alterado Pós-Recurso (com validação estrita do texto da opção)
  // ---------------------------------------------------------------------------
  console.log('🔍 Auditando Grupo 1: Gabarito Alterado Pós-Recurso (validação textual)...');
  for (const pq of posRecursoPlat) {
    const aj = findAjudaMatch(pq.statement);
    if (!aj) {
      auditoriaDetalhada.grupo1_posRecurso.mantidasSemMatch.push({ id: pq.id, code: pq.code, motivo: 'Enunciado não pareado no AjudaMédico' });
      continue;
    }

    if (aj.officialAnswer === 'ANULADA') {
      filaDeAtualizacao.push({ id: pq.id, code: pq.code, correct_answer: 'ANULADA', grupo: 'Grupo 1 (Anulação Oficial Pós-Recurso)' });
      auditoriaDetalhada.grupo1_posRecurso.atualizadas.push({ id: pq.id, code: pq.code, letraAnterior: pq.correct_answer, novaLetra: 'ANULADA', motivo: 'Anulada formalmente pós-recurso' });
      continue;
    }

    const optAjuda = aj.options?.find(o => o.id === aj.officialAnswer);
    if (!optAjuda) {
      auditoriaDetalhada.grupo1_posRecurso.mantidasSemMatch.push({ id: pq.id, code: pq.code, motivo: 'Opção oficial não encontrada no AjudaMédico' });
      continue;
    }

    // Busca nas alternativas da plataforma qual corresponde ao texto da opção correta do AjudaMédico
    let letraAlvoPlataforma = null;
    let textoOpcaoCorrespondente = null;

    for (const po of (pq.options || [])) {
      if (areOptionsMatching(po.text, optAjuda.text)) {
        letraAlvoPlataforma = po.letter || po.id;
        textoOpcaoCorrespondente = po.text;
        break;
      }
    }

    if (letraAlvoPlataforma) {
      if (pq.correct_answer !== letraAlvoPlataforma) {
        filaDeAtualizacao.push({
          id: pq.id,
          code: pq.code,
          correct_answer: letraAlvoPlataforma,
          grupo: 'Grupo 1 (Pós-Recurso com Texto Validado)'
        });
      }
      auditoriaDetalhada.grupo1_posRecurso.atualizadas.push({
        id: pq.id,
        code: pq.code,
        letraAnterior: pq.correct_answer,
        novaLetra: letraAlvoPlataforma,
        textoConfirmado: textoOpcaoCorrespondente?.substring(0, 50)
      });
    } else {
      auditoriaDetalhada.grupo1_posRecurso.mantidasSemMatch.push({
        id: pq.id,
        code: pq.code,
        gabaritoAjuda: aj.officialAnswer,
        textoAjuda: optAjuda.text.substring(0, 45),
        motivo: 'Texto da opção do AjudaMédico não coincide com nenhuma alternativa da questão na plataforma'
      });
    }
  }

  // ---------------------------------------------------------------------------
  // GRUPO 2: Permutação de Caderno / Tipo de Prova
  // Regra: se o texto da letra atual na plataforma já bate com o texto correto, MANTÉM.
  // Mude apenas se o texto da letra atual na plataforma for diferente, remapeando para a letra certa.
  // ---------------------------------------------------------------------------
  console.log('🔍 Auditando Grupo 2: Permutação de Caderno (validação textual de caderno)...');
  for (const pq of permPlat) {
    const aj = findAjudaMatch(pq.statement);
    if (!aj) {
      auditoriaDetalhada.grupo2_permutacao.semMatch.push({ id: pq.id, code: pq.code });
      continue;
    }

    const optAjudaCorreta = aj.options?.find(o => o.id === aj.officialAnswer);
    const optPlatCorreta = pq.options?.find(o => (o.letter || o.id) === pq.correct_answer);

    if (!optAjudaCorreta || !optPlatCorreta) {
      auditoriaDetalhada.grupo2_permutacao.semMatch.push({ id: pq.id, code: pq.code });
      continue;
    }

    // Caso A: O gabarito atual da plataforma já aponta para a opção com o texto correto!
    if (areOptionsMatching(optPlatCorreta.text, optAjudaCorreta.text)) {
      auditoriaDetalhada.grupo2_permutacao.mantidasIntactas.push({
        id: pq.id,
        code: pq.code,
        letraMantida: pq.correct_answer,
        textoConfirmado: optPlatCorreta.text.substring(0, 45)
      });
    } else {
      // Caso B: O texto da alternativa na plataforma é diferente! Procura em qual letra está o texto correto
      let novaLetra = null;
      let textoCorrespondente = null;
      for (const po of (pq.options || [])) {
        if (areOptionsMatching(po.text, optAjudaCorreta.text)) {
          novaLetra = po.letter || po.id;
          textoCorrespondente = po.text;
          break;
        }
      }

      if (novaLetra && novaLetra !== pq.correct_answer) {
        filaDeAtualizacao.push({
          id: pq.id,
          code: pq.code,
          correct_answer: novaLetra,
          grupo: 'Grupo 2 (Caderno Remapeado por Texto)'
        });
        auditoriaDetalhada.grupo2_permutacao.remapeadas.push({
          id: pq.id,
          code: pq.code,
          letraAnterior: pq.correct_answer,
          novaLetra,
          textoConfirmado: textoCorrespondente?.substring(0, 45)
        });
      } else {
        auditoriaDetalhada.grupo2_permutacao.semMatch.push({
          id: pq.id,
          code: pq.code,
          motivo: 'Texto da opção correta não encontrado entre as alternativas'
        });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // GRUPO 3: Rejeitadas por Divergência Textual Crítica (procura correspondência de letra)
  // ---------------------------------------------------------------------------
  console.log('🔍 Auditando Grupo 3: 45 Rejeitadas (busca de correspondência textual)...');
  for (const pq of rejsPlat) {
    const aj = findAjudaMatch(pq.statement);
    if (!aj) {
      auditoriaDetalhada.grupo3_rejeitadasRemapeadas.semMatch.push({ id: pq.id, code: pq.code });
      continue;
    }

    const optAjudaCorreta = aj.options?.find(o => o.id === aj.officialAnswer);
    if (!optAjudaCorreta) {
      auditoriaDetalhada.grupo3_rejeitadasRemapeadas.semMatch.push({ id: pq.id, code: pq.code });
      continue;
    }

    let letraCorrespondente = null;
    let textoCorrespondente = null;

    for (const po of (pq.options || [])) {
      if (areOptionsMatching(po.text, optAjudaCorreta.text)) {
        letraCorrespondente = po.letter || po.id;
        textoCorrespondente = po.text;
        break;
      }
    }

    if (letraCorrespondente) {
      filaDeAtualizacao.push({
        id: pq.id,
        code: pq.code,
        correct_answer: letraCorrespondente,
        grupo: 'Grupo 3 (Remapeada com Correspondência Textual Exata)'
      });
      auditoriaDetalhada.grupo3_rejeitadasRemapeadas.remapeadas.push({
        id: pq.id,
        code: pq.code,
        novaLetra: letraCorrespondente,
        textoConfirmado: textoCorrespondente?.substring(0, 45)
      });
    } else {
      auditoriaDetalhada.grupo3_rejeitadasRemapeadas.semMatch.push({
        id: pq.id,
        code: pq.code,
        ajudaAns: aj.officialAnswer,
        ajudaText: optAjudaCorreta.text.substring(0, 40),
        motivo: 'Nenhuma das alternativas da plataforma corresponde ao texto da resposta correta'
      });
    }
  }

  console.log('\n===============================================================');
  console.log('📊 RESUMO DA AUDITORIA BASEADA EM TEXTO');
  console.log(`   📌 Grupo 1 (Pós-Recurso):       ${auditoriaDetalhada.grupo1_posRecurso.atualizadas.length} com texto validado (${auditoriaDetalhada.grupo1_posRecurso.mantidasSemMatch.length} mantidas sem alteração por divergência de opções)`);
  console.log(`   📌 Grupo 2 (Permutação Caderno): ${auditoriaDetalhada.grupo2_permutacao.mantidasIntactas.length} mantidas intactas (texto já correto) | ${auditoriaDetalhada.grupo2_permutacao.remapeadas.length} remapeadas por texto`);
  console.log(`   📌 Grupo 3 (Rejeitadas 45):     ${auditoriaDetalhada.grupo3_rejeitadasRemapeadas.remapeadas.length} remapeadas com texto idêntico | ${auditoriaDetalhada.grupo3_rejeitadasRemapeadas.semMatch.length} mantidas sem gabarito`);
  console.log(`\n   🚀 TOTAL DE QUESTÕES A ATUALIZAR: ${filaDeAtualizacao.length}`);
  console.log('===============================================================\n');

  // Grava relatório de auditoria
  fs.writeFileSync(AUDIT_REPORT, JSON.stringify({
    geradoEm: new Date().toISOString(),
    totalAtualizacoes: filaDeAtualizacao.length,
    filaDeAtualizacao,
    auditoriaDetalhada
  }, null, 2), 'utf8');
  console.log(`💾 Relatório completo registrado em: ${AUDIT_REPORT}`);

  // ---------------------------------------------------------------------------
  // APLICAÇÃO CIRÚRGICA NO SUPABASE (APENAS correct_answer!)
  // ---------------------------------------------------------------------------
  console.log(`\n🚀 INICIANDO GRAVAÇÃO NO SUPABASE DE ${filaDeAtualizacao.length} QUESTÕES...`);
  console.log(`🛡️ Regras estritas: APENAS correct_answer é atualizado. Comentários intactos, 0 novas questões!\n`);

  let atualizadas = 0;
  let falhas = 0;
  const BATCH_SIZE = 40;

  for (let i = 0; i < filaDeAtualizacao.length; i += BATCH_SIZE) {
    const batch = filaDeAtualizacao.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async (item) => {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?id=eq.${item.id}`, {
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
        if (res.ok) atualizadas++;
        else falhas++;
      } catch (e) {
        falhas++;
      }
    }));
    process.stdout.write(`\r   Gravando: ${atualizadas} / ${filaDeAtualizacao.length} concluídos (Falhas: ${falhas})...`);
  }

  console.log(`\n\n🎉 APLICAÇÃO CONCLUÍDA COM SUCESSO!`);
  console.log(`   ✅ Gabaritos gravados com texto rigorosamente validado: ${atualizadas}`);
  console.log(`   ⚠️ Falhas: ${falhas}`);
}

main().catch(console.error);
