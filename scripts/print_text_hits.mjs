import fs from 'fs';

const textHits = JSON.parse(fs.readFileSync('scripts/medevo_supabase_text_hits.json', 'utf8'));
textHits.forEach((q, i) => {
  const fields = q.hits.map(h => h.field).join(', ');
  const sampleSnippet = q.hits[0].snippet;
  console.log(`[${i+1}] ${q.code || q.id} | ${q.banca} (${q.year}) | Campos: ${fields} | ID: ${q.id}`);
  console.log(`    Trecho: ${sampleSnippet}\n`);
});
