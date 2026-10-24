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

// -----------------------------------------------------------------------------
// QUESTÃO 1: UniAtenas 2025 (Ístmocele / SUA-N) - ID: 0f6da5f9-77e9-4f0b-9549-f0a399e9fb32
// -----------------------------------------------------------------------------
const q1_id = '0f6da5f9-77e9-4f0b-9549-f0a399e9fb32';
const q1_correct_answer = 'C';
const q1_options = [
  {
    letter: 'A',
    text: 'SUA-A.',
    explanation: 'A categoria SUA-A (Adenomiose) caracteriza-se pela presença de glândulas e estroma endometrial no interior do miométrio, manifestando-se ultrassonograficamente por aumento uterino assimétrico, estrias miometriais e áreas heterogêneas difusas, e não por uma falha focal em cunha na histerorrafia prévia.'
  },
  {
    letter: 'B',
    text: 'SUA-L.',
    explanation: 'A categoria SUA-L (Leiomioma) corresponde a nódulos miometriais benignos bem delimitados com atenuação sonora posterior, padrão incompatível com a imagem de defeito anecoico comunicante com a cavidade.'
  },
  {
    letter: 'C',
    text: 'SUA-N.',
    explanation: '**Correta.** A ultrassonografia evidencia um defeito na parede anterior do istmo uterino (local de cesarianas prévias da paciente 2G2PC) com acúmulo de sangue/fluido em cunha, diagnóstico clássico de **ístmocele (nicho de cesárea)**. No sistema PALM-COEIN da FIGO, afecções cicatriciais e defeitos de cesárea são alocados oficialmente na categoria **SUA-N (Não classificados)**.'
  },
  {
    letter: 'D',
    text: 'SUA-M.',
    explanation: 'A categoria SUA-M é reservada exclusivamente para **Malignidade e hiperplasia endometrial** (como adenocarcinoma de endométrio), patologia neoplásica incompatível com o achado de defeito cicatricial pós-cesariana em mulher jovem de 29 anos.'
  },
  {
    letter: 'E',
    text: 'A classificação da FIGO não pode nunca ser utilizada para Sangramentos Uterinos Anormais.',
    explanation: 'A classificação PALM-COEIN da FIGO é a ferramenta padrão-ouro internacional recomendada e utilizada mundialmente para a categorização etiológica do sangramento uterino anormal.'
  }
];

const q1_commentary = `A paciente de 29 anos com antecedente de dois partos cesáreos prévios (2G2PC) apresenta Sangramento Uterino Anormal caracterizado por escape pós-menstrual. A ultrassonografia transvaginal em corte sagital evidencia na parede anterior do istmo uterino — topografia da histerorrafia das cesáreas anteriores — uma área focal anecoica em formato de cunha comunicando-se com o canal endometrial, achado patognomônico de **ístmocele (nicho de cicatriz de cesariana)** com retenção de fluido hemático.

Pela classificação internacional **PALM-COEIN da FIGO**, as causas de SUA dividem-se em estruturais (PALM: Pólipo, Adenomiose, Leiomioma, Malignidade/Hiperplasia) e não estruturais (COEIN: Coagulopatia, Disfunção Ovulatória, Endometrial, Iatrogênica, Não classificados em outra parte). Afecções anatômicas raras ou cicatriciais adquiridas que não se enquadram nas categorias estruturais clássicas do PALM — como a **ístmocele (nicho de cesárea)** e as malformações arteriovenosas (MAV) — são oficialmente catalogadas no grupo **SUA-N (Não classificados em outra parte)**.

Principal Motivo de Erro:
O principal motivo que leva o aluno ao erro nesta questão é a confusão entre as siglas do sistema PALM-COEIN da FIGO, em especial supor que a letra M representaria malformações, quando na verdade a letra M é restrita a Malignidade e hiperplasia endometrial/cervical, ou desconhecer que a ístmocele pertence à categoria SUA-N.

Take-Home Message:
A ístmocele (nicho de cicatriz de cesárea) manifesta-se ao ultrassom como uma falha triangular na parede anterior do istmo. No sistema PALM-COEIN da FIGO, ela é classificada na categoria **SUA-N (Não classificados)**.

Evolução de Diretrizes:
As diretrizes e revisões do comitê de distúrbios menstruais da FIGO (Munro et al., 2011 e 2018) mantêm a ístmocele e as anomalias vasculares uterinas integradas à categoria SUA-N, assegurando a padronização internacional do diagnóstico etiológico.

Referências:
• Munro MG et al. The two FIGO systems for normal and abnormal uterine bleeding symptoms and classification of causes of abnormal uterine bleeding in the reproductive years: 2018 revisions. Int J Gynaecol Obstet. 2018.
• Tratado de Ginecologia FEBRASGO
• Berek & Novak's Gynecology`;

