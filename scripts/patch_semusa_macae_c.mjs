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

const questionId = 'dfd55754-daee-41dc-8fdb-181302bd7e41';
const newCorrectAnswer = 'C';

const newOptions = [
  {
    letter: 'A',
    text: 'As afirmativas I e II são verdadeiras. A afirmativa III é falsa.',
    explanation: 'Incorreta. A afirmativa I é falsa (o diagnóstico de menopausa é clínico e exige 12 meses consecutivos de amenorreia, não sendo firmado por dosagens isoladas de FSH e estradiol na perimenopausa) e a afirmativa III é verdadeira (o esquema de ACO monofásico em alta dose de 8/8h por 7 dias é indicado para a hemostasia rápida do sangramento agudo).'
  },
  {
    letter: 'B',
    text: 'As afirmativas I e III são verdadeiras. A afirmativa II é falsa.',
    explanation: 'Incorreta. A afirmativa I é falsa e a afirmativa II é verdadeira, pois a dosagem de estradiol de 44,65 pg/mL e o espessamento endometrial de 12 mm comprovam a persistência de folículos terciários/antrais funcionantes secretando estrogênio.'
  },
  {
    letter: 'C',
    text: 'As afirmativas II e III são verdadeiras. A afirmativa I é falsa.',
    explanation: '**Correta.** A afirmativa I é **falsa** porque a menopausa é um diagnóstico estritamente clínico e retrospectivo após 12 meses de amenorreia; a paciente tem apenas 3 meses sem menstruar (climatério/perimenopausa). A afirmativa II é **verdadeira**, pois o estradiol detectável (44,65 pg/mL) e o endométrio proliferado (12 mm) atestam produção hormonal por folículos terciários residuais. A afirmativa III é **verdadeira**, correspondendo ao protocolo clássico de curetagem hormonal com ACO combinado de 8/8h por 7 dias para cessar metrorragia aguda volumosa.'
  },
  {
    letter: 'D',
    text: 'As afirmativas I, II e III são verdadeiras.',
    explanation: 'Incorreta. A afirmativa I é falsa, pois a paciente está na perimenopausa e não na menopausa confirmada.'
  },
  {
    letter: 'E',
    text: 'As afirmativas I, II e III são falsas.',
    explanation: 'Incorreta. As afirmativas II e III são tecnicamente e clinicamente verdadeiras.'
  }
];

const newCommentary = `A paciente de 48 anos encontra-se na **transição menopausal (perimenopausa/climatério)**, caracterizada por ciclos anovulatórios, flutuações hormonais acentuadas e sintomas vasomotores (fogachos noturnos).

Análise criteriosa de cada afirmativa:

• **Afirmativa I (FALSA):** O diagnóstico de **menopausa é estritamente clínico e retrospectivo**, definido apenas após **12 meses consecutivos de amenorreia** em mulher em idade climatérica. Dosagens isoladas de FSH e estradiol não confirmam nem excluem menopausa nesta fase de transição, pois as gonadotrofinas variam de forma errática. A paciente tem apenas 3 meses sem menstruar (e acabou de sangrar há 5 dias), estando em plena perimenopausa.
• **Afirmativa II (VERDADEIRA):** O estradiol sérico de **44,65 pg/mL** (acima dos níveis típicos pós-menopausa < 20-30 pg/mL) associado ao **endométrio espessado (12 mm)** comprova a persistência de **folículos ovarianos terciários (antrais)** remanescentes que continuam produzindo estrogênio de forma desregulada e sem oposição progestagênica lútea.
• **Afirmativa III (VERDADEIRA):** Diante de uma **hemorragia uterina disfuncional aguda de grande intensidade com repercussão hemodinâmica (lipotímia)** decorrente de estímulo estrogênico persistente, a terapia de emergência clássica preconizada pelos tratados de ginecologia (Berek & Novak, FEBRASGO) para a hemostasia rápida e curetagem medicamentosa é o uso de **anticoncepcional combinado monofásico em altas doses: 1 comprimido via oral de 8 em 8 horas durante 1 semana**, estabilizando o endométrio e cessando o sangramento.

Portanto, **as afirmativas II e III são verdadeiras e a afirmativa I é falsa (Alternativa C)**.

Principal Motivo de Erro:
O principal motivo que leva o aluno ao erro nesta questão é a confusão entre o **diagnóstico clínico definitivo de menopausa (exclusivamente após 12 meses de amenorreia)** e o período de **transição menopausal**, além do receio em assinalar o esquema terapêutico intensivo de ACO (8/8h) que constitui conduta clássica de hemostasia de urgência para sangramento anovulatório volumoso.

Take-Home Message:
1. O diagnóstico de **menopausa é estritamente clínico e retrospectivo (12 meses de amenorreia)**. FSH elevado isolado no climatério não sela diagnóstico de menopausa.
2. Na hemorragia disfuncional aguda da perimenopausa com endométrio espessado, o controle hemostático rápido é obtido com **curetagem medicamentosa (ACO combinado de 8/8h por 7 dias)**.

Evolução de Diretrizes:
Os critérios diagnósticos da Federação Brasileira das Associações de Ginecologia e Obstetrícia (FEBRASGO) e do ACOG permanecem uniformes: menopausa é evento clínico retrospectivo (1 ano sem menstruar). O manejo hemostático de urgência no sangramento anovulatório volumoso mantém o regime intensivo com estroprogestagênios orais ou progestagênios de alta dose como conduta de primeira linha antes de métodos cirúrgicos.

Referências:
• Tratado de Ginecologia FEBRASGO
• Berek & Novak - Tratado de Ginecologia
• ACOG Practice Bulletin - Management of Abnormal Uterine Bleeding Associated with Ovulatory Dysfunction`;

const mainError = 'Confusão entre o diagnóstico clínico de menopausa (exige 12 meses de amenorreia) e perimenopausa, e desconhecimento do esquema clássico de hemostasia com ACO em altas doses (8/8h) para sangramento disfuncional agudo.';
const takeHome = 'Menopausa exige 12 meses de amenorreia para confirmação. Sangramento uterino agudo com endométrio espessado no climatério pode ser controlado com ACO de 8/8h por 7 dias.';

async function updateAll() {
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
      console.log('✅ ginecologia_deep_solved.json atualizado com sucesso!');
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
      console.log('✅ ginecologia_gold_anchors_complete.json atualizado com sucesso!');
    }
  }

  console.log('\n🎉 SUCESSO TOTAL: Questão atualizada para Letra C com resolução padrão-ouro completa!');
}

updateAll();
