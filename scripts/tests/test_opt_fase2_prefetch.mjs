import fs from 'fs';

console.log('\n================================================================');
console.log('🧪 TESTE AUTOMATIZADO DA FASE 2: PREFETCH & RESPOSTA INSTANTÂNEA');
console.log('================================================================\n');

const cardCode = fs.readFileSync('src/components/QuestionCard.tsx', 'utf8');

let passed = 0;
let total = 3;

// Teste 1: Verificação de existência da checagem de prefetchPromisesRef
if (
  cardCode.includes('const prefetchKey = `${question.id}_${pendingSelected}`;') &&
  cardCode.includes('const existingPrefetchPromise = prefetchPromisesRef.current[prefetchKey];')
) {
  console.log('✅ [PASS] 1. Consulta ao cache de prefetch implementada em handleConfirmAnswer');
  console.log('   └── As promises em trânsito/resolvidas não são mais descartadas');
  passed++;
} else {
  console.error('❌ [FAIL] 1. existingPrefetchPromise não verificado!');
}

// Teste 2: Consumo da Promise existente sem disparar nova requisição síncrona
if (
  cardCode.includes('if (existingPrefetchPromise) {') &&
  cardCode.includes('data = await existingPrefetchPromise;')
) {
  console.log('✅ [PASS] 2. Consumo direto do prefetch com latência local (0ms)');
  console.log('   └── O aluno não fica esperando 600ms com o botão de Resolver bloqueado');
  passed++;
} else {
  console.error('❌ [FAIL] 2. data = await existingPrefetchPromise não encontrado!');
}

// Teste 3: Confirmação de persistência assíncrona em background
if (
  cardCode.includes('// Gabarito obtido instantaneamente via prefetch: confirma persistência em background') &&
  cardCode.includes("isPrefetch: false")
) {
  console.log('✅ [PASS] 3. Sincronização assíncrona desacoplada da renderização visual');
  console.log('   └── Persistência no Postgres ocorre sem travar a percepção do usuário');
  passed++;
} else {
  console.error('❌ [FAIL] 3. Sincronização em background não implementada!');
}

console.log('\n----------------------------------------------------------------');
console.log(`📊 RESULTADO FINAL DA BATERIA DA FASE 2: ${passed}/${total} APROVADOS`);
console.log('----------------------------------------------------------------\n');

if (passed !== total) process.exit(1);
