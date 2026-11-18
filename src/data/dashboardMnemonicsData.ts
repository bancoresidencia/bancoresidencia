export interface CriticalSubtopicDefault {
  name: string;
  defaultAccuracy: number;
}

export const CRITICAL_SUBTOPICS_MAP: Record<string, CriticalSubtopicDefault[]> = {
  cirurgia: [
    { name: 'Abdome Agudo', defaultAccuracy: 0 },
    { name: 'Trauma Abdominal (ATLS)', defaultAccuracy: 25 },
    { name: 'Hérnias da Parede', defaultAccuracy: 33 }
  ],
  clinica: [
    { name: 'Insuficiência Cardíaca', defaultAccuracy: 20 },
    { name: 'Sepse e Choque', defaultAccuracy: 30 },
    { name: 'Diabetes e Complicações', defaultAccuracy: 40 }
  ],
  pediatria: [
    { name: 'Aleitamento Materno', defaultAccuracy: 25 },
    { name: 'Infecções Respiratórias (IVAS)', defaultAccuracy: 35 },
    { name: 'Triagens Neonatais', defaultAccuracy: 40 }
  ],
  ginecologia: [
    { name: 'Sangramento Uterino Anormal', defaultAccuracy: 15 },
    { name: 'Rastreamento CA Colo', defaultAccuracy: 30 },
    { name: 'Climatério e TH', defaultAccuracy: 35 }
  ],
  obstetricia: [
    { name: 'Hemorragias da Gestação', defaultAccuracy: 20 },
    { name: 'Pré-Eclâmpsia e Eclâmpsia', defaultAccuracy: 28 },
    { name: 'Vitalidade Fetal e Parto', defaultAccuracy: 40 }
  ],
  preventiva: [
    { name: 'Estudos Epidemiológicos', defaultAccuracy: 18 },
    { name: 'Princípios e Diretrizes SUS', defaultAccuracy: 30 },
    { name: 'Testes Diagnósticos (Sens/Espec)', defaultAccuracy: 38 }
  ]
};

export interface DetailedMnemonicData {
  title: string;
  theme: string;
  acronym: string;
  letters: string[];
  content: string;
  rule: string;
  clinicalApplication: string;
  bancaTrap: string;
  examFrequency: string;
  breakdown: Array<{
    letter: string;
    label: string;
    meaning: string;
    detail: string;
    badge?: string;
  }>;
  clinicalCase?: {
    vignette: string;
    answer: string;
    explanation: string;
  };
  practiceQuery?: {
    specialty: string;
    tema?: string;
    search?: string;
  };
}