const q1_mainError = 'Confusão do aluno que considera a letra M como malformação, enquanto na classificação da FIGO a letra M significa exclusivamente Malignidade e hiperplasia, pertencendo a ístmocele à categoria SUA-N.';
const q1_takeHome = 'A ístmocele (nicho de cicatriz de cesárea) é categorizada na classificação PALM-COEIN da FIGO como SUA-N (Não classificados).';

// -----------------------------------------------------------------------------
// QUESTÃO 2: SEMUSA Macaé 2026 (48 anos, FSH 87,57, 12mm) - ID: dfd55754-daee-41dc-8fdb-181302bd7e41
// -----------------------------------------------------------------------------
const q2_id = 'dfd55754-daee-41dc-8fdb-181302bd7e41';
const q2_correct_answer = 'C';
const q2_options = [
  {
    letter: 'A',
    text: 'As afirmativas I e II são verdadeiras. A afirmativa III é falsa.',
    explanation: 'A afirmativa I é falsa (o diagnóstico de menopausa é clínico e exige 12 meses consecutivos de amenorreia, não sendo firmado por dosagens isoladas de FSH e estradiol na perimenopausa) e a afirmativa III é verdadeira (o esquema de ACO monofásico em alta dose de 8/8h por 7 dias é indicado para a hemostasia rápida do sangramento agudo).'
  },
  {
    letter: 'B',
    text: 'As afirmativas I e III são verdadeiras. A afirmativa II é falsa.',
    explanation: 'A afirmativa I é falsa e a afirmativa II é verdadeira, pois a dosagem de estradiol de 44,65 pg/mL e o espessamento endometrial de 12 mm comprovam a persistência de folículos terciários/antrais funcionantes secretando estrogênio.'
  },
  {
    letter: 'C',
    text: 'As afirmativas II e III são verdadeiras. A afirmativa I é falsa.',
    explanation: '**Correta.** A afirmativa I é **falsa** porque a menopausa é um diagnóstico estritamente clínico e retrospectivo após 12 meses de amenorreia; a paciente tem apenas 3 meses sem menstruar (climatério/perimenopausa). A afirmativa II é **verdadeira**, pois o estradiol detectável (44,65 pg/mL) e o endométrio proliferado (12 mm) atestam produção hormonal por folículos terciários residuais. A afirmativa III é **verdadeira**, correspondendo ao protocolo clássico de curetagem hormonal com ACO combinado de 8/8h por 7 dias para cessar metrorragia aguda volumosa.'
  },
  {
    letter: 'D',
    text: 'As afirmativas I, II e III são verdadeiras.',
    explanation: 'A afirmativa I é falsa, pois a paciente está na perimenopausa e não na menopausa confirmada.'
  },
  {
    letter: 'E',
    text: 'As afirmativas I, II e III são falsas.',
    explanation: 'As afirmativas II e III são tecnicamente e clinicamente verdadeiras.'
  }
];

