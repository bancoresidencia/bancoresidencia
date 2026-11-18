import { loadLocalEnv, resolveGeminiKey } from './load_env.mjs';

const env = loadLocalEnv();
const testKey = resolveGeminiKey(env, ['GEMINI_API_KEY_PAID', 'GEMINI_API_KEY_ON_DEMAND', 'GEMINI_API_KEY']);
if (!testKey) {
  console.error('❌ Defina GEMINI_API_KEY_PAID no .env.local ou passe --key=...');
  process.exit(1);
}

async function inspectKey() {
  console.log('=== AUDITORIA COMPLETA DA CHAVE INFORMADA ===');
  console.log('Chave:', testKey.slice(0, 12) + '...' + testKey.slice(-6));

  // 1. Listar todos os modelos disponíveis para esta chave
  const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${testKey}`;
  try {
    const res = await fetch(listUrl);
    console.log(`\n1. Listagem de Modelos: HTTP ${res.status} (${res.statusText})`);
    if (res.ok) {
      const data = await res.json();
      const models = data.models || [];
      console.log(`Total de modelos retornados pela API: ${models.length}`);
      
      const modelNames = models.map(m => m.name.replace('models/', ''));
      console.log('Modelos disponíveis:');
      modelNames.forEach(m => console.log('  -', m));

      const hasUltra = modelNames.filter(m => m.toLowerCase().includes('ultra'));
      console.log('\nModelos com "ultra" no nome:', hasUltra.length > 0 ? hasUltra : 'Nenhum');
    } else {
      const txt = await res.text();
      console.log('Erro ao listar modelos:', txt);
    }
  } catch (err) {
    console.log('Erro de conexão ao listar modelos:', err.message);
  }

  // 2. Testar chamada de geração em modelos-chave
  const testModels = [
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash-lite',
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest',
    'gemini-1.0-ultra',
    'gemini-ultra'
  ];

  console.log('\n2. Teste de Inferência nos Modelos:');
  for (const m of testModels) {
    const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${testKey}`;
    try {
      const start = Date.now();
      const res = await fetch(genUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'ping' }] }],
          generationConfig: { maxOutputTokens: 5 }
        })
      });
      const duration = Date.now() - start;
      if (res.ok) {
        const json = await res.json();
        console.log(`  ✅ ${m.padEnd(25)} -> HTTP 200 OK (${duration}ms)`);
      } else {
        const errJson = await res.json().catch(() => ({}));
        console.log(`  ❌ ${m.padEnd(25)} -> HTTP ${res.status} [${errJson.error?.status || ''}]: ${errJson.error?.message?.slice(0, 100) || ''}`);
      }
    } catch (e) {
      console.log(`  ⚠️ ${m.padEnd(25)} -> Erro: ${e.message}`);
    }
  }
}

inspectKey();
