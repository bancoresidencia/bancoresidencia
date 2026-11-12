import { DatabaseSync } from 'node:sqlite';

const db1 = new DatabaseSync('data/provaderesidencia_coleta.db');
const totalWithImgInDb1 = db1.prepare(`
  SELECT count(*) as c
  FROM questoes
  WHERE imagem_url IS NOT NULL AND imagem_url != '' AND imagem_url != 'null'
`).get().c;
console.log(`Total de questões com imagem_url em provaderesidencia_coleta.db: ${totalWithImgInDb1}`);

const sample = db1.prepare(`
  SELECT q.id, q.numero, q.enunciado, q.imagem_url, p.titulo, p.ano
  FROM questoes q
  JOIN provas p ON q.prova_id = p.id
  WHERE q.imagem_url IS NOT NULL AND q.imagem_url != ''
  LIMIT 5
`).all();

console.log('Amostra de questoes com imagem em provaderesidencia_coleta.db:');
console.log(JSON.stringify(sample, null, 2));
