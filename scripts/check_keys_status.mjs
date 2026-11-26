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
  if (
    keyName.startsWith('GEMINI_API_KEY') &&
    !keyName.includes('PAID') &&
    !keyName.includes('DEMAND') &&
    !keyName.includes('BILLING') &&
    val &&
    !val.startsWith('SUA_')
  ) {
    keys.push({ name: keyName, key: val, preview: '...' + val.slice(-6) });
  }
}

keys.sort((a, b) => {
  const numA = parseInt(a.name.replace(/\D/g, '') || '0', 10);
  const numB = parseInt(b.name.replace(/\D/g, '') || '0', 10);
  return numA - numB;
});

console.log(`=== TESTANDO ${keys.length} VARIAVEIS DE CHAVES GRATUITAS GEMINI (SEM PAID / ON_DEMAND) ===`);

const testPrompt = {
  contents: [
    {
      parts: [
        { text: 'Responda apenas: OK' }
      ]
    }
  ],
  generationConfig: {
    maxOutputTokens: 10,
    temperature: 0.1
  }
};

const ACTIVE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.1-flash-lite-preview',
  'gemini-3.8-flash',
  'gemini-flash-lite-latest'
];

async function testKey(item, model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${item.key}`;
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPrompt),
      signal: AbortSignal.timeout(15000)
    });
    const duration = Date.now() - start;
    if (res.ok) {
      const data = await res.json();
      const txt = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Sem texto';
      return { ok: true, status: res.status, text: txt, duration, model };
    } else {
      const errText = await res.text();
      let parsed;
      try { parsed = JSON.parse(errText); } catch { parsed = { raw: errText }; }
      const message = parsed.error?.message || errText.slice(0, 120);
      const reason = parsed.error?.status || `HTTP_${res.status}`;
      return { ok: false, status: res.status, reason, message, duration, model };
    }
  } catch (err) {
    return { ok: false, status: 0, reason: 'FETCH_ERROR', message: err.message, duration: Date.now() - start, model };
  }
}

async function run() {
  const seenKeyValues = new Map();
  const keyMeta = keys.map(item => {
    const dupOf = seenKeyValues.get(item.key) || null;
    if (!dupOf) seenKeyValues.set(item.key, item.name);
    return { item, dupOf };
  });

  const results = [];
  for (let i = 0; i < keyMeta.length; i += 4) {
    const batch = keyMeta.slice(i, i + 4);
    const batchRes = await Promise.all(
      batch.map(async ({ item, dupOf }) => {
        const modelResults = [];
        for (const model of ACTIVE_MODELS) {
          const res = await testKey(item, model);
          modelResults.push(res);
          if (res.status === 401 || res.status === 403) break;
        }
        return { item, dupOf, modelResults };
      })
    );
    results.push(...batchRes);
  }

  console.log('\n--- RESULTADOS DO DIAGNÓSTICO ---');
  let activeUnique = 0;
  let duplicateActive = 0;
  let invalidCount = 0;
  let exhaustedCount = 0;
  let timeoutCount = 0;

  for (const r of results) {
    const name = r.item.name.padEnd(18, ' ');
    const preview = r.item.preview.padEnd(12, ' ');
    const working = r.modelResults.filter(m => m.ok);
    const firstErr = r.modelResults[0];

    if (working.length > 0) {
      const modelsStr = working.map(w => `${w.model}(${w.duration}ms)`).join(', ');
      if (r.dupOf) {
        duplicateActive++;
        console.log(`[DUPLICADA] ${name} | ${preview} | == ${r.dupOf} | ${modelsStr}`);
      } else {
        activeUnique++;
        console.log(`[ATIVA]     ${name} | ${preview} | ${modelsStr}`);
      }
    } else if (firstErr?.status === 401 || firstErr?.status === 403) {
      invalidCount++;
      console.log(`[INVÁLIDA]  ${name} | ${preview} | HTTP ${firstErr.status} -> ${firstErr.message}`);
    } else if (r.modelResults.every(m => m.status === 0)) {
      timeoutCount++;
      console.log(`[TIMEOUT]   ${name} | ${preview} | Sem resposta em 15s (${firstErr?.message})`);
    } else {
      exhaustedCount++;
      console.log(`[ESGOTADA]  ${name} | ${preview} | HTTP ${firstErr?.status} -> ${firstErr?.message}`);
    }
  }

  console.log('\n--- RESUMO GERAL DO POOL GRATUITO ---');
  console.log(`Variáveis GEMINI_API_KEY gratuitas no .env.local : ${keys.length}`);
  console.log(`Chaves físicas ÚNICAS ATIVAS e prontas agora     : ${activeUnique}`);
  console.log(`Variáveis duplicadas (mesma chave física)        : ${duplicateActive}`);
  console.log(`Chaves inválidas/revogadas (HTTP 401/403)        : ${invalidCount}`);
  console.log(`Chaves esgotadas (HTTP 429 em todos os modelos)  : ${exhaustedCount}`);
  console.log(`Timeouts de rede                                 : ${timeoutCount}`);
}

run();

