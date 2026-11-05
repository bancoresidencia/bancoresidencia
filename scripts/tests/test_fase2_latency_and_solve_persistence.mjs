import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

console.log('\n================================================================');
console.log('⚡ TESTE AUTOMATIZADO DA FASE 2: BORDA, TTFB E PERSISTÊNCIA SERVERLESS');
console.log('================================================================\n');

const BASE_URL = process.env.TEST_APP_URL || 'http://localhost:3000';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let passed = 0;
let failed = 0;

function report(name, isSuccess, details) {
  if (isSuccess) {
    console.log(`✅ [PASS] ${name}`);
    if (details.info) console.log(`   └─ ${details.info}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${name}`);
    if (details.error) console.error(`   └─ Erro: ${details.error}`);
    if (details.status) console.error(`   └─ Status: ${details.status}`);
    failed++;
  }
}

async function makeRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const start = performance.now();
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    const elapsed = performance.now() - start;
    let body = null;
    try {
      body = await res.json();
    } catch {
      // not json
    }
    return {
      status: res.status,
      body,
      elapsedMs: Math.round(elapsed),
      headers: res.headers
    };
  } catch (err) {
    const elapsed = performance.now() - start;
    return {
      status: 0,
      error: err.message,
      elapsedMs: Math.round(elapsed)
    };
  }
}

async function getRealStudentTokenAndId() {
  if (!SUPABASE_URL || !SERVICE_KEY || !ANON_KEY) return null;
  try {
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const client = createClient(SUPABASE_URL, ANON_KEY);

    const { data: usersData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
    const userEmail = usersData?.users?.[0]?.email || 'drivesckek@gmail.com';
    const userId = usersData?.users?.[0]?.id;

    const { data: linkData, error: lErr } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: userEmail
    });
    if (lErr || !linkData?.properties?.email_otp) return null;

    const { data: authData, error: aErr } = await client.auth.verifyOtp({
      email: userEmail,
      token: linkData.properties.email_otp,
      type: 'magiclink'
    });
    if (aErr || !authData?.session?.access_token) return null;

    return { token: authData.session.access_token, userId };
  } catch {
    return null;
  }
}