export const DETAILED_MNEMONICS_MAP: Record<string, DetailedMnemonicData> = {
  cirurgia: {
    title: 'Critérios de Ranson na Admissão (Pancreatite Aguda)',
    theme: 'Pancreatite Aguda • Doenças Biliares & Pâncreas',
    acronym: 'L-A-G-A-R',
    letters: ['L', 'A', 'G', 'A', 'R'],
    content: 'L-A-G-A-R na admissão: Leucócitos (>16k) • Age/Idade (>55) • Glicose (>200) • AST (>250) • LDH (>350)',
    rule: '≥3 critérios na admissão prediz pancreatite aguda grave (indicação formal de UTI e vigilância de falência orgânica)',
    clinicalApplication:
      'Aplicado nas primeiras 48h de evolução. Pacientes com 0-2 critérios apresentam mortalidade < 1%; ≥3 critérios elevam o risco para 15-40%, exigindo ressuscitação volêmica vigorosa com Ringer Lactato e monitorização hemodinâmica contínua.',
    bancaTrap:
      'Pegadinha Clássica: Amilase e lipase NÃO avaliam gravidade nem entram em Ranson (servem exclusivamente para o diagnóstico). Outra pegadinha frequente é confundir os critérios da admissão com os de 48h (C-H-A-B-O-S: Cálcio, Hematócrito, Gaso/pO2, BUN/Ureia, Déficit de Base, Sequestro Líquido).',
    examFrequency: 'Altíssima relevância • Cobrado em ~91% das bancas de Residência (ENARE, USP, SURCE, SUS-SP)',
    practiceQuery: {
      specialty: 'Cirurgia Geral',
      tema: 'Pancreatite Aguda',
      search: 'Pancreatite'
    },
    breakdown: [
      { letter: 'L', label: 'Leucócitos', meaning: '> 16.000 /mm³', detail: 'Expressa a intensidade da resposta inflamatória sistêmica inicial (SIRS)' },
      { letter: 'A', label: 'Age / Idade', meaning: '> 55 anos', detail: 'Fator prognóstico independente associado a menor reserva fisiológica' },
      { letter: 'G', label: 'Glicose', meaning: '> 200 mg/dL', detail: 'Reflete estresse adrenérgico e disfunção endócrina das ilhotas pancreáticas' },
      { letter: 'A', label: 'AST / TGO', meaning: '> 250 U/L', detail: 'Marcador de lesão hepatocelular e sofrimento parenquimatoso secundário' },
      { letter: 'R', label: 'LDH / DHL', meaning: '> 350 U/L', detail: 'Indicador direto de necrose tecidual e lise celular acelerada' }
    ],
    clinicalCase: {
      vignette:
        'Homem de 58 anos dá entrada com dor epigástrica em barra há 12h, lipase 1400 U/L. Exames admissionais: Leucócitos 17.800/mm³, Glicose 245 mg/dL, AST 290 U/L, LDH 420 U/L. Qual a conduta imediata quanto à estratificação?',
      answer: 'Pancreatite Aguda Grave (Ranson = 5 critérios na admissão). Indicação mandatória de leito em UTI e hidratação guiada por metas.',
      explanation:
        'O paciente pontuou nos 5 critérios de admissão (Idade > 55, Leucócitos > 16k, Glicose > 200, AST > 250, LDH > 350). Com escore ≥ 3, o quadro é categorizado como grave com alta probabilidade de necrose e falência de múltiplos órgãos.'
    }
  },
  clinica: {
    title: 'Critérios de Light (Derrame Pleural: Exsudato vs Transudato)',
    theme: 'Pneumologia • Análise do Líquido Pleural',
    acronym: 'LIGHT',
    letters: ['1', '2', '3'],
    content: 'Prot Pleural/Sérica > 0,5 OU LDH Pleural/Sérica > 0,6 OU LDH Pleural > 2/3 do LSN sérico',
    rule: 'Apenas 1 critério positivo já classifica o líquido como EXSUDATO (processo inflamatório, infeccioso ou neoplásico)',
    clinicalApplication:
      'Etapa diagnóstica obrigatória após toracocentese. Se for Exsudato, impõe-se a busca por etiologias inflamatórias (derrame parapneumônico, empiema, tuberculose, neoplasia, TEP). Se nenhum dos 3 critérios estiver presente, confirma-se Transudato (insuficiência cardíaca descompensada, cirrose, síndrome nefrótica).',
    bancaTrap:
      'Pegadinha Clássica: A regra é baseada em "OU", nunca em "E". Uma relação de Proteína Pleural/Sérica de 0,51, isoladamente, já sacramenta o diagnóstico de exsudato! Fique atento ao falso-exsudato em cardiopatas em uso de furosemida (neste caso, o gradiente de albumina soro-líquido pleural > 1,2 g/dL reclassifica como transudato).',
    examFrequency: 'Tema indispensável • Cobrado em 89% das provas de Clínica Médica',
    practiceQuery: {
      specialty: 'Clínica Médica',
      tema: 'Pneumologia',
      search: 'Derrame Pleural'
    },
    breakdown: [
      { letter: '1', label: 'Proteína', meaning: 'Prot Pleural / Sérica > 0,5', detail: 'Aumento da permeabilidade capilar pleural decorrente de inflamação local' },
      { letter: '2', label: 'LDH Razão', meaning: 'LDH Pleural / Sérico > 0,6', detail: 'Reflete alta celularidade e inflamação exuberante no espaço pleural' },
      { letter: '3', label: 'LDH Absoluto', meaning: 'LDH Pleural > 2/3 do LSN sérico', detail: 'Geralmente > 200 U/L quando o valor sérico de referência é 300 U/L' }
    ],
    clinicalCase: {
      vignette:
        'Mulher de 62 anos com tosse seca e derrame pleural à direita. Punção: Proteína pleural 3,2 g/dL (sérica 6,0 g/dL), LDH pleural 180 U/L (sérico 320 U/L, LSN = 250 U/L). Como classificar o líquido?',
      answer: 'Exsudato Pleural (Razão Prot Pleural/Sérica = 3,2 / 6,0 = 0,53, que é > 0,5).',
      explanation:
        'Embora o LDH isolado esteja abaixo dos cortes de exsudato, a presença de um único critério positivo (relação de proteína > 0,5) é suficiente para selar o diagnóstico de exsudato segundo a sensibilidade de 98% dos Critérios de Light.'
    }
  },
  pediatria: {
    title: 'Escore de Apgar Neonatal (1º e 5º Minuto)',
    theme: 'Neonatologia • Recepção e Vitalidade do Recém-Nascido',
    acronym: 'A-P-G-A-R',
    letters: ['A', 'P', 'G', 'A', 'R'],
    content: 'A-P-G-A-R: Aparência (cor) • Pulso (FC) • Gesticulação • Atividade (tônus) • Respiração',
    rule: 'Nota de 0 a 10 • Avalia vitalidade ao nascer e resposta à reanimação (0-3: asfixia grave, 4-6: moderada, 7-10: boa vitalidade)',
    clinicalApplication:
      'O Apgar é pontuado no 1º e no 5º minuto (persistindo a cada 5 min se < 7). O escore de 5º minuto é o parâmetro de maior valor prognóstico neurológico e de morbimortalidade no período neonatal imediato.',
    bancaTrap:
      'Pegadinha Número 1 de Sala de Parto: NUNCA se atrasa ou aguarda a contagem do Apgar para iniciar manobras de reanimação! A indicação de reanimação (aquecer, secar, posicionar, aspirar se necessário e ventilar com pressão positiva) depende da avaliação tríplice imediata: Termo? Respirando ou chorando? Tônus em flexão?',
    examFrequency: 'Tema obrigatório • Presente em mais de 92% das provas de Pediatria',
    practiceQuery: {
      specialty: 'Pediatria',
      tema: 'Neonatologia',
      search: 'Neonatologia'
    },
    breakdown: [
      { letter: 'A', label: 'Aparência (Cor)', meaning: '0: Pálido/Cianose Central | 1: Acrocianose | 2: Completamente Rosado', detail: 'Acrocianose isolada é fisiológica nos primeiros minutos de vida extrauterina' },
      { letter: 'P', label: 'Pulso (FC)', meaning: '0: Ausente | 1: < 100 bpm | 2: ≥ 100 bpm', detail: 'FC < 100 bpm é a principal indicação para Ventilação com Pressão Positiva (VPP)' },
      { letter: 'G', label: 'Gesticulação', meaning: '0: Sem resposta | 1: Caretas | 2: Espirro, tosse, choro vigoroso', detail: 'Avalia a irritabilidade reflexa à estimulação tátil e desobstrução de vias aéreas' },
      { letter: 'A', label: 'Atividade', meaning: '0: Flácido | 1: Alguma flexão | 2: Movimentos ativos e tônus forte', detail: 'Reflete a oxigenação e integridade do tronco encefálico e medula espinhal' },
      { letter: 'R', label: 'Respiração', meaning: '0: Ausente (apneia) | 1: Lenta/irregular | 2: Regular e choro forte', detail: 'Esforço respiratório espontâneo eficaz na transição cardiopulmonar' }
    ],
    clinicalCase: {
      vignette:
        'Recém-nascido a termo no 1º minuto apresenta FC = 120 bpm, choro vigoroso, extremidades arroxeadas com tronco rosado, espirra à aspiração e movimenta membros ativamente. Qual seu escore?',
      answer: 'Apgar 9 (A=1 [acrocianose], P=2 [FC > 100], G=2 [espirro/tosse], A=2 [movimento ativo], R=2 [choro vigoroso]).',
      explanation:
        'A única dedução de 1 ponto ocorre na Aparência/Cor decorrente de acrocianose (extremidades periféricas cianóticas com tronco rosado), o que é achado frequente e esperado no 1º minuto.'
    }
  },
  ginecologia: {
    title: 'Classificação FIGO de SUA (PALM-COEIN)',
    theme: 'Ginecologia Geral • Sangramento Uterino Anormal',
    acronym: 'PALM-COEIN',
    letters: ['P', 'A', 'L', 'M', 'C', 'O', 'E', 'I', 'N'],
    content:
      'PALM (Estruturais) / COEIN (Não Estruturais): Pólipo, Adenomiose, Leiomioma, Malignidade / Coagulopatia, Ovulatória, Endometrial, Iatrogênica, Não especificada',
    rule: 'PALM = Causas anatômicas e estruturais (visíveis a exames de imagem e histopatologia) • COEIN = Causas não estruturais / funcionais',
    clinicalApplication:
      'Sistematização obrigatória na condução do Sangramento Uterino Anormal em mulheres não gestantes no menacme. Permite separar pacientes candidatas a procedimentos intervencionistas/cirúrgicos (PALM) daquelas com indicação de manejo clínico, hormonal ou hematológico (COEIN).',
    bancaTrap:
      'Pegadinhas Clássicas: (1) Onde entra o sangramento por DIU de cobre ou anticoagulante oral? Resposta: COEIN (I = Iatrogênica ou C = Coagulopatia). (2) A banca adora cobrar as subclasses de Leiomioma (Lsm = submucoso, com maior sangramento; Lo = outros intramural/subseroso).',
    examFrequency: 'Altíssima frequência • Questão certa em Ginecologia e Obstetrícia',
    practiceQuery: {
      specialty: 'Ginecologia',
      tema: 'Ginecologia Geral',
      search: 'Sangramento Uterino'
    },
    breakdown: [
      { letter: 'P', label: 'Pólipo', meaning: 'Endometrial ou Endocervical', detail: 'Diagnóstico por ultrassonografia com histerossonografia ou histeroscopia' },
      { letter: 'A', label: 'Adenomiose', meaning: 'Infiltração de glândulas no miométrio', detail: 'Causa clássica de útero globoso, aumentado e dismenorreia secundária intensa' },
      { letter: 'L', label: 'Leiomioma', meaning: 'Submucoso (Lsm) vs Outros (Lo)', detail: 'Submucosos causam sangramento abundante por distorção endometrial direta' },
      { letter: 'M', label: 'Malignidade', meaning: 'Câncer de endométrio e hiperplasias', detail: 'Principal suspeita em SUA no climatério e pós-menopausa tardia' },
      { letter: 'C', label: 'Coagulopatia', meaning: 'Doença de von Willebrand, plaquetopenias', detail: 'Suspeitar em sangramentos intensos desde a menarca' },
      { letter: 'O', label: 'Disfunção Ovulatória', meaning: 'SOP, hiperprolactinemia, hipotireoidismo', detail: 'Ciclos anovulatórios com sangramento irregular por quebra estrogênica' },
      { letter: 'E', label: 'Endometrial', meaning: 'Deficiência na vasoconstrição local', detail: 'Desequilíbrio de prostaglandinas (PGF2a/PGE2) em ciclos regulares' },
      { letter: 'I', label: 'Iatrogênica', meaning: 'DIU, implantes, anticoagulantes, psicotrópicos', detail: 'Efeito colateral farmacológico documentado em anamnese dirigida' },
      { letter: 'N', label: 'Não Especificada', meaning: 'Malformações arteriovenosas, nichos', detail: 'Condições raras não catalogadas nos outros grupos FIGO' }
    ],
    clinicalCase: {
      vignette:
        'Mulher de 34 anos com ciclos menstruais a cada 45 a 60 dias, sangramento em grande volume e hirsutismo. Exame pélvico e USG transvaginal anatômica normais. Qual o grupo FIGO?',
      answer: 'COEIN - Letra "O" (Disfunção Ovulatória secundária à Síndrome dos Ovários Policísticos).',
      explanation:
        'A ausência de alterações estruturais na imagem descarta o grupo PALM. A oligomenorreia associada a hirsutismo confirma anovulação crônica, pertencente à categoria "O" (Ovulatory dysfunction) do sistema FIGO.'
    }
  },
  obstetricia: {
    title: 'Descolamento Prematuro de Placenta (DPP)',
    theme: 'Obstetrícia de Alto Risco • Hemorragias da 2ª Metade',
    acronym: 'D-P-P',
    letters: ['D', 'O', 'R', 'H', 'I', 'P'],
    content: 'Tríade clássica: Dor abdominal súbita + Hipertonia uterina ("útero em tábua") + Sangramento escuro com sofrimento fetal agudo',
    rule: 'Conduta imediata: Amniotomia precoce imediata + Parto pela via mais rápida (geralmente cesariana de emergência)',
    clinicalApplication:
      'Emergência obstétrica de alto risco materno-fetal associada a hipertensão prévia/pré-eclâmpsia e trauma. A amniotomia descompressiva reduz a pressão intramiócica, alivia a hipertonia e diminui a liberação de tromboplastina na circulação materna.',
    bancaTrap:
      'Diferencial Fatal em Prova: DPP vs Placenta Prévia (PP). No DPP a dor é INTENSA e súbita, o sangramento é ESCURO e tem HIPERTONIA uterina sustentada. Na Placenta Prévia, o sangramento é ROUBO (vermelho vivo), INDOLOR, INSIDIOSO e o útero é normotônico e indolor. Nunca realize toque vaginal em sangramento de 2ª metade sem antes excluir placenta prévia!',
    examFrequency: 'Top 3 em todas as provas de Obstetrícia do Brasil',
    practiceQuery: {
      specialty: 'Obstetrícia',
      tema: 'Obstetrícia de Alto Risco',
      search: 'Placenta'
    },
    breakdown: [
      { letter: 'D', label: 'Dor Abdominal', meaning: 'Súbita, intensa e contínua', detail: 'Decorrente do extravasamento de sangue na espessura do miométrio' },
      { letter: 'H', label: 'Hipertonia', meaning: 'Útero lenhoso ("útero em tábua")', detail: 'Elevação do tônus basal e taquissistolia refratária ao relaxamento' },
      { letter: 'S', label: 'Sangramento', meaning: 'Escuro e com coágulos', detail: 'Pode ser oculto em 20% dos casos quando há hematoma retroplacentário' },
      { letter: 'F', label: 'Sofrimento Fetal', meaning: 'Desacelerações DIP 2 / Bradicardia', detail: 'Redução abrupta da área de trocas gasosas materno-fetais' },
      { letter: 'C', label: 'CIVD / Coagulação', meaning: 'Consumo maciço de fibrinogênio', detail: 'Risco de síndrome de Couvelaire (apoplexia uteroplacentária)' }
    ],
    clinicalCase: {
      vignette:
        'Gestante de 36 semanas hipertensa dá entrada com dor em baixo ventre de início abrupto há 40 min, útero espasmódico doloroso e sangramento escuro moderado. BCF = 95 bpm. Qual a conduta?',
      answer: 'Amniotomia imediata e cesariana de emergência por Descolamento Prematuro de Placenta com feto vivo em sofrimento.',
      explanation:
        'A tríade de dor intensa, hipertonia uterina e sangramento escuro confirma DPP. Havendo feto vivo e bradicardia fetal sustentada (< 110 bpm), a conduta prioritária é interromper a gestação pela via mais rápida (cesariana imediata com amniotomia de alívio).'
    }
  },
  preventiva: {
    title: 'Princípios do SUS: Doutrinários vs Organizativos',
    theme: 'Legislação e História do SUS • Lei 8.080/90 e CF/88',
    acronym: 'U-I-E',
    letters: ['U', 'I', 'E'],
    content:
      'Doutrinários (U-I-E): Universalidade • Integralidade • Equidade / Organizativos: Descentralização • Regionalização • Hierarquização • Participação Popular',
    rule: 'Doutrinários refletem a filosofia e os valores éticos constitucionais (U-I-E) • Organizativos definem a operação e arquitetura prática do sistema',
    clinicalApplication:
      'Pilar estruturante de todas as políticas públicas de saúde no Brasil, norteando a Rede de Atenção à Saúde (RAS) e a formulação de linhas de cuidado prioritárias na Atenção Primária.',
    bancaTrap:
      'Pegadinha Número 1 de Medicina Preventiva: A banca troca "Equidade" por "Igualdade". No SUS, o princípio é EQUIDADE (tratar de forma desigual os desiguais, direcionando mais recursos aos mais vulneráveis). Tratar todos igualmente perpetua as disparidades sociais. Segunda pegadinha: confundir princípio doutrinário com organizativo.',
    examFrequency: 'Tema mais cobrado em toda a Medicina Preventiva (~94% das provas)',
    practiceQuery: {
      specialty: 'Medicina Preventiva e Social',
      tema: 'Atenção Primária à Saúde',
      search: 'Saúde da Família'
    },
    breakdown: [
      { letter: 'U', label: 'Universalidade', meaning: 'Acesso à saúde como direito de todos e dever do Estado', detail: 'Sem exigência de contribuição previdenciária, nacionalidade ou vínculo empregatício formal' },
      { letter: 'I', label: 'Integralidade', meaning: 'Cuidado contínuo, biopsicossocial e em todos os níveis', detail: 'Articulação simultânea de ações promocionais, preventivas, curativas e reabilitadoras' },
      { letter: 'E', label: 'Equidade', meaning: 'Justiça distributiva: atender mais a quem mais necessita', detail: 'Redução de disparidades mediante alocação diferencial de serviços às populações de maior risco' }
    ],
    clinicalCase: {
      vignette:
        'Em um município, a gestão de saúde implementou um programa de visitas domiciliares semanais exclusivo para comunidades ribeirinhas isoladas com alta taxa de mortalidade infantil. Qual princípio fundamenta a medida?',
      answer: 'Princípio Doutrinário da Equidade.',
      explanation:
        'A concessão de mais atenção e recursos específicos para a população em condição de maior vulnerabilidade e desvantagem exemplifica com perfeição a Equidade em saúde ("tratar desigualmente os desiguais").'
    }
  }
};

export const MNEMONICS_MAP: Record<string, { title: string; content: string; rule: string }> = Object.entries(
  DETAILED_MNEMONICS_MAP
).reduce(
  (acc, [key, val]) => {
    acc[key] = { title: val.title, content: val.content, rule: val.rule };
    return acc;
  },
  {} as Record<string, { title: string; content: string; rule: string }>
);
