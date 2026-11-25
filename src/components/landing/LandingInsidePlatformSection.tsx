'use client';

import React, { useState, useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import {
  FileText,
  Brain,
  BookOpen,
  BarChart3,
  CheckCircle2,
  XCircle,
  Highlighter,
  Strikethrough,
  Bookmark,
  FolderPlus,
  Clock,
  Eye,
  EyeOff,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Timer,
  Pause,
  Play,
  Type,
  Flag,
  Keyboard,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Pencil,
  RotateCcw,
  SlidersHorizontal,
  History,
  Star,
  Shuffle,
  Plus,
  Calendar,
  Sun,
  Moon,
  Sunrise,
  Sunset
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useScrollReveal } from './useScrollReveal';
import { BackArrowButton } from '@/components/ui/BackArrowButton';

type PlatformTabKey = 'questoes' | 'flashcards' | 'resumos' | 'desempenho';

interface QuestionOption {
  letter: string;
  text: string;
  explanation: string;
}

interface RealPlatformQuestion {
  id: string;
  banca: string;
  year: number;
  especialidade: string;
  tema: string;
  foco?: string;
  subfoco: string;
  difficultyTRI: string;
  cadernoTotal: number;
  cadernoAtual: number;
  progressPct: number;
  sessionTimer: string;
  totalTimer: string;
  statusBadge: 'resolvida_sessao' | 'resolvida_anteriormente';
  statement: string;
  options: QuestionOption[];
  correct_answer: string;
  initialSelectedOption: string | null;
  officialCommentary: string;
  trapReason: string;
  takeHomeMessage: string;
  guidelinesEvolution: string;
  references: string[];
}

const ENARE_OBSTETRICIA_QUESTION: RealPlatformQuestion = {
  id: 'q-enare-isoimunizacao',
  banca: 'ENARE',
  year: 2027,
  especialidade: 'Ginecologia e Obstetrícia',
  tema: 'Obstetrícia Patológica',
  foco: 'Isoimunização Rh',
  subfoco: 'Isoimunização Rh e Sangramento na Gestação',
  difficultyTRI: 'Média',
  cadernoTotal: 11,
  cadernoAtual: 1,
  progressPct: 9,
  sessionTimer: '00:24',
  totalTimer: '00:27',
  statusBadge: 'resolvida_sessao',
  statement:
    'Paciente, G3P1A1, com gestação de 13 semanas, datada pela ecografia de 8 semanas, procura pronto atendimento devido à queixa de sangramento vaginal iniciado há 3 dias, em pequena quantidade. A tipagem sanguínea anotada no cartão de pré-natal é A negativo. Ela desconhece a tipagem sanguínea de seu parceiro. O exame ginecológico mostra sangue escurecido em moderada quantidade na vagina e colo uterino fechado. É solicitado teste de coombs indireto, cujo resultado é positivo.\n\nQual a conduta nesse momento?',
  options: [
    {
      letter: 'A',
      text: 'Alertar paciente sobre a inviabilidade da gestação.',
      explanation:
        'O quadro clínico de sangramento vaginal com colo fechado em gestação de 13 semanas caracteriza uma ameaça de abortamento, não havendo evidências clínicas ou ecográficas de inviabilidade fetal que justifiquem tal conduta.'
    },
    {
      letter: 'B',
      text: 'Realizar imunoglobulina anti-RH.',
      explanation:
        'A imunoglobulina anti-D é uma medida profilática indicada estritamente para gestantes Rh negativas NÃO sensibilizadas (Coombs indireto negativo). Uma vez que o Coombs é positivo, a paciente já está aloimunizada e a imunoglobulina não tem efeito protetor.'
    },
    {
      letter: 'C',
      text: 'Solicitar ultrassonografia transvaginal para confirmação diagnóstica de mola hidatiforme.',
      explanation:
        'O quadro clínico e temporal não é sugestivo de mola hidatiforme (não há útero aumentado desproporcional à idade gestacional, nem eliminação de vesículas).'
    },
    {
      letter: 'D',
      text: 'Encaminhar para pré-natal de alto risco e solicitar Doppler da artéria cerebral média.',
      explanation:
        'Correta. A paciente apresenta isoimunização Rh confirmada (Coombs positivo). A conduta obrigatória é o seguimento em pré-natal de alto risco com vigilância de anemia fetal através do Doppler da velocidade sistólica máxima da artéria cerebral média (PVS-ACM).'
    }
  ],
  correct_answer: 'D',
  initialSelectedOption: 'A',
  officialCommentary:
    'A paciente apresenta um quadro de isoimunização Rh (Coombs indireto positivo). A profilaxia anti-D é indicada apenas para gestantes Rh negativas não sensibilizadas (Coombs indireto negativo) após eventos sensibilizantes ou rotineiramente na 28ª semana. Uma vez que o Coombs é positivo, a paciente já desenvolveu anticorpos anti-D, e o foco da assistência obstétrica desloca-se para o rastreamento de anemia fetal grave através da avaliação seriada do pico de velocidade sistólica da artéria cerebral média (PVS-ACM) e, se necessário, procedimentos invasivos como a cordocentese. O encaminhamento para o pré-natal de alto risco é a conduta mandatória para garantir a vigilância fetal adequada.',
  trapReason:
    'O principal motivo que leva o aluno ao erro nesta questão é a confusão entre a profilaxia da isoimunização (paciente Rh- negativa não sensibilizada) e o manejo da gestante já sensibilizada (Coombs positivo), levando à indicação incorreta de imunoglobulina.',
  takeHomeMessage:
    'Coombs indireto positivo significa que a paciente já está sensibilizada; portanto, a imunoglobulina anti-Rh não tem papel profilático e a gestação deve ser conduzida em serviço de alto risco para monitoramento de anemia fetal.',
  guidelinesEvolution:
    'As diretrizes permanecem inalteradas: o manejo da isoimunização Rh baseia-se na vigilância fetal por Doppler de ACM em centros especializados, sendo a profilaxia com imunoglobulina restrita a pacientes Rh negativas com Coombs indireto negativo.',
  references: [
    'Federação Brasileira das Associações de Ginecologia e Obstetrícia (FEBRASGO) - Manual de Orientação em Obstetrícia',
    'Obstetrícia de Williams: Princípios e Prática'
  ]
};

const HSL_SIRIO_QUESTION: RealPlatformQuestion = {
  id: 'q-hsl-sirio-esteatose',
  banca: 'HSL / Sírio',
  year: 2027,
  especialidade: 'Clínica Médica',
  tema: 'Gastroenterologia',
  foco: 'Cirrose Hepática e Hipertensão Portal',
  subfoco: 'Esteatose Hepática Metabólica (MASLD/MASH) e Fibrose Hepática (FIB-4)',
  difficultyTRI: 'Média',
  cadernoTotal: 5,
  cadernoAtual: 1,
  progressPct: 0,
  sessionTimer: '04:04',
  totalTimer: '04:11',
  statusBadge: 'resolvida_anteriormente',
  statement:
    'Homem de 52 anos assintomático é atendido em consulta de rotina. Nega fadiga, dor abdominal, icterícia ou sangramento. Ele tem diabetes mellitus tipo 2, hipertensão arterial e dislipidemia, em tratamento com losartana, metformina, gliclazida e atorvastatina. Não há uso de álcool, medicações hepatotóxicas ou fitoterápicos. Ao exame físico: sinais vitais normais; peso: 102 kg; altura: 168 cm; circunferência abdominal: 112 cm; abdome: normal; extremidades sem edema; o restante não é contributivo. Exames séricos atuais: hemoglobina glicada (HbA1c): 7,8%; hemograma completo normal; AST (TGO): 40 U/L; ALT (TGP): 64 U/L; fosfatase alcalina: 85 U/L; GGT: 52 U/L; bilirrubinas totais: 0,8 mg/dL; albumina: 4,2 g/dL; coagulograma normal. Sorologias virais negativas. Escore FIB-4 do paciente: 1,62 (risco intermediário). Assinale a alternativa correta quanto a esse paciente.',
  options: [
    {
      letter: 'A',
      text: 'A tomografia abdominal com fase venosa de contraste constitui o exame recomendado a esse paciente, para o diagnóstico de esteatose metabólica e quantificação de fibrose, aumentando a acurácia dos marcadores séricos na definição da conduta clínica perante a síndrome metabólica documentada.',
      explanation:
        'A tomografia abdominal com contraste não tem acurácia para quantificar rigidez tecidual ou diagnosticar graus de fibrose hepática; métodos elastográficos ou biópsia são os recomendados para estratificação tecidual.'
    },
    {
      letter: 'B',
      text: 'O algoritmo diagnóstico baseado no escore FIB-4 incorpora a dosagem sérica da gama-GT e da fosfatase alcalina, fornecendo uma estimativa precisa da atividade necroinflamatória aguda no parênquima hepático e da permeabilidade do sistema biliar periférico.',
      explanation:
        'O escore FIB-4 é calculado unicamente a partir de: Idade, AST (TGO), ALT (TGP) e contagem de Plaquetas. Não contempla dosagem de GGT nem fosfatase alcalina.'
    },
    {
      letter: 'C',
      text: 'O cálculo de estratificação de risco hepático adotado pelas diretrizes incorpora os níveis de albumina plasmática e o tempo de protrombina para compor o resultado final, traduzindo fielmente a capacidade de síntese proteica celular e a sua respectiva sobrevida sistêmica.',
      explanation:
        'Albumina e tempo de protrombina/INR são variáveis utilizadas em escores prognósticos de cirrose e falência hepática (como Child-Pugh e MELD), e não no escore FIB-4.'
    },
    {
      letter: 'D',
      text: 'O exame de ultrassonografia convencional em modo B possui alta sensibilidade para quantificar a rigidez do parênquima e diagnosticar fibrose em graus iniciais, sendo o método definitivo para substituir elastografias complexas em pacientes com acúmulo de tecido adiposo visceral.',
      explanation:
        'A ultrassonografia convencional detecta infiltração gordurosa (esteatose) moderada ou avançada, mas possui baixa sensibilidade para detectar e quantificar estágios iniciais de fibrose hepática.'
    },
    {
      letter: 'E',
      text: 'Os métodos elastográficos para avaliação da rigidez hepática fornecem dados estruturais valiosos desse paciente com FIB-4 intermediário, permitindo confirmar a ausência de fibrose significativa ou sustentar a necessidade de uma avaliação anatomopatológica por biópsia tecidual confirmatória.',
      explanation:
        'Correta. Em pacientes com MASLD e escore FIB-4 intermediário (zona cinzenta: 1,30 a 2,67 na população geral ou 1,62 neste caso), a conduta mandatória pelas diretrizes da AASLD e SBH é realizar teste de segunda linha com elastografia hepática (Transitória/FibroScan, ARFI ou RM) para guiar indicação de biópsia.'
    }
  ],
  correct_answer: 'E',
  initialSelectedOption: 'A',
  officialCommentary:
    'Paciente com síndrome metabólica e diabetes mellitus tipo 2 apresenta esteatose hepática metabólica (MASLD) com elevação leve de transaminases. O escore FIB-4 de 1,62 situa-se na zona cinzenta (risco intermediário para fibrose avançada). Segundo as diretrizes da AASLD, EASL e Sociedade Brasileira de Hepatologia (SBH), pacientes com FIB-4 intermediário exigem avaliação secundária com elastografia hepática para mensurar a rigidez hepática e definir a presença de fibrose clinicamente significativa (F ≥ 2). Casos inconclusivos ou de alto risco podem requerer biópsia hepática para estadiamento histológico definitivo.',
  trapReason:
    'A armadilha principal reside na confusão dos parâmetros que compõem o escore FIB-4 (misturando testes de função canalicular e coagulação) e na falsa presunção de que a tomografia computadorizada ou ultrassonografia convencional quantificam fibrose tecidual.',
  takeHomeMessage:
    'Diante de um FIB-4 intermediário (1,30 a 2,67) na esteatose hepática metabólica (MASLD), a conduta mandatória é realizar elastografia hepática para estratificar o risco de fibrose avançada e guiar a eventual indicação de biópsia hepática.',
  guidelinesEvolution:
    'A nomenclatura oficial evoluiu de NAFLD (esteatose não alcoólica) para MASLD (doença hepática esteatótica associada a disfunção metabólica), com algoritmos em dois passos: 1º FIB-4 populacional; 2º elastografia em intermediários.',
  references: [
    'Sociedade Brasileira de Hepatologia (SBH) - Diretrizes Clínicas de MASLD/MASH',
    'AASLD Practice Guidance on the Clinical Assessment and Management of Nonalcoholic Fatty Liver Disease'
  ]
};

const DEMO_QUESTIONS: RealPlatformQuestion[] = [
  ENARE_OBSTETRICIA_QUESTION,
  HSL_SIRIO_QUESTION
];

interface PlatformFlashcardData {
  id: string;
  topic: string;
  statementWithCloze: string;
  revealedTitle: string;
  fullStatementFilled: string;
  clozeBadge: string;
  clinicalExplanation: string;
}

const DEMO_FLASHCARDS: PlatformFlashcardData[] = [
  {
    id: 'fc-declaracao-obito',
    topic: 'Declaração de Óbito (DO)',
    statementWithCloze:
      'Em caso de óbito por causa externa (homicídio, suicídio ou acidente), mesmo que ocorrido dentro do hospital sob cuidados médicos, a Declaração de Óbito (DO) deve ser emitida obrigatoriamente pelo médico do [ ... ].',
    revealedTitle: 'IML (Instituto Médico Legal)',
    fullStatementFilled:
      'Em caso de óbito por causa externa (homicídio, suicídio ou acidente), mesmo que ocorrido dentro do hospital sob cuidados médicos, a Declaração de Óbito (DO) deve ser emitida obrigatoriamente pelo médico do IML.',
    clozeBadge: 'IML',
    clinicalExplanation:
      'Médicos assistentes e do Serviço de Verificação de Óbito (SVO) são proibidos de assinar DO em mortes violentas ou suspeitas, mesmo que a internação tenha durado dias ou meses.'
  },
  {
    id: 'fc-leavell-clark',
    topic: 'História Natural da Doença e Níveis de Prevenção',
    statementWithCloze:
      'A vacinação em massa contra a Febre Amarela e o uso de preservativos para prevenção de ISTs são exemplos clássicos de prevenção [ ... ] segundo o modelo de Leavell & Clark.',
    revealedTitle: 'Prevenção Primária (Proteção Específica)',
    fullStatementFilled:
      'A vacinação em massa contra a Febre Amarela e o uso de preservativos para prevenção de ISTs são exemplos clássicos de prevenção primária segundo o modelo de Leavell & Clark.',
    clozeBadge: 'Primária',
    clinicalExplanation:
      'A prevenção primária atua no período pré-patogênico, englobando a promoção da saúde e a proteção específica (imunização, EPIs e saneamento básico).'
  },
  {
    id: 'fc-infeccao-puerperal',
    topic: 'Infecção Puerperal & Endometrite',
    statementWithCloze:
      'A Morbidade Febril Puerperal é definida pela temperatura axilar ≥ 38,0 °C em 2 dias distintos entre o 2º e 10º dia, e o esquema de 1ª linha na endometrite pós-parto é [ ... ] venoso.',
    revealedTitle: 'Clindamicina 900mg + Gentamicina 5mg/kg',
    fullStatementFilled:
      'A Morbidade Febril Puerperal é definida pela temperatura axilar ≥ 38,0 °C em 2 dias distintos entre o 2º e 10º dia, e o esquema de 1ª linha na endometrite pós-parto é Clindamicina 900mg + Gentamicina 5mg/kg venoso.',
    clozeBadge: 'Clindamicina + Gentamicina',
    clinicalExplanation:
      'O esquema venoso deve ser mantido estritamente até a paciente permanecer 48 horas inteiramente afebril e assintomática. Não há indicação de antibiótico oral ambulatorial após a alta!'
  }
];

const CLINICAL_SUMMARY_INFECCAO_PUERPERAL = {
  id: 'infeccao-puerperal',
  titulo: 'Infecção Puerperal & Endometrite Pós-Parto',
  especialidade: 'Ginecologia e Obstetrícia • Puerpério e Complicações Puerperais',
  areaColor: '#EC4899',
  badge: 'Recorrência Máxima • ENARE, USP-SP, SURCE & UNICAMP',
  referencia: 'FEBRASGO / ACOG / CDC / Manual de Gestação de Alto Risco do Ministério da Saúde',
  incidencia: [
    {
      banca: 'ENARE',
      subfocos: [
        { nome: 'Fisiopatologia, Critérios Diagnósticos e Fatores de Risco', pct: 46 },
        { nome: 'Esquemas Antimicrobianos Venosos (Clindamicina + Gentamicina)', pct: 34 },
        { nome: 'Diagnóstico Diferencial e Conduta pós-Cesárea', pct: 20 }
      ]
    },
    {
      banca: 'USP-SP',
      subfocos: [
        { nome: 'Esquema Clindamicina + Gentamicina e Critérios de Cura', pct: 48 },
        { nome: 'Conduta na Febre Persistente: Abscesso e Tromboflebite Pélvica', pct: 32 },
        { nome: 'Flora Polimicrobiana Mista (Aeróbios e Anaeróbios)', pct: 20 }
      ]
    },
    {
      banca: 'SURCE',
      subfocos: [
        { nome: 'Critérios Clínicos de Morbidade Febril Puerperal (>24h)', pct: 44 },
        { nome: 'Duração da Terapia Venosa até 48h Afebril', pct: 36 },
        { nome: 'Manejo de Abscessos Pélvicos e Complicações', pct: 20 }
      ]
    },
    {
      banca: 'UNICAMP',
      subfocos: [
        { nome: 'Cesariana como principal fator de risco isolado (10-30x)', pct: 45 },
        { nome: 'Profilaxia Cirúrgica: Cefazolina 2g IV na indução', pct: 35 },
        { nome: 'Suspensão hospitalar sem necessidade de VO ambulatorial', pct: 20 }
      ]
    }
  ],
  pontosChave: [
    {
      titulo: 'Critérios Clínicos de Morbidade Febril Puerperal',
      desc: 'Temperatura axilar ou oral ≥ 38,0 °C aferida em pelo menos 2 ocasiões distintas entre o 2º e o 10º dia de puerpério, EXCLUINDO rigorosamente as primeiras 24 horas pós-parto (febre nas primeiras 24h reflete desidratação ou resposta inflamatória ao parto).'
    },
    {
      titulo: 'Tríade Clássica de Bumm na Endometrite',
      desc: 'Febre puerperal persistente + Útero amolecido, subinvoluído e doloroso à palpação + Lóquios turvos e fétidos (achocolatados). O principal fator de risco isolado é o parto cesárea (eleva em 10 a 30 vezes o risco relativo).'
    },
    {
      titulo: 'Esquema Antimicrobiano Hospitalar de 1ª Linha (Padrão-Ouro)',
      desc: 'Clindamicina 900 mg IV de 8/8h + Gentamicina 5 mg/kg IV em dose única diária (ou 1,5 mg/kg 8/8h). Manter estritamente até a paciente completar 48 horas inteiramente afebril e assintomática. NÃO HÁ INDICAÇÃO de complementação com antibiótico via oral após a alta hospitalar!',
      alerta: true
    },
    {
      titulo: 'Conduta na Falha Terapêutica após 48-72 Horas',
      desc: 'Se a febre persistir após 48 a 72h de cobertura adequada, deve-se realizar ultrassonografia pélvica/tomografia para investigar abscesso de parede abdominal, hematoma infectado, restos ovulares ou tromboflebite pélvica séptica (onde se inicia prova terapêutica com Heparina venosa).'
    },
    {
      titulo: 'Profilaxia Cirúrgica Mandatória na Cesariana',
      desc: 'Cefazolina 2g IV (ou 3g se IMC ≥ 35 ou peso ≥ 120 kg) infundida 30 a 60 minutos ANTES da incisão cirúrgica na indução anestésica, reduzindo drasticamente infecções de sítio cirúrgico e endometrite.'
    }
  ],
  algoritmoTitulo: 'Algoritmo Decisório Sequencial na Infecção Puerperal (FEBRASGO / Ministério da Saúde)',
  algoritmoPassos: [
    '1. Identificação de Morbidade Febril (> 24h pós-parto com temp ≥ 38°C em 2 dias distintos) e exame físico/pélvico minucioso',
    '2. Coleta de hemoculturas e início imediato de Clindamicina 900 mg IV 8/8h + Gentamicina 5 mg/kg IV 1x/dia',
    '3. Reavaliação clínica em 48-72h: melhora acentuada mantém o esquema venoso até completar 48h completas afebril e assintomática',
    '4. Febre persistente após 72h: USG pélvica/TC para descartar coleções/abscesso de parede e prova de heparina plena se suspeita de tromboflebite',
    '5. Alta hospitalar segura após 48h afebril, com suspensão imediata dos antimicrobianos e sem prescrição oral ambulatorial'
  ]
};

const HIGHLIGHTER_COLORS = [
  { name: 'Amarelo', hex: '#fcd34d', rgba: 'rgba(252, 211, 77, 0.45)' },
  { name: 'Verde', hex: '#6ee7b7', rgba: 'rgba(110, 231, 183, 0.45)' },
  { name: 'Rosa', hex: '#f9a8d4', rgba: 'rgba(249, 168, 212, 0.45)' },
  { name: 'Azul', hex: '#7dd3fc', rgba: 'rgba(125, 211, 252, 0.45)' },
  { name: 'Laranja', hex: '#fdba74', rgba: 'rgba(253, 186, 116, 0.45)' },
  { name: 'Roxo', hex: '#c084fc', rgba: 'rgba(192, 132, 252, 0.45)' }
];

interface Stroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

export interface LandingInsidePlatformSectionProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  activeTab?: PlatformTabKey;
  onTabChange?: (tab: PlatformTabKey) => void;
}

