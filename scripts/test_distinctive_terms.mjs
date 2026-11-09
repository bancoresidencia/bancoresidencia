import { pipeline, cos_sim } from '@xenova/transformers';

const extractor = await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');

const q = 'A visita domiciliar (VD) tem como prioridade o diagnóstico da realidade do indivíduo e as ações educativas. Geralmente é programada e serve para subsidiar o cuidado longitudinal ao longo do tempo pela equipe de saúde da família.';

const qEmb = await extractor(q, { pooling: 'mean', normalize: true });

// Sem palavras distintivas:
const p1 = 'Atributos Essenciais de Barbara Starfield';
const p2 = 'Atributos Derivados de Barbara Starfield';
const e1 = await extractor(p1, { pooling: 'mean', normalize: true });
const e2 = await extractor(p2, { pooling: 'mean', normalize: true });

console.log('Sem termos distintivos:');
console.log('  Essenciais:', cos_sim(qEmb.data, e1.data).toFixed(4));
console.log('  Derivados: ', cos_sim(qEmb.data, e2.data).toFixed(4));

// COM termos clínicos distintivos da medicina:
const p1Rich = 'Atributos Essenciais de Barbara Starfield: Acesso de Primeiro Contato, Longitudinalidade e Cuidado Contínuo, Integralidade e Coordenação do Cuidado.';
const p2Rich = 'Atributos Derivados de Barbara Starfield: Orientação Familiar, Orientação Comunitária e Competência Cultural.';

const e1R = await extractor(p1Rich, { pooling: 'mean', normalize: true });
const e2R = await extractor(p2Rich, { pooling: 'mean', normalize: true });

console.log('\nCOM termos clínicos distintivos da medicina:');
console.log('  Essenciais:', cos_sim(qEmb.data, e1R.data).toFixed(4));
console.log('  Derivados: ', cos_sim(qEmb.data, e2R.data).toFixed(4));
console.log('  Diferencial:', (cos_sim(qEmb.data, e1R.data) - cos_sim(qEmb.data, e2R.data)).toFixed(4));

