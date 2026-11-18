import https from 'https';
import { loadLocalEnv } from './load_env.mjs';

const env = loadLocalEnv();
const freeKey = env.GEMINI_API_KEY || env.GEMINI_API_KEY_1 || '';
const paidKey = env.GEMINI_API_KEY_PAID || env.GEMINI_API_KEY_ON_DEMAND || '';

const keys = [
  freeKey && {
    name: 'Chave 1 (GRATUITA - GEMINI_API_KEY)',
    key: freeKey,
    suffix: `...${freeKey.slice(-6)}`
  },
  paidKey && {
    name: 'Chave 2 (PAGA - GEMINI_API_KEY_PAID)',
    key: paidKey,
    suffix: `...${paidKey.slice(-6)}`
  }
].filter(Boolean);

if (keys.length === 0) {
  console.error('❌ Defina GEMINI_API_KEY e/ou GEMINI_API_KEY_PAID no .env.local.');
  process.exit(1);
}

const modelsToTest = [
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-2.5-flash'
];

async function testKey(item) {
  console.log(`\n================================================================================`);
  console.log(`🔍 TESTANDO: ${item.name}`);
  console.log(`🔑 Token: ${item.key.slice(0, 14)}...${item.suffix}`);
  console.log(`================================================================================`);

  // 1. Testar List Models (Verifica permissões do projeto)
  const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${item.key}`;
  try {
    const listRes = await fetch(listUrl);
    console.log(`📡 GET /v1beta/models -> HTTP ${listRes.status} ${listRes.statusText}`);
    const listData = await listRes.json();
    if (!listRes.ok) {
      console.log(`❌ Erro no /v1beta/models:`, JSON.stringify(listData, null, 2));
    } else {
      console.log(`✅ Sucesso! Total de modelos acessíveis: ${listData.models ? listData.models.length : 0}`);
    }
  } catch (err) {
    console.log(`❌ Falha de rede ao listar modelos:`, err.message);
  }

  // 2. Testar chamada de inferência em cada modelo
  for (const model of modelsToTest) {
    const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${item.key}`;
    const payload = JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: 'Responda apenas: TEST_OK' }] }],
      generationConfig: { maxOutputTokens: 10 }
    });

    try {
      const start = Date.now();
      const res = await fetch(genUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });
      const duration = Date.now() - start;
      const data = await res.json();

      if (res.ok) {
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        console.log(`  ✅ [${model}] HTTP 200 OK (${duration}ms) -> Resposta: "${text}"`);
      } else {
        const errMessage = data.error?.message || res.statusText;
        const errStatus = data.error?.status || '';
        console.log(`  ❌ [${model}] HTTP ${res.status} (${errStatus}): ${errMessage}`);
      }
    } catch (e) {
      console.log(`  ❌ [${model}] Exceção:`, e.message);
    }
  }
}

async function run() {
  for (const k of keys) {
    await testKey(k);
  }
}

run();
