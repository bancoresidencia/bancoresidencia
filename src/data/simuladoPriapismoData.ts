import { Question } from '@/types';

export const SIMULADO_PRIAPISMO_QUESTIONS: Question[] = [
  {
    id: 'be5e245d-01c6-4b58-82f3-1a75812e0f71',
    code: 'SMS-2025-URO-823',
    institution: 'SMS Campo Grande',
    banca: 'SMS Campo Grande',
    year: 2025,
    tipoProva: 'Residência Médica',
    modalidade: 'Acesso Direto',
    especialidade: 'Cirurgia Geral',
    tema: 'Urologia',
    foco: 'Urgências Urológicas',
    subfoco: 'Priapismo e Urgências Penianas',
    difficulty: 'Difícil',
    type: 'Múltipla escolha',
    isAnulada: false,
    statement:
      'O priapismo é uma ereção peniana que persiste além da estimulação sexual, ou que não esteja relacionada com ela. Exceto nos casos do tipo não isquêmico, o priapismo costuma ser acompanhado de dor espontânea e à palpação. No grupo mais jovem, o priapismo associa-se mais a doença falciforme ou a uma neoplasia. O priapismo com baixo fluxo se associa a um pênis doloroso inteiramente ereto, causando hipoxia local e acidose devido a diminuição da saída venosa. Já o priapismo de alto fluxo se associa ao aumento do fluxo arterial sem aumento da resistência à saída venosa, assim resultando em entrada alta e saída alta. O tratamento do priapismo de alto fluxo na grande maioria é cirúrgico através de embolização arterial ou ligadura arterial cirúrgica aberta. Assinale a alternativa que corresponde a um priapismo de alto fluxo:',
    options: [
      {
        letter: 'A',
        text: 'Trauma perineal ou peniano',
        explanation:
          '**Alternativa correta.** O **priapismo arterial (alto fluxo)** é caracterizado por uma **fístula arteriovenosa** entre a artéria cavernosa e os sinusóides do corpo cavernoso, decorrente tipicamente de **trauma perineal ou peniano**, resultando em **ereção indolor**, **sem isquemia tecidual** e com gasometria sanguínea de **padrão arterial** (pH ≥ 7,40, pO₂ > 90 mmHg).'
      },
      {
        letter: 'B',
        text: 'Medicações como sildenafil, trazodona, clorpromazina',
        explanation:
          '**Alternativa incorreta.** Medicações como **sildenafil (inibidor da PDE-5)**, **trazodona** e **clorpromazina** provocam alteração autonômica e falha no esvaziamento venoso, desencadeando classicamente **priapismo veno-oclusivo (baixo fluxo / isquêmico)**.'
      },
      {
        letter: 'C',
        text: 'Traumatismo raquimedular',
        explanation:
          '**Alternativa incorreta.** O traumatismo raquimedular cursa com **disfunção simpática** e ereções reflexas sustentadas que geram estase venosa e **priapismo de baixo fluxo (isquêmico)**, e não arterial.'
      },
      {
        letter: 'D',
        text: 'Contraste IV hiperosmolar',
        explanation:
          '**Alternativa incorreta.** O contraste intravenoso hiperosmolar associa-se a **nefropatia induzida por contraste** e reações osmóticas, **sem relação fisiopatológica** com fístulas arteriocavernosas ou priapismo de alto fluxo.'
      },
      {
        letter: 'E',
        text: 'Nenhuma das anteriores',
        explanation:
          '**Alternativa incorreta.** A **Alternativa A está correta**, tornando incorreta a indicação de que nenhuma seria verdadeira.'
      }
    ],
    correctAnswer: 'A',
    commentary:
      'O priapismo divide-se fundamentalmente em duas entidades clínicas:\n\n1. **Priapismo Isquêmico (Baixo Fluxo / Veno-oclusivo):** Representa uma **emergência médica urológica** análoga a uma síndrome compartimental. Cursa com **dor peniana intensa**, **corpos cavernosos rígidos com glande flácida**, **sangue aspirado escuro**, **hipóxia tecidual profunda** e **acidose grave** (pH < 7,25).\n\n2. **Priapismo Não Isquêmico (Alto Fluxo / Arterial):** Decorre de **trauma perineal contuso**, gerando fístula artéria-sinusóide. É **indolor**, **não cursa com isquemia imediata**, mantém pênis **elástico/tumescente** e sangue **vermelho-vivo arterial** (pH ≥ 7,40, pO₂ > 90 mmHg).\n\n**Conduta:** Enquanto o isquêmico exige **aspiração + fenilefrina intracavernosa de urgência**, o não isquêmico é conduzido inicialmente com **observação clínica** ou **embolização arterial seletiva** guiada por arteriografia.',
    mainErrorReason:
      '**Armadilha clássica de prova:** Confundir a etiologia medicamentosa (sildenafil, trazodona) com alto fluxo. Na realidade, medicações causam **priapismo de baixo fluxo (isquêmico)** por estase venosa dolorosa. O priapismo de alto fluxo é **quase exclusivamente traumático e indolor**.',
    takeHomeMessage:
      '**Regra de Ouro:** Pênis doloroso e rígido após medicação ou falciforme = **Baixo Fluxo (Isquêmico → Emergência)**. Pênis indolor após pancada no períneo ou bicicleta = **Alto Fluxo (Arterial → Embolização Seletiva)**.',
    guidelineEvolution:
      'As diretrizes da **Associação Americana de Urologia (AUA)** e da **Associação Europeia de Urologia (EAU)** priorizam a gasometria cavernosa para o diagnóstico diferencial definitivo entre priapismo isquêmico e não isquêmico.',
    references: [
      'Campbell-Walsh Urology (Capítulo de Urgências Andrológicas)',
      'Diretrizes da Associação Europeia de Urologia (EAU) sobre Urologia de Urgência',
      'Consenso da Sociedade Brasileira de Urologia (SBU)'
    ]
  },
  {
    id: 'eecc0b31-c52c-559a-9976-7f67ac20a35a',
    code: 'UNESP-2024-URO-102',
    institution: 'UNESP',
    banca: 'VUNESP',
    year: 2024,
    tipoProva: 'Residência Médica',
    modalidade: 'Acesso Direto',
    especialidade: 'Cirurgia Geral',
    tema: 'Urologia',
    foco: 'Urgências Urológicas',
    subfoco: 'Priapismo e Urgências Penianas',
    difficulty: 'Difícil',
    type: 'Múltipla escolha',
    isAnulada: false,
    statement:
      'Homem de 35 anos apresenta ereção dolorosa e persistente há 4 horas. Nega uso de medicações ou trauma recentemente. Ao exame físico: estável hemodinamicamente, desconfortável devido à dor peniana. Pênis: ereto, corpos cavernosos entumescidos com consistência muito firme e glande flácida. O tipo de priapismo, o resultado da gasometria do sangue cavernoso e a conduta terapêutica inicial são, correta e respectivamente:',
    options: [
      {
        letter: 'A',
        text: 'Não isquêmico; pH = 7,30 pO₂ = 65 pCO₂ = 35; arteriografia com embolização de fístula.',
        explanation:
          '**Alternativa incorreta.** O quadro com **dor intensa**, **corpos cavernosos rígidos** e **glande flácida** define **priapismo isquêmico (baixo fluxo)**, e não alto fluxo. Ademais, a gasometria do alto fluxo seria arterializada (pH ≥ 7,40, pO₂ > 90 mmHg).'
      },
      {
        letter: 'B',
        text: 'Isquêmico; pH = 7,30 pO₂ = 65 pCO₂ = 35; shunt cavernoso-esponjoso proximal.',
        explanation:
          '**Alternativa incorreta.** Os valores gasométricos apresentados (pH = 7,30, pO₂ = 65, pCO₂ = 35) **não refletem a acidose e hipóxia cavernosas** do priapismo isquêmico. Além disso, o *shunt* proximal de Quackels é procedimento cirúrgico de **resgate de última linha**, nunca conduta inicial.'
      },
      {
        letter: 'C',
        text: 'Isquêmico; pH = 7,10 pO₂ = 35 pCO₂ = 65; shunt cavernoso-esponjoso distal.',
        explanation:
          '**Alternativa incorreta.** Embora os valores gasométricos de acidose e hipercapnia estejam adequados (pH = 7,10, pO₂ = 35, pCO₂ = 65), a realização imediata de **shunt distal (Winter ou Al-Ghorab)** **queima etapas obrigatórias** do protocolo inicial de descompressão clínica.'
      },
      {
        letter: 'D',
        text: 'Isquêmico; pH = 7,10 pO₂ = 35 pCO₂ = 65; aspiração e irrigação dos corpos cavernosos, e injeção intracavernosa de simpatomiméticos.',
        explanation:
          '**Alternativa correta.** Diagnóstico de **priapismo isquêmico (baixo fluxo)** confirmado pelo exame físico e pela gasometria: **acidose grave** (pH = 7,10), **hipóxia tecidual profunda** (pO₂ = 35 mmHg) e **hipercapnia** (pCO₂ = 65 mmHg). A conduta inicial mandatória preconizada pelas diretrizes (AUA/EAU/SBU) é a **aspiração/irrigação com soro fisiológico** associada à **injeção intracavernosa de simpatomiméticos (fenilefrina)**.'
      }
    ],
    correctAnswer: 'D',
    commentary:
      'O priapismo isquêmico é uma **emergência tempo-dependente**: após **4 a 6 horas**, inicia-se fibrose tecidual irreversível e necrose da musculatura cavernosa, culminando em disfunção erétil permanente em até 90% dos casos não revertidos precocemente.\n\n**Diferenciação pela Gasometria Cavernosa:**\n• **Isquêmico (Veno-oclusivo):** pH < 7,25, pO₂ < 30 mmHg, pCO₂ > 60 mmHg (sangue escuro, acidótico).\n• **Não Isquêmico (Arterial):** pH > 7,40, pO₂ > 90 mmHg, pCO₂ < 40 mmHg (sangue vermelho-vivo, oxigenado).\n\n**Escalonamento Terapêutico Preconizado:**\n1. **1ª Linha:** Aspiração de sangue escuro e irrigação com SF 0,9%.\n2. **2ª Linha:** Injeção intracavernosa fracionada de **fenilefrina** (100 a 500 µg a cada 3–5 min, com monitorização de PA/FC).\n3. **3ª Linha (Casos Refratários > 1 hora):** *Shunts* cirúrgicos distais (Winter, Al-Ghorab) e, em última instância, proximais (Quackels, Grayhack).',
    mainErrorReason:
      '**Armadilha clássica:** Indicar procedimentos cirúrgicos invasivos (*shunts*) logo na chegada do paciente. O protocolo exige **esgotar aspiração + injeção de alfa-agonista** antes de qualquer intervenção cirúrgica de derivação.',
    takeHomeMessage:
      '**Regra de Ouro:** Sangue escuro, acidose (pH < 7,25) e hipóxia (pO₂ < 30 mmHg) = **Priapismo Isquêmico**. Conduta inicial inegociável: **aspiração + fenilefrina intracavernosa**.',
    guidelineEvolution:
      'Diretrizes internacionais (AUA e EAU) são unânimes: procedimentos de derivação (shunts de Winter, Al-Ghorab ou Grayhack) só são autorizados após falência comprovada do tratamento conservador por aspiração e fenilefrina intracavernosa.',
    references: [
      'Diretrizes de Priapismo da Associação Americana de Urologia (AUA)',
      'Diretrizes da Associação Europeia de Urologia (EAU) sobre Urgências Andrológicas',
      'Manual de Urgências Urológicas da Sociedade Brasileira de Urologia (SBU)'
    ]
  }
];
