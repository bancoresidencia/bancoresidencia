import { DatabaseSync } from 'node:sqlite';
import {
  rankCandidateSubfocos,
  decideCandidateAllocation,
  buildCanonicalIndex
} from './pipeline_recategorizacao_fases.mjs';
import fs from 'fs';
import path from 'path';

const rawTree = JSON.parse(fs.readFileSync('data/catalogo_ginecologia.json', 'utf8'));
const canonicalIndex = buildCanonicalIndex(rawTree);

const db = new DatabaseSync('data/questoes_132k.db');

for (const code of ['HOSPITAL-2017-GIN-11314', 'SANTA-2015-GIN-1913', 'SMS-2023-GIN-8166', 'HOSPITAL-2017-GIN-9614']) {
  const q = db.prepare(`SELECT * FROM questions WHERE code = ?`).get(code);
  if (!q) continue;

  const fEntry = canonicalIndex.compositeFocoMap.get(`ginecologia|||${q.foco.toLowerCase().trim()}`);
  const availableSubfocos = fEntry?.subfocosList || [];

  const ranking = rankCandidateSubfocos(q, availableSubfocos, q.foco);
  const decision = decideCandidateAllocation(ranking, availableSubfocos, null);

  console.log(`\n========================================`);
  console.log(`Código: ${q.code}`);
  console.log(`Foco: ${q.foco}`);
  console.log(`Candidatos Subfocos:`, availableSubfocos);
  console.log(`Ranking Scores:`, ranking);
  console.log(`Decisão:`, decision);
}

db.close();
