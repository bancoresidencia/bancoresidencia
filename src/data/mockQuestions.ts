import { Question } from '@/types';

export const mockQuestions: Question[] = [
  {
    id: 'q-1',
    code: 'ENARE-2024-01',
    institution: 'ENARE',
    year: 2024,
    specialty: 'Clínica Médica',
    subtheme: 'Cardiologia / Síndrome Coronariana Aguda',
    difficulty: 'Média',
    statement: 'Homem de 62 anos, hipertenso e tabagista, dá entrada na emergência com dor precordial retroesternal em aperto, irradiada para mandíbula e membro superior esquerdo há 2 horas. Ao exame: PA 140/90 mmHg, FC 88 bpm. O eletrocardiograma demonstra supradesnivelamento do segmento ST de 2,5 mm nas derivações DII, DIII e aVF. O hospital não dispõe de serviço de hemodinâmica no local, e o tempo estimado de transferência para centro de intervenção coronária percutânea (ICP) é de 160 minutos. Qual a conduta terapêutica imediata mais indicada?',
    options: [
      { letter: 'A', text: 'Transferir imediatamente para ICP primária, uma vez que o tempo limite é de 180 minutos.' },
      { letter: 'B', text: 'Iniciar trombólise química imediatamente na emergência com agente fibrinolítico, salvo contraindicações.' },
      { letter: 'C', text: 'Administrar apenas dupla antiagregação plaquetária e aguardar avaliação do cardiologista de plantão.' },
      { letter: 'D', text: 'Solicitar dosagem de troponina ultrassensível seriada antes de qualquer intervenção invasiva ou lítica.' },
      { letter: 'E', text: 'Iniciar infusão contínua de heparina não fracionada e manter conduta conservadora.' }
    ],
    correctAnswer: 'B',
    commentary: 'Em pacientes com IAM com supra de ST (neste caso de parede inferior: DII, DIII e aVF), a meta para transferência visando ICP primária é que o tempo primeiro contato médico-guia não exceda 120 minutos. Como a transferência estimada é de 160 minutos (> 120 min), a estratégia fármaco-invasiva é imperativa: trombólise com fibrinolítico até 10 minutos do diagnóstico, seguida de transferência para angiografia em 2 a 24 horas.'
  },
  {
    id: 'q-2',
    code: 'USP-SP-2024-15',
    institution: 'USP-SP',
    year: 2024,
    specialty: 'Cirurgia Geral',
    subtheme: 'Abdome Agudo / Apendicite Aguda',
    difficulty: 'Fácil',
    statement: 'Paciente jovem de 21 anos procura pronto-socorro com história de dor periumbilical de início há 18 horas que migrou para a fossa ilíaca direita, acompanhada de anorexia, náuseas e febrícula (37,9 °C). Ao exame físico, apresenta descompressão brusca dolorosa no ponto de McBurney. Qual é a principal hipótese diagnóstica e a conduta recomendada?',
    options: [
      { letter: 'A', text: 'Diverticulite aguda; solicitar colonoscopia de urgência.' },
      { letter: 'B', text: 'Gastroenterite aguda; hidratação venosa e alta com sintomáticos.' },
      { letter: 'C', text: 'Apendicite aguda; indicação de apendicectomia.' },
      { letter: 'D', text: 'Litíase ureteral direita; tomografia computadorizada sem contraste e analgesia.' },
      { letter: 'E', text: 'Doença inflamatória pélvica; antibioticoterapia empírica ambulatorial.' }
    ],
    correctAnswer: 'C',
    commentary: 'A história clínica clássica com dor cronológica de Murphy (dor periumbilical epigástrica migrando para fossa ilíaca direita associada a anorexia e febrícula) com sinal de Blumberg positivo em homem jovem fecha o quadro de Apendicite Aguda típica, tendo indicação cirúrgica (apendicectomia laparoscópica ou aberta).'
  },
  {
    id: 'q-3',
    code: 'UNIFESP-2023-44',
    institution: 'UNIFESP',
    year: 2023,
    specialty: 'Pediatria',
    subtheme: 'Infectologia / Doenças Exantemáticas',
    difficulty: 'Média',
    statement: 'Lactente de 10 meses é levado à UBS pelos pais devido a febre alta persistente (39,5 °C) durante 3 dias consecutivos, sem foco evidente ao exame e com bom estado geral nos períodos afebris. No quarto dia, a febre cessa subitamente e surge um exantema maculopapular róseo, não pruriginoso, com início no tronco e discreta disseminação para face e membros. Qual é o diagnóstico etiológico mais provável?',
    options: [
      { letter: 'A', text: 'Exantema Súbito (Roséola Infantil), causado pelo Herpes-vírus humano tipo 6.' },
      { letter: 'B', text: 'Sarampo, causado pelo Morbillivirus.' },
      { letter: 'C', text: 'Rubéola, causada pelo Rubivirus.' },
      { letter: 'D', text: 'Escarlatina, causada pelo Streptococcus pyogenes do grupo A.' },
      { letter: 'E', text: 'Eritema Infeccioso, causado pelo Parvovírus B19.' }
    ],
    correctAnswer: 'A',
    commentary: 'O exantema súbito (roséola) é caracterizado pelo padrão clássico de febre alta de 3 a 5 dias que desaparece em crise e coincide exatamente com o surgimento do exantema maculopapular de predomínio em tronco. O agente etiológico clássico é o HHV-6 (Herpesvírus Humano tipo 6).'
  },
  {
    id: 'q-4',
    code: 'UERJ-2024-32',
    institution: 'UERJ',
    year: 2024,
    specialty: 'Ginecologia e Obstetrícia',
    subtheme: 'Obstetrícia / Doença Hipertensiva Específica da Gravidez',
    difficulty: 'Difícil',
    statement: 'Primigesta de 34 semanas comparece à emergência obstétrica com PA 165/110 mmHg, cefaleia frontal refratária e escotomas cintilantes. Proteinúria de fita demonstra +++ e reflexos patelares estão exaltados com clônus esgotável. Qual é o fármaco de primeira escolha para prevenção imediata de convulsões eclâmpticas e qual a sua posologia de ataque de acordo com o esquema de Pritchard?',
    options: [
      { letter: 'A', text: 'Sulfato de Magnésio; 4 g IV lento + 10 g IM profundo (5 g em cada glúteo).' },
      { letter: 'B', text: 'Diazepam; 10 mg IV em bolus com repetição a cada 15 minutos.' },
      { letter: 'C', text: 'Hidralazina; 5 mg IV direto com objetivo anticonvulsivante.' },
      { letter: 'D', text: 'Fenitoína; 15 a 20 mg/kg infundidos em soro glicosado.' },
      { letter: 'E', text: 'Sulfato de Magnésio; 2 g IV em infusão contínua em 24 horas sem dose intramuscular.' }
    ],
    correctAnswer: 'A',
    commentary: 'O Sulfato de Magnésio é a droga de escolha comprovada para prevenção e controle de convulsões na pré-eclâmpsia grave/iminência de eclâmpsia. O esquema de Pritchard preconiza dose de ataque de 4 g IV associada a 10 g IM (5 g em cada nádega), seguido de manutenção com 5 g IM a cada 4 horas sob vigilância estrita de reflexos patelares, diurese e frequência respiratória.'
  },
  {
    id: 'q-5',
    code: 'UNICAMP-2023-18',
    institution: 'UNICAMP',
    year: 2023,
    specialty: 'Medicina Preventiva e Social',
    subtheme: 'Epidemiologia / Testes Diagnósticos',
    difficulty: 'Média',
    statement: 'Um novo teste sorológico para triagem de hepatite viral foi aplicado em uma população de alto risco. O teste possui sensibilidade de 96% e especificidade de 92%. Se aplicarmos esse mesmo teste em uma população de baixa prevalência da doença, como se comportarão o Valor Preditivo Positivo (VPP) e o Valor Preditivo Negativo (VPN)?',
    options: [
      { letter: 'A', text: 'O VPP aumentará e o VPN diminuirá.' },
      { letter: 'B', text: 'O VPP diminuirá e o VPN aumentará.' },
      { letter: 'C', text: 'Ambos permanecerão inalterados, pois dependem apenas da sensibilidade e especificidade.' },
      { letter: 'D', text: 'Tanto o VPP quanto o VPN diminuirão consideravelmente.' },
      { letter: 'E', text: 'Tanto o VPP quanto o VPN aumentarão de forma proporcional à redução da amostra.' }
    ],
    correctAnswer: 'B',
    commentary: 'A sensibilidade e a especificidade são propriedades intrínsecas ao teste e não mudam com a prevalência. Por outro lado, os valores preditivos dependem diretamente da prevalência: em populações com baixa prevalência da doença, o Valor Preditivo Positivo (VPP) cai (maior proporção de falso-positivos) e o Valor Preditivo Negativo (VPN) sobe.'
  }
];

export const mockInstitutions = ['Todas', 'ENARE', 'USP-SP', 'UNIFESP', 'UNICAMP', 'UERJ', 'SUS-SP'];
export const mockSpecialties = [
  'Todas',
  'Clínica Médica',
  'Cirurgia Geral',
  'Pediatria',
  'Ginecologia e Obstetrícia',
  'Medicina Preventiva e Social'
];
export const mockYears = ['Todos', '2024', '2023', '2022', '2021'];
export const mockDifficulties = ['Todas', 'Fácil', 'Média', 'Difícil'];
