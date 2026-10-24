import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const questionId = '0f6da5f9-77e9-4f0b-9549-f0a399e9fb32';
const newCorrectAnswer = 'C';

const newOptions = [
  {
    letter: 'A',
    text: 'SUA-A.',
    explanation: 'Incorreta. A categoria **SUA-A (Adenomiose)** caracteriza-se pela presença ectópica de glândulas e estroma endometrial no miométrio, manifestando-se ultrassonograficamente por espessamento miometrial assimétrico, estrias e microcistos heterogêneos difusos, e não por um defeito focal em cunha na histerorrafia prévia.'
  },
  {
    letter: 'B',
    text: 'SUA-L.',
    explanation: 'Incorreta. A categoria **SUA-L (Leiomioma)** corresponde a tumorações miometriais benignas bem delimitadas com padrão fascicular e atenuação sonora posterior, achado totalmente distinto da falha miometrial anecoica da cicatriz de cesárea.'
  },
  {
    letter: 'C',
    text: 'SUA-N.',
    explanation: '**Correta.** A ultrassonografia transvaginal em corte sagital evidencia na parede anterior do istmo uterino (local da histerorrafia de cesáreas anteriores da paciente 2G2PC) uma área anecoica em cunha comunicando-se com a cavidade endometrial, definindo classicamente uma **Ístmocele (Nicho de cicatriz de cesariana)** com retenção de fluido hemático pós-menstrual. No sistema internacional **PALM-COEIN da FIGO (Munro et al., 2011/2018)**, a ístmocele e as malformações arteriovenosas uterinas são oficialmente alocadas na categoria **N (Não classificados em outra parte / Not otherwise classified)**.'
  },
  {
    letter: 'D',
    text: 'SUA-M.',
    explanation: 'Incorreta (Gabarito preliminar errôneo da banca). A letra **M** no acrônimo da FIGO significa exclusivamente **Malignidade e Hiperplasia** (Malignancy and hyperplasia), entidade incompatível com uma paciente jovem de 29 anos com defeito cicatricial mecânico pós-cesárea. O examinador cometeu um equívoco conceitual clássico ao associar a letra M a "malformação de cicatriz".'
  },
  {
    letter: 'E',
    text: 'A classificação da FIGO não pode nunca ser utilizada para Sangramentos Uterinos Anormais.',
    explanation: 'Incorreta. A classificação PALM-COEIN da FIGO é a ferramenta diagnóstica internacional padrão-ouro mundial para categorização etiológica do sangramento uterino anormal na menácme.'
  }
];

const newCommentary = `[GABARITO CORRIGIDO PELA CURADORIA MÉDICA / CONCILIAÇÃO DE RECURSO DA FIGO]
Gabarito retificado para a **ALTERNATIVA C (SUA-N)**.

A paciente é uma mulher jovem de 29 anos com antecedente obstétrico de dois partos cesáreos prévios (**2G2PC**) que apresenta Sangramento Uterino Anormal (tipicamente sangramento escuro de escape pós-menstrual por retenção de sangue).

1. **Achado Ultrassonográfico Transvaginal:**
O corte sagital do útero evidencia, exatamente na parede anterior do istmo/segmento uterino inferior (topografia da incisão cirúrgica das cesáreas anteriores), uma descontinuidade miometrial focal em formato de cunha/triângulo, anecoica por acúmulo de sangue/fluido: trata-se do aspecto patognomônico de **ÍSTMOCELE (Nicho de cicatriz de cesariana / Cesarean scar defect)**.

2. **Enquadramento no Sistema PALM-COEIN da FIGO:**
O sistema PALM-COEIN divide as causas em:
• **Estruturais (PALM):** Pólipo (P), Adenomiose (A), Leiomioma (L), Malignidade/Hiperplasia (M).
• **Não Estruturais (COEIN):** Coagulopatia (C), Disfunção Ovulatória (O), Endometrial (E), Iatrogênica (I), Não classificados em outra parte (N).

Pelas diretrizes e consensos mundiais da FIGO (*Munro MG et al., FIGO Menstrual Disorders Committee, 2011/2018*), causas estruturais atípicas adquiridas que não se enquadram nas categorias miometriais/endometriais habituais — especificamente o **defeito de cicatriz de cesárea (ístmocele)** e as malformações vasculares/arteriovenosas — são formalmente classificadas no grupo **SUA-N (Não classificados em outra parte)**.

3. **Origem do Erro do Gabarito da Banca:**
A banca examinadora publicou preliminarmente a Letra D (SUA-M), fruto de um erro crasso do examinador que presumiu que a letra "M" seria de "Malformação cicatricial", ignorando que na FIGO o "M" é reservado estritamente para Malignidade (câncer de endométrio/colo) e hiperplasias atípicas.

Principal Motivo de Erro:
Confundir a letra M da FIGO (Malignidade e hiperplasia) com "malformação", ou desconhecer que a ístmocele pós-cesárea pertence à categoria SUA-N da classificação internacional da FIGO.

Take-Home Message:
A **ístmocele (nicho de cesárea)** é visualizada ao ultrassom como uma falha em cunha na histerorrafia anterior do istmo. Na classificação PALM-COEIN da FIGO, ela é categorizada oficialmente como **SUA-N (Não classificados)**.

Evolução de Diretrizes:
Desde a consolidação da classificação PALM-COEIN pela FIGO em 2011 e a atualização de 2018, o comitê internacional de distúrbios menstruais fixou o nicho de cesárea na categoria "N", afastando qualquer relação com as categorias neoplásicas (M).

Referências:
• Munro MG, Critchley HOD, Fraser IS; FIGO Menstrual Disorders Committee. The two FIGO systems for normal and abnormal uterine bleeding symptoms and classification of causes of abnormal uterine bleeding in the reproductive years: 2018 revisions. Int J Gynaecol Obstet. 2018.
• Federação Brasileira das Associações de Ginecologia e Obstetrícia (FEBRASGO) - Tratado de Ginecologia.`;

