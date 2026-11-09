import { DatabaseSync } from 'node:sqlite';
import { pipeline, cos_sim } from '@xenova/transformers';

const db = new DatabaseSync('data/questoes_132k.db');
const extractor = await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');

// Teste 1: Q#01ac6550 (Enterorragia com gabarito de EDA)
const q1 = db.prepare(`SELECT * FROM questions WHERE id = '01ac6550-1f27-400f-b8e3-56ec03960dc6'`).get();

let q1Opts = [];
try { q1Opts = JSON.parse(q1.options || '[]'); } catch(e) {}
const q1Correct = q1Opts.find(o => o.letter === q1.correct_answer) || {};

console.log('--- TESTE 1: INJEÇÃO DE GABARITO NA QUESTÃO DE ENTERORRAGIA ---');
console.log('Alternativa Correta:', q1Correct.letter, '-', q1Correct.text);

const q1PayloadRaw = `Caso clínico: ${q1.statement}`;
const q1PayloadRich = `Caso clínico: ${q1.statement}. Gabarito da Banca Oficial: Alternativa ${q1Correct.letter}: ${q1Correct.text}. Justificativa clínica: ${q1Correct.explanation || ''} ${q1.commentary || ''}`;

const candHDA = 'Hemorragia Digestiva Alta (HDA) Não-Varicosa vs Varicosa: Diagnóstico, Estabilização e EDA';
const candHDB = 'Hemorragia Digestiva Baixa (HDB): Divertículos, Angiodisplasia e Conduta';

const embHDA = await extractor(candHDA, { pooling: 'mean', normalize: true });
const embHDB = await extractor(candHDB, { pooling: 'mean', normalize: true });

const rawEmb = await extractor(q1PayloadRaw, { pooling: 'mean', normalize: true });
console.log('\nSem gabarito (Puro):');
console.log('  Score HDA:', cos_sim(rawEmb.data, embHDA.data).toFixed(4));
console.log('  Score HDB:', cos_sim(rawEmb.data, embHDB.data).toFixed(4));

const richEmb = await extractor(q1PayloadRich, { pooling: 'mean', normalize: true });
console.log('\nCom injeção de Gabarito + Justificativa Oficial:');
console.log('  Score HDA:', cos_sim(richEmb.data, embHDA.data).toFixed(4));
console.log('  Score HDB:', cos_sim(richEmb.data, embHDB.data).toFixed(4));

db.close();

