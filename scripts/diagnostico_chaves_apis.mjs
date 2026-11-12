import fs from 'fs';
import path from 'path';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const results = [];

function record(provider, keyLabel, model, status, latency, details) {
  results.push({ provider, keyLabel, model, status, latency, details });
  console.log(`[${provider}] ${keyLabel} | Modelo: ${model} | Status: ${status} | Latência: ${latency}ms | Detalhes: ${details}`);
}

// 1. Provedor OpenRouter
async function testOpenRouter() {
  const key = env.OPENROUTER_API_KEY;
  if (!key) {
    record('OpenRouter', 'OPENROUTER_API_KEY', 'N/A', 'NÃO CONFIGURADO', 0, 'Chave não encontrada');
    return;
  }

  // Verifica informações da chave /auth/key
  try {
    const authRes = await fetch('https://openrouter.ai/api/v1/auth/key', {
      headers: { 'Authorization': `Bearer ${key}` }
    });
    if (authRes.ok) {
      const authData = await authRes.json();
      console.log('OpenRouter Auth Info:', JSON.stringify(authData?.data || {}, null, 2));
    }
  } catch (e) {
    console.log('OpenRouter Auth Info Error:', e.message);
  }

  const models = ['nvidia/nemotron-3-ultra-550b-a55b:free', 'google/gemma-4-31b-it:free'];
  for (const m of models) {
    const t0 = Date.now();
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
          'HTTP-Referer': 'https://bancoresidencia.com.br',
          'X-Title': 'Banco Residencia'
        },
        body: JSON.stringify({
          model: m,
          messages: [{ role: 'user', content: 'Responda apenas: OK' }],
          max_tokens: 15
        }),
        signal: AbortSignal.timeout(15000)
      });
      const lat = Date.now() - t0;
      if (res.ok) {
        const d = await res.json();
        const reply = d?.choices?.[0]?.message?.content?.trim() || 'Resposta vazia';
        record('OpenRouter', 'OPENROUTER_API_KEY', m, '200 OK', lat, `Ativo! Resposta: "${reply}"`);
      } else {
        const errText = await res.text();
        record('OpenRouter', 'OPENROUTER_API_KEY', m, `HTTP ${res.status}`, lat, errText.slice(0, 150));
      }
    } catch (e) {
      record('OpenRouter', 'OPENROUTER_API_KEY', m, 'ERRO CONEXÃO', Date.now() - t0, e.message);
    }
  }
}

// 2. Provedor Groq Cloud
async function testGroq() {
  const key = env.GROQ_API_KEY;
  if (!key) {
    record('Groq Cloud', 'GROQ_API_KEY', 'N/A', 'NÃO CONFIGURADO', 0, 'Chave não encontrada');
    return;
  }

  const models = ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b'];
  for (const m of models) {
    const t0 = Date.now();
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: m,
          messages: [{ role: 'user', content: 'Responda apenas: OK' }],
          max_tokens: 15
        }),
        signal: AbortSignal.timeout(15000)
      });
      const lat = Date.now() - t0;
      if (res.ok) {
        const d = await res.json();
        const reply = d?.choices?.[0]?.message?.content?.trim() || 'Resposta vazia';
        record('Groq Cloud', 'GROQ_API_KEY', m, '200 OK', lat, `Ativo! Resposta: "${reply}"`);
      } else {
        const errText = await res.text();
        record('Groq Cloud', 'GROQ_API_KEY', m, `HTTP ${res.status}`, lat, errText.slice(0, 150));
      }
    } catch (e) {
      record('Groq Cloud', 'GROQ_API_KEY', m, 'ERRO CONEXÃO', Date.now() - t0, e.message);
    }
  }
}

// 3. Provedor Google Gemini
async function testGemini() {
  const geminiKeys = [
    { label: 'GEMINI_API_KEY', val: env.GEMINI_API_KEY },
    { label: 'GEMINI_API_KEY_1', val: env.GEMINI_API_KEY_1 },
    { label: 'GEMINI_API_KEY_2', val: env.GEMINI_API_KEY_2 },
    { label: 'GEMINI_API_KEY_3', val: env.GEMINI_API_KEY_3 },
    { label: 'GEMINI_API_KEY_4', val: env.GEMINI_API_KEY_4 },
    { label: 'GEMINI_API_KEY_5', val: env.GEMINI_API_KEY_5 }
  ];

  for (const item of geminiKeys) {
    if (!item.val) {
      record('Google Gemini', item.label, 'N/A', 'NÃO CONFIGURADO', 0, 'Chave não preenchida');
      continue;
    }

    for (const m of ['gemini-3.1-flash-lite', 'gemini-3-flash-preview']) {
      const t0 = Date.now();
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${item.val}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Responda apenas: OK' }] }]
          }),
          signal: AbortSignal.timeout(15000)
        });
        const lat = Date.now() - t0;
        if (res.ok) {
          const d = await res.json();
          const reply = d?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'OK';
          record('Google Gemini', item.label, m, '200 OK', lat, `Ativo! Resposta: "${reply}"`);
        } else {
          const errText = await res.text();
          let summary = errText.slice(0, 150);
          try {
            const errObj = JSON.parse(errText);
            summary = errObj?.error?.message || summary;
          } catch {}
          record('Google Gemini', item.label, m, `HTTP ${res.status}`, lat, summary.slice(0, 120));
        }
      } catch (e) {
        record('Google Gemini', item.label, m, 'ERRO CONEXÃO', Date.now() - t0, e.message);
      }
    }
  }
}

// 4. Provedor DeepSeek
async function testDeepSeek() {
  const key = env.DEEPSEEK_API_KEY;
  if (!key) return;

  const t0 = Date.now();
  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Responda apenas: OK' }],
        max_tokens: 15
      }),
      signal: AbortSignal.timeout(15000)
    });
    const lat = Date.now() - t0;
    if (res.ok) {
      const d = await res.json();
      const reply = d?.choices?.[0]?.message?.content?.trim() || 'OK';
      record('DeepSeek', 'DEEPSEEK_API_KEY', 'deepseek-chat', '200 OK', lat, `Ativo! Resposta: "${reply}"`);
    } else {
      const errText = await res.text();
      record('DeepSeek', 'DEEPSEEK_API_KEY', 'deepseek-chat', `HTTP ${res.status}`, lat, errText.slice(0, 150));
    }
  } catch (e) {
    record('DeepSeek', 'DEEPSEEK_API_KEY', 'deepseek-chat', 'ERRO CONEXÃO', Date.now() - t0, e.message);
  }
}

console.log('========================================================================');
console.log('🔍 INICIANDO DIAGNÓSTICO COMPLETO DE TODAS AS CHAVES DE API (RESET DIÁRIO)');
console.log('========================================================================\n');

await testOpenRouter();
console.log('');
await testGroq();
console.log('');
await testGemini();
console.log('');
await testDeepSeek();

console.log('\n========================================================================');
console.log('📋 DIAGNÓSTICO FINALIZADO');
console.log('========================================================================');
