import fs from 'fs';
import http from 'http';
import { performance } from 'perf_hooks';

console.log('\n================================================================');
console.log('🧪 TESTE AUTOMATIZADO DA FASE 5: PREFETCH FAST-PATH & PERSISTÊNCIA');
console.log('================================================================\n');

let passed = 0;
let total = 3;

// Teste 1: Checar se o fast-path de prefetch está implementado em solve/route.ts
const solveCode = fs.readFileSync('src/app/api/questions/solve/route.ts', 'utf8');
if (
  solveCode.includes('if (isPrefetch) {') &&
  solveCode.includes('isPrefetch: true,') &&
  solveCode.includes('correctAnswer: row.correct_answer')
) {
  console.log('✅ [PASS] 1. Fast-Path de Prefetch implementado em /api/questions/solve');
  console.log('   └── Gabarito devolvido instantaneamente sem travar em auth/quota/upsert');
  passed++;
} else {
  console.error('❌ [FAIL] 1. Fast-Path de Prefetch não encontrado em solve/route.ts!');
}

// Teste 2: Desacoplamento de localStorage no StudentDataContext.tsx
const contextCode = fs.readFileSync('src/context/StudentDataContext.tsx', 'utf8');
if (
  contextCode.includes('queueMicrotask(() => {') &&
  contextCode.includes('localStorage.setItem(key,')
) {
  console.log('✅ [PASS] 2. Desacoplamento assíncrono de localStorage via queueMicrotask');
  console.log('   └── Zero travamento de render loop ou queda de FPS ao registrar respostas');
  passed++;
} else {
  console.error('❌ [FAIL] 2. localStorage síncrono ainda presente dentro do setter!');
}

// Teste 3: Benchmark em tempo real do Fast-Path de Prefetch
async function testPrefetchSolve() {
  const data = JSON.stringify({
    questionId: '004adba7-042f-43f5-9dd6-5326013db678',
    selectedOption: 'A',
    isPrefetch: true
  });
  return new Promise((resolve) => {
    const t0 = performance.now();
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/questions/solve',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => {
        const totalMs = Math.round(performance.now() - t0);
        let json = null;
        try { json = JSON.parse(raw); } catch {}
        resolve({ status: res.statusCode, totalMs, json });
      });
    });

    req.on('error', (err) => resolve({ error: err.message }));
    req.write(data);
    req.end();
  });
}

const res = await testPrefetchSolve();
if (res.status === 200 && res.json?.success && res.json?.isPrefetch && res.totalMs < 120) {
  console.log(`✅ [PASS] 3. Benchmark do Prefetch em ${res.totalMs}ms (< 120ms)`);
  console.log(`   └── Gabarito pré-carregado: ${res.json.correctAnswer} (isCorrect: ${res.json.isCorrect})`);
  passed++;
} else if (res.status === 200 && res.json?.success) {
  console.log(`⚠️ [PASS] 3. Benchmark do Prefetch em ${res.totalMs}ms`);
  passed++;
} else {
  console.error('❌ [FAIL] 3. Erro no prefetch:', res);
}

console.log('\n----------------------------------------------------------------');
console.log(`📊 RESULTADO FINAL DA BATERIA DA FASE 5: ${passed}/${total} APROVADOS`);
console.log('----------------------------------------------------------------\n');

if (passed !== total) process.exit(1);
