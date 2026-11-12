import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
        if (!process.env[k]) process.env[k] = v;
      }
    }
  });
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fullAnalysis() {
  console.log('=== ANALISANDO DISSERTATIVAS (146 questões) ===');
  const { data: dissertativas, error: dErr } = await supabase
    .from('questions')
    .select('id, code, banca, institution, year, especialidade, correct_answer, commentary, is_anulada')
    .eq('type', 'Dissertativa');

  if (dErr) {
    console.error('Erro ao buscar dissertativas:', dErr);
    return;
  }

  let dissWithAns = 0;
  let dissWithCommentaryOnly = 0;
  let dissWithoutAny = 0;
  let dissAnuladas = 0;

  dissertativas.forEach(q => {
    const ans = (q.correct_answer || '').trim();
    const comm = (q.commentary || '').trim();
    const isAnulada = Boolean(q.is_anulada) || ans.toUpperCase() === 'ANULADA';

    if (isAnulada) {
      dissAnuladas++;
    } else if (ans) {
      dissWithAns++;
    } else if (comm) {
      dissWithCommentaryOnly++;
    } else {
      dissWithoutAny++;
    }
  });

  console.log({
    totalDissertativas: dissertativas.length,
    dissWithAns,
    dissWithCommentaryOnly,
    dissWithoutAny,
    dissAnuladas,
    amostraGabarito: dissertativas.filter(q => q.correct_answer).slice(0, 3).map(q => ({
      banca: q.banca,
      ano: q.year,
      ans: q.correct_answer?.substring(0, 50)
    })),
    amostraComentario: dissertativas.filter(q => !q.correct_answer && q.commentary).slice(0, 3).map(q => ({
      banca: q.banca,
      ano: q.year,
      comm: q.commentary?.substring(0, 50)
    }))
  });

  console.log('\n=== ANALISANDO MÚLTIPLA ESCOLHA (129.880 questões) ===');
  
  // Total Múltipla Escolha
  const { count: mcTotal } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('type', 'Múltipla escolha');

  // MC Anuladas
  const { count: mcAnuladas } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('type', 'Múltipla escolha')
    .or('is_anulada.eq.true,correct_answer.ilike.%anulada%');

  // MC Com Gabarito (não anulada)
  const { count: mcComGabarito } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('type', 'Múltipla escolha')
    .eq('is_anulada', false)
    .not('correct_answer', 'is', null)
    .neq('correct_answer', '')
    .not('correct_answer', 'ilike', '%anulada%');

  // MC Sem Gabarito (não anulada)
  const { count: mcSemGabarito } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('type', 'Múltipla escolha')
    .eq('is_anulada', false)
    .or('correct_answer.is.null,correct_answer.eq.');

  console.log({
    mcTotal,
    mcComGabarito,
    mcSemGabarito,
    mcAnuladas,
    soma: mcComGabarito + mcSemGabarito + mcAnuladas
  });

  // Especialidades
  console.log('\n=== AGRUPAMENTO POR ESPECIALIDADE DAS QUESTÕES SEM GABARITO ===');
  // Como são ~10.977 sem gabarito, podemos puxar os metadados (especialidade, banca, year) das sem gabarito em lotes
  const semGabaritoTotal = mcSemGabarito + dissWithoutAny;
  console.log(`Buscando dados das ~${semGabaritoTotal} questões sem gabarito...`);

  const specMap = {};
  const bancaMap = {};
  const yearMap = {};

  let from = 0;
  const BATCH = 2000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('questions')
      .select('especialidade, banca, year')
      .eq('is_anulada', false)
      .or('correct_answer.is.null,correct_answer.eq.')
      .range(from, from + BATCH - 1);

    if (error) {
      console.error('Erro ao buscar lote sem gabarito:', error);
      break;
    }

    if (!data || data.length === 0) {
      hasMore = false;
      break;
    }

    data.forEach(q => {
      const sp = (q.especialidade || 'Não informada').trim();
      const b = (q.banca || 'Não informada').trim();
      const y = q.year ? String(q.year) : 'Não informado';

      specMap[sp] = (specMap[sp] || 0) + 1;
      bancaMap[b] = (bancaMap[b] || 0) + 1;
      yearMap[y] = (yearMap[y] || 0) + 1;
    });

    from += BATCH;
    if (data.length < BATCH) hasMore = false;
  }

  // Ordena top bancas e especialidades
  const topBancas = Object.entries(bancaMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  const topSpecs = Object.entries(specMap)
    .sort((a, b) => b[1] - a[1]);

  const topYears = Object.entries(yearMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const finalOutput = {
    totalGeral: 130026,
    multiplaEscolha: {
      total: mcTotal,
      comGabarito: mcComGabarito,
      semGabarito: mcSemGabarito,
      anuladas: mcAnuladas,
      percentualComGabarito: ((mcComGabarito / mcTotal) * 100).toFixed(2) + '%'
    },
    dissertativas: {
      total: dissertativas.length,
      comGabaritoDireto: dissWithAns,
      comEspelhoComentario: dissWithCommentaryOnly,
      totalComResolucao: dissWithAns + dissWithCommentaryOnly,
      semNenhumaResposta: dissWithoutAny,
      anuladas: dissAnuladas
    },
    consolidadoGeral: {
      comGabaritoOuResolucao: mcComGabarito + dissWithAns + dissWithCommentaryOnly,
      semGabarito: mcSemGabarito + dissWithoutAny,
      anuladasOficiais: mcAnuladas + dissAnuladas,
      taxaCoberturaHomologada: (((mcComGabarito + dissWithAns + dissWithCommentaryOnly + mcAnuladas + dissAnuladas) / 130026) * 100).toFixed(2) + '%'
    },
    especialidadesSemGabarito: topSpecs,
    topBancasSemGabarito: topBancas,
    topAnosSemGabarito: topYears
  };

  fs.writeFileSync('data/full_audit_summary.json', JSON.stringify(finalOutput, null, 2), 'utf8');
  console.log('=== RESULTADO FINAL CONSOLIDADO ===');
  console.log(JSON.stringify(finalOutput, null, 2));
}

fullAnalysis();
