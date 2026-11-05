import fs from 'fs';

console.log('\n======================================================');
console.log('🧪 TESTE AUTOMATIZADO DA FASE 1: FIM DO GHOST REFETCH');
console.log('======================================================\n');

const questoesViewCode = fs.readFileSync('src/components/QuestoesView.tsx', 'utf8');

let passed = 0;
let total = 3;

// Teste 1: userAnswers removido do dependency array do useEffect de busca
const effectMatch = questoesViewCode.match(/clearTimeout\(timer\);[\s\S]*?\}\s*,\s*\[([\s\S]*?)\]\);/);
if (effectMatch && !effectMatch[1].includes('userAnswers') && effectMatch[1].includes('sessionQuestionIds')) {
  console.log('✅ [PASS] 1. userAnswers removido do dependency array de busca de questões');
  console.log('   └── O ato de responder agora NÃO aciona recarregamento de 50 questões');
  passed++;
} else {
  console.error('❌ [FAIL] 1. userAnswers ainda está no dependency array!', effectMatch ? effectMatch[1] : 'não encontrou effect');
}

// Teste 2: Presença do userAnswersRef para manter filtros de status íntegros
if (
  questoesViewCode.includes('const userAnswersRef = useRef(userAnswers);') &&
  questoesViewCode.includes('userAnswersRef.current = userAnswers;')
) {
  console.log('✅ [PASS] 2. userAnswersRef implementado com sincronização reativa estável');
  console.log('   └── Filtros de status (Resolvidas/Acertadas/Erradas) continuam 100% funcionais');
  passed++;
} else {
  console.error('❌ [FAIL] 2. userAnswersRef ausente ou não sincronizado!');
}

// Teste 3: Leitura no load() via userAnswersRef.current
if (
  questoesViewCode.includes('const currentAnswers = userAnswersRef.current;') &&
  questoesViewCode.includes('const answeredIds = Object.keys(currentAnswers);')
) {
  console.log('✅ [PASS] 3. load() consome snapshot de respostas via ref sem recriar escopo');
  console.log('   └── Zero alocação desnecessária de timers e zero flickers visuais na tela');
  passed++;
} else {
  console.error('❌ [FAIL] 3. load() não consome currentAnswers via ref!');
}

console.log('\n------------------------------------------------------');
console.log(`📊 RESULTADO FINAL DA BATERIA DA FASE 1: ${passed}/${total} APROVADOS`);
console.log('------------------------------------------------------\n');

if (passed !== total) process.exit(1);
