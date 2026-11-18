import fs from 'fs';
import { API_KEYS } from './solve_questions_engine.mjs';

async function testAllKeysHealth() {
  console.log(`Testando saúde de ${API_KEYS.length} chaves no pool gratuito...\n`);

  for (let i = 0; i < API_KEYS.length; i++) {
    const key = API_KEYS[i];
    const keyLabel = `Chave ${i + 1} (...${key.slice(-6)})`;
    const modelResults = [];

    for (const m of ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.5-flash']) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`;
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'OK' }] }],
            generationConfig: { maxOutputTokens: 5 }
          })
        });

        if (res.ok) {
          modelResults.push(`${m}: 200 (Ativa)`);
        } else if (res.status === 429) {
          modelResults.push(`${m}: 429 (Esgotada)`);
        } else {
          modelResults.push(`${m}: HTTP ${res.status}`);
        }
      } catch (e) {
        modelResults.push(`${m}: Erro ${e.message}`);
      }
    }

    console.log(`${keyLabel.padEnd(25)} -> ${modelResults.join(' | ')}`);
  }
}

testAllKeysHealth();
