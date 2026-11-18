import fs from 'fs';

// Ler .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const lines = envContent.split('\n');
const keys = [];

for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed.startsWith('#') || !trimmed.includes('=')) continue;
  const eqIdx = trimmed.indexOf('=');
  const keyName = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
  if (keyName.startsWith('GEMINI_API_KEY') && !keyName.includes('PAID') && val && !val.startsWith('SUA_')) {
    keys.push({ name: keyName, key: val, preview: val.slice(0, 8) + '...' + val.slice(-6) });
  }
}

console.log(`=== TESTANDO ${keys.length} CHAVES GEMINI EM TEMPO REAL ===`);

const testPrompt = {
  contents: [
    {
      parts: [
        { text: "Responda apenas: OK" }
      ]
    }
  ],
  generationConfig: {
    maxOutputTokens: 10,
    temperature: 0.1
  }
};

async function testKey(item, model = 'gemini-3.5-flash-lite') {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${item.key}`;
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPrompt)
    });
    const duration = Date.now() - start;
    if (res.ok) {
      const data = await res.json();
      const txt = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Sem texto';
      return { ok: true, status: res.status, text: txt, duration, model };
    } else {
      const errText = await res.text();
      let parsed;
      try { parsed = JSON.parse(errText); } catch (e) { parsed = { raw: errText }; }
      const message = parsed.error?.message || errText.slice(0, 120);
      const reason = parsed.error?.status || `HTTP_${res.status}`;
      return { ok: false, status: res.status, reason, message, duration, model };
    }
  } catch (err) {
    return { ok: false, status: 0, reason: 'FETCH_ERROR', message: err.message, duration: Date.now() - start, model };
  }
}

async function run() {
  const results = [];
  for (const item of keys) {
    // Testa primeiro no modelo principal gemini-3.5-flash-lite
    let res = await testKey(item, 'gemini-3.5-flash-lite');
    // Se der 429 ou erro, testa também no fallback gemini-3.1-flash-lite
    let fallbackRes = null;
    if (!res.ok) {
      fallbackRes = await testKey(item, 'gemini-3.1-flash-lite');
    }
    results.push({ item, res, fallbackRes });
  }

  console.log('\n--- RESULTADOS DO DIAGNÓSTICO ---');
  let activeCount = 0;
  let exhaustedCount = 0;
  let otherErrorCount = 0;

  for (const r of results) {
    const name = r.item.name.padEnd(18, ' ');
    const preview = r.item.preview.padEnd(20, ' ');
    if (r.res.ok) {
      activeCount++;
      console.log(`[ATSUB-OK]  ${name} | ${preview} | HTTP ${r.res.status} (${r.res.duration}ms) -> "${r.res.text}" [${r.res.model}]`);
    } else if (r.res.status === 429) {
      exhaustedCount++;
      const fbInfo = r.fallbackRes?.ok
        ? `Fallback 3.1 OK (${r.fallbackRes.duration}ms)`
        : `Fallback 3.1 também 429`;
      console.log(`[ESGOTADA] ${name} | ${preview} | HTTP 429 (${r.res.reason}) -> ${r.res.message} | ${fbInfo}`);
    } else {
      otherErrorCount++;
      console.log(`[ERRO ${r.res.status}] ${name} | ${preview} | ${r.res.reason} -> ${r.res.message}`);
    }
  }

  console.log('\n--- RESUMO GERAL DO POOL ---');
  console.log(`Total de chaves configuradas: ${keys.length}`);
  console.log(`Chaves 100% OPERACIONAIS agora: ${activeCount}`);
  console.log(`Chaves com RATE LIMIT / ESGOTADAS (429): ${exhaustedCount}`);
  console.log(`Chaves com outros erros: ${otherErrorCount}`);
}

run();

