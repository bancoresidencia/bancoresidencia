import { pipeline, cos_sim } from '@xenova/transformers';

console.log('⏳ Inicializando pipeline de embeddings local...');
const extractor = await pipeline('feature-extraction', 'Xenova/multilingual-e5-small');
console.log('✅ Modelo carregado com sucesso!');

// Multilingual-e5 requer o prefixo "query: " para buscas e "passage: " para documentos
const text1 = 'query: Paciente com febre alta, rigidez de nuca, petéquias e líquor turvo';
const cand1 = 'passage: Meningite Meningocócica: Diagnóstico e Antibioticoterapia';
const cand2 = 'passage: Colecistite Aguda e Cirurgia Videolaparoscópica';

const e1 = await extractor(text1, { pooling: 'mean', normalize: true });
const ec1 = await extractor(cand1, { pooling: 'mean', normalize: true });
const ec2 = await extractor(cand2, { pooling: 'mean', normalize: true });

const score1 = cos_sim(e1.data, ec1.data);
const score2 = cos_sim(e1.data, ec2.data);

console.log('Score Meningite:', score1.toFixed(4));
console.log('Score Colecistite:', score2.toFixed(4));

