import { pipeline, cos_sim } from '@xenova/transformers';

console.log('⏳ Testando Xenova/paraphrase-multilingual-MiniLM-L12-v2...');
const extractor = await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');

const text1 = 'Paciente com febre alta, rigidez de nuca, petéquias e líquor turvo com diplococos gram-negativos';
const cand1 = 'Meningite Meningocócica e Infecções do Sistema Nervoso Central';
const cand2 = 'Colecistite Aguda Litiásica e Cirurgia Abdominal';

const e1 = await extractor(text1, { pooling: 'mean', normalize: true });
const ec1 = await extractor(cand1, { pooling: 'mean', normalize: true });
const ec2 = await extractor(cand2, { pooling: 'mean', normalize: true });

const score1 = cos_sim(e1.data, ec1.data);
const score2 = cos_sim(e1.data, ec2.data);

console.log('Score Meningite:', score1.toFixed(4));
console.log('Score Colecistite:', score2.toFixed(4));
console.log('Diferencial:', (score1 - score2).toFixed(4));

