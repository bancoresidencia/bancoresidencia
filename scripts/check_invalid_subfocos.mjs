import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { clinicalHierarchy } from '../src/data/mockQuestions.ts';

const db = new DatabaseSync('data/questoes_132k.db', { readOnly: true });

const frontSubfocos = new Set();
for (const esp of clinicalHierarchy) {
  for (const t of esp.temas) {
    for (const f of t.focos) {
      for (const s of f.subfocos) {
        frontSubfocos.add(s.subfoco);
      }
    }
  }
}

const sqliteSubfocoCounts = db.prepare('SELECT subfoco, COUNT(*) as count FROM questions WHERE subfoco IS NOT NULL GROUP BY subfoco').all();

let totalRowsWithSubfoco = 0;
let validSubfocoRows = 0;
let invalidSubfocos = [];

for (const row of sqliteSubfocoCounts) {
  totalRowsWithSubfoco += row.count;
  if (frontSubfocos.has(row.subfoco)) {
    validSubfocoRows += row.count;
  } else {
    invalidSubfocos.push(row);
  }
}

console.log(`Total de questões com subfoco: ${totalRowsWithSubfoco}`);
console.log(`Questões com subfoco exatamente no Front: ${validSubfocoRows} (${((validSubfocoRows/totalRowsWithSubfoco)*100).toFixed(2)}%)`);
console.log(`Questões com subfoco fora do Front: ${totalRowsWithSubfoco - validSubfocoRows} (${(((totalRowsWithSubfoco - validSubfocoRows)/totalRowsWithSubfoco)*100).toFixed(2)}%)`);
console.log(`Subfocos distintos fora: ${invalidSubfocos.length}`);
console.log('Top 20 subfocos com mais questões fora:');
invalidSubfocos.sort((a,b) => b.count - a.count);
invalidSubfocos.slice(0, 20).forEach(s => console.log(`  - ${s.subfoco}: ${s.count}`));

