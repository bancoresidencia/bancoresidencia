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

import { allInstituicoesSiglas, medicalInstitutionsDirectory, bancasExaminadorasOficiais } from './instituicoesData';

export const medevoInstituicoes: string[] = allInstituicoesSiglas;
export { medicalInstitutionsDirectory, bancasExaminadorasOficiais };

import { clinicaMedicaHierarchy } from './clinicaMedicaData';
import { cirurgiaHierarchy } from './cirurgiaData';
import { pediatriaHierarchy } from './pediatriaData';
import { obstetriciaHierarchy } from './obstetriciaData';
import { ginecologiaHierarchy } from './ginecologiaData';
import { preventivaHierarchy } from './preventivaData';
import { extractedMedEvoQuestions } from './extractedMedEvoQuestions';
import { urologiaQuestions } from './urologiaQuestions';
import { ginecologiaQuestions } from './ginecologia';

// Hierarquia completa extraída com Especialidade, Tema, Foco e Subfoco
export const medevoHierarchy: SpecialtyHierarchy[] = [
  clinicaMedicaHierarchy,
  cirurgiaHierarchy,
  pediatriaHierarchy,
  obstetriciaHierarchy,
  ginecologiaHierarchy,
  preventivaHierarchy
];

export const mockQuestions: Question[] = [
  ...urologiaQuestions,
  ...ginecologiaQuestions,
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
    especialidade: 'Obstetrícia',
    tema: 'Doenças Hipertensivas na Gestação',
    foco: 'Pré-eclâmpsia e Eclâmpsia',
    subfoco: 'Sulfato de Magnésio: Uso e Toxicidade',
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
    id: 'q-gin-1',
    code: 'USP-SP-2024-GIN-01',
    institution: 'USP-SP',
    banca: 'FUVEST',
    year: 2024,
    tipoProva: 'Prova 1',
    modalidade: 'Residência Médica',
    especialidade: 'Ginecologia',
    tema: 'Oncologia Ginecológica',
    foco: 'Rastreamento do Colo do Útero, HPV, NIC e Colposcopia',
    subfoco: 'Lesões Intraepiteliais: LSIL, HSIL e Atipias',
    difficulty: 'Médio',
    type: 'Múltipla escolha',
    isAnulada: false,
    statement: 'Mulher de 32 anos realiza colpocitologia oncótica de rotina na atenção primária com resultado de lesão intraepitelial de alto grau (HSIL). Segundo as Diretrizes Brasileiras para o Rastreamento do Câncer do Colo do Útero do Ministério da Saúde/INCA, qual é a conduta imediata preconizada?',
    options: [
      { letter: 'A', text: 'Encaminhamento para colposcopia imediata.' },
      { letter: 'B', text: 'Repetir a colpocitologia em 6 meses na unidade básica.' },
      { letter: 'C', text: 'Realizar conização ambulatorial direta sem necessidade de colposcopia prévia.' },
      { letter: 'D', text: 'Pesquisa de DNA-HPV oncogênico e aguardar 1 ano se negativo.' },
      { letter: 'E', text: 'Prescrever estrogenioterapia tópica por 21 dias e repetir a citologia.' }
    ],
    correctAnswer: 'A',
    commentary: 'Para laudos citológicos de lesão intraepitelial de alto grau (HSIL) em mulheres a partir de 25 anos, a conduta recomendada pelo Ministério da Saúde/INCA é o encaminhamento imediato para colposcopia.'
  },
  {
    id: 'q-gin-2',
    code: 'ENARE-2024-GIN-02',
    institution: 'ENARE',
    banca: 'FGV',
    year: 2024,
    tipoProva: 'Prova 1',
    modalidade: 'Residência Médica',
    especialidade: 'Ginecologia',
    tema: 'Mastologia',
    foco: 'Rastreamento do Câncer de Mama',
    subfoco: 'BI-RADS: Interpretação e Conduta (Categorias 0-6)',
    difficulty: 'Fácil',
    type: 'Múltipla escolha',
    isAnulada: false,
    statement: 'Mulher de 52 anos realiza mamografia de rastreamento com laudo conclusivo de categoria BI-RADS 0 devido à alta densidade mamária com assimetria focal não elucidada. Qual a conduta recomendada?',
    options: [
      { letter: 'A', text: 'Avaliação por imagem complementar (ultrassonografia mamária e/ou compressão localizada).' },
      { letter: 'B', text: 'Repetição da mamografia em 1 ano para acompanhamento anual regular.' },
      { letter: 'C', text: 'Encaminhamento imediato para biópsia cirúrgica por suspeita de malignidade.' },
      { letter: 'D', text: 'Controle radiológico estrito em 6 meses com mamografia bilateral.' },
      { letter: 'E', text: 'Ressonância magnética de mamas obrigatória antes de qualquer outro método.' }
    ],
    correctAnswer: 'A',
    commentary: 'A categoria BI-RADS 0 é um achado incompleto que exige avaliação por exames de imagem adicionais (como incidências mamográficas adicionais, compressão/magnificação ou ultrassonografia).'
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
  },
  {
    id: 'q-oft-1',
    code: 'USP-CBO-2024-01',
    institution: 'USP-SP',
    banca: 'FUVEST',
    year: 2024,
    tipoProva: 'Prova 1',
    modalidade: 'Título de Oftalmologia (CBO)',
    modalidades: ['Título de Oftalmologia (CBO)', 'Residência Médica', 'Revalida', 'R+ Clínica Médica'],
    especialidade: 'Clínica Médica',
    tema: 'Oftalmologia',
    foco: 'Olho Vermelho e Glaucoma Agudo',
    subfoco: 'Glaucoma Agudo de Ângulo Fechado: Diagnóstico e Conduta Imediata',
    difficulty: 'Difícil',
    type: 'Múltipla escolha',
    isAnulada: false,
    statement: 'Mulher de 64 anos é trazida à emergência com queixa de dor ocular súbita e intensa à direita, associada a turvação visual, visão de halos coloridos ao redor da luz, náuseas e vômitos. Ao exame oftalmológico: injeção ciliar importante, córnea edemaciada ("com aspecto de vidro fosco"), midríase média fixa paralítica e pressão intraocular (PIO) de 54 mmHg ao tonômetro. Qual a conduta clínica e definitiva mais adequada?',
    options: [
      { letter: 'A', text: 'Administrar colírio de pilocarpina a 2%, acetazolamida oral/endovenosa, manitol intravenoso e programar iridotomia periférica a laser.' },
      { letter: 'B', text: 'Prescrever colírio de tropicamina (midriático) e antibioticoterapia tópica de amplo espectro com fluoroquinolona.' },
      { letter: 'C', text: 'Encaminhar para transplante endotelial de córnea de urgência e corticoterapia oral em dose alta.' },
      { letter: 'D', text: 'Prescrever apenas colírio de lágrima artificial e analgesia simples com paracetamol.' }
    ],
    correctAnswer: 'A',
    commentary: 'O quadro clínico é patognomônico de Glaucoma Agudo de Ângulo Fechado (emergência oftalmológica com PIO severamente elevada, dor periorbitária, náuseas e midríase média fixa). O manejo emergencial visa baixar a PIO com hipotensores tópicos (pilocarpina para miose e desobstrução angular), acetazolamida (inibidor da anidrase carbônica) e manitol hiperosmótico. O tratamento curativo e profilático definitivo é a iridotomia periférica bilateral a laser (YAG laser).'
  },
  {
    id: 'q-neuroped-1',
    code: 'UNICAMP-NEUROPED-2024-02',
    institution: 'UNICAMP',
    banca: 'FCM/UNICAMP',
    year: 2024,
    tipoProva: 'Prova 1',
    modalidade: 'R+ Neuropediatria',
    modalidades: ['R+ Neuropediatria', 'R+ Pediatria', 'Residência Médica', 'Revalida'],
    especialidade: 'Pediatria',
    tema: 'Neurologia Pediátrica',
    foco: 'Convulsão Febril e Epilepsias da Infância',
    subfoco: 'Crise Convulsiva Febril Simples: Critérios e Orientação aos Pais',
    difficulty: 'Médio',
    type: 'Múltipla escolha',
    isAnulada: false,
    statement: 'Lactente de 16 meses, com desenvolvimento neuropsicomotor adequado para a idade e sem histórico familiar de epilepsia, apresenta crise convulsiva tônico-clônica generalizada com duração de 2 minutos durante pico febril de 39,2 °C atribuído a otite média aguda. Na emergência pediátrica, 20 minutos após o evento, a criança encontra-se alerta, reativa, sem sinais meníngeos e com exame neurológico inteiramente normal. Qual a classificação do evento e a recomendação preconizada?',
    options: [
      { letter: 'A', text: 'Crise convulsiva febril simples; tranquilização da família, controle térmico com antitérmicos e tratamento da otite, sem indicação de anticonvulsivante profilático diário ou neuroimagem.' },
      { letter: 'B', text: 'Estado de mal epiléptico febril; iniciar fenobarbital de manutenção e punção lombar obrigatória.' },
      { letter: 'C', text: 'Crise febril complexa; solicitação imediata de ressonância magnética de crânio e início de ácido valproico.' },
      { letter: 'D', text: 'Meningite bacteriana oculta; internação em UTI pediátrica e ceftriaxona por 14 dias sem necessidade de avaliar foco infeccioso.' }
    ],
    correctAnswer: 'A',
    commentary: 'Trata-se de uma Crise Convulsiva Febril Simples: generalizada, duração < 15 minutos, episódio único em 24h, sem déficits focais pós-ictais e em criança de 6 meses a 5 anos. A conduta é conservadora: tranquilização familiar sobre o excelente prognóstico, manejo do foco infeccioso (otite) e controle sintomático da febre. Não há indicação de punção lombar na ausência de sinais meníngeos, neuroimagem ou anticonvulsivante profilático.'
  },
  {
    id: 'q-ciclo-1',
    code: 'MED-BASICO-2024-01',
    institution: 'ENARE',
    banca: 'FGV',
    year: 2024,
    tipoProva: 'Prova 1',
    modalidade: 'Ciclo Básico',
    modalidades: ['Ciclo Básico', 'Residência Médica', 'Revalida', 'R+ Clínica Médica', 'Título Clínica Médica (TECM)'],
    especialidade: 'Clínica Médica',
    tema: 'Fisiologia e Farmacologia Clínica',
    foco: 'Fisiopatologia dos Choques Circulatórios',
    subfoco: 'Padrões Hemodinâmicos: RVP, Débito Cardíaco e Extração de Oxigênio',
    difficulty: 'Fácil',
    type: 'Múltipla escolha',
    isAnulada: false,
    statement: 'Um estudante de medicina durante o internato analisa os padrões hemodinâmicos fundamentais dos diferentes tipos de choque circulatório. Em um paciente com choque distributivo (como na sepse hiperdinâmica inicial), qual é o comportamento esperado característico da Resistência Vascular Periférica (RVP) e do Débito Cardíaco (DC)?',
    options: [
      { letter: 'A', text: 'RVP marcadamente diminuída (vasodilatação arteriolar sistêmica) e Débito Cardíaco tipicamente elevado ou normal.' },
      { letter: 'B', text: 'RVP marcadamente elevada (vasoconstrição compensatória) e Débito Cardíaco diminuído por falência de bomba.' },
      { letter: 'C', text: 'RVP elevada e Débito Cardíaco zero por perda volêmica maciça.' },
      { letter: 'D', text: 'Tanto a RVP quanto o Débito Cardíaco permanecem inalterados, havendo apenas hipoxemia isolada.' }
    ],
    correctAnswer: 'A',
    commentary: 'No choque distributivo/séptico em fase inicial (hiperdinâmica), a liberação maciça de mediadores inflamatórios e óxido nítrico endotelial causa intensa vasodilatação sistêmica, resultando em queda abrupta da Resistência Vascular Periférica (RVP baixa). Para compensar e manter a perfusão tecidual, o coração responde com taquicardia e aumento do volume sistólico, gerando Débito Cardíaco elevado (extremidades quentes, pulso célere e pressão de pulso alargada).'
  },
  {
    id: 'q-rplus-cir-1',
    code: 'USP-CIR-RPLUS-2024-01',
    institution: 'USP-SP',
    banca: 'FUVEST',
    year: 2024,
    tipoProva: 'Prova 1',
    modalidade: 'R+ Cirurgia',
    modalidades: ['R+ Cirurgia', 'Residência Médica', 'Revalida'],
    especialidade: 'Cirurgia Geral',
    tema: 'Trauma e Cirurgia de Emergência',
    foco: 'Cirurgia do Aparelho Digestivo e Fígado',
    subfoco: 'Trauma Hepático Fechado: Manejo Não Operatório vs Laparotomia',
    difficulty: 'Difícil',
    type: 'Múltipla escolha',
    isAnulada: false,
    statement: 'Homem de 29 anos, vítima de colisão motociclística, dá entrada no centro de trauma com estabilidade hemodinâmica mantida (PA 125/80 mmHg, FC 82 bpm) após infusão inicial de 500 mL de Ringer Lactato. A tomografia de abdome demonstra laceração hepática profunda no lobo direito (segmentos VI e VII) com profundidade > 3 cm e hemoperitônio moderado, sem extravasamento ativo de contraste (blush) arterial (Trauma hepático grau III). Qual a conduta cirúrgica preconizada?',
    options: [
      { letter: 'A', text: 'Tratamento Não Operatório (TNO) com monitorização contínua em ambiente de terapia intensiva/semi-intensiva, repouso e dosagens seriadas de hemoglobina/hematócrito.' },
      { letter: 'B', text: 'Laparotomia exploradora imediata para empacotamento hepático e sutura com fio inabsorvível.' },
      { letter: 'C', text: 'Hepatectomia regrada de urgência dos segmentos acometidos.' },
      { letter: 'D', text: 'Alta hospitalar imediata com orientação de analgésicos via oral.' }
    ],
    correctAnswer: 'A',
    commentary: 'No trauma abdominal fechado de órgãos sólidos (fígado e baço), a estabilidade hemodinâmica é o critério cardeal definidor da conduta. Pacientes estáveis, mesmo com lesões de alto grau (grau III ou IV), são candidatos primordiais ao Tratamento Não Operatório (TNO) com monitorização em UTI e controle laboratorial estrito, reservando laparotomia para instabilidade ou peritonite franca.'
  },
  {
    id: 'q-rplus-go-1',
    code: 'UNICAMP-GO-RPLUS-2024-01',
    institution: 'UNICAMP',
    banca: 'FCM/UNICAMP',
    year: 2024,
    tipoProva: 'Prova 1',
    modalidade: 'R+ Ginecologia e Obstetrícia',
    modalidades: ['R+ Ginecologia e Obstetrícia', 'Residência Médica', 'Revalida'],
    especialidade: 'Obstetrícia',
    tema: 'Parto e Puerpério',
    foco: 'Hemorragia Pós-Parto (HPP)',
    subfoco: 'Atonia Uterina: Medidas Farmacológicas e Balão de Tamponamento Intrauterino',
    difficulty: 'Médio',
    type: 'Múltipla escolha',
    isAnulada: false,
    statement: 'Puérpera imediata de 26 anos, pós-parto vaginal de feto macrossômico (4.200 g), apresenta sangramento genital volumoso e amolecimento uterino à palpação supra-púbica (fundo uterino acima da cicatriz umbilical e hipotônico). Foi realizada massagem uterina bimanual de Hamilton e ocitocina 20 UI em infusão venosa, sem resposta hemostática adequada. Qual é o algoritmo farmacológico de segunda linha e a conduta mecânica seguinte recomendados antes de laparotomia?',
    options: [
      { letter: 'A', text: 'Administração de Metilergonovina IM (salvo se hipertensa), Misoprostol retal/oral, Ácido Tranexâmico IV precoce e passagem de Balão de Tamponamento Intrauterino (ex: Bakri).' },
      { letter: 'B', text: 'Histerectomia subtotal direta sem qualquer medicação adicional.' },
      { letter: 'C', text: 'Administrar apenas heparina e aguardar parada espontânea do sangramento.' },
      { letter: 'D', text: 'Curetagem uterina cortante com cureta de Recamier sem ocitócicos.' }
    ],
    correctAnswer: 'A',
    commentary: 'A atonia uterina é a principal causa da regra dos 4Ts da HPP (Tônus). O manejo sequencial inclui massagem bimanual, Ocitocina em infusão, Metilergonovina IM (se não houver HAS), Ácido Tranexâmico na primeira hora e Misoprostol. Em caso de refratariedade clínica, o tamponamento com Balão Intrauterino de Bakri é a intervenção mecânica conservadora de primeira escolha para evitar histerectomia puerperal.'
  }
];

export const mockInstitutionsList = medevoInstituicoes;
export const mockInstitutions = ['Todas', ...mockInstitutionsList];
export const mockBancas = ['Todas', 'FGV', 'FUVEST', 'VUNESP', 'CEPUERJ', 'FCM/UNICAMP', 'IBFC', 'CESPE/Cebraspe'];
export const mockSpecialties = ['Todas', 'Clínica Médica', 'Cirurgia Geral', 'Pediatria', 'Ginecologia', 'Obstetrícia', 'Ginecologia e Obstetrícia', 'Medicina Preventiva e Social'];
export const mockYears = ['Todos', '2027', '2026', '2025', '2024', '2023', '2022', '2021', '2020'];
export const mockDifficulties = ['Todas', 'Fácil', 'Médio', 'Difícil', 'Desconhecido'];
