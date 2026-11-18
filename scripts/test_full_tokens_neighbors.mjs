import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
const db = new DatabaseSync('data/questions_golden_fts.db', { readOnly: true });

const res = JSON.parse(fs.readFileSync('data/benchmark_consenso_100_resultado.json', 'utf8'));

const testIds = ['pdr_21052', 'pdr_9952', 'pdr_9956', 'pdr_21010', 'pdr_21021', 'pdr_23376'];

const STOPWORDS = new Set(['para', 'com', 'sem', 'dos', 'das', 'uma', 'uns', 'pelo', 'pela', 'sobre', 'entre', 'após', 'onde', 'qual', 'como', 'mais', 'menos', 'que', 'nao', 'sao', 'este', 'esta', 'esse', 'essa', 'isso', 'isto', 'foram', 'como', 'pode', 'deve', 'sendo', 'caso', 'sobre', 'paciente', 'abaixo', 'acima', 'assinale', 'alternativa', 'correta', 'incorreta', 'analise', 'seguinte', 'quadro', 'apresenta', 'relacao', 'segundo', 'diante', 'considere', 'quanto', 'podemos', 'afirmar', 'referente', 'anos', 'mulher', 'homem', 'apresentando', 'dirigiu', 'solicitarmos', 'administracao', 'queixou', 'localizada', 'assintomatica', 'proceder', 'durante', 'ultima', 'semana']);

for (const id of testIds) {
  const q = res.find(r => r.id === id);
  const raw = `${q.statement} ${q.correctText}`;
  const norm = raw
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ');

  const tokens = norm.split(/\s+/).filter(w => w.length >= 3 && !STOPWORDS.has(w));
  const ftsQuery = tokens.map(t => `"${t}"`).join(' OR ');

  const matches = db.prepare('SELECT especialidade, tema, foco, subfoco, bm25(questions_fts) as rank FROM questions_fts WHERE questions_fts MATCH ? ORDER BY rank LIMIT 5').all(ftsQuery);
  
  console.log(`\n================ ID: ${id} ================`);
  console.log(`Text: ${q.statement.slice(0, 90)}...`);
  console.log(`Gab: ${q.correctText}`);
  console.log('Top Neighbors with full tokens:');
  for (const m of matches) {
    console.log(`  [Rank: ${m.rank.toFixed(2)}] ${m.especialidade} > ${m.tema} > ${m.foco} > ${m.subfoco}`);
  }
}
