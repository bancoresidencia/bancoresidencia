import fs from 'fs';
import path from 'path';

const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZWRwZG1ndmdhdGpkZnhneGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIyNzk3MTgsImV4cCI6MjA0Nzg1NTcxOH0.cjoaggOXt1kY9WmVNbAipCOQ2dP4PWLP43KMf8cO8Wo';
const token = 'eyJhbGciOiJIUzI1NiIsImtpZCI6Ikc4M0dqWlVNYUtCb0RCL08iLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2J4ZWRwZG1ndmdhdGpkZnhneGlqLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI0ZDU4OTIxYi1iZDM3LTRmZGUtOWVmZi1hNmM2NzNkNTVlMWEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzkxNDI3OTQ3LCJpYXQiOjE3OTA4MjMxNDcsImVtYWlsIjoiZi5yb2dlcm9jaGFAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJnb29nbGUiLCJwcm92aWRlcnMiOlsiZ29vZ2xlIl19LCJ1c2VyX21ldGFkYXRhIjp7ImF2YXRhcl91cmwiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NMZGhaOXVEYUhDUWdPdkhqUEtrOG9nRDNqQmFqNE15aFZETm1mNnNhZ2lwWEkzN1E9czk2LWMiLCJlbWFpbCI6ImYucm9nZXJvY2hhQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJSb2dlciBSb2NoYSIsImlzcyI6Imh0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbSIsIm5hbWUiOiJSb2dlciBSb2NoYSIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0xkaFo5dURhSENRZ092SGpQS2s4b2dEM2pCYWo0TXloVkRObWY2c2FnaXBYSTM3UT1zOTYtYyIsInByb3ZpZGVyX2lkIjoiMTA5MTAxNjcyNjYzMjcyNjcyODgyIiwic3ViIjoiMTA5MTAxNjcyNjYzMjcyNjcyODgyIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoib2F1dGgiLCJ0aW1lc3RhbXAiOjE3OTA4MjMxNDd9XSwic2Vzc2lvbl9pZCI6Ijg4MzM3YTFkLTQ5MTEtNDE5OC05NDY4LTUxOGJkZTg3ZGEyNiIsImlzX2Fub255bW91cyI6ZmFsc2V9.Z9gMYE-XR57FMliR8feGwo7XJz1PMrf5UXrjSfARoxY';

const outputFile = 'd:/bancoresidencia/data/ginecologia_medevo_extracted.json';
const idsData = JSON.parse(fs.readFileSync('d:/bancoresidencia/data/ginecologia_ids_list.json', 'utf8'));
const allIds = idsData.ids;
console.log(`Carregados ${allIds.length} IDs de questões de Ginecologia.`);

// Load existing progress
let extractedQuestions = [];
if (fs.existsSync(outputFile)) {
  try {
    const existing = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    if (existing && Array.isArray(existing.questions)) {
      extractedQuestions = existing.questions;
      console.log(`Progresso anterior recuperado: ${extractedQuestions.length} questões já salvas.`);
    }
  } catch (e) {}
}

const alreadyExtractedIds = new Set(extractedQuestions.map(q => q.id));
const remainingIds = allIds.filter(id => !alreadyExtractedIds.has(id));
console.log(`Restam ${remainingIds.length} questões para extrair.`);

const CHUNK_SIZE = 150;
const chunks = [];
for (let i = 0; i < remainingIds.length; i += CHUNK_SIZE) {
  chunks.push(remainingIds.slice(i, i + CHUNK_SIZE));
}
console.log(`Total de novos lotes: ${chunks.length}`);

async function fetchChunkWithRetry(chunkIds, attempt = 1) {
  try {
    const res = await fetch('https://api.medevo.com.br/rest/v1/rpc/get_questions_by_ids_secure_v2', {
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question_ids: chunkIds })
    });
    
    if (res.status === 400 || res.status === 429) {
      const txt = await res.text();
      console.warn(`[Rate limit detectado (Tentativa ${attempt})]: aguardando 6s... Detalhe: ${txt.slice(0, 100)}`);
      await new Promise(r => setTimeout(r, 6000));
      return fetchChunkWithRetry(chunkIds, attempt + 1);
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }
    return await res.json();
  } catch (err) {
    if (attempt < 6) {
      const wait = attempt * 3000;
      console.warn(`Erro de rede/timeout. Tentativa ${attempt}. Aguardando ${wait}ms...`);
      await new Promise(r => setTimeout(r, wait));
      return fetchChunkWithRetry(chunkIds, attempt + 1);
    }
    throw err;
  }
}

async function main() {
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const list = await fetchChunkWithRetry(chunk);
    extractedQuestions.push(...list);

    console.log(`Lote ${i + 1}/${chunks.length} concluído: +${list.length} questoes | Total acumulado: ${extractedQuestions.length}/${allIds.length} (${Math.round((extractedQuestions.length / allIds.length) * 100)}%)`);

    // Save checkpoint after every chunk to be 100% resilient
    fs.writeFileSync(outputFile, JSON.stringify({
      total: extractedQuestions.length,
      questions: extractedQuestions
    }));

    // Respectful delay between requests (900ms) to stay comfortably under rate limits
    await new Promise(r => setTimeout(r, 900));
  }

  // Final formatting
  fs.writeFileSync(outputFile, JSON.stringify({
    total: extractedQuestions.length,
    questions: extractedQuestions
  }, null, 2));

  console.log(`🎉 EXTRAÇÃO 100% CONCLUÍDA: ${extractedQuestions.length} questões salvas em ${outputFile}!`);
}

main().catch(err => {
  console.error('Erro na extração:', err);
  process.exit(1);
});
