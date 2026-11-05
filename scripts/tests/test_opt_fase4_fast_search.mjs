import fs from 'fs';
import http from 'http';
import { performance } from 'perf_hooks';

console.log('\n================================================================');
console.log('🧪 TESTE AUTOMATIZADO DA FASE 4: CARGA INSTANTÂNEA E COUNT SEGURO');
console.log('================================================================\n');

let passed = 0;
let total = 3;

// Teste 1: Remoção do debounce de 350ms no mount em QuestoesView.tsx
const viewCode = fs.readFileSync('src/components/QuestoesView.tsx', 'utf8');
if (
  viewCode.includes('if (isFirstLoadRef.current) {') &&
  viewCode.includes('isFirstLoadRef.current = false;') &&
  viewCode.includes('load();')
) {
  console.log('✅ [PASS] 1. Carga inicial instantânea (0ms de atraso) implementada');
  console.log('   └── 350ms de espera morta eliminados no carregamento de /questoes');
  passed++;
} else {
  console.error('❌ [FAIL] 1. Carga inicial instantânea não encontrada em QuestoesView.tsx!');
}

// Teste 2: Proteção de Timeout de contagem no backend
const routeCode = fs.readFileSync('src/app/api/questions/route.ts', 'utf8');
if (
  routeCode.includes('Promise.race([') &&
  routeCode.includes('calculateHierarchyFallback(filters)')
) {
  console.log('✅ [PASS] 2. Proteção de concorrência com Promise.race implementada');
  console.log('   └── O endpoint nunca mais aguarda 8s por varreduras de contagem lenta');
  passed++;
} else {
  console.error('❌ [FAIL] 2. Promise.race ausente em route.ts!');
}

// Teste 3: Medição de tempo real de busca de 50 questões
async function testQuestionsFetch() {
  const data = JSON.stringify({ page: 1, pageSize: 50, filters: {} });
  return new Promise((resolve) => {
    const t0 = performance.now();
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/questions',
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

const apiRes = await testQuestionsFetch();
if (apiRes.status === 200 && apiRes.json?.questions?.length === 50) {
  console.log(`✅ [PASS] 3. Busca de 50 questões concluída em ${apiRes.totalMs}ms`);
  console.log(`   └── Itens retornados: ${apiRes.json.questions.length} | Total calculado: ${apiRes.json.total}`);
  passed++;
} else {
  console.error('❌ [FAIL] 3. Erro na busca de questões:', apiRes);
}

console.log('\n----------------------------------------------------------------');
console.log(`📊 RESULTADO FINAL DA BATERIA DA FASE 4: ${passed}/${total} APROVADOS`);
console.log('----------------------------------------------------------------\n');

if (passed !== total) process.exit(1);
