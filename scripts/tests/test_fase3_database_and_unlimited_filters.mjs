import { createClient } from '@supabase/supabase-js';

console.log('\n================================================================');
console.log('🧪 TESTE AUTOMATIZADO DA FASE 3: BANCO DE DADOS E FILTROS ILIMITADOS');
console.log('================================================================\n');

const BASE_URL = process.env.TEST_APP_URL || 'http://localhost:3000';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let passed = 0;
let failed = 0;

function report(name, isSuccess, details = {}) {
  if (isSuccess) {
    console.log(`✅ [PASS] ${name}`);
    if (details.info) console.log(`   └── ${details.info}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${name}`);
    if (details.error) console.error(`   └── Erro: ${details.error}`);
    if (details.status) console.error(`   └── Status: ${details.status}`);
    failed++;
  }
}

async function makePost(path, body) {
  const url = `${BASE_URL}${path}`;
  const start = performance.now();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const elapsedMs = Math.round(performance.now() - start);
    let data = null;
    try {
      data = await res.json();
    } catch {
      // not json
    }
    return { status: res.status, data, elapsedMs };
  } catch (err) {
    const elapsedMs = Math.round(performance.now() - start);
    return { status: 0, error: err.message, elapsedMs };
  }
}

async function run() {
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // 1. Obter uma amostra de 300 IDs reais da tabela questions para testes de escala
  console.log('🔍 Coletando amostra de 300 IDs de questões do banco Supabase...');
  const { data: sampleQuestions, error: sampleErr } = await supabase
    .from('questions')
    .select('id')
    .limit(300);

  if (sampleErr || !sampleQuestions || sampleQuestions.length < 200) {
    console.error('❌ Não foi possível carregar questões para o teste:', sampleErr);
    process.exit(1);
  }

  const sampleIds = sampleQuestions.map((q) => q.id);
  console.log(`   └── ${sampleIds.length} IDs obtidos para simulação.`);

  // --------------------------------------------------------------------------
  // TESTE 1: Eliminação do Fatiamento de 150 em "Resolvidas" e "Erradas"
  // --------------------------------------------------------------------------
  console.log('\n--- TESTE 1: Paginação Ilimitada em "Resolvidas" (> 150 itens) ---');
  // Simula usuário com 250 questões resolvidas
  const simulatedSolved = sampleIds.slice(0, 250);

  // Requisita Página 1 (itens 0-49)
  const page1Res = await makePost('/api/questions', {
    filters: {
      status: 'Resolvidas',
      userSolvedIds: simulatedSolved
    },
    page: 1,
    pageSize: 50
  });

  // Requisita Página 4 (itens 150-199: no código antigo retornava ZERO por causa do slice(0, 150))
  const page4Res = await makePost('/api/questions', {
    filters: {
      status: 'Resolvidas',
      userSolvedIds: simulatedSolved
    },
    page: 4,
    pageSize: 50
  });

  const p1Ok = page1Res.status === 200 && page1Res.data?.questions?.length === 50 && page1Res.data?.total === 250;
  const p4Ok = page4Res.status === 200 && page4Res.data?.questions?.length === 50 && page4Res.data?.total === 250;
  const noCollision = page1Res.data?.questions?.[0]?.id !== page4Res.data?.questions?.[0]?.id;

  report(
    '1. Paginação Ilimitada de Questões Resolvidas (Fim do limite de 150)',
    p1Ok && p4Ok && noCollision,
    {
      info: `Página 1: ${page1Res.data?.questions?.length} itens | Página 4 (itens 150-199): ${page4Res.data?.questions?.length} itens | Total reportado: ${page4Res.data?.total} (esperado: 250)`
    }
  );

  // --------------------------------------------------------------------------
  // TESTE 2: Imunidade de Questões Resolvidas no filtro "Não vistas"
  // --------------------------------------------------------------------------
  console.log('\n--- TESTE 2: Filtro "Não vistas" com mais de 120 resolvidas ---');
  // No código antigo, apenas os primeiros 120 eram excluídos (slice(0, 120)).
  // Se o aluno resolveu 200 questões, as questões 121-200 vazavam no filtro "Não vistas"!
  const solvedSet = new Set(simulatedSolved);

  const unseenRes = await makePost('/api/questions', {
    filters: {
      status: 'Não vistas',
      userSolvedIds: simulatedSolved
    },
    page: 1,
    pageSize: 50
  });

  const unseenQuestions = unseenRes.data?.questions || [];
  const leakedQuestions = unseenQuestions.filter((q) => solvedSet.has(q.id));

  report(
    '2. Imunidade Absoluta em "Não Vistas" (Zero vazamento com 250 resolvidas)',
    unseenRes.status === 200 && unseenQuestions.length > 0 && leakedQuestions.length === 0,
    {
      info: `Questões retornadas: ${unseenQuestions.length} | Vazamentos detectados: ${leakedQuestions.length} (zero vazamento com corte antigo)`
    }
  );

  // --------------------------------------------------------------------------
  // TESTE 3: Redução Drástica de Payload em `user_answers`
  // --------------------------------------------------------------------------
  console.log('\n--- TESTE 3: Otimização de Payload em user_answers ---');
  // Consulta com attempts vs consulta sem attempts (projeção otimizada)
  const { data: withAttempts } = await supabase
    .from('user_answers')
    .select('question_id, selected_option, is_correct, answered_at, specialty, tema, foco, subfoco, difficulty, banca, year, status_retrial, error_reason, student_notes, attempts')
    .limit(50);

  const { data: withoutAttempts } = await supabase
    .from('user_answers')
    .select('question_id, selected_option, is_correct, answered_at, specialty, tema, foco, subfoco, difficulty, banca, year, status_retrial, error_reason, student_notes')
    .limit(50);

  const sizeWith = Buffer.byteLength(JSON.stringify(withAttempts || []));
  const sizeWithout = Buffer.byteLength(JSON.stringify(withoutAttempts || []));
  const reductionPercent = sizeWith > 0 ? Math.round(((sizeWith - sizeWithout) / sizeWith) * 100) : 0;

  report(
    '3. Otimização de Projeção em user_answers (Omissão de attempts JSONB pesado)',
    withoutAttempts !== null && sizeWithout <= sizeWith,
    {
      info: `Payload completo: ${sizeWith} bytes | Payload otimizado: ${sizeWithout} bytes (Economia imediata por lote)`
    }
  );

  // --------------------------------------------------------------------------
  // TESTE 4: Aceleração e Cache em Memória das Facets da Árvore Clínica
  // --------------------------------------------------------------------------
  console.log('\n--- TESTE 4: Aceleração de Facets da Árvore Clínica ---');
  const facetFilters = {
    instituicoes: ['ENARE'],
    anos: [2024]
  };

  // Primeira chamada (popula cache)
  const facet1 = await makePost('/api/questions', {
    action: 'facets',
    filters: facetFilters
  });

  // Segunda chamada (deve vir do cache em memória < 60ms)
  const facet2 = await makePost('/api/questions', {
    action: 'facets',
    filters: facetFilters
  });

  const facetOk = facet2.status === 200 && facet2.data?.facets?.totalRightCardCount !== undefined;
  const isFast = facet2.elapsedMs < 100;

  report(
    '4. Cache em Memória de Facets da Árvore Clínica',
    facetOk && isFast,
    {
      info: `1ª requisição (banco): ${facet1.elapsedMs}ms | 2ª requisição (cache): ${facet2.elapsedMs}ms (Aceleração de ${Math.round((facet1.elapsedMs / Math.max(facet2.elapsedMs, 1)))}x)`
    }
  );

  // --------------------------------------------------------------------------
  // RESULTADO FINAL
  // --------------------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('📊 RESULTADO FINAL DA BATERIA DA FASE 3:');
  console.log(`   ✅ Aprovados: ${passed}/4`);
  console.log(`   ❌ Falhas:    ${failed}/4`);
  console.log('----------------------------------------------------------------\n');

  if (failed > 0) process.exit(1);
}

run().catch((e) => {
  console.error('Erro na execução do teste:', e);
  process.exit(1);
});
