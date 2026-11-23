import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('data/sanar_crawler.db');
const rows = db.prepare("SELECT enunciado_original, alternativa_a, alternativa_b, alternativa_c, alternativa_d FROM questions WHERE enunciado_original LIKE '%<img%' LIMIT 100").all();
const domains = new Set();
for (const r of rows) {
  const text = [r.enunciado_original, r.alternativa_a, r.alternativa_b, r.alternativa_c, r.alternativa_d].join(' ');
  const matches = text.match(/https?:\/\/[^\/"'\s]+/gi) || [];
  matches.forEach(m => domains.add(m));
}
console.log('Domains found in Sanar DB:', [...domains]);
