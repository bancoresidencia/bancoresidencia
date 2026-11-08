const start = Date.now();
try {
  const res = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'medicina:latest',
      prompt: 'Qual é a conduta inicial na pré-eclâmpsia grave com iminência de eclâmpsia? Responda em 2 frases objetivas.',
      stream: false
    })
  });

  const totalTime = ((Date.now() - start) / 1000).toFixed(2);
  if (!res.ok) {
    console.error('HTTP Error:', res.status, await res.text());
    process.exit(1);
  }

  const json = await res.json();
  const promptTokens = json.prompt_eval_count || 0;
  const evalTokens = json.eval_count || 0;
  const evalDurationSec = (json.eval_duration / 1e9) || 1;
  const tps = (evalTokens / evalDurationSec).toFixed(2);

  console.log('='.repeat(60));
  console.log('BENCHMARK LOCAL OLLAMA (medicina:latest):');
  console.log('='.repeat(60));
  console.log(`- Tempo Total: ${totalTime}s`);
  console.log(`- Tokens de Entrada: ${promptTokens}`);
  console.log(`- Tokens de Saída: ${evalTokens}`);
  console.log(`- Velocidade de Geração: ${tps} tokens/s`);
  console.log(`- Resposta Gerada:\n${json.response}`);
} catch (err) {
  console.error('Erro ao conectar no Ollama:', err.message);
}

