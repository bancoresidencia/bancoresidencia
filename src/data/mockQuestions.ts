import { SpecialtyHierarchy, StudyModalidade, Question } from '@/types';

export const medevoModalidades: StudyModalidade[] = [
  'Residência Médica',
  'Revalida',
  'Ciclo Básico',
  'R+ Clínica Médica',
  'R+ Pediatria',
  'R+ Cirurgia',
  'R+ Ginecologia e Obstetrícia',
  'R+ Neuropediatria',
  'Título de Oftalmologia (CBO)',
  'Título Clínica Médica (TECM)'
];

export const medevoTiposProva = [
  'Prova 1',
  'Prova 2',
  '2ª Aplicação',
  'Suplementar',
  'Pró-Residência MFC',
  'Segunda Entrada'
];

export const medevoAnos = Array.from({ length: 18 }, (_, i) => 2027 - i); // 2027 até 2010

export const medevoInstituicoes = [
  'ENARE',
  'USP-SP',
  'UNIFESP',
  'UNICAMP',
  'UERJ',
  'SUS-SP',
  'UFRJ',
  'UFMG',
  'SCMSP',
  'IAMSPE',
  'UFRGS',
  'UFPR',
  'AMRIGS',
  'PSU-MG',
  'SES-DF',
  'SURCE',
  'HSI',
  'HEVV',
  'HST',
  'SUS-RR',
  'Hospital São Marcos',
  'Hospital Policlin'
];

import { clinicaMedicaHierarchy } from './clinicaMedicaData';
import { cirurgiaHierarchy } from './cirurgiaData';
import { pediatriaHierarchy } from './pediatriaData';
import { preventivaHierarchy } from './preventivaData';
import { extractedMedEvoQuestions } from './extractedMedEvoQuestions';

// Hierarquia completa extraída com Especialidade, Tema, Foco e Subfoco
export const medevoHierarchy: SpecialtyHierarchy[] = [
  clinicaMedicaHierarchy,
  cirurgiaHierarchy,
  pediatriaHierarchy,
  {
    especialidade: 'Ginecologia e Obstetrícia',
    temas: [
      {
        tema: 'Obstetrícia',
        focos: [
          {
            foco: 'Síndromes Hipertensivas e Hemorragias da Gestação',
            subfocos: [
              'Pré-Eclâmpsia com Sinais de Gravidade e Manejo com Sulfato de Magnésio',
              'Descolamento Prematuro de Placenta e Placenta Prévia',
              'Hemorragia Pós-Parto: Conduta e Drogas Uterotônicas'
            ]
          }
        ]
      },
      {
        tema: 'Ginecologia',
        focos: [
          {
            foco: 'Rastreamento Oncológico e Sangramento Uterino Anormal',
            subfocos: [
              'Diretrizes Brasileiras para Rastreamento do Câncer do Colo Uterino',
              'Classificação PALM-COEIN para SUA'
            ]
          }
        ]
      }
    ]
  },
  preventivaHierarchy
];

