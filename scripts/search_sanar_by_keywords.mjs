import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('data/sanar_crawler.db');

const testCases = [
  { name: 'Bandl-Frommel', query: '%dilatacao total%' },
  { name: 'ABEM 32 anos', query: '%previamente higida%fraqueza%' },
  { name: 'ENARE 28 anos', query: '%Homem de 28 anos%estudante%' },
  { name: 'UFRGS 63 anos', query: '%Paciente de 63 anos%G4P4%' },
  { name: 'USP 4 meses', query: '%Crianca%4 meses%assadura%' }
];

console.log('Checking questions table in sanar_crawler.db:');
for (const tc of testCases) {
  const row = db.prepare(`SELECT sanar_id, enunciado_texto FROM questions WHERE enunciado_texto LIKE ? LIMIT 1`).get(tc.query);
  console.log(`  ${tc.name}:`, row ? `FOUND (${row.sanar_id})` : 'NOT_FOUND_IN_QUESTIONS_TABLE');
}

console.log('\nChecking crawl_queue table in sanar_crawler.db:');
for (const tc of testCases) {
  const row = db.prepare(`SELECT url FROM crawl_queue WHERE url LIKE ? LIMIT 1`).get(tc.query.replace(/ /g, '-').toLowerCase());
  console.log(`  ${tc.name} in crawl_queue:`, row ? `FOUND (${row.url})` : 'NOT_FOUND_IN_QUEUE');
}
