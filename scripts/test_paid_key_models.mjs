import fs from 'fs';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const [k, ...v] = l.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
}

const paidKey = env.GEMINI_API_KEY_PAID || env.GEMINI_API_KEY_ON_DEMAND;

async function testPaidKey() {
  console.log('Testando Chave Paga (...', paidKey ? paidKey.slice(-6) : 'NÃO ENCONTRADA', ')...');
  if (!paidKey) return;

  const models = ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-2.5-flash-lite', 'gemini-2.0-flash-lite', 'gemini-1.5-flash-8b'];
  for (const m of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${paidKey}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Ping teste de conexao' }] }],
          generationConfig: { maxOutputTokens: 5 }
        })
      });
      console.log(`Modelo ${m}: HTTP ${res.status} (${res.statusText})`);
      if (!res.ok) {
        const txt = await res.text();
        console.log(`   Detalhes: ${txt.slice(0, 100)}`);
      }
    } catch (e) {
      console.log(`Modelo ${m}: Erro de rede ${e.message}`);
    }
  }
}

testPaidKey();