export const mockQuestions: Question[] = [
  ...extractedMedEvoQuestions,
  {
    id: 'q-1',
    code: 'ENARE-2024-01',
    institution: 'ENARE',
    banca: 'FGV',
    year: 2024,
    tipoProva: 'Prova 1',
    modalidade: 'Residência Médica',
    especialidade: 'Clínica Médica',
    tema: 'Cardiologia',
    foco: 'Síndrome Coronariana Aguda',
    subfoco: 'IAM com Supra de ST: Estratégia Fármaco-Invasiva e Trombolíticos',
    difficulty: 'Médio',
    type: 'Múltipla escolha',
    isAnulada: false,
    statement: 'Homem de 62 anos, hipertenso e tabagista, dá entrada na emergência com dor precordial retroesternal em aperto, irradiada para mandíbula e membro superior esquerdo há 2 horas. Ao exame: PA 140/90 mmHg, FC 88 bpm. O eletrocardiograma demonstra supradesnivelamento do segmento ST de 2,5 mm nas derivações DII, DIII e aVF. O hospital não dispõe de serviço de hemodinâmica no local, e o tempo estimado de transferência para centro de intervenção coronária percutânea (ICP) é de 160 minutos. Qual a conduta terapêutica imediata mais indicada?',
    options: [
      { letter: 'A', text: 'Transferir imediatamente para ICP primária, uma vez que o tempo limite é de 180 minutos.' },
      { letter: 'B', text: 'Iniciar trombólise química imediatamente na emergência com agente fibrinolítico, salvo contraindicações.' },
      { letter: 'C', text: 'Administrar apenas dupla antiagregação plaquetária e aguardar avaliação do cardiologista de plantão.' },
      { letter: 'D', text: 'Solicitar dosagem de troponina ultrassensível seriada antes de qualquer intervenção invasiva ou lítica.' },
      { letter: 'E', text: 'Iniciar infusão contínua de heparina não fracionada e manter conduta conservadora.' }
    ],
    correctAnswer: 'B',
    commentary: 'Em pacientes com IAM com supra de ST (parede inferior: DII, DIII e aVF), a meta para transferência visando ICP primária é que o tempo primeiro contato médico-guia não exceda 120 minutos. Como a transferência estimada é de 160 minutos (> 120 min), a estratégia fármaco-invasiva é imperativa: trombólise com fibrinolítico até 10 minutos do diagnóstico, seguida de transferência para angiografia em 2 a 24 horas.'
  },
  {
    id: 'q-2',
    code: 'USP-SP-2024-15',
    institution: 'USP-SP',
    banca: 'FUVEST',
    year: 2024,
    tipoProva: 'Prova 1',
    modalidade: 'Residência Médica',
    especialidade: 'Cirurgia Geral',
    tema: 'Abdome Agudo',
    foco: 'Abdome Agudo Inflamatório e Obstrutivo',
    subfoco: 'Apendicite Aguda: Escore de Alvarado e Tratamento Cirúrgico',
    difficulty: 'Fácil',
    type: 'Múltipla escolha',
    isAnulada: false,
    statement: 'Paciente jovem de 21 anos procura pronto-socorro com história de dor periumbilical de início há 18 horas que migrou para a fossa ilíaca direita, acompanhada de anorexia, náuseas e febrícula (37,9 °C). Ao exame físico, apresenta descompressão brusca dolorosa no ponto de McBurney. Qual é a principal hipótese diagnóstica e a conduta recomendada?',
    options: [
      { letter: 'A', text: 'Diverticulite aguda; solicitar colonoscopia de urgência.' },
      { letter: 'B', text: 'Gastroenterite aguda; hidratação venosa e alta com sintomáticos.' },
      { letter: 'C', text: 'Apendicite aguda; indicação de apendicectomia.' },
      { letter: 'D', text: 'Litíase ureteral direita; tomografia computadorizada sem contraste e analgesia.' },
      { letter: 'E', text: 'Doença inflamatória pélvica; antibioticoterapia empírica ambulatorial.' }
    ],
    correctAnswer: 'C',
    commentary: 'A história clínica clássica com dor cronológica de Murphy com sinal de Blumberg positivo em homem jovem fecha o quadro de Apendicite Aguda típica, tendo indicação cirúrgica imediata (apendicectomia).'
  },
  {
    id: 'q-3',
    code: 'UNIFESP-2023-44',
    institution: 'UNIFESP',
    banca: 'VUNESP',
    year: 2023,
    tipoProva: 'Prova 2',
    modalidade: 'Residência Médica',
    especialidade: 'Pediatria',
    tema: 'Doenças Exantemáticas e Respiratórias',
    foco: 'Exantemas na Infância',
    subfoco: 'Sarampo, Rubéola, Exantema Súbito e Escarlatina',
    difficulty: 'Médio',
    type: 'Múltipla escolha',
    isAnulada: false,
    statement: 'Lactente de 10 meses é levado à UBS pelos pais devido a febre alta persistente (39,5 °C) durante 3 dias consecutivos, sem foco evidente ao exame e com bom estado geral nos períodos afebris. No quarto dia, a febre cessa subitamente e surge um exantema maculopapular róseo, não pruriginoso, com início no tronco e discreta disseminação para face e membros. Qual é o diagnóstico etiológico mais provável?',
    options: [
      { letter: 'A', text: 'Exantema Súbito (Roséola Infantil), causado pelo Herpes-vírus humano tipo 6.' },
      { letter: 'B', text: 'Sarampo, causado pelo Morbillivirus.' },
      { letter: 'C', text: 'Rubéola, causada pelo Rubivirus.' },
      { letter: 'D', text: 'Escarlatina, causada pelo Streptococcus pyogenes do grupo A.' },
      { letter: 'E', text: 'Eritema Infeccioso, causado pelo Parvovírus B19.' }
    ],
    correctAnswer: 'A',
    commentary: 'O exantema súbito (roséola) é caracterizado pelo padrão clássico de febre alta de 3 a 5 dias que desaparece em crise e coincide exatamente com o surgimento do exantema maculopapular de tronco. Agente: HHV-6.'
  },
  {
    id: 'q-4',
    code: 'UERJ-2024-32',
    institution: 'UERJ',
    banca: 'CEPUERJ',
    year: 2024,
    tipoProva: 'Prova 1',
    modalidade: 'Residência Médica',
    especialidade: 'Ginecologia e Obstetrícia',
    tema: 'Obstetrícia',
    foco: 'Síndromes Hipertensivas e Hemorragias da Gestação',
    subfoco: 'Pré-Eclâmpsia com Sinais de Gravidade e Manejo com Sulfato de Magnésio',
    difficulty: 'Difícil',
    type: 'Múltipla escolha',
    isAnulada: false,
    statement: 'Primigesta de 34 semanas comparece à emergência obstétrica com PA 165/110 mmHg, cefaleia frontal refratária e escotomas cintilantes. Proteinúria de fita demonstra +++ e reflexos patelares estão exaltados com clônus esgotável. Qual é o fármaco de primeira escolha para prevenção imediata de convulsões eclâmpticas e qual a sua posologia de ataque de acordo com o esquema de Pritchard?',
    options: [
      { letter: 'A', text: 'Sulfato de Magnésio; 4 g IV lento + 10 g IM profundo (5 g em cada glúteo).' },
      { letter: 'B', text: 'Diazepam; 10 mg IV em bolus com repetição a cada 15 minutos.' },
      { letter: 'C', text: 'Hidralazina; 5 mg IV direto com objetivo anticonvulsivante.' },
      { letter: 'D', text: 'Fenitoína; 15 a 20 mg/kg infundidos em soro glicosado.' },
      { letter: 'E', text: 'Sulfato de Magnésio; 2 g IV em infusão contínua em 24 horas sem dose intramuscular.' }
    ],
    correctAnswer: 'A',
    commentary: 'O Sulfato de Magnésio é a droga de escolha comprovada para prevenção e controle de convulsões na pré-eclâmpsia grave. O esquema de Pritchard preconiza 4 g IV lento + 10 g IM profundo (5 g em cada nádega).'
  },
  {
    id: 'q-5',
    code: 'UNICAMP-2023-18',
    institution: 'UNICAMP',
    banca: 'FCM/UNICAMP',
    year: 2023,
    tipoProva: 'Prova 1',
    modalidade: 'Residência Médica',
    especialidade: 'Medicina Preventiva e Social',
    tema: 'Epidemiologia e Bioestatística',
    foco: 'Delineamento de Estudos e Medidas de Associação',
    subfoco: 'Sensibilidade, Especificidade, VPP, VPN e Acurácia',
    difficulty: 'Médio',
    type: 'Múltipla escolha',
    isAnulada: false,
    statement: 'Um novo teste sorológico para triagem de hepatite viral foi aplicado em uma população de alto risco. O teste possui sensibilidade de 96% e especificidade de 92%. Se aplicarmos esse mesmo teste em uma população de baixa prevalência da doença, como se comportarão o Valor Preditivo Positivo (VPP) e o Valor Preditivo Negativo (VPN)?',
    options: [
      { letter: 'A', text: 'O VPP aumentará e o VPN diminuirá.' },
      { letter: 'B', text: 'O VPP diminuirá e o VPN aumentará.' },
      { letter: 'C', text: 'Ambos permanecerão inalterados, pois dependem apenas da sensibilidade e especificidade.' },
      { letter: 'D', text: 'Tanto o VPP quanto o VPN diminuirão consideravelmente.' },
      { letter: 'E', text: 'Tanto o VPP quanto o VPN aumentarão de forma proporcional à redução da amostra.' }
    ],
    correctAnswer: 'B',
    commentary: 'Valores preditivos dependem diretamente da prevalência: em populações com baixa prevalência da doença, o Valor Preditivo Positivo (VPP) cai e o Valor Preditivo Negativo (VPN) sobe.'
  },
  {
    id: 'q-6',
    code: 'REVALIDA-INEP-2024-08',
    institution: 'ENARE',
    banca: 'FGV',
    year: 2024,
    tipoProva: 'Prova 1',
    modalidade: 'Revalida',
    especialidade: 'Clínica Médica',
    tema: 'Cardiologia',
    foco: 'Hipertensão Arterial Sistêmica',
    subfoco: 'Tratamento da HAS: Farmacológico e Não Farmacológico',
    difficulty: 'Fácil',
    type: 'Múltipla escolha',
    isAnulada: false,
    statement: 'Homem de 54 anos, assintomático, sem comorbidades prévias, apresenta PA de 148/92 mmHg em duas consultas distintas. Não apresenta lesões de órgão-alvo. Qual a meta pressórica e a recomendação inicial segundo a Diretriz Brasileira de Hipertensão Arterial?',
    options: [
      { letter: 'A', text: 'Meta < 130/80 mmHg; iniciar modificações do estilo de vida associadas à monoterapia ou dupla terapia farmacológica.' },
      { letter: 'B', text: 'Meta < 140/90 mmHg; prescrever apenas repouso e evitar qualquer medicação por 1 ano.' },
      { letter: 'C', text: 'Meta < 120/70 mmHg; prescrever imediatamente três fármacos em dose máxima.' },
      { letter: 'D', text: 'Meta < 150/95 mmHg; solicitar apenas MAPA e manter conduta expectante.' }
    ],
    correctAnswer: 'A',
    commentary: 'Para pacientes com HAS estágio 1 ou 2, a meta é < 130/80 mmHg em grande parte dos indivíduos, combinando mudanças no estilo de vida com fármacos anti-hipertensivos de primeira linha.'
  },
  {
    id: 'q-7',
    code: 'USP-SP-2022-DISC-01',
    institution: 'USP-SP',
    banca: 'FUVEST',
    year: 2022,
    tipoProva: 'Prova 2',
    modalidade: 'Residência Médica',
    especialidade: 'Cirurgia Geral',
    tema: 'Trauma e Emergência Cirúrgica',
    foco: 'Atendimento Inicial ao Politraumatizado (ATLS 10ª Ed)',
    subfoco: 'Pneumotórax Hipertensivo, Aberto e Tórax Instável',
    difficulty: 'Difícil',
    type: 'Discursiva',
    isAnulada: false,
    statement: 'Vítima de colisão auto x anteparo dá entrada na sala de emergência com turgência jugular patológica, hipotensão severa (PA 70/40 mmHg) e ausência de murmúrio vesicular em hemitórax direito com timpanismo à percussão. Cite o diagnóstico sindrômico e a conduta imediata para descompressão.',
    options: [
      { letter: 'A', text: 'Pneumotórax hipertensivo; punção torácica descompressiva com cateter calibroso no 4º ou 5º espaço intercostal na linha axilar anterior/média.' },
      { letter: 'B', text: 'Tamponamento cardíaco; toracotomia imediata na sala de emergência sem punção prévia.' },
      { letter: 'C', text: 'Hemotórax maciço; intubação orotraqueal e drenagem torácica no 2º espaço intercostal.' },
      { letter: 'D', text: 'Pneumotórax simples; aguardar realização de tomografia computadorizada de tórax contrastada.' }
    ],
    correctAnswer: 'A',
    commentary: 'Trata-se de pneumotórax hipertensivo, uma emergência clínica diagnosticada pelo exame físico (hipotensão, turgência jugular, murmúrio abolido e hipertimpanismo). A conduta imediata de alívio segundo o ATLS 10ª edição é toracocentese com agulha calibrosa no 4º/5º EIC entre a linha axilar anterior e média.'
  },
  {
    id: 'q-8',
    code: 'USP-SP-2025-EMERG-01',
    institution: 'USP-SP',
    banca: 'FUVEST',
    year: 2025,
    tipoProva: 'Prova 1',
    modalidade: 'Residência Médica',
    especialidade: 'Clínica Médica',
    tema: 'Medicina de Emergência',
    foco: 'Parada Cardiorrespiratória no Adulto',
    subfoco: 'SAV: Algoritmos, Desfibrilação e Via Aérea Avançada',
    difficulty: 'Médio',
    type: 'Múltipla escolha',
    isAnulada: false,
    statement: 'Homem de 62 anos sofre PCR presenciada em sala de emergência. A monitorização cardíaca revela Fibrilação Ventricular (FV). Foi aplicado o primeiro choque com desfibrilador bifásico (200 J) e reiniciadas imediatamente as compressões torácicas de alta qualidade. Durante o segundo ciclo de 2 minutos de RCP, qual deve ser a conduta farmacológica prioritária segundo as diretrizes do ACLS?',
    options: [
      { letter: 'A', text: 'Administrar Amiodarona 300 mg em bolus imediatamente após o primeiro choque.' },
      { letter: 'B', text: 'Administrar Epinefrina 1 mg por via intravenosa/intraóssea a cada 3 a 5 minutos, após a segunda checagem de ritmo/segundo choque.' },
      { letter: 'C', text: 'Administrar Atropina 1 mg em bolus e Bicarbonato de Sódio a 8,4%.' },
      { letter: 'D', text: 'Interromper as compressões torácicas para realizar intubação orotraqueal imediata com capnografia.' },
      { letter: 'E', text: 'Administrar Sulfato de Magnésio 2g IV antes de qualquer vasopressor.' }
    ],
    correctAnswer: 'B',
    commentary: 'No algoritmo de PCR para ritmos chocáveis (FV/TV sem pulso), a prioridade absoluta após a desfibrilação é a retomada contínua das compressões. A epinefrina (1 mg IV/IO a cada 3-5 min) é introduzida após o segundo choque caso o ritmo persista chocável. A amiodarona (300 mg primeiro bolus, 150 mg segundo bolus) é recomendada a partir do terceiro choque em casos refratários.'
  },
  {
    id: 'q-9',
    code: 'UNIFESP-2025-GERIAT-02',
    institution: 'UNIFESP',
    banca: 'VUNESP',
    year: 2025,
    tipoProva: 'Prova 1',
    modalidade: 'Residência Médica',
    especialidade: 'Clínica Médica',
    tema: 'Geriatria',
    foco: 'Delirium',
    subfoco: 'Identificação e Critérios Diagnósticos de Delirium',
    difficulty: 'Fácil',
    type: 'Múltipla escolha',
    isAnulada: false,
    statement: 'Mulher de 82 anos, internada na enfermaria de clínica médica no 3º dia de tratamento de pneumonia comunitária, passa a apresentar no período noturno flutuação do nível de consciência, agitação psicomotora, desorientação temporal e alucinações visuais. Durante a manhã, alternou com períodos de sonolência excessiva e desatenção. Pela ferramenta CAM (Confusion Assessment Method), quais são os critérios obrigatórios presentes?',
    options: [
      { letter: 'A', text: 'Apenas déficit cognitivo crônico e afasia motora.' },
      { letter: 'B', text: 'Início agudo e curso flutuante + déficit de atenção (critérios 1 e 2 obrigatórios).' },
      { letter: 'C', text: 'Necessidade obrigatória de punção lombar e eletroencefalograma para confirmação.' },
      { letter: 'D', text: 'Depressão maior com sintomas psicóticos induzidos por antimicrobianos.' },
      { letter: 'E', text: 'Demência de Alzheimer avançada de instalação fulminante.' }
    ],
    correctAnswer: 'B',
    commentary: 'O diagnóstico de delirium pelo CAM requer a presença simultânea do critério 1 (início agudo e curso flutuante) e do critério 2 (desatenção), somados a pelo menos um entre pensamento desorganizado (critério 3) ou nível alterado de consciência (critério 4).'
  },
  {
    id: 'q-10',
    code: 'UNICAMP-2025-UTI-03',
    institution: 'UNICAMP',
    banca: 'FCM/UNICAMP',
    year: 2025,
    tipoProva: 'Prova 1',
    modalidade: 'Residência Médica',
    especialidade: 'Clínica Médica',
    tema: 'Terapia Intensiva',
    foco: 'Sepse e Choque Séptico: Bundles de 1 e 3 Horas, Fonte e Metas',
    subfoco: 'Bundle de 1 Hora: Avaliação e Intervenção Inicial',
    difficulty: 'Difícil',
    type: 'Múltipla escolha',
    isAnulada: false,
    statement: 'Paciente de 68 anos dá entrada em sala de emergência com tosse produtiva, dispneia, taquipneia (FR 28 irpm), sonolência e hipotensão (PA 82/46 mmHg, PAM 58 mmHg). O lactato arterial sérico de entrada é de 4,2 mmol/L. Segundo a diretriz da Surviving Sepsis Campaign (Bundle de 1 hora), qual conduta deve ser implementada de forma imediata na primeira hora?',
    options: [
      { letter: 'A', text: 'Coleta de hemoculturas antes do início dos antibióticos, início de antimicrobiano de amplo espectro na 1ª hora e ressuscitação volêmica com cristaloide a 30 mL/kg para PAM < 65 ou lactato ≥ 4 mmol/L.' },
      { letter: 'B', text: 'Iniciar apenas reposição de albumina a 20% e aguardar o resultado das culturas em 48h antes de prescrever antibióticos.' },
      { letter: 'C', text: 'Iniciar dobutamina em alta dose antes de qualquer infusão de líquidos e sem necessidade de culturas.' },
      { letter: 'D', text: 'Prescrever apenas corticoterapia em altas doses e manter o paciente sob observação sem ressuscitação hídrica.' }
    ],
    correctAnswer: 'A',
    commentary: 'O Bundle de 1 hora da Surviving Sepsis Campaign preconiza: 1) Dosar lactato; 2) Coletar hemoculturas antes de iniciar antimicrobianos; 3) Administrar antibióticos de amplo espectro; 4) Iniciar ressuscitação com 30 mL/kg de cristaloides para hipotensão ou lactato ≥ 4 mmol/L; 5) Iniciar vasopressores (noradrenalina como primeira escolha) se hipotenso durante ou após a ressuscitação volêmica para manter PAM ≥ 65 mmHg.'
  },
  {
    id: 'q-11',
    code: 'SUS-SP-2025-PALIAT-04',
    institution: 'SUS-SP',
    banca: 'VUNESP',
    year: 2025,
    tipoProva: 'Prova 1',
    modalidade: 'Residência Médica',
    especialidade: 'Clínica Médica',
    tema: 'Cuidados Paliativos',
    foco: 'Cuidados de Fim de Vida',
    subfoco: 'Comunicação de Más Notícias (SPIKES)',
    difficulty: 'Fácil',
    type: 'Múltipla escolha',
    isAnulada: false,
    statement: 'Durante a comunicação de notícias difíceis a familiares de um paciente com neoplasia metastática sem proposta curativa, o médico aplica o protocolo SPIKES. Na etapa "P" (Perception / Percepção), qual é a atitude médica recomendada?',
    options: [
      { letter: 'A', text: 'Entregar imediatamente o laudo anatomopatológico detalhado com jargões técnicos para a família ler.' },
      { letter: 'B', text: 'Fazer perguntas abertas para avaliar o que o paciente ou a família já compreendem sobre o quadro clínico e suas expectativas ("O que os outros médicos já explicaram até agora?").' },
      { letter: 'C', text: 'Prescrever sedativos profiláticos para evitar que a família expresse emoções.' },
      { letter: 'D', text: 'Informar que não há mais nada a ser feito e encerrar a conversa em 2 minutos.' }
    ],
    correctAnswer: 'B',
    commentary: 'No protocolo SPIKES: S (Setting - Preparar o ambiente), P (Perception - Avaliar a percepção do paciente/família sobre a doença), I (Invitation - Convidar e perguntar se desejam saber os detalhes), K (Knowledge - Transmitir o conhecimento em linguagem clara), E (Emotions - Acolher as emoções com empatia), S (Strategy/Summary - Definir estratégia compartilhada e resumir os próximos passos).'
  }
];

export const mockInstitutionsList = medevoInstituicoes;
export const mockInstitutions = ['Todas', ...mockInstitutionsList];
export const mockBancas = ['Todas', 'FGV', 'FUVEST', 'VUNESP', 'CEPUERJ', 'FCM/UNICAMP', 'IBFC', 'CESPE/Cebraspe'];
export const mockSpecialties = ['Todas', 'Clínica Médica', 'Cirurgia Geral', 'Pediatria', 'Ginecologia e Obstetrícia', 'Medicina Preventiva e Social'];
export const mockYears = ['Todos', '2027', '2026', '2025', '2024', '2023', '2022', '2021', '2020'];
export const mockDifficulties = ['Todas', 'Fácil', 'Médio', 'Difícil', 'Desconhecido'];