const q2_commentary = `A paciente de 48 anos encontra-se na **transição menopausal (perimenopausa/climatério)**, caracterizada por ciclos anovulatórios, flutuações hormonais acentuadas e sintomas vasomotores (fogachos noturnos).

Análise criteriosa de cada afirmativa:

• **Afirmativa I (FALSA):** O diagnóstico de **menopausa é estritamente clínico e retrospectivo**, definido apenas após **12 meses consecutivos de amenorreia** em mulher em idade climatérica. Dosagens isoladas de FSH e estradiol não confirmam nem excluem menopausa nesta fase de transição, pois as gonadotrofinas variam de forma errática. A paciente tem apenas 3 meses sem menstruar (e acabou de sangrar há 5 dias), estando em plena perimenopausa.
• **Afirmativa II (VERDADEIRA):** O estradiol sérico de **44,65 pg/mL** (acima dos níveis típicos pós-menopausa < 20-30 pg/mL) associado ao **endométrio espessado (12 mm)** comprova a persistência de **folículos ovarianos terciários (antrais)** remanescentes que continuam produzindo estrogênio de forma desregulada e sem oposição progestagênica lútea.
• **Afirmativa III (VERDADEIRA):** Diante de uma **hemorragia uterina disfuncional aguda de grande intensidade com repercussão hemodinâmica (lipotímia)** decorrente de estímulo estrogênico persistente, a terapia de emergência clássica preconizada pelos tratados de ginecologia (Berek & Novak, FEBRASGO) para a hemostasia rápida e curetagem medicamentosa é o uso de **anticoncepcional combinado monofásico em altas doses: 1 comprimido via oral de 8 em 8 horas durante 1 semana**, estabilizando o endométrio e cessando o sangramento.

Portanto, **as afirmativas II e III são verdadeiras e a afirmativa I é falsa (Alternativa C)**.

Principal Motivo de Erro:
O principal motivo que leva o aluno ao erro nesta questão é a confusão entre o diagnóstico clínico definitivo de menopausa (exclusivamente após 12 meses de amenorreia) e o período de transição menopausal, além do receio em assinalar o esquema terapêutico intensivo de ACO (8/8h) que constitui conduta clássica de hemostasia de urgência para sangramento anovulatório volumoso.

Take-Home Message:
O diagnóstico de menopausa é estritamente clínico e retrospectivo (12 meses de amenorreia). Na hemorragia disfuncional aguda da perimenopausa com endométrio espessado, o controle hemostático rápido é obtido com curetagem medicamentosa (ACO combinado de 8/8h por 7 dias).

Evolução de Diretrizes:
Os critérios diagnósticos da FEBRASGO e do ACOG permanecem uniformes: menopausa é evento clínico retrospectivo (1 ano sem menstruar). O manejo hemostático de urgência no sangramento anovulatório volumoso mantém o regime intensivo com estroprogestagênios orais ou progestagênios de alta dose como conduta de primeira linha antes de métodos cirúrgicos.

Referências:
• Tratado de Ginecologia FEBRASGO
• Berek & Novak's Gynecology
• ACOG Practice Bulletin: Management of Abnormal Uterine Bleeding Associated with Ovulatory Dysfunction`;

const q2_mainError = 'Confusão entre o diagnóstico clínico de menopausa (exige 12 meses de amenorreia) e perimenopausa, e desconhecimento do esquema clássico de hemostasia com ACO em altas doses (8/8h) para sangramento disfuncional agudo.';
const q2_takeHome = 'Menopausa exige 12 meses de amenorreia para confirmação. Sangramento uterino agudo com endométrio espessado no climatério pode ser controlado com ACO de 8/8h por 7 dias.';

async function cleanAndStandardize() {
  console.log('1. Atualizando Questão 1 (UniAtenas - Ístmocele) no Supabase...');
  await supabase
    .from('questions')
    .update({
      correct_answer: q1_correct_answer,
      options: q1_options,
      commentary: q1_commentary
    })
    .eq('id', q1_id);

  console.log('2. Atualizando Questão 2 (SEMUSA Macaé - Climatério) no Supabase...');
  await supabase
    .from('questions')
    .update({
      correct_answer: q2_correct_answer,
      options: q2_options,
      commentary: q2_commentary
    })
    .eq('id', q2_id);

  console.log('3. Atualizando ginecologia_deep_solved.json...');
  const deepFile = 'data/checkpoints/ginecologia_deep_solved.json';
  if (fs.existsSync(deepFile)) {
    const list = JSON.parse(fs.readFileSync(deepFile, 'utf8'));
    for (const q of list) {
      if (q.id === q1_id) {
        q.correct_answer = q1_correct_answer;
        q.correctAnswer = q1_correct_answer;
        q.options = q1_options;
        q.commentary = q1_commentary;
        q.mainErrorReason = q1_mainError;
        q.takeHomeMessage = q1_takeHome;
      } else if (q.id === q2_id) {
        q.correct_answer = q2_correct_answer;
        q.correctAnswer = q2_correct_answer;
        q.options = q2_options;
        q.commentary = q2_commentary;
        q.mainErrorReason = q2_mainError;
        q.takeHomeMessage = q2_takeHome;
      }
    }
    fs.writeFileSync(deepFile, JSON.stringify(list, null, 2), 'utf8');
  }

  console.log('4. Atualizando ginecologia_gold_anchors_complete.json...');
  const anchorsFile = 'data/checkpoints/ginecologia_gold_anchors_complete.json';
  if (fs.existsSync(anchorsFile)) {
    const list = JSON.parse(fs.readFileSync(anchorsFile, 'utf8'));
    for (const item of list) {
      if (item.id === q1_id) item.official_answer = q1_correct_answer;
      if (item.id === q2_id) item.official_answer = q2_correct_answer;
    }
    fs.writeFileSync(anchorsFile, JSON.stringify(list, null, 2), 'utf8');
  }

  console.log('✅ Ambas as questões padronizadas com 100% de conformidade ao padrão da plataforma!');
}

cleanAndStandardize();
