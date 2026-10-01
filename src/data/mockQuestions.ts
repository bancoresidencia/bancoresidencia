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
  'SURCE'
];

// Hierarquia completa extraída com Especialidade, Tema, Foco e Subfoco
export const medevoHierarchy: SpecialtyHierarchy[] = [
  {
    especialidade: 'Clínica Médica',
    temas: [
      {
        tema: 'Cardiologia',
        focos: [
          {
            foco: 'Hipertensão Arterial Sistêmica',
            subfocos: [
              'Tratamento da HAS: Farmacológico e Não Farmacológico',
              'Diagnóstico, Classificação e Monitorização (MAPA/MRPA)',
              'HAS Secundária e Resistente: Investigação e Manejo',
              'Crises e Emergências Hipertensivas: Manejo e Tratamento',
              'HAS em Populações Específicas e Lesão de Órgão-Alvo'
            ]
          },
          {
            foco: 'Insuficiência Cardíaca',
            subfocos: [
              'IC com Fração de Ejeção Reduzida (ICFER): Quádrupla Terapia',
              'IC com Fração de Ejeção Preservada (ICFEP): Diagnóstico e Manejo',
              'Descompensação Aguda: Perfil Hemodinâmico de Stevenson',
              'Biomarcadores (BNP / NT-proBNP) e Critérios de Framingham',
              'Miocardiopatias Dilatada, Hipertrófica e Restritiva'
            ]
          },
          {
            foco: 'Síndrome Coronariana Aguda',
            subfocos: [
              'IAM com Supra de ST: Estratégia Fármaco-Invasiva e Trombolíticos',
              'IAM sem Supra de ST e Angina Instável: Estratificação de Risco (TIMI/GRACE)',
              'Complicações Mecânicas e Elétricas do Infarto Agudo',
              'Eletrocardiograma em SCA: Paredes e Artérias Culpadas'
            ]
          },
          {
            foco: 'Arritmias e Bloqueios',
            subfocos: [
              'Fibrilação Atrial: Controle de Ritmo vs Frequência e CHA2DS2-VASc',
              'Taquicardias Supraventriculares e Síndrome de Wolff-Parkinson-White',
              'Bloqueios Atrioventriculares e Indicações de Marcapasso'
            ]
          }
        ]
      },
      {
        tema: 'Gastroenterologia',
        focos: [
          {
            foco: 'Hepatologia e Cirrose Hepática',
            subfocos: [
              'Hipertensão Portal e Hemorragia Digestiva Alta Varicosa',
              'Ascite e Peritonite Bacteriana Espontânea (PBE)',
              'Encefalopatia Hepática e Síndrome Hepatorrenal'
            ]
          },
          {
            foco: 'Doença do Refluxo e Úlcera Péptica',
            subfocos: [
              'DRGE: Diagnóstico, Complicações e Esôfago de Barrett',
              'Úlcera Péptica e Infecção por Helicobacter pylori'
            ]
          }
        ]
      },
      {
        tema: 'Infectologia',
        focos: [
          {
            foco: 'HIV / AIDS e Infecções Oportunistas',
            subfocos: [
              'Profilaxia Pré e Pós-Exposição (PrEP e PEP)',
              'Neurotoxoplasmose, Meningite Criptocócica e Tuberculose'
            ]
          },
          {
            foco: 'Sepse e Choque Séptico',
            subfocos: [
              'Definições do Sepsis-3 (SOFA e qSOFA)',
              'Pacote de 1 hora: Ressuscitação Volêmica e Drogas Vasoativas'
            ]
          }
        ]
      },
      {
        tema: 'Pneumologia',
        focos: [
          {
            foco: 'Pneumonias e DPOC',
            subfocos: [
              'Pneumonia Adquirida na Comunidade: Escore CURB-65',
              'Exacerbação da DPOC: Antibióticos, Corticoterapia e VNI'
            ]
          }
        ]
      },
      {
        tema: 'Nefrologia',
        focos: [
          {
            foco: 'Injúria Renal Aguda e Distúrbios Hidroeletrolíticos',
            subfocos: [
              'Classificação KDIGO para Injúria Renal Aguda',
              'Hiponatremia e Hipercalemia: Conduta de Emergência'
            ]
          }
        ]
      },
      {
        tema: 'Endocrinologia',
        focos: [
          {
            foco: 'Diabetes Mellitus e Emergências Hiperglicêmicas',
            subfocos: [
              'Cetoacidose Diabética e Estado Hiperosmolar Hiperglicêmico',
              'Metas Terapêuticas e Novos Antidiabéticos (iSGLT2 e análogos GLP-1)'
            ]
          }
        ]
      }
    ]
  },
  {
    especialidade: 'Cirurgia Geral',
    temas: [
      {
        tema: 'Trauma e Emergência Cirúrgica',
        focos: [
          {
            foco: 'Atendimento Inicial ao Politraumatizado (ATLS 10ª Ed)',
            subfocos: [
              'Vias Aéreas no Trauma e Intubação de Sequência Rápida',
              'Pneumotórax Hipertensivo, Aberto e Tórax Instável',
              'Choque Hemorrágico no Trauma e Protocolo de Transfusão Maciça',
              'FAST e e-FAST: Janelas Pericárdica, Hepatorrenal e Esplenorrenal'
            ]
          }
        ]
      },
      {
        tema: 'Abdome Agudo',
        focos: [
          {
            foco: 'Abdome Agudo Inflamatório e Obstrutivo',
            subfocos: [
              'Apendicite Aguda: Escore de Alvarado e Tratamento Cirúrgico',
              'Colecistite Aguda e Coledocolitíase: Critérios de Tóquio',
              'Obstrução Intestinal: Bridas, Volvo de Sigmoide e Hérnias Encarceradas'
            ]
          }
        ]
      }
    ]
  },
  {
    especialidade: 'Pediatria',
    temas: [
      {
        tema: 'Neonatologia',
        focos: [
          {
            foco: 'Reanimação Neonatal em Sala de Parto (SBP)',
            subfocos: [
              'Passos Iniciais e Ventilação com Pressão Positiva (VPP)',
              'Prematuridade e Síndrome do Desconforto Respiratório (Doença da Membrana Hialina)'
            ]
          }
        ]
      },
      {
        tema: 'Doenças Exantemáticas e Respiratórias',
        focos: [
          {
            foco: 'Exantemas na Infância',
            subfocos: [
              'Sarampo, Rubéola, Exantema Súbito e Escarlatina',
              'Bronquiolite Viral Aguda e Manejo Clínico'
            ]
          }
        ]
      }
    ]
  },
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
  {
    especialidade: 'Medicina Preventiva e Social',
    temas: [
      {
        tema: 'Epidemiologia e Bioestatística',
        focos: [
          {
            foco: 'Delineamento de Estudos e Medidas de Associação',
            subfocos: [
              'Estudos de Coorte, Caso-Controle, Transversal e Ensaio Clínico',
              'Risco Relativo, Odds Ratio e Risco Atribuível',
              'Sensibilidade, Especificidade, VPP, VPN e Acurácia'
            ]
          }
        ]
      },
      {
        tema: 'Sistema Único de Saúde (SUS)',
        focos: [
          {
            foco: 'Legislação e Princípios do SUS',
            subfocos: [
              'Leis Orgânicas 8.080/90 e 8.142/90',
              'Princípios Doutrinários: Universalidade, Integralidade e Equidade',
              'Vigilância em Saúde e Notificação Compulsória'
            ]
          }
        ]
      }
    ]
  }
];

export const mockQuestions: Question[] = [
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
  }
];

export const mockInstitutionsList = medevoInstituicoes;
export const mockInstitutions = ['Todas', ...mockInstitutionsList];
export const mockBancas = ['Todas', 'FGV', 'FUVEST', 'VUNESP', 'CEPUERJ', 'FCM/UNICAMP', 'IBFC', 'CESPE/Cebraspe'];
export const mockSpecialties = ['Todas', 'Clínica Médica', 'Cirurgia Geral', 'Pediatria', 'Ginecologia e Obstetrícia', 'Medicina Preventiva e Social'];
export const mockYears = ['Todos', '2027', '2026', '2025', '2024', '2023', '2022', '2021', '2020'];
export const mockDifficulties = ['Todas', 'Fácil', 'Médio', 'Difícil', 'Desconhecido'];
