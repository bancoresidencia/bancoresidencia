import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';
import { cos_sim, pipeline } from '@xenova/transformers';

async function test() {
  const extractor = await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');
  const db = new DatabaseSync('data/questions_golden_fts.db', { readOnly: true });

  const qText = 'Em pacientes com angina instável, o uso de nitroglicerina venosa é justificado';
  const qVec = Array.from((await extractor(qText, { pooling: 'mean', normalize: true })).data);

  const synthCache = JSON.parse(fs.readFileSync('data/cache_canonical_tree_vectors.json', 'utf8'));
  const clinCache = JSON.parse(fs.readFileSync('data/cache_canonical_tree_clinical_centroids.json', 'utf8'));

  const k = 'Clínica Médica|||Síndromes Coronarianas Isquêmicas (Aguda e Crônica)';
  const sVec = synthCache.focos[k];
  const cVec = clinCache.focos[k];

  console.log('Cosine with synthetic:', cos_sim(qVec, sVec));
  console.log('Cosine with clinical centroid:', cos_sim(qVec, cVec));

  const query = '"angina" AND "nitroglicerina"';
  const neighbors = db.prepare('SELECT id, statement, foco, bm25(questions_fts) as rank FROM questions_fts WHERE questions_fts MATCH ? ORDER BY rank LIMIT 5').all(query);
  for (const n of neighbors) {
    const nVec = Array.from((await extractor(n.statement.slice(0, 100), { pooling: 'mean', normalize: true })).data);
    console.log(`Neighbor ${n.id} (Rank: ${n.rank.toFixed(2)}) | Foco: ${n.foco} | Cosine: ${cos_sim(qVec, nVec).toFixed(3)}`);
  }
}
test();