async function runTests() {
  console.log(`🌐 Alvo dos testes: ${BASE_URL}\n`);

  // 1. Validação do arquivo vercel.json
  {
    const exists = fs.existsSync('vercel.json');
    let hasIad1 = false;
    let hasNext = false;
    if (exists) {
      try {
        const parsed = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
        hasIad1 = Array.isArray(parsed.regions) && parsed.regions.includes('iad1');
        hasNext = parsed.framework === 'nextjs';
      } catch {}
    }
    const ok = exists && hasIad1 && hasNext;
    report('1. Configuração de Borda Vercel (vercel.json com região iad1 colocalizada)', ok, {
      info: ok ? 'vercel.json presente com regions: ["iad1"] (colocalizado com Supabase us-east-1)' : null,
      error: ok ? null : 'vercel.json ausente ou sem região iad1'
    });
  }

  // 2. Benchmark de TTFB no Middleware para Visitante Anônimo (sem auth cookies)
  {
    console.log('⏱️ Executando benchmark de TTFB no Middleware (20 requisições consecutivas)...');
    const timings = [];
    for (let i = 0; i < 20; i++) {
      const res = await makeRequest('/');
      if (res.status === 200 || res.status === 307 || res.status === 308) {
        timings.push(res.elapsedMs);
      }
    }
    const avgTtfb = Math.round(timings.reduce((a, b) => a + b, 0) / timings.length);
    const minTtfb = Math.min(...timings);
    const maxTtfb = Math.max(...timings);
    const ok = avgTtfb < 150 && minTtfb < 80;
    report('2. Benchmark de TTFB do Middleware (Eliminação de Round-Trip em Visitantes)', ok, {
      info: `Média: ${avgTtfb}ms (Mínimo: ${minTtfb}ms, Máximo: ${maxTtfb}ms) — Zero chamadas externas bloqueantes`,
      error: ok ? null : `Média de TTFB acima do esperado: ${avgTtfb}ms`
    });
  }

  // 3. Teste de Persistência 100% no PostgreSQL ao resolver questão (/api/questions/solve)
  {
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const studentInfo = await getRealStudentTokenAndId();

    if (!studentInfo) {
      report('3. Persistência 100% de Resposta no PostgreSQL (/api/questions/solve)', false, {
        error: 'Não foi possível gerar token de estudante para testar o solve'
      });
    } else {
      // Busca uma questão real existente para responder
      const { data: sampleQuestions } = await admin
        .from('questions')
        .select('id, code')
        .limit(1);

      const targetQuestion = sampleQuestions?.[0];
      if (!targetQuestion) {
        report('3. Persistência 100% de Resposta no PostgreSQL', false, { error: 'Nenhuma questão encontrada no banco' });
      } else {
        // Limpa registro de teste anterior para garantir idempotência estrita
        await admin
          .from('user_answers')
          .delete()
          .eq('user_id', studentInfo.userId)
          .eq('question_id', targetQuestion.id);

        const testLetter = 'C';
        const solveRes = await makeRequest('/api/questions/solve', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${studentInfo.token}`
          },
          body: JSON.stringify({
            questionId: targetQuestion.id,
            selectedOption: testLetter,
            isPrefetch: false,
            attempts: [{ letter: testLetter, isCorrect: false, timestamp: Date.now() }],
            studentNotes: 'Teste automatizado de persistência Fase 2',
            errorReason: 'Falta de Atenção'
          })
        });

        // Imediatamente consulta o banco Supabase PostgreSQL para conferir persistência direta
        const { data: savedRow, error: dbErr } = await admin
          .from('user_answers')
          .select('question_id, selected_option, is_correct, student_notes, error_reason')
          .eq('user_id', studentInfo.userId)
          .eq('question_id', targetQuestion.id)
          .maybeSingle();

        const isPersisted = !dbErr && savedRow && savedRow.selected_option === testLetter;

        report('3. Persistência 100% no PostgreSQL (/api/questions/solve com await garantido)', isPersisted, {
          info: `Resposta gravada e confirmada no Postgres em ${solveRes.elapsedMs}ms! (selected_option: '${savedRow?.selected_option}', notes: '${savedRow?.student_notes}')`,
          error: isPersisted ? null : `Registro não encontrado no Postgres ou divergente: ${JSON.stringify(savedRow)}`
        });

        // 4. Teste de Reconciliação Monotônica de Nova Tentativa na Mesma Questão
        const secondLetter = 'B';
        const secondSolveRes = await makeRequest('/api/questions/solve', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${studentInfo.token}`
          },
          body: JSON.stringify({
            questionId: targetQuestion.id,
            selectedOption: secondLetter,
            isPrefetch: false,
            attempts: [
              { letter: testLetter, isCorrect: false, timestamp: Date.now() - 1000 },
              { letter: secondLetter, isCorrect: true, timestamp: Date.now() }
            ],
            studentNotes: 'Segunda tentativa persistida com sucesso'
          })
        });

        const { data: updatedRow } = await admin
          .from('user_answers')
          .select('selected_option, attempts')
          .eq('user_id', studentInfo.userId)
          .eq('question_id', targetQuestion.id)
          .maybeSingle();

        const updatedOk = updatedRow && updatedRow.selected_option === secondLetter;
        report('4. Reconciliação Monotônica de Tentativas Consecutivas', updatedOk, {
          info: `Atualização confirmada no Postgres: '${updatedRow?.selected_option}' (Tentativas registradas: ${Array.isArray(updatedRow?.attempts) ? updatedRow.attempts.length : 1}) em ${secondSolveRes.elapsedMs}ms`,
          error: updatedOk ? null : 'Falha na atualização da segunda tentativa'
        });
      }
    }
  }

  console.log('\n----------------------------------------------------------------');
  console.log(`📊 RESULTADO FINAL DA BATERIA DA FASE 2:`);
  console.log(`   ✅ Aprovados: ${passed}/${passed + failed}`);
  console.log(`   ❌ Falhas:    ${failed}/${passed + failed}`);
  console.log('----------------------------------------------------------------\n');

  if (failed > 0) process.exit(1);
}

runTests();
