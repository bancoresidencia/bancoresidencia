import { DatabaseSync } from 'node:sqlite';
import { pipeline, cos_sim } from '@xenova/transformers';

const db = new DatabaseSync('data/questoes_132k.db');
const extractor = await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');

const questaoExemplo = `
Mulher de 45 anos, previamente hígida, queixa-se de dor em cólica no hipocôndrio direito após ingestão de alimentos gordurosos há 3 semanas. 
Hoje apresentou piora da dor, com irradiação para escápula direita, associada a febre de 38,2ºC e vômitos. 
Ao exame físico: sinal de Murphy positivo. Ultrassonografia de abdome: vesícula biliar distendida, espessamento da parede (5 mm) e cálculo impactado no infundíbulo.
`;

const qEmb = await extractor(questaoExemplo, { pooling: 'mean', normalize: true });

// Busca 3 questões de Colecistite e 3 de Apendicite já homologadas
const colecistiteRows = db.prepare(`
  SELECT id, substr(statement, 1, 200) as st 
  FROM questions 
  WHERE status_recategorizacao = 'REMANEJO_BLOCO_SUBFOCO_REFINADO'
    AND novo_subfoco LIKE '%Colecistite%'
  LIMIT 3
`).all();

const apendiciteRows = db.prepare(`
  SELECT id, substr(statement, 1, 200) as st 
  FROM questions 
  WHERE status_recategorizacao = 'REMANEJO_BLOCO_SUBFOCO_REFINADO'
    AND novo_subfoco LIKE '%Apendicite%'
  LIMIT 3
`).all();

console.log('--- Comparação com Questões Homologadas de Colecistite (Ground Truth): ---');
for (const r of colecistiteRows) {
  const emb = await extractor(r.st, { pooling: 'mean', normalize: true });
  const score = cos_sim(qEmb.data, emb.data);
  console.log(`[Score: ${score.toFixed(4)}] ${r.st.replace(/\n/g, ' ')}...`);
}

console.log('\n--- Comparação com Questões Homologadas de Apendicite (Ground Truth): ---');
for (const r of apendiciteRows) {
  const emb = await extractor(r.st, { pooling: 'mean', normalize: true });
  const score = cos_sim(qEmb.data, emb.data);
  console.log(`[Score: ${score.toFixed(4)}] ${r.st.replace(/\n/g, ' ')}...`);
}

db.close();

