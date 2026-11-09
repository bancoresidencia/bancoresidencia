import { pipeline, cos_sim } from '@xenova/transformers';

console.log('⏳ Carregando paraphrase-multilingual-MiniLM-L12-v2 local...');
const extractor = await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');

const questaoExemplo = `
Mulher de 45 anos, previamente hígida, queixa-se de dor em cólica no hipocôndrio direito após ingestão de alimentos gordurosos há 3 semanas. 
Hoje apresentou piora da dor, com irradiação para escápula direita, associada a febre de 38,2ºC e vômitos. 
Ao exame físico: sinal de Murphy positivo. Ultrassonografia de abdome: vesícula biliar distendida, espessamento da parede (5 mm) e cálculo impactado no infundíbulo.
`;

const subfocosCandidatos = [
  'Colecistite Aguda Litiásica e Coledocolitíase: Diagnóstico e Tratamento',
  'Pancreatite Aguda: Critérios de Atlanta e Escore de Balthazar',
  'Apendicite Aguda: Diagnóstico Clínico e Escore de Alvarado',
  'Hérnias da Parede Abdominal: Anatomia e Tratamento Cirúrgico'
];

console.log('🧪 Gerando embedding do caso clínico...');
const qEmb = await extractor(questaoExemplo, { pooling: 'mean', normalize: true });

console.log('🧪 Comparando contra os subfocos candidatos:');
for (const sub of subfocosCandidatos) {
  const sEmb = await extractor(sub, { pooling: 'mean', normalize: true });
  const score = cos_sim(qEmb.data, sEmb.data);
  console.log(`  • [Score: ${score.toFixed(4)}] ${sub}`);
}

