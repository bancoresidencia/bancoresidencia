import { DatabaseSync } from 'node:sqlite';
import { pipeline, cos_sim } from '@xenova/transformers';

const db = new DatabaseSync('data/questoes_132k.db');
const extractor = await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');

const q1 = db.prepare(`SELECT * FROM questions WHERE id = '01ac6550-1f27-400f-b8e3-56ec03960dc6'`).get();

let q1Opts = [];
try { q1Opts = JSON.parse(q1.options || '[]'); } catch(e) {}
const q1Correct = q1Opts.find(o => o.letter === q1.correct_answer) || {};

const candHDA = 'Hemorragia Digestiva Alta (HDA) Não-Varicosa vs Varicosa: Diagnóstico, Estabilização e EDA';
const candHDB = 'Hemorragia Digestiva Baixa (HDB): Divertículos, Angiodisplasia e Conduta';

const embHDA = await extractor(candHDA, { pooling: 'mean', normalize: true });
const embHDB = await extractor(candHDB, { pooling: 'mean', normalize: true });

// Teste com payload conciso e cirúrgico:
const q1Targeted = `Caso clínico: ${q1.statement.slice(0, 300)}. Gabarito correto: ${q1Correct.text}. Diagnóstico: Hemorragia Alta vs Baixa.`;

const targEmb = await extractor(q1Targeted, { pooling: 'mean', normalize: true });
console.log('Payload Cirúrgico Conciso:');
console.log('  Score HDA:', cos_sim(targEmb.data, embHDA.data).toFixed(4));
console.log('  Score HDB:', cos_sim(targEmb.data, embHDB.data).toFixed(4));

db.close();