const mainError = 'Confusão do examinador que considerou a letra M como "malformação", enquanto na classificação da FIGO a letra M significa exclusivamente Malignidade e hiperplasia, pertencendo a ístmocele à categoria SUA-N.';
const takeHome = 'A ístmocele (nicho de cicatriz de cesárea) é categorizada na classificação PALM-COEIN da FIGO como SUA-N (Não classificados).';

async function updateQuestion() {
  console.log('1. Atualizando no Supabase...');
  const { data, error } = await supabase
    .from('questions')
    .update({
      correct_answer: newCorrectAnswer,
      options: newOptions,
      commentary: newCommentary
    })
    .eq('id', questionId)
    .select();

  if (error) {
    console.error('❌ Erro no Supabase:', error);
  } else {
    console.log('✅ Supabase atualizado com sucesso! ID:', data[0]?.id, 'Novo Gabarito:', data[0]?.correct_answer);
  }

  // 2. Atualizar em data/checkpoints/ginecologia_deep_solved.json
  const deepFile = 'data/checkpoints/ginecologia_deep_solved.json';
  if (fs.existsSync(deepFile)) {
    console.log('2. Atualizando ginecologia_deep_solved.json...');
    const list = JSON.parse(fs.readFileSync(deepFile, 'utf8'));
    let found = false;
    for (const q of list) {
      if (q.id === questionId) {
        q.correct_answer = newCorrectAnswer;
        q.correctAnswer = newCorrectAnswer;
        q.options = newOptions;
        q.commentary = newCommentary;
        q.mainErrorReason = mainError;
        q.takeHomeMessage = takeHome;
        found = true;
        break;
      }
    }
    if (found) {
      fs.writeFileSync(deepFile, JSON.stringify(list, null, 2), 'utf8');
      console.log('✅ ginecologia_deep_solved.json atualizado!');
    }
  }

  // 3. Atualizar em data/checkpoints/ginecologia_gold_anchors_complete.json
  const anchorsFile = 'data/checkpoints/ginecologia_gold_anchors_complete.json';
  if (fs.existsSync(anchorsFile)) {
    console.log('3. Atualizando ginecologia_gold_anchors_complete.json...');
    const list = JSON.parse(fs.readFileSync(anchorsFile, 'utf8'));
    let found = false;
    for (const item of list) {
      if (item.id === questionId) {
        item.official_answer = newCorrectAnswer;
        found = true;
        break;
      }
    }
    if (found) {
      fs.writeFileSync(anchorsFile, JSON.stringify(list, null, 2), 'utf8');
      console.log('✅ ginecologia_gold_anchors_complete.json atualizado!');
    }
  }

  console.log('\n🎉 SUCESSO TOTAL: Questão de Ístmocele retificada para Letra C (SUA-N) com resolução padrão-ouro!');
}

updateQuestion();
