import { DatabaseSync } from 'node:sqlite';
import { pipeline, cos_sim } from '@xenova/transformers';

const db = new DatabaseSync('data/questoes_132k.db');
const extractor = await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');

const q2 = db.prepare(`SELECT * FROM questions WHERE id = '01b3c33d-4ba8-4cda-8855-588f3a702703'`).get();

let q2Opts = [];
try { q2Opts = JSON.parse(q2.options || '[]'); } catch(e) {}
const q2Correct = q2Opts.find(o => o.letter === q2.correct_answer) || {};

const q2Targeted = `Caso clínico: ${q2.statement.slice(0, 350)}. Gabarito correto: ${q2Correct.text}. Tema: ${q2.antigo_tema || ''} ${q2.antigo_subfoco || ''}.`;

const cands = [
  'Pancreatite Crônica: Insuficiência Exócrina, Esteatorreia e Reposição Enzimática',
  'Pancreatite Aguda: Critérios de Atlanta e Gravidade',
  'Apendicite Aguda: Diagnóstico Clínico e Escore de Alvarado',
  'Colecistite Aguda Litiásica: Diagnóstico e Tratamento'
];

const qEmb = await extractor(q2Targeted, { pooling: 'mean', normalize: true });

console.log('--- TESTE QUESTION 2 (PANCREATITE): ---');
for (const c of cands) {
  const cEmb = await extractor(c, { pooling: 'mean', normalize: true });
  console.log(`  • [${cos_sim(qEmb.data, cEmb.data).toFixed(4)}] ${c}`);
}

db.close();