export const LandingInsidePlatformSection: React.FC<LandingInsidePlatformSectionProps> = ({
  onOpenAuth,
  activeTab: controlledActiveTab,
  onTabChange
}) => {
  const { accent, mode, accentConfig } = useTheme();
  const isMonochrome = accent === 'neutral';

  const [internalTab, setInternalTab] = useState<PlatformTabKey>('questoes');
  const activeTab = controlledActiveTab ?? internalTab;
  const setActiveTab = (tab: PlatformTabKey) => {
    setInternalTab(tab);
    onTabChange?.(tab);
  };

  useEffect(() => {
    const handleCustomNavigate = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab: PlatformTabKey }>;
      if (customEvent.detail?.tab) {
        setActiveTab(customEvent.detail.tab);
      }
    };
    window.addEventListener('navigate-platform-tab', handleCustomNavigate);
    return () => window.removeEventListener('navigate-platform-tab', handleCustomNavigate);
  }, []);

  const highlightTextStyle: React.CSSProperties = isMonochrome
    ? {
      backgroundImage:
        mode === 'dark'
          ? 'linear-gradient(110deg, rgba(255,255,255,0.92) 0%, rgba(161,161,170,0.72) 28%, rgba(255,255,255,1) 50%, rgba(113,113,122,0.76) 76%, rgba(255,255,255,0.92) 100%)'
          : 'linear-gradient(110deg, rgba(9,9,11,0.92) 0%, rgba(82,82,91,0.74) 28%, rgba(9,9,11,1) 50%, rgba(113,113,122,0.78) 76%, rgba(9,9,11,0.92) 100%)'
    }
    : {
      backgroundImage: `linear-gradient(110deg, ${accentConfig.primaryHex} 0%, ${accentConfig.chartPalette[1] ?? accentConfig.hoverHex
        } 26%, ${mode === 'dark' ? 'rgba(224,242,254,0.92)' : 'rgba(255,255,255,0.85)'
        } 48%, ${accentConfig.chartPalette[2] ?? accentConfig.accuracyAccent.hex} 68%, ${accentConfig.primaryHex
        } 100%)`
    };

  // Estado da aba Questões
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const currentQuestion = DEMO_QUESTIONS[activeQuestionIdx] || DEMO_QUESTIONS[0];

  const [isQuestionRulerOpen, setIsQuestionRulerOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(
    currentQuestion.initialSelectedOption
  );
  const [isAnswered, setIsAnswered] = useState<boolean>(true);
  const [openJustifications, setOpenJustifications] = useState<Record<string, boolean>>({
    A: true,
    B: false,
    C: false,
    D: false,
    E: false
  });
  const [strikedOptions, setStrikedOptions] = useState<Record<string, boolean>>({});
  const [areAlternativesHidden, setAreAlternativesHidden] = useState<boolean>(false);
  const [isProfessorCommentaryOpen, setIsProfessorCommentaryOpen] = useState<boolean>(true);
  const [isTrapReasonOpen, setIsTrapReasonOpen] = useState<boolean>(true);
  const [isTakeHomeOpen, setIsTakeHomeOpen] = useState<boolean>(true);
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState<boolean>(true);
  const [isReferencesOpen, setIsReferencesOpen] = useState<boolean>(true);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Ferramentas StudyInk
  const [activeHighlighterColor, setActiveHighlighterColor] = useState<number>(0);
  const [isHighlighterOpen, setIsHighlighterOpen] = useState<boolean>(false);
  const [isHighlighterActive, setIsHighlighterActive] = useState<boolean>(false);
  const [isStrikethroughActive, setIsStrikethroughActive] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Cronômetros da Questão
  const [questionSeconds, setQuestionSeconds] = useState<number>(24);
  const [totalSeconds, setTotalSeconds] = useState<number>(27);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Estado da aba Flashcards
  const [flashcardIdx, setFlashcardIdx] = useState<number>(0);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);
  const [fsrsToast, setFsrsToast] = useState<string | null>(null);

  // Estado da aba Resumos
  const [selectedBancaIdx, setSelectedBancaIdx] = useState<number>(0);

  // Estado da aba Desempenho
  const [dashboardTab, setDashboardTab] = useState<
    'visao_geral' | 'especialidades' | 'raiox_erros' | 'tempo'
  >('visao_geral');
  const [dashboardPeriod, setDashboardPeriod] = useState<string>('7d');
  const [evolutionPeriod, setEvolutionPeriod] = useState<'30d' | '3m' | '6m' | 'livre'>('30d');

  // Ao trocar de questão
  const switchQuestion = (newIdx: number) => {
    setActiveQuestionIdx(newIdx);
    const q = DEMO_QUESTIONS[newIdx];
    setSelectedOption(q.initialSelectedOption);
    setIsAnswered(true);
    setOpenJustifications({
      A: true,
      B: false,
      C: false,
      D: false,
      E: false
    });
    setStrikedOptions({});
    if (newIdx === 1) {
      setQuestionSeconds(244); // 04:04
      setTotalSeconds(251); // 04:11
    } else {
      setQuestionSeconds(24); // 00:24
      setTotalSeconds(27); // 00:27
    }
  };

  // Cronômetros ativos
  useEffect(() => {
    if (!isTimerRunning || activeTab !== 'questoes') return;
    const interval = setInterval(() => {
      setQuestionSeconds((prev) => prev + 1);
      setTotalSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, activeTab]);

  // Tecla Espaço para virar Flashcards
  useEffect(() => {
    if (activeTab !== 'flashcards') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setIsCardFlipped((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectOption = (letter: string) => {
    setSelectedOption(letter);
    setIsAnswered(true);
    setOpenJustifications((prev) => ({
      ...prev,
      [letter]: true
    }));
  };

  const toggleJustification = (letter: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenJustifications((prev) => ({
      ...prev,
      [letter]: !prev[letter]
    }));
  };

  const toggleStrikeOption = (letter: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStrikedOptions((prev) => ({
      ...prev,
      [letter]: !prev[letter]
    }));
  };

  const handleRateFlashcard = (label: string) => {
    setFsrsToast(`FSRS: Próxima repetição agendada para ${label}`);
    setTimeout(() => setFsrsToast(null), 3000);
    setTimeout(() => {
      setIsCardFlipped(false);
      setFlashcardIdx((prev) => (prev + 1) % DEMO_FLASHCARDS.length);
    }, 800);
  };

  // Drawing Handlers
  const handlePointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!isHighlighterActive) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDrawing(true);
    const color = HIGHLIGHTER_COLORS[activeHighlighterColor].rgba;
    setStrokes((prev) => [...prev, { points: [{ x, y }], color, width: 14 }]);
  };

  const handlePointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!isDrawing || !isHighlighterActive) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const updated = { ...last, points: [...last.points, { x, y }] };
      return [...prev.slice(0, -1), updated];
    });
  };

  const handlePointerUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      showToast('Anotação salva neste dispositivo');
    }
  };

  const currentFlashcard = DEMO_FLASHCARDS[flashcardIdx];
  const currentSummary = CLINICAL_SUMMARY_INFECCAO_PUERPERAL;
  const currentBancaData =
    currentSummary.incidencia[selectedBancaIdx] || currentSummary.incidencia[0];

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const { ref: sectionRef, isVisible: sectionVisible, isExiting: sectionExiting } = useScrollReveal<HTMLDivElement>(0.05);

  return (
    <section
      id="dentro-da-plataforma"
      className="relative scroll-mt-16 pt-12 sm:pt-16 pb-12 sm:pb-16 bg-[var(--bg-page,#f1f5f9)] dark:bg-[var(--bg-page,#09090b)] text-[var(--foreground,#09090b)] dark:text-[var(--foreground,#f4f4f5)] transition-colors duration-200 overflow-hidden"
    >
      {/* Iluminação Ambiente Suave Atrás da Dobra (Zero Linhas / Divisórias) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] sm:w-[980px] h-96 opacity-25 dark:opacity-15 blur-3xl rounded-full"
        style={{
          background: `radial-gradient(ellipse at center, ${accentConfig.primaryHex} 0%, transparent 70%)`
        }}
      />
      <div ref={sectionRef} className={`max-w-7xl mx-auto px-3 sm:px-6 space-y-6 sm:space-y-8 fold-reveal ${sectionVisible ? 'is-visible' : ''} ${sectionExiting ? 'is-exiting' : ''}`}>
        {/* Cabeçalho */}
        <div className="max-w-3xl space-y-2 text-left">
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-[-0.03em] text-zinc-950 dark:text-white leading-[1.15]">
            Experimente o{' '}
            <span className="bg-clip-text text-transparent" style={highlightTextStyle}>
              Hippocampus
            </span>
          </h2>
        </div>

        {/* Barra de Navegação Entre as 4 Abas Principais */}
        <div className="flex items-center justify-start overflow-x-auto no-scrollbar">
          <div className="inline-flex p-1.5 rounded-2xl bg-white dark:bg-[#12131a] border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-lg gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('questoes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'questoes'
                  ? 'text-white shadow-md'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              style={activeTab === 'questoes' ? { backgroundColor: accentConfig.primaryHex, color: accentConfig.primaryContrastHex } : {}}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Questões na Prática</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('flashcards')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'flashcards'
                  ? 'text-white shadow-md'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              style={activeTab === 'flashcards' ? { backgroundColor: accentConfig.primaryHex, color: accentConfig.primaryContrastHex } : {}}
            >
              <Brain className="w-4 h-4 shrink-0" />
              <span>Flashcards FSRS</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('resumos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'resumos'
                  ? 'text-white shadow-md'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              style={activeTab === 'resumos' ? { backgroundColor: accentConfig.primaryHex, color: accentConfig.primaryContrastHex } : {}}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Resumos com Raio-X</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('desempenho')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'desempenho'
                  ? 'text-white shadow-md'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              style={activeTab === 'desempenho' ? { backgroundColor: accentConfig.primaryHex, color: accentConfig.primaryContrastHex } : {}}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span>Painel de Desempenho & TRI</span>
            </button>
          </div>
        </div>

        {/* Toast Notificação */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal de Atalhos de Teclado */}
        {isShortcutsOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
            onClick={() => setIsShortcutsOpen(false)}
          >
            <div
              className="w-full max-w-md p-6 rounded-3xl bg-[#12131a] border border-zinc-800 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2 text-sm font-black text-white">
                  <Keyboard className="w-4 h-4" style={{ color: accentConfig.primaryHex }} />
                  <span>Atalhos Rápidos de Estudo</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsShortcutsOpen(false)}
                  className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-zinc-300">
                <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/80">
                  <span>Alternar régua de questões</span>
                  <kbd
                    className="px-2 py-0.5 rounded bg-zinc-800 font-mono font-bold"
                    style={{ color: accentConfig.primaryHex }}
                  >
                    Q
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/80">
                  <span>Selecionar alternativas</span>
                  <kbd className="px-2 py-0.5 rounded bg-zinc-800 font-mono font-bold">
                    1 - 5 / A - E
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/80">
                  <span>Riscar / Cortar distrator</span>
                  <kbd className="px-2 py-0.5 rounded bg-zinc-800 font-mono font-bold">S</kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/80">
                  <span>Ativar caneta / marca-texto</span>
                  <kbd className="px-2 py-0.5 rounded bg-zinc-800 font-mono font-bold">M</kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/80">
                  <span>Virar cartão flashcard</span>
                  <kbd className="px-2 py-0.5 rounded bg-zinc-800 font-mono font-bold">Espaço</kbd>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 1: QUESTÕES NA PRÁTICA (EXATAMENTE COMO NAS IMAGENS 1, 2, 3 E 4)
            ========================================================================= */}
        {activeTab === 'questoes' && (
          <div className="space-y-4">
            {/* 1. BARRA SUPERIOR IDÊNTICA ÀS IMAGENS */}
            <div className="bg-[#10121a] border border-zinc-800/90 rounded-2xl p-3 shadow-md space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Lado Esquerdo: Botão Voltar + Círculo de Progresso + Dropdown */}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => showToast('Início da sessão de treino')}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#181a24] hover:bg-[#202332] border border-zinc-700/60 text-zinc-300 transition-all cursor-pointer shadow-xs active:scale-95"
                    title="Voltar"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div
                    onClick={() => setIsQuestionRulerOpen(!isQuestionRulerOpen)}
                    className="flex items-center gap-2.5 px-2.5 py-1 rounded-xl bg-[#141620] hover:bg-[#1a1d2c] border border-zinc-800/80 transition-all cursor-pointer"
                    title="Ocultar/Exibir régua de questões (Q)"
                  >
                    <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-zinc-800"
                          strokeWidth="3.2"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          strokeDasharray={`${currentQuestion.progressPct}, 100`}
                          strokeWidth="3.2"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          style={{ color: accentConfig.primaryHex }}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span
                        className="absolute text-[9px] font-black font-sans"
                        style={{ color: accentConfig.primaryHex }}
                      >
                        {currentQuestion.progressPct}%
                      </span>
                    </div>

                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-black text-white leading-tight">
                          {activeQuestionIdx === 0 ? '1/11' : '0/5'}
                        </span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isQuestionRulerOpen ? 'rotate-180' : ''}`}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-zinc-400">Progresso</span>
                    </div>
                  </div>
                </div>

                {/* Lado Direito / Centro: Ferramentas de Estudo com Rolagem Suave no Mobile */}
                <div className="w-full sm:w-auto flex items-center overflow-x-auto scrollbar-none pb-1 sm:pb-0 gap-1.5 sm:gap-2 flex-nowrap sm:flex-wrap">
                  {/* Cronômetro Duplo: Questão | Total */}
                  <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#141620] border border-zinc-800 text-[11px] font-bold text-zinc-300">
                    <div
                      className="flex items-center gap-1"
                      style={{ color: accentConfig.primaryHex }}
                      title="Tempo na questão"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span className="font-mono">{formatTimer(questionSeconds)}</span>
                      <span className="text-[9px] text-zinc-500 font-sans">Q</span>
                    </div>
                    <span className="text-zinc-700">|</span>
                    <div
                      className="flex items-center gap-1 text-emerald-400"
                      title="Tempo total acumulado"
                    >
                      <Timer className="w-3.5 h-3.5" />
                      <span className="font-mono">{formatTimer(totalSeconds)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className="p-0.5 rounded text-zinc-500 hover:text-white cursor-pointer"
                    >
                      {isTimerRunning ? (
                        <Pause className="w-3 h-3" />
                      ) : (
                        <Play className="w-3 h-3 text-emerald-400" />
                      )}
                    </button>
                  </div>

                  {/* Marca-texto / Caneta (Split Button Sem Aninhamento de Botões) */}
                  <div className="shrink-0 relative inline-flex items-center">
                    <div
                      className={`inline-flex items-center rounded-xl border transition-all ${isHighlighterActive
                          ? 'bg-amber-950/60 border-amber-600 text-amber-300 ring-2 ring-amber-400/30'
                          : 'bg-[#141620] hover:bg-[#1a1d2c] border-zinc-800 text-zinc-300'
                        }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setIsHighlighterActive(!isHighlighterActive);
                          showToast(
                            isHighlighterActive
                              ? 'Modo Anotar desativado'
                              : 'Modo Anotar ativado: desenhe sobre o enunciado'
                          );
                        }}
                        className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 min-h-[32px] cursor-pointer"
                        title="Caneta / Marca-texto"
                      >
                        <Highlighter className="w-3.5 h-3.5" />
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/30"
                          style={{ backgroundColor: HIGHLIGHTER_COLORS[activeHighlighterColor].hex }}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsHighlighterOpen(!isHighlighterOpen);
                        }}
                        className="pr-2 pl-1 py-1.5 min-h-[32px] flex items-center justify-center cursor-pointer hover:text-white"
                        title="Escolher cor da caneta"
                        aria-label="Escolher cor da caneta"
                      >
                        <ChevronDown className="w-3 h-3 text-zinc-400" />
                      </button>
                    </div>

                    {isHighlighterOpen && (
                      <div className="absolute top-full right-0 mt-2 z-50 flex items-center gap-1.5 p-2 bg-[#161822] border border-zinc-700 rounded-2xl shadow-2xl animate-in fade-in duration-150">
                        {HIGHLIGHTER_COLORS.map((c, idx) => (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => {
                              setActiveHighlighterColor(idx);
                              setIsHighlighterOpen(false);
                              setIsHighlighterActive(true);
                              showToast(`Cor ${c.name} ativada`);
                            }}
                            className={`w-5 h-5 rounded-full border border-black/20 ${activeHighlighterColor === idx ? 'scale-125 ring-2 ring-white' : ''}`}
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Botão S Riscar */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsStrikethroughActive(!isStrikethroughActive);
                      showToast(
                        isStrikethroughActive ? 'Modo Riscar desativado' : 'Modo Riscar ativo'
                      );
                    }}
                    className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 min-h-[32px] rounded-xl border transition-all cursor-pointer ${isStrikethroughActive
                        ? 'bg-rose-950/60 border-rose-600 text-rose-300 ring-2 ring-rose-400/30'
                        : 'bg-[#141620] hover:bg-[#1a1d2c] border-zinc-800 text-zinc-300'
                      }`}
                    title="Modo Riscar distrator [S]"
                  >
                    <Strikethrough className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold">Riscar</span>
                  </button>

                  {/* Botão Tamanho da Fonte */}
                  <button
                    type="button"
                    onClick={() =>
                      setFontSize((prev) => (prev === 'sm' ? 'base' : prev === 'base' ? 'lg' : 'sm'))
                    }
                    className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 min-h-[32px] bg-[#141620] hover:bg-[#1a1d2c] border border-zinc-800 rounded-xl text-zinc-300 text-[11px] font-bold cursor-pointer"
                    title="Tamanho da fonte"
                  >
                    <Type className="w-3.5 h-3.5" />
                    <span style={{ color: accentConfig.primaryHex }}>
                      {fontSize === 'sm' ? 'A-' : fontSize === 'base' ? 'A' : 'A+'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-zinc-500" />
                  </button>

                  {/* Botão Favorito */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsBookmarked(!isBookmarked);
                      showToast(isBookmarked ? 'Removida dos favoritos' : 'Questão favoritada');
                    }}
                    className="shrink-0 p-2 rounded-xl bg-[#141620] hover:bg-[#1a1d2c] border border-zinc-800 text-zinc-400 hover:text-amber-400 cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                    title="Favoritar questão"
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`}
                    />
                  </button>

                  {/* Botão Reportar */}
                  <button
                    type="button"
                    onClick={() => showToast('Canal de curadoria médica aberto')}
                    className="shrink-0 p-2 rounded-xl bg-[#141620] hover:bg-[#1a1d2c] border border-zinc-800 text-zinc-400 hover:text-amber-400 cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                    title="Reportar questão"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>

                  {/* Botão Atalhos */}
                  <button
                    type="button"
                    onClick={() => setIsShortcutsOpen(true)}
                    className="shrink-0 hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#141620] hover:bg-[#1a1d2c] border border-zinc-800 text-zinc-300 text-xs font-bold cursor-pointer min-h-[32px]"
                  >
                    <Keyboard className="w-3.5 h-3.5" style={{ color: accentConfig.primaryHex }} />
                    <span>Atalhos</span>
                  </button>

                  {/* Botão Filtros Rápidos */}
                  <button
                    type="button"
                    onClick={() =>
                      showToast(
                        activeQuestionIdx === 0
                          ? 'Filtros ativos: ENARE 2027 • Ginecologia'
                          : 'Filtros ativos: HSL / Sírio 2027 • Clínica Médica'
                      )
                    }
                    className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#141620] hover:bg-[#1a1d2c] border border-zinc-800 text-zinc-300 text-xs font-bold cursor-pointer min-h-[32px]"
                    title="Filtros da sessão"
                  >
                    <SlidersHorizontal
                      className="w-3.5 h-3.5"
                      style={{ color: accentConfig.primaryHex }}
                    />
                    <span
                      className="w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
                      style={{ backgroundColor: accentConfig.primaryHex }}
                    >
                      2
                    </span>
                  </button>

                  {/* Botão Finalizar */}
                  <button
                    type="button"
                    onClick={() => onOpenAuth('register')}
                    className="shrink-0 flex items-center gap-1 px-4 py-1.5 rounded-xl text-xs font-black shadow-md cursor-pointer active:scale-95 transition-all text-white min-h-[32px]"
                    style={
                      activeQuestionIdx === 1
                        ? { backgroundColor: '#ffffff', color: '#090a0f' }
                        : { backgroundColor: accentConfig.primaryHex }
                    }
                    title="Finalizar treino"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Finalizar</span>
                  </button>
                </div>
              </div>

              {/* RÉGUA EXPANSÍVEL DE QUESTÕES (IDÊNTICA À IMAGEM 4) */}
              {isQuestionRulerOpen && (
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar animate-in fade-in duration-150">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => switchQuestion(0)}
                      className="p-1 rounded text-zinc-500 hover:text-white"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {(activeQuestionIdx === 0
                      ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
                      : [1, 2, 3, 4, 5]
                    ).map((num, idx) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          if (idx === 0) switchQuestion(0);
                          else if (idx === 1) switchQuestion(1);
                          else showToast(`Navegando para questão simulada ${num}`);
                        }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${idx === 0
                            ? 'text-white shadow-md ring-2'
                            : 'bg-[#181a24] text-zinc-400 hover:text-white hover:bg-zinc-800'
                          }`}
                        style={
                          idx === 0
                            ? {
                              backgroundColor: accentConfig.primaryHex,
                              borderColor: accentConfig.primaryHex
                            }
                            : {}
                        }
                      >
                        {num}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => showToast('Adicionar mais questões ao caderno')}
                      className="w-7 h-7 rounded-full border border-dashed border-zinc-700 text-zinc-500 hover:text-white flex items-center justify-center text-xs"
                      title="Adicionar questão"
                    >
                      +
                    </button>

                    <button
                      type="button"
                      onClick={() => switchQuestion(1)}
                      className="p-1 rounded text-zinc-500 hover:text-white"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => switchQuestion(0)}
                      className="px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer"
                      style={
                        activeQuestionIdx === 0
                          ? {
                            backgroundColor: accentConfig.bgRgba,
                            color: accentConfig.primaryHex,
                            border: `1px solid ${accentConfig.borderRgba}`
                          }
                          : { color: '#71717a' }
                      }
                    >
                      ENARE 2027
                    </button>
                    <button
                      type="button"
                      onClick={() => switchQuestion(1)}
                      className="px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer"
                      style={
                        activeQuestionIdx === 1
                          ? {
                            backgroundColor: accentConfig.bgRgba,
                            color: accentConfig.primaryHex,
                            border: `1px solid ${accentConfig.borderRgba}`
                          }
                          : { color: '#71717a' }
                      }
                    >
                      HSL/Sírio 2027
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. CARD PRINCIPAL DA QUESTÃO IDÊNTICO ÀS IMAGENS */}
            <div className="bg-[#10121a] border border-zinc-800/90 rounded-3xl p-5 sm:p-8 space-y-6 shadow-xl">
              {/* Header Interno com Tags Idênticas às Imagens 1 e 2 */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="px-3 py-1 rounded-xl text-xs font-black bg-[#161824] border border-zinc-700 flex items-center gap-1.5"
                    style={{ color: accentConfig.primaryHex }}
                  >
                    <BookOpen className="w-3.5 h-3.5" style={{ color: accentConfig.primaryHex }} />
                    <span>
                      {currentQuestion.banca} • {currentQuestion.year}
                    </span>
                  </span>

                  {activeQuestionIdx === 0 && (
                    <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-950/40 text-amber-400 border border-amber-800/60 flex items-center gap-1">
                      <span>⚡ 1/10 hoje Liberar Ilimitado</span>
                    </span>
                  )}

                  {activeQuestionIdx === 0 ? (
                    <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-rose-950/40 text-rose-300 border border-rose-900/60 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      <span>Resolvida nesta sessão</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOption(null);
                          setIsAnswered(false);
                          showToast('Questão resetada para refazer');
                        }}
                        className="ml-1 text-[11px] underline text-zinc-400 hover:text-white flex items-center gap-0.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Refazer</span>
                      </button>
                    </span>
                  ) : (
                    <>
                      <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-rose-950/40 text-rose-300 border border-rose-900/60 flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                        <span>Resolvida anteriormente</span>
                      </span>
                      <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-950/40 text-amber-400 border border-amber-800/60">
                        Dificuldade TRI: Média
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 text-zinc-500">
                  <button
                    type="button"
                    onClick={() => setAreAlternativesHidden(!areAlternativesHidden)}
                    className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                    title="Ocultar alternativas"
                  >
                    {areAlternativesHidden ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => showToast('Adicionada à pasta de revisão')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer text-xs"
                    title="Salvar na pasta"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Salvar na Pasta</span>
                  </button>

                  <span className="text-xs font-black font-sans bg-[#181a24] text-white px-2.5 py-1 rounded-lg border border-zinc-700">
                    {activeQuestionIdx === 0 ? '1/11' : '1/5'}
                  </span>
                </div>
              </div>

              {/* Enunciado Oficial com Camada de Desenho SVG */}
              <div className="relative select-text">
                <div
                  className={`text-zinc-100 font-medium leading-relaxed whitespace-pre-line ${fontSize === 'sm' ? 'text-sm' : fontSize === 'lg' ? 'text-lg' : 'text-base'
                    }`}
                >
                  {currentQuestion.statement}
                </div>

                {/* Camada SVG Interativa de Desenho */}
                <svg
                  ref={svgRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  className={`absolute inset-0 w-full h-full pointer-events-${isHighlighterActive ? 'auto' : 'none'} ${isHighlighterActive ? 'cursor-crosshair touch-none' : ''
                    }`}
                  style={{ zIndex: 10 }}
                >
                  {strokes.map((s, idx) => (
                    <polyline
                      key={idx}
                      fill="none"
                      stroke={s.color}
                      strokeWidth={s.width}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={s.points.map((p) => `${p.x},${p.y}`).join(' ')}
                    />
                  ))}
                </svg>
              </div>

              {/* Alternativas com Justificativas Individuais Idênticas às Imagens */}
              {!areAlternativesHidden && (
                <div className="space-y-3 pt-2">
                  {currentQuestion.options.map((opt) => {
                    const isSelected = selectedOption === opt.letter;
                    const isCorrect = opt.letter === currentQuestion.correct_answer;
                    const isStriked = Boolean(strikedOptions[opt.letter]);
                    const isJustificationOpen = Boolean(openJustifications[opt.letter]);

                    let containerBorder =
                      'border-zinc-800 bg-[#12141c] hover:border-zinc-700 text-zinc-200';
                    let letterCircle = 'bg-zinc-800 text-zinc-300 border-zinc-700';

                    if (isAnswered) {
                      if (isSelected && !isCorrect) {
                        containerBorder =
                          'border-rose-600/90 bg-[#1a0f14] shadow-md ring-1 ring-rose-600/30';
                        letterCircle = 'bg-rose-600 text-white font-black';
                      } else if (isCorrect) {
                        containerBorder =
                          'border-emerald-600/90 bg-[#0d1814] shadow-md ring-1 ring-emerald-600/30';
                        letterCircle = 'bg-emerald-600 text-white font-black';
                      }
                    }

                    return (
                      <div
                        key={opt.letter}
                        onClick={() => handleSelectOption(opt.letter)}
                        className={`p-4 rounded-2xl border transition-all duration-150 cursor-pointer space-y-3 ${containerBorder} ${isStriked ? 'opacity-30 line-through' : ''
                          }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <span
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${letterCircle}`}
                            >
                              {opt.letter}
                            </span>
                            <span className="text-xs sm:text-sm font-semibold leading-relaxed">
                              {opt.text}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Tag Incorreta / Correta */}
                            {isAnswered && isSelected && !isCorrect && (
                              <div className="flex items-center gap-1 text-rose-400 text-xs font-bold">
                                <XCircle className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Incorreta</span>
                              </div>
                            )}
                            {isAnswered && isCorrect && (
                              <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Gabarito</span>
                              </div>
                            )}

                            {/* Botão Ver / Ocultar Justificativa */}
                            {isAnswered && (
                              <button
                                type="button"
                                onClick={(e) => toggleJustification(opt.letter, e)}
                                className="px-3 py-1 rounded-lg text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs hover:opacity-90"
                                style={{ backgroundColor: accentConfig.primaryHex }}
                              >
                                <span>
                                  {isJustificationOpen
                                    ? 'Ocultar Justificativa'
                                    : 'Ver Justificativa'}
                                </span>
                                {isJustificationOpen ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                              </button>
                            )}

                            {/* Botão Riscar Individual */}
                            {!isAnswered && (
                              <button
                                type="button"
                                onClick={(e) => toggleStrikeOption(opt.letter, e)}
                                className="p-1 rounded text-zinc-500 hover:text-white"
                                title="Riscar alternativa"
                              >
                                <Strikethrough className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Box Interno de Justificativa da Alternativa */}
                        {isAnswered && isJustificationOpen && (
                          <div
                            className="p-4 rounded-xl border text-xs sm:text-[13px] leading-relaxed text-zinc-300 space-y-1 animate-in fade-in duration-150"
                            style={{
                              borderColor: accentConfig.borderRgba,
                              backgroundColor: accentConfig.bgRgba
                            }}
                          >
                            <div className="font-bold" style={{ color: accentConfig.primaryHex }}>
                              Justificativa da Alternativa {opt.letter}:
                            </div>
                            <p className="opacity-95">{opt.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 3. COMENTÁRIO COMPLETO DO PROFESSOR (IDÊNTICO ÀS IMAGENS 2 E 3) */}
              {isAnswered && (
                <div className="space-y-4 pt-4 border-t border-zinc-800">
                  {/* Cabeçalho do Bloco */}
                  <div
                    onClick={() => setIsProfessorCommentaryOpen(!isProfessorCommentaryOpen)}
                    className="flex items-center justify-between text-xs sm:text-sm font-bold cursor-pointer hover:opacity-85"
                    style={{ color: accentConfig.primaryHex }}
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>
                        {isProfessorCommentaryOpen
                          ? 'Ocultar comentário final do professor'
                          : 'Exibir comentário final do professor'}
                      </span>
                    </div>
                    {isProfessorCommentaryOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>

                  {isProfessorCommentaryOpen && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      {/* Box 1: Gabarito Oficial (Verde) */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-[#0b1510] border border-emerald-600/40 text-zinc-200 space-y-2">
                        <div className="flex items-center gap-2 text-emerald-400 font-black text-xs sm:text-sm">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>Gabarito Oficial: Alternativa {currentQuestion.correct_answer}</span>
                        </div>
                        <p className="text-xs sm:text-[13px] leading-relaxed text-zinc-300 opacity-95">
                          {currentQuestion.officialCommentary}
                        </p>
                      </div>

                      {/* Box 2: Principal Motivo de Erro / Armadilha da Questão (Âmbar) */}
                      <div className="p-4 rounded-2xl bg-[#161208] border border-amber-600/40 space-y-2">
                        <div
                          onClick={() => setIsTrapReasonOpen(!isTrapReasonOpen)}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>Principal Motivo de Erro (Armadilha da Questão)</span>
                          </div>
                          <span className="text-xs text-zinc-500 hover:text-white flex items-center gap-1">
                            {isTrapReasonOpen ? 'Ocultar ^' : 'Exibir v'}
                          </span>
                        </div>
                        {isTrapReasonOpen && (
                          <p className="text-xs sm:text-[13px] leading-relaxed text-amber-200/90 pt-1 border-t border-amber-900/40">
                            {currentQuestion.trapReason}
                          </p>
                        )}
                      </div>

                      {/* Box 3: Take-Home Message */}
                      <div
                        className="p-4 rounded-2xl border space-y-2"
                        style={{
                          borderColor: accentConfig.borderRgba,
                          backgroundColor: accentConfig.bgRgba
                        }}
                      >
                        <div
                          onClick={() => setIsTakeHomeOpen(!isTakeHomeOpen)}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <div
                            className="flex items-center gap-2 font-bold text-xs sm:text-sm"
                            style={{ color: accentConfig.primaryHex }}
                          >
                            <Lightbulb className="w-4 h-4 shrink-0" />
                            <span>Take-Home Message</span>
                          </div>
                          <span className="text-xs text-zinc-500 hover:text-white flex items-center gap-1">
                            {isTakeHomeOpen ? 'Ocultar ^' : 'Exibir v'}
                          </span>
                        </div>
                        {isTakeHomeOpen && (
                          <p
                            className="text-xs sm:text-[13px] leading-relaxed text-zinc-200 pt-1 border-t"
                            style={{ borderTopColor: accentConfig.borderRgba }}
                          >
                            {currentQuestion.takeHomeMessage}
                          </p>
                        )}
                      </div>

                      {/* Box 4: Evolução de Diretrizes (Azul Petróleo) */}
                      <div className="p-4 rounded-2xl bg-[#0e1628] border border-indigo-600/40 space-y-2">
                        <div
                          onClick={() => setIsGuidelinesOpen(!isGuidelinesOpen)}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs sm:text-sm">
                            <History className="w-4 h-4 shrink-0" />
                            <span>Evolução de Diretrizes</span>
                          </div>
                          <span className="text-xs text-zinc-500 hover:text-white flex items-center gap-1">
                            {isGuidelinesOpen ? 'Ocultar ^' : 'Exibir v'}
                          </span>
                        </div>
                        {isGuidelinesOpen && (
                          <p className="text-xs sm:text-[13px] leading-relaxed text-indigo-200/90 pt-1 border-t border-indigo-900/40">
                            {currentQuestion.guidelinesEvolution}
                          </p>
                        )}
                      </div>

                      {/* Box 5: Referências Oficiais */}
                      <div className="p-4 rounded-2xl bg-[#12141c] border border-zinc-800 space-y-2">
                        <div
                          onClick={() => setIsReferencesOpen(!isReferencesOpen)}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2 text-zinc-400 font-bold text-xs">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>Referências Oficiais ({currentQuestion.references.length})</span>
                          </div>
                          <span className="text-xs text-zinc-500 hover:text-white flex items-center gap-1">
                            {isReferencesOpen ? 'Ocultar ^' : 'Exibir v'}
                          </span>
                        </div>
                        {isReferencesOpen && (
                          <ul className="text-xs text-zinc-400 space-y-1 pt-1 border-t border-zinc-800/80 list-disc list-inside">
                            {currentQuestion.references.map((ref, rIdx) => (
                              <li key={rIdx}>{ref}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Comentários dos Alunos */}
                      <div className="p-3 rounded-xl bg-[#12141c] border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2">
                        <span>💬 Comentários dos Alunos</span>
                        <span className="w-4 h-4 rounded-full bg-zinc-800 text-zinc-300 text-[10px] flex items-center justify-center font-bold">
                          0
                        </span>
                      </div>

                      {/* Rodapé com Navegação */}
                      <div className="pt-3 flex items-center justify-between gap-4 border-t border-zinc-800">
                        <button
                          type="button"
                          onClick={() => switchQuestion(0)}
                          className="px-4 py-2 rounded-xl bg-[#141620] hover:bg-[#1a1d2c] border border-zinc-800 text-xs font-bold text-zinc-400 hover:text-white cursor-pointer"
                        >
                          &lt; Anterior
                        </button>

                        <span className="text-xs font-black text-white bg-[#141620] px-3 py-1 rounded-lg border border-zinc-800">
                          {activeQuestionIdx === 0 ? '1/11' : '1/5'}
                        </span>

                        <button
                          type="button"
                          onClick={() => switchQuestion(activeQuestionIdx === 0 ? 1 : 0)}
                          className="px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md cursor-pointer transition-all hover:opacity-90"
                          style={{ backgroundColor: accentConfig.primaryHex }}
                        >
                          Próxima &gt;
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 2: FLASHCARDS FSRS (EXATAMENTE COMO NAS IMAGENS 8 E 9)
            ========================================================================= */}
        {activeTab === 'flashcards' && (
          <div className="space-y-4">
            {/* Header da Sessão Idêntico à Imagem 8 */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#10121a] border border-zinc-800 text-xs font-bold text-zinc-300 shadow-md">
              <BackArrowButton
                onClick={() => setActiveTab('questoes')}
                variant="ghost"
                title="Sair"
                ariaLabel="Sair da demonstração"
              />

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 font-mono text-zinc-300">
                  <Clock className="w-3.5 h-3.5" style={{ color: accentConfig.primaryHex }} />
                  <span>00:06</span>
                </div>
                <span className="text-zinc-600">|</span>
                <span className="font-mono text-white bg-[#181a24] px-2 py-0.5 rounded border border-zinc-700">
                  {flashcardIdx + 1}/{DEMO_FLASHCARDS.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-1.5 rounded-lg bg-amber-950/40 text-amber-400 border border-amber-800/60"
                  title="Embaralhar"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded-lg bg-[#181a24] text-zinc-400 hover:text-white border border-zinc-700"
                  title="Adicionar"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded-lg bg-[#181a24] text-zinc-400 hover:text-white border border-zinc-700"
                  title="Estatísticas"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded-lg bg-[#181a24] text-zinc-400 hover:text-white border border-zinc-700"
                  title="Atalhos"
                >
                  <Keyboard className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Linha de Progresso Superior */}
            <div className="w-full h-1 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${((flashcardIdx + 1) / DEMO_FLASHCARDS.length) * 100}%`,
                  backgroundColor: accentConfig.primaryHex
                }}
              />
            </div>

            {/* Toast FSRS */}
            {fsrsToast && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{fsrsToast}</span>
              </div>
            )}

            {/* CARD CENTRAL (FRENTE - IMAGEM 10 / VERSO - IMAGEM 9) */}
            <div
              onClick={() => setIsCardFlipped(!isCardFlipped)}
              className="min-h-[320px] p-6 sm:p-10 rounded-3xl bg-[#10121a] border border-zinc-800 shadow-2xl flex flex-col justify-between cursor-pointer transition-all duration-200 hover:border-zinc-700"
            >
              {/* Header do Card */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800/60 text-xs text-zinc-400 font-bold">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: accentConfig.primaryHex }}
                  />
                  <span>{currentFlashcard.topic}</span>
                </div>
                <div className="flex items-center gap-2 text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <Pencil className="w-3.5 h-3.5 text-zinc-500" />
                </div>
              </div>

              {/* FRENTE DO CARTÃO (IDÊNTICO À IMAGEM 10) */}
              {!isCardFlipped && (
                <div className="py-8 text-center space-y-6">
                  <div className="text-base sm:text-xl font-medium text-zinc-100 leading-relaxed max-w-2xl mx-auto">
                    {currentFlashcard.statementWithCloze}
                  </div>
                </div>
              )}

              {/* VERSO REVELADO (IDÊNTICO À IMAGEM 9) */}
              {isCardFlipped && (
                <div className="py-4 space-y-5 animate-in fade-in duration-150">
                  <div className="text-center">
                    <h3
                      className="text-xl sm:text-2xl font-black tracking-tight"
                      style={{ color: accentConfig.primaryHex }}
                    >
                      {currentFlashcard.revealedTitle}
                    </h3>
                  </div>

                  {/* Box: Enunciado Completo Preenchido com Badge Verde */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#141622] border border-zinc-800 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                      ENUNCIADO COMPLETO PREENCHIDO
                    </span>
                    <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
                      {currentFlashcard.fullStatementFilled.split(currentFlashcard.clozeBadge)[0]}
                      <mark className="bg-emerald-900/60 text-emerald-200 font-black px-2 py-0.5 rounded-lg border border-emerald-600/50">
                        {currentFlashcard.clozeBadge}
                      </mark>
                      {currentFlashcard.fullStatementFilled.split(currentFlashcard.clozeBadge)[1]}
                    </p>
                  </div>

                  {/* Box: Explicação Clínica */}
                  <div className="p-4 rounded-2xl bg-[#12141e] border border-zinc-800 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                      <span>✨ Explicação Clínica</span>
                    </div>
                    <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed">
                      {currentFlashcard.clinicalExplanation}
                    </p>
                  </div>
                </div>
              )}

              {/* CONTROLES INFERIORES: BOTAO MOSTRAR RESPOSTA OU RÉGUA FSRS */}
              <div className="pt-4 border-t border-zinc-800/60">
                {!isCardFlipped ? (
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFlashcardIdx(
                          (prev) => (prev - 1 + DEMO_FLASHCARDS.length) % DEMO_FLASHCARDS.length
                        );
                      }}
                      className="p-2.5 rounded-xl bg-[#181a24] text-zinc-400 hover:text-white border border-zinc-700 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsCardFlipped(true)}
                      className="px-6 py-2.5 rounded-xl text-white font-black text-xs sm:text-sm shadow-md cursor-pointer transition-all active:scale-95 hover:opacity-90"
                      style={{ backgroundColor: accentConfig.primaryHex }}
                    >
                      Mostrar Resposta
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFlashcardIdx((prev) => (prev + 1) % DEMO_FLASHCARDS.length);
                      }}
                      className="p-2.5 rounded-xl bg-[#181a24] text-zinc-400 hover:text-white border border-zinc-700 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                    {/* RÉGUA DOS 4 BOTÕES FSRS IDÊNTICA À IMAGEM 9 */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => handleRateFlashcard('<1 min')}
                        className="p-3 rounded-xl bg-[#2a0e14] hover:bg-[#38131a] border border-rose-900/80 text-rose-300 text-center cursor-pointer transition-all active:scale-95"
                      >
                        <div className="font-black text-xs">De novo (1)</div>
                        <div className="text-[10px] opacity-70">&lt;1 min</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRateFlashcard('<5 min')}
                        className="p-3 rounded-xl bg-[#181a24] hover:bg-[#202330] border border-zinc-700 text-zinc-300 text-center cursor-pointer transition-all active:scale-95"
                      >
                        <div className="font-black text-xs">Difícil (2)</div>
                        <div className="text-[10px] opacity-70">&lt;5 min</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRateFlashcard('<10 min')}
                        className="p-3 rounded-xl bg-[#0a1f18] hover:bg-[#0e2a20] border border-emerald-900/80 text-emerald-300 text-center cursor-pointer transition-all active:scale-95"
                      >
                        <div className="font-black text-xs">Bom (3)</div>
                        <div className="text-[10px] opacity-70">&lt;10 min</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRateFlashcard('<2 dias')}
                        className="p-3 rounded-xl bg-[#0a1828] hover:bg-[#0e2238] border border-cyan-900/80 text-cyan-300 text-center cursor-pointer transition-all active:scale-95"
                      >
                        <div className="font-black text-xs">Fácil (4)</div>
                        <div className="text-[10px] opacity-70">&lt;2 dias</div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 text-xs font-bold text-zinc-400">
                      <button
                        type="button"
                        onClick={() => setIsCardFlipped(false)}
                        className="hover:text-white cursor-pointer"
                      >
                        ↶ Ver Pergunta
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFlashcardIdx((prev) => (prev + 1) % DEMO_FLASHCARDS.length)
                        }
                        className="hover:text-white cursor-pointer"
                      >
                        Pular / Próximo &gt;
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 3: RESUMOS COM RAIO-X (INFECÇÃO PUERPERAL & ENDOMETRITE)
            ========================================================================= */}
        {activeTab === 'resumos' && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#10121a] border border-zinc-800 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md"
                    style={{ backgroundColor: currentSummary.areaColor }}
                  >
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      {currentSummary.titulo}
                    </h3>
                    <div className="text-xs text-zinc-400">{currentSummary.especialidade}</div>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-xl text-xs font-black bg-pink-950/40 text-pink-300 border border-pink-900 self-start sm:self-auto">
                  {currentSummary.badge}
                </span>
              </div>

              {/* Raio-X de Recorrência por Bancas */}
              <div className="p-4 rounded-2xl bg-[#141622] border border-zinc-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-zinc-300">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" style={{ color: accentConfig.primaryHex }} />
                    <span>Raio-X de Bancas: Como o tema é cobrado nos exames</span>
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                    {currentSummary.incidencia.map((bancaItem, bIdx) => (
                      <button
                        key={bancaItem.banca}
                        type="button"
                        onClick={() => setSelectedBancaIdx(bIdx)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${selectedBancaIdx === bIdx
                            ? 'text-white shadow-sm'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        style={
                          selectedBancaIdx === bIdx
                            ? { backgroundColor: accentConfig.primaryHex }
                            : {}
                        }
                      >
                        {bancaItem.banca}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {currentBancaData.subfocos.map((sf) => (
                    <div
                      key={sf.nome}
                      className="p-3.5 rounded-xl bg-[#10121a] border border-zinc-800 flex flex-col justify-between"
                    >
                      <span className="text-xs font-semibold text-zinc-200 leading-snug">
                        {sf.nome}
                      </span>
                      <span className="text-sm font-black text-pink-400 mt-2 font-mono">
                        {sf.pct}% das questões
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pontos Críticos & Pérolas de Prova */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Pontos Críticos & Pérolas de Prova
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentSummary.pontosChave.map((pt) => (
                    <div
                      key={pt.titulo}
                      className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed ${pt.alerta
                          ? 'bg-[#181208] border-amber-700/60 text-amber-200'
                          : 'bg-[#141622] border-zinc-800 text-zinc-300'
                        }`}
                    >
                      <div className="font-bold flex items-center gap-1.5 mb-1.5">
                        {pt.alerta ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <Lightbulb
                            className="w-4 h-4 shrink-0"
                            style={{ color: accentConfig.primaryHex }}
                          />
                        )}
                        <span>{pt.titulo}</span>
                      </div>
                      <p className="opacity-90 leading-normal">{pt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Algoritmo Decisório Passo a Passo */}
              <div className="p-5 rounded-2xl bg-[#141622] border border-zinc-800 space-y-3">
                <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{currentSummary.algoritmoTitulo}</span>
                </div>
                <div className="space-y-2">
                  {currentSummary.algoritmoPassos.map((passo, pIdx) => (
                    <div
                      key={passo}
                      className="p-3 rounded-xl bg-[#10121a] border border-zinc-800 text-xs text-zinc-200 font-medium flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 text-zinc-300">
                        {pIdx + 1}
                      </span>
                      <span className="leading-relaxed">{passo}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ações Rápidas Cruzadas */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800">
                <div className="text-xs text-zinc-400">
                  Referência: <strong>{currentSummary.referencia}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('flashcards');
                      setFlashcardIdx(2);
                      showToast('Iniciando flashcard de Infecção Puerperal');
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-pink-950/60 hover:bg-pink-900/60 text-pink-300 text-xs font-bold cursor-pointer transition-all border border-pink-900"
                  >
                    <Brain className="w-3.5 h-3.5" />
                    <span>Praticar Flashcards deste Tema</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('questoes');
                      switchQuestion(0);
                      showToast('Navegando para o banco de questões');
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-xs font-bold cursor-pointer transition-all shadow-md hover:opacity-90"
                    style={{ backgroundColor: accentConfig.primaryHex }}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Resolver Questões no Banco</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ABA 4: PAINEL DE DESEMPENHO (EXATAMENTE COMO NAS IMAGENS 6, 7 E 8)
            ========================================================================= */}
        {activeTab === 'desempenho' && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#10121a] border border-zinc-800 shadow-xl space-y-6">
              {/* Abas e Filtros Superiores Idênticos à Imagem 6 */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                <div className="inline-flex p-1 rounded-xl bg-[#141620] border border-zinc-800 gap-1 overflow-x-auto no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setDashboardTab('visao_geral')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${dashboardTab === 'visao_geral'
                        ? 'text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                      }`}
                    style={
                      dashboardTab === 'visao_geral'
                        ? { backgroundColor: accentConfig.primaryHex }
                        : {}
                    }
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Visão Geral</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDashboardTab('especialidades')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${dashboardTab === 'especialidades'
                        ? 'text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                      }`}
                    style={
                      dashboardTab === 'especialidades'
                        ? { backgroundColor: accentConfig.primaryHex }
                        : {}
                    }
                  >
                    <span>🩺 Especialidades</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDashboardTab('raiox_erros')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${dashboardTab === 'raiox_erros'
                        ? 'text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                      }`}
                    style={
                      dashboardTab === 'raiox_erros'
                        ? { backgroundColor: accentConfig.primaryHex }
                        : {}
                    }
                  >
                    <span>🎯 Raio-X de Erros</span>
                    <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
                      75
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDashboardTab('tempo')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${dashboardTab === 'tempo'
                        ? 'text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                      }`}
                    style={
                      dashboardTab === 'tempo'
                        ? { backgroundColor: accentConfig.primaryHex }
                        : {}
                    }
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Tempo de Estudo</span>
                  </button>
                </div>

                {/* Filtros da Direita */}
                <div className="flex items-center gap-2">
                  <select
                    value={dashboardPeriod}
                    onChange={(e) => setDashboardPeriod(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-[#141620] border border-zinc-800 text-xs font-bold text-zinc-300 cursor-pointer"
                  >
                    <option value="7d">Últimos 7 dias</option>
                    <option value="30d">Últimos 30 dias</option>
                    <option value="all">Todo o período</option>
                  </select>

                  <select className="px-3 py-1.5 rounded-xl bg-[#141620] border border-zinc-800 text-xs font-bold text-zinc-300 cursor-pointer">
                    <option>Residência Médica</option>
                    <option>Revalida</option>
                  </select>

                  <select className="px-3 py-1.5 rounded-xl bg-[#141620] border border-zinc-800 text-xs font-bold text-zinc-300 cursor-pointer">
                    <option>Todas as Bancas</option>
                    <option>ENARE</option>
                    <option>USP-SP</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => showToast('Métricas recalculadas com sucesso')}
                    className="p-2 rounded-xl bg-[#141620] border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                    title="Recalcular"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* CONTEÚDO DA SUB-ABA 1: VISÃO GERAL (EXATAMENTE IMAGENS 6, 7 E 8) */}
              {dashboardTab === 'visao_geral' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* 4 CARDS DE KPI IDÊNTICOS À IMAGEM 6 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 1. VOLUME RESOLVIDO */}
                    <div className="p-5 rounded-2xl bg-[#12141c] border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                        <span>VOLUME RESOLVIDO</span>
                        <span className="text-emerald-400 text-xs flex items-center gap-0.5">
                          ↗ +18.0%
                        </span>
                      </div>
                      <div className="text-3xl sm:text-4xl font-black text-white font-mono">1</div>
                      <div className="text-xs text-zinc-400">1 únicas e 1 inéditas</div>
                    </div>

                    {/* 2. ACERTOS LÍQUIDOS */}
                    <div className="p-5 rounded-2xl bg-[#12141c] border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                        <span>ACERTOS LÍQUIDOS</span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 text-[10px] font-bold border border-emerald-800/60">
                          ✔ Consistente
                        </span>
                      </div>
                      <div className="text-3xl sm:text-4xl font-black text-white font-mono">0</div>
                      <div className="text-xs text-rose-400">1 erros mapeados no período</div>
                    </div>

                    {/* 3. APROVEITAMENTO */}
                    <div className="p-5 rounded-2xl bg-[#12141c] border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                        <span>APROVEITAMENTO</span>
                        <span className="text-amber-400 text-xs">↘ -2.1%</span>
                      </div>
                      <div className="text-3xl sm:text-4xl font-black text-white font-mono">
                        0.0%
                      </div>
                      <div className="text-xs text-zinc-400">Taxa bruta (meta: ≥ 80% ideal)</div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: '15%' }}
                        />
                      </div>
                    </div>

                    {/* 4. RITMO MÉDIO */}
                    <div className="p-5 rounded-2xl bg-[#12141c] border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                        <span>RITMO MÉDIO</span>
                        <span className="text-[10px]" style={{ color: accentConfig.primaryHex }}>
                          ⏱ Ideal &lt; 2m 30s
                        </span>
                      </div>
                      <div className="text-3xl sm:text-4xl font-black text-white font-mono">
                        1m 48s
                      </div>
                      <div className="text-xs text-zinc-400">Tempo médio / questão</div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: '60%', backgroundColor: accentConfig.primaryHex }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* GRÁFICO DE EVOLUÇÃO (IDÊNTICO À IMAGEM 6) */}
                  <div className="p-5 rounded-2xl bg-[#12141c] border border-zinc-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <h4 className="text-sm font-black text-white">Evolução</h4>
                        <div className="inline-flex p-0.5 rounded-lg bg-[#181a24] text-[11px] font-bold text-zinc-400">
                          {(['30d', '3m', '6m', 'livre'] as const).map((period) => (
                            <button
                              key={period}
                              type="button"
                              onClick={() => setEvolutionPeriod(period)}
                              className={`px-2 py-0.5 rounded cursor-pointer ${evolutionPeriod === period ? 'bg-zinc-800 text-white' : ''}`}
                            >
                              {period === '30d'
                                ? '30 Dias'
                                : period === '3m'
                                  ? '3 Meses'
                                  : period === '6m'
                                    ? '6 Meses'
                                    : 'Livre'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-bold text-zinc-400">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                          <span>Acertos (Topo)</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                          <span>Erros (Base)</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-0.5 bg-zinc-400" />
                          <span>Tendência</span>
                        </span>
                      </div>
                    </div>

                    {/* Gráfico SVG Simulado com as Barras e a Linha de Tendência */}
                    <div className="h-44 w-full flex flex-col justify-end pt-4">
                      <div className="relative w-full h-32 flex items-end justify-between px-2 sm:px-6 border-b border-zinc-800">
                        {/* Linha de Tendência Cinza (Curva Suave) */}
                        <svg
                          className="absolute inset-0 w-full h-full pointer-events-none"
                          preserveAspectRatio="none"
                          viewBox="0 0 100 100"
                        >
                          <path
                            d="M 0,95 Q 60,95 75,50 T 100,50"
                            fill="none"
                            stroke="#71717a"
                            strokeWidth="2"
                            strokeDasharray="0"
                          />
                        </svg>

                        {/* Barras dos dias */}
                        {[
                          '15/11',
                          '16/11',
                          '17/11',
                          '18/11',
                          '19/11',
                          '20/11',
                          'Hoje',
                          '22/11'
                        ].map((day) => (
                          <div key={day} className="flex flex-col items-center gap-2 z-10">
                            {day === 'Hoje' ? (
                              <div
                                className="w-4 sm:w-6 h-28 rounded-t bg-rose-500 shadow-lg"
                                title="1 Erro"
                              />
                            ) : (
                              <div className="w-4 sm:w-6 h-1 rounded-t bg-transparent" />
                            )}
                            <span className="text-[10px] text-zinc-500 font-medium">{day}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* DETALHAMENTO DE QUESTÕES POR HORA DO DIA (IDÊNTICO À IMAGEM 7) */}
                  <div className="p-5 rounded-2xl bg-[#12141c] border border-zinc-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white">
                            Detalhamento de Questões por Hora do Dia
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 text-[10px] font-bold border border-emerald-800/60">
                            Sábado, 21 De Novembro
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400">
                          Selecione o dia desejado para analisar o volume e a taxa de acerto a cada
                          hora (00h às 23h)
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
                        <button type="button" className="p-1 rounded bg-[#181a24] border border-zinc-800">
                          &lt;
                        </button>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#181a24] border border-zinc-800">
                          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                          <span>21/11/2026</span>
                        </div>
                        <button type="button" className="p-1 rounded bg-[#181a24] border border-zinc-800">
                          &gt;
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-[#161824] border border-zinc-800/80 text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-500">Total no Dia</span>
                        <div className="font-black text-white text-sm">1 questão</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500">Acertos</span>
                        <div className="font-black text-emerald-400 text-sm">0 (0%)</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500">Erros</span>
                        <div className="font-black text-rose-400 text-sm">1</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500">Horário de Pico</span>
                        <div className="font-black text-white text-sm">22h:00 (1q)</div>
                      </div>
                    </div>

                    {/* Gráfico 24 Horas com a Coluna Vermelha às 22h */}
                    <div className="h-28 w-full flex items-end justify-between px-1 sm:px-4 border-b border-zinc-800">
                      {[
                        '00h',
                        '02h',
                        '04h',
                        '06h',
                        '08h',
                        '10h',
                        '12h',
                        '14h',
                        '16h',
                        '18h',
                        '20h',
                        '22h'
                      ].map((h) => (
                        <div key={h} className="flex flex-col items-center gap-1.5">
                          {h === '22h' ? (
                            <div
                              className="w-3.5 sm:w-5 h-20 rounded-t bg-rose-500"
                              title="22h: 1 erro"
                            />
                          ) : (
                            <div className="w-3.5 sm:w-5 h-0.5 bg-transparent" />
                          )}
                          <span className="text-[9px] text-zinc-500">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CRONOBIOLOGIA E RENDIMENTO POR TURNO (IDÊNTICO À IMAGEM 8) */}
                  <div className="space-y-4">
                    {/* 4 Cards de Métricas Biológicas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 rounded-2xl bg-[#12141c] border border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
                          <span>MÉDIA DIÁRIA</span>
                          <span className="text-emerald-400 text-[10px]">Meta: 30/dia</span>
                        </div>
                        <div className="text-2xl font-black text-white font-mono">1 q/dia</div>
                        <div className="text-[11px] text-zinc-400">Abaixo da meta de 30q/dia</div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#12141c] border border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
                          <span>VOLUME PROJETADO</span>
                          <span className="text-[10px]" style={{ color: accentConfig.primaryHex }}>
                            ~ 30 dias
                          </span>
                        </div>
                        <div className="text-2xl font-black text-white font-mono">~30 q/mês</div>
                        <div className="text-[11px] text-zinc-400">
                          Estimativa baseada no seu ritmo recente
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#12141c] border border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
                          <span>ASSIDUIDADE</span>
                          <span className="text-amber-400 text-[10px]">🔥 Constância</span>
                        </div>
                        <div className="text-2xl font-black text-white font-mono">
                          100% dos dias
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          26 dias com resoluções no período
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#12141c] border border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
                          <span>PICO COGNITIVO</span>
                          <span className="text-purple-400 text-[10px]">Melhor turno</span>
                        </div>
                        <div className="text-2xl font-black text-white font-mono">
                          Manhã <span className="text-emerald-400 text-sm font-bold">66%</span>
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          Horário com maior taxa de acerto (06h – 12h)
                        </div>
                      </div>
                    </div>

                    {/* Grid dos 4 Turnos Biológicos */}
                    <div className="p-5 rounded-2xl bg-[#12141c] border border-zinc-800 space-y-4">
                      <div>
                        <h4 className="text-sm font-black text-white">
                          Cronobiologia de Estudo & Rendimento por Turno
                        </h4>
                        <p className="text-xs text-zinc-400">
                          Distribuição de volume e taxa de acerto conforme o horário biológico
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Manhã */}
                        <div className="p-4 rounded-xl bg-[#161824] border border-zinc-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                              <Sunrise className="w-4 h-4 text-amber-400" />
                              <span>Manhã</span>
                              <span className="text-[10px] text-zinc-500 font-normal">
                                06h-12h
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 text-xs font-black border border-amber-800/40">
                              66% acerto
                            </span>
                          </div>
                          <div className="text-xs text-zinc-400">
                            Volume: <strong>44 q (13%)</strong>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: '66%' }}
                            />
                          </div>
                        </div>

                        {/* Tarde */}
                        <div className="p-4 rounded-xl bg-[#161824] border border-zinc-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                              <Sun className="w-4 h-4 text-orange-400" />
                              <span>Tarde</span>
                              <span className="text-[10px] text-zinc-500 font-normal">
                                12h-18h
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 text-xs font-black border border-rose-800/40">
                              52% acerto
                            </span>
                          </div>
                          <div className="text-xs text-zinc-400">
                            Volume: <strong>84 q (25%)</strong>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                            <div
                              className="h-full bg-rose-500 rounded-full"
                              style={{ width: '52%' }}
                            />
                          </div>
                        </div>

                        {/* Noite */}
                        <div className="p-4 rounded-xl bg-[#161824] border border-zinc-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                              <Sunset className="w-4 h-4 text-purple-400" />
                              <span>Noite</span>
                              <span className="text-[10px] text-zinc-500 font-normal">
                                18h-23h
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 text-xs font-black border border-rose-800/40">
                              55% acerto
                            </span>
                          </div>
                          <div className="text-xs text-zinc-400">
                            Volume: <strong>137 q (41%)</strong>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                            <div
                              className="h-full bg-rose-500 rounded-full"
                              style={{ width: '55%' }}
                            />
                          </div>
                        </div>

                        {/* Madrugada */}
                        <div className="p-4 rounded-xl bg-[#161824] border border-zinc-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                              <Moon className="w-4 h-4" style={{ color: accentConfig.primaryHex }} />
                              <span>Madrugada</span>
                              <span className="text-[10px] text-zinc-500 font-normal">
                                23h-06h
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 text-xs font-black border border-rose-800/40">
                              56% acerto
                            </span>
                          </div>
                          <div className="text-xs text-zinc-400">
                            Volume: <strong>73 q (22%)</strong>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                            <div
                              className="h-full bg-rose-500 rounded-full"
                              style={{ width: '56%' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CONTEÚDO DA SUB-ABA 2: ESPECIALIDADES */}
              {dashboardTab === 'especialidades' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs font-bold text-zinc-400">
                    <span>Desempenho por Grande Área Médica</span>
                    <span style={{ color: accentConfig.primaryHex }}>TRI Calibrada</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      {
                        nome: 'Ginecologia e Obstetrícia',
                        acerto: 78,
                        volume: 45,
                        tempo: '1m 32s',
                        color: '#ec4899',
                        foco: 'Isoimunização Rh & Infecção Puerperal'
                      },
                      {
                        nome: 'Clínica Médica',
                        acerto: 65,
                        volume: 62,
                        tempo: '2m 10s',
                        color: accentConfig.primaryHex,
                        foco: 'Hepatologia (MASLD) & Cardiologia'
                      },
                      {
                        nome: 'Cirurgia Geral',
                        acerto: 72,
                        volume: 50,
                        tempo: '1m 45s',
                        color: '#f97316',
                        foco: 'Abdome Agudo & Trauma'
                      },
                      {
                        nome: 'Pediatria',
                        acerto: 80,
                        volume: 38,
                        tempo: '1m 20s',
                        color: '#10b981',
                        foco: 'Neonatologia & Puericultura'
                      },
                      {
                        nome: 'Medicina Preventiva',
                        acerto: 85,
                        volume: 40,
                        tempo: '1m 15s',
                        color: '#8b5cf6',
                        foco: 'Declaração de Óbito & Leavell & Clark'
                      }
                    ].map((area) => (
                      <div
                        key={area.nome}
                        className="p-4 rounded-2xl bg-[#12141c] border border-zinc-800 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: area.color }}
                            />
                            {area.nome}
                          </span>
                          <span className="font-mono text-sm font-black text-emerald-400">
                            {area.acerto}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${area.acerto}%`,
                              backgroundColor: area.color
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-zinc-400">
                          <span>Volume: {area.volume}q</span>
                          <span>Ritmo: {area.tempo}</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate pt-1 border-t border-zinc-800/60">
                          Subfoco recente: {area.foco}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CONTEÚDO DA SUB-ABA 3: RAIO-X DE ERROS (75 ERROS) */}
              {dashboardTab === 'raiox_erros' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800 text-xs">
                    <span className="font-bold text-zinc-300">
                      Mapeamento Cirúrgico de Vulnerabilidades Recentes (75 questões erradas)
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenAuth('register')}
                      className="text-xs font-bold underline cursor-pointer self-start sm:self-auto hover:opacity-85"
                      style={{ color: accentConfig.primaryHex }}
                    >
                      Gerar Caderno Inteligente de Erros &rarr;
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      {
                        tema: 'Isoimunização Rh e Sangramento na Gestação',
                        area: 'Ginecologia e Obstetrícia',
                        banca: 'ENARE 2027',
                        motivo:
                          'Confusão entre profilaxia anti-D em não sensibilizada vs conduta com Coombs positivo (Doppler de ACM)',
                        acaoTexto: 'Revisar no Resumo',
                        tabTarget: 'resumos' as const
                      },
                      {
                        tema: 'Esteatose Hepática Metabólica (MASLD) & Escore FIB-4',
                        area: 'Clínica Médica',
                        banca: 'HSL / Sírio 2027',
                        motivo:
                          'Confusão nos parâmetros do FIB-4 e presunção errônea de que Tomografia mede rigidez hepática',
                        acaoTexto: 'Praticar no Banco',
                        tabTarget: 'questoes' as const
                      },
                      {
                        tema: 'Critérios de Morbidade Febril Puerperal e Endometrite',
                        area: 'Ginecologia e Obstetrícia',
                        banca: 'USP-SP / SURCE',
                        motivo:
                          'Tentativa de prescrever antibiótico oral após alta hospitalar ou esquecimento do intervalo >24h pós-parto',
                        acaoTexto: 'Abrir Flashcards',
                        tabTarget: 'flashcards' as const
                      },
                      {
                        tema: 'Declaração de Óbito em Morte Violenta ou Suspeita',
                        area: 'Medicina Preventiva',
                        banca: 'Revalida INEP',
                        motivo:
                          'Médico assistente hospitalar assinando DO em causa externa (competência exclusiva do IML)',
                        acaoTexto: 'Revisar Flashcard',
                        tabTarget: 'flashcards' as const
                      }
                    ].map((erro, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-[#12141c] border border-rose-900/30 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-rose-800/60 transition-all"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                            <span className="text-xs sm:text-sm font-bold text-white truncate">
                              {erro.tema}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#181a24] text-zinc-400 border border-zinc-700">
                              {erro.banca}
                            </span>
                          </div>
                          <p className="text-xs text-rose-200/80 leading-relaxed">{erro.motivo}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab(erro.tabTarget);
                            if (erro.tabTarget === 'flashcards') setFlashcardIdx(0);
                            if (erro.tabTarget === 'questoes') switchQuestion(1);
                            showToast(`Navegando para remediação: ${erro.tema}`);
                          }}
                          className="px-3.5 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all shrink-0 self-start md:self-auto hover:opacity-90"
                          style={{
                            backgroundColor: accentConfig.bgRgba,
                            color: accentConfig.primaryHex,
                            borderColor: accentConfig.borderRgba
                          }}
                        >
                          {erro.acaoTexto}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CONTEÚDO DA SUB-ABA 4: TEMPO DE ESTUDO */}
              {dashboardTab === 'tempo' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-[#12141c] border border-zinc-800 space-y-1">
                      <span className="text-[11px] text-zinc-400">Tempo em Questões</span>
                      <div className="text-2xl font-black text-white font-mono">1h 45min</div>
                      <div className="text-[10px] text-zinc-500">60% da carga horária</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#12141c] border border-zinc-800 space-y-1">
                      <span className="text-[11px] text-zinc-400">Tempo em Flashcards</span>
                      <div className="text-2xl font-black text-white font-mono">42min</div>
                      <div className="text-[10px] text-zinc-500">24% da carga horária</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#12141c] border border-zinc-800 space-y-1">
                      <span className="text-[11px] text-zinc-400">Tempo em Resumos</span>
                      <div className="text-2xl font-black text-white font-mono">28min</div>
                      <div className="text-[10px] text-zinc-500">16% da carga horária</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#12141c] border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span>Eficiência Cognitiva por Hora</span>
                      <span className="text-emerald-400">Turno da Manhã: +28% de retenção</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Seu pico de fixação neurológica ocorre entre 08h e 11h, onde sua taxa de acerto
                      atinge 66% com menor tempo médio de resposta por item (1m 35s).
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default LandingInsidePlatformSection;
