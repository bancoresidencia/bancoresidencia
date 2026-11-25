export type DemoTabKey = 'internato' | 'residencia' | 'revalida' | 'rplus';

export interface FeaturedBancaItem {
  id: string;
  name: string;
  shortLabel: string;
  logoSlug?: string;
  targetTab: DemoTabKey;
  targetQuestionIdx: number;
}

export const TOP_FEATURED_BANCAS: FeaturedBancaItem[] = [
  { id: 'enare', name: 'ENARE / EBSERH', shortLabel: 'ENARE', logoSlug: 'enare', targetTab: 'residencia', targetQuestionIdx: 0 },
  { id: 'usp-sp', name: 'USP-SP (HCFMUSP)', shortLabel: 'USP-SP', logoSlug: 'hcfmusp', targetTab: 'residencia', targetQuestionIdx: 1 },
  { id: 'unicamp', name: 'UNICAMP', shortLabel: 'UNICAMP', logoSlug: 'hc-unicamp', targetTab: 'residencia', targetQuestionIdx: 2 },
  { id: 'unifesp', name: 'UNIFESP (EPM)', shortLabel: 'UNIFESP', logoSlug: 'unifesp-epm', targetTab: 'residencia', targetQuestionIdx: 0 },
  { id: 'sus-sp', name: 'SUS-SP', shortLabel: 'SUS-SP', logoSlug: 'sus-sp', targetTab: 'residencia', targetQuestionIdx: 1 },
  { id: 'amrigs', name: 'AMRIGS', shortLabel: 'AMRIGS', logoSlug: 'amrigs', targetTab: 'rplus', targetQuestionIdx: 2 },
  { id: 'psu-mg', name: 'PSU-MG (AREMG)', shortLabel: 'PSU-MG', logoSlug: 'aremg', targetTab: 'residencia', targetQuestionIdx: 4 },
  { id: 'einstein', name: 'Hospital Israelita Albert Einstein', shortLabel: 'EINSTEIN', logoSlug: 'einstein-hiae', targetTab: 'residencia', targetQuestionIdx: 1 },
  { id: 'iamspe', name: 'IAMSPE (HSPE)', shortLabel: 'IAMSPE', logoSlug: 'hspe-fmo', targetTab: 'residencia', targetQuestionIdx: 0 },
  { id: 'santa-casa-sp', name: 'Santa Casa de São Paulo', shortLabel: 'SANTA CASA SP', logoSlug: 'santa-casa-sp', targetTab: 'residencia', targetQuestionIdx: 2 },
  { id: 'psu-ce', name: 'PSU-CE / SURCE', shortLabel: 'SURCE', logoSlug: 'surce', targetTab: 'residencia', targetQuestionIdx: 3 },
  { id: 'uerj', name: 'UERJ (HUPE)', shortLabel: 'UERJ', logoSlug: 'hupe', targetTab: 'residencia', targetQuestionIdx: 0 },
  { id: 'ufrj', name: 'UFRJ', shortLabel: 'UFRJ', logoSlug: 'ufrj', targetTab: 'residencia', targetQuestionIdx: 1 },
  { id: 'ses-pe', name: 'SES-PE', shortLabel: 'SES-PE', logoSlug: 'ses-pe', targetTab: 'residencia', targetQuestionIdx: 3 },
  { id: 'ses-df', name: 'SES-DF', shortLabel: 'SES-DF', logoSlug: 'ses-df', targetTab: 'residencia', targetQuestionIdx: 4 },
  { id: 'hcpa', name: 'HCPA', shortLabel: 'HCPA', logoSlug: 'hcpa', targetTab: 'rplus', targetQuestionIdx: 0 },
  { id: 'fmabc', name: 'FMABC', shortLabel: 'FMABC', logoSlug: 'fmabc', targetTab: 'residencia', targetQuestionIdx: 2 },
  { id: 'uel', name: 'UEL', shortLabel: 'UEL', logoSlug: 'hu-uel', targetTab: 'residencia', targetQuestionIdx: 0 },
  { id: 'revalida', name: 'INEP Revalida', shortLabel: 'REVALIDA', logoSlug: 'inep-revalida', targetTab: 'revalida', targetQuestionIdx: 1 },
  { id: 'amp', name: 'AMP', shortLabel: 'AMP', logoSlug: 'amp', targetTab: 'residencia', targetQuestionIdx: 4 }
];

export interface LandingKpiMetric {
  id: string;
  prefix?: string;
  targetValue: number;
  suffix: string;
  label: string;
  sublabel: string;
}

export const LANDING_KPI_METRICS: LandingKpiMetric[] = [
  {
    id: 'questions',
    prefix: '+',
    targetValue: 200,
    suffix: ' mil',
    label: 'Questões curadas e auditadas',
    sublabel: 'Acesso Direto, Revalida, Internato e R+'
  },
  {
    id: 'commented',
    targetValue: 100,
    suffix: '%',
    label: 'Comentadas alternativa por alternativa',
    sublabel: 'Explicação do acerto e de cada distrator'
  },
  {
    id: 'bancas',
    prefix: '+',
    targetValue: 120,
    suffix: '',
    label: 'Bancas e instituições oficiais',
    sublabel: 'Provas na íntegra com cronômetro real'
  },
  {
    id: 'guarantee',
    targetValue: 7,
    suffix: ' dias',
    label: 'Garantia incondicional',
    sublabel: 'Reembolso integral sem burocracia'
  }
];

export interface ScientificAuthorityItem {
  acronym: string;
  fullName: string;
  scope: string;
}

export const SCIENTIFIC_AUTHORITIES: ScientificAuthorityItem[] = [
  { acronym: 'SBC', fullName: 'Sociedade Brasileira de Cardiologia', scope: 'Diretrizes de IC, SCA, HAS e Arritmias' },
  { acronym: 'FEBRASGO', fullName: 'Federação Brasileira de Ginecologia e Obstetrícia', scope: 'Pré-natal, Sangramentos e Oncologia Ginecológica' },
  { acronym: 'SBP', fullName: 'Sociedade Brasileira de Pediatria', scope: 'Neonatologia, Puericultura e Emergências' },
  { acronym: 'ATLS / CBC', fullName: 'Colégio Brasileiro de Cirurgiões & Trauma', scope: 'Atendimento Inicial ao Politraumatizado e Abdome Agudo' },
  { acronym: 'MS / PNI', fullName: 'Ministério da Saúde & Vigilância', scope: 'Calendário Vacinal, PCDTs e Atenção Primária' },
  { acronym: 'CFM / SUS', fullName: 'Conselho Federal de Medicina & Legislação', scope: 'Ética Médica, Bioética e Políticas de Saúde' }
];

export interface LandingPricingPlan {
  id: 'monthly' | 'semiannual' | 'annual' | 'biennial';
  name: string;
  badge?: string;
  tier: 'standard' | 'secondary_highlight' | 'primary_highlight';
  pricePerMonth: string;
  billingText: string;
  periodLabel: string;
  savingsLabel: string;
  hasSavings: boolean;
  audienceTag: string;
}

export const LANDING_PRICING_PLANS: LandingPricingPlan[] = [
  {
    id: 'monthly',
    name: 'Plano Mensal',
    tier: 'standard',
    pricePerMonth: '49,90',
    billingText: 'Cobrança mensal avulsa • Cancele quando quiser',
    periodLabel: '/mês',
    savingsLabel: 'Flexibilidade sem fidelidade',
    hasSavings: false,
    audienceTag: 'Para experimentar no seu ritmo'
  },
  {
    id: 'semiannual',
    name: 'Plano Semestral',
    badge: 'Reta Final • 6 Meses',
    tier: 'standard',
    pricePerMonth: '29,90',
    billingText: 'R$ 179,40 à vista ou até 6x de R$ 29,90 (sujeito a taxas)',
    periodLabel: '/mês',
    savingsLabel: 'Economize R$ 120,00 (40% OFF)',
    hasSavings: true,
    audienceTag: 'Ideal para revisão intensiva pré-prova'
  },
  {
    id: 'annual',
    name: 'Plano Anual',
    badge: 'Mais Escolhido • 1 Ano',
    tier: 'secondary_highlight',
    pricePerMonth: '25,90',
    billingText: 'R$ 310,80 à vista ou até 12x de R$ 25,90 (sujeito a taxas)',
    periodLabel: '/mês',
    savingsLabel: 'Economize R$ 288,00 (48% OFF)',
    hasSavings: true,
    audienceTag: 'Ciclo completo rumo à aprovação'
  },
  {
    id: 'biennial',
    name: 'Plano Bienal',
    badge: 'Melhor Custo-Benefício • 2 Anos',
    tier: 'primary_highlight',
    pricePerMonth: '19,90',
    billingText: 'Equivalente mensal nos 24 meses • R$ 477,60 à vista ou até 12x de R$ 39,80 (sujeito a taxas)',
    periodLabel: '/mês*',
    savingsLabel: 'Economize R$ 720,00 (60% OFF)',
    hasSavings: true,
    audienceTag: 'Perfeito para 5º e 6º ano (Internato)'
  }
];

export const INCLUDED_PLATFORM_FEATURES: string[] = [
  '+200 mil questões comentadas',
  'Provas na íntegra com cronômetro',
  'Flashcards FSRS & Método Cloze',
  'Resumos com Raio-X de Bancas',
  'Psicometria TRI & Percentil',
  'Caderno de Erros Automático',
  'Sincronização Google Agenda'
];

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const LANDING_FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Como funcionam as condições especiais de lançamento?',
    answer:
      'Durante o lote promocional de lançamento, os planos Semestral, Anual e Bienal contam com descontos progressivos de até 60% já aplicados. Todos os planos liberam 100% dos módulos da plataforma sem restrições ocultas: banco com +200 mil questões, simulados oficiais, flashcards FSRS, resumos estruturados e métricas psicométricas TRI.'
  },
  {
    id: 'faq-2',
    question: 'As resoluções comentam todas as alternativas ou apenas o gabarito?',
    answer:
      'As resoluções dissecam alternativa por alternativa (A, B, C, D e E). Além de fundamentar a conduta correta pelas diretrizes vigentes (SBC, FEBRASGO, SBP, ATLS, Ministério da Saúde), apontamos exatamente a pegadinha clínica de cada distrator para blindar seu raciocínio em prova.'
  },
  {
    id: 'faq-3',
    question: 'Quais bancas e modalidades estão contempladas nas +200 mil questões?',
    answer:
      'O acervo abrange Acesso Direto, Pré-Requisito (R+), Revalida INEP e Internato, reunindo provas oficiais de ENARE, USP-SP, UNICAMP, UNIFESP, SUS-SP, Einstein, IAMSPE, Santa Casa SP, AMRIGS, PSU-MG, SURCE, SES-PE, SES-DF, UERJ, UFRJ, AMP e mais de 120 instituições examinadoras.'
  },
  {
    id: 'faq-4',
    question: 'Como funcionam os Flashcards FSRS, o Método Cloze e os Resumos Clínicos?',
    answer:
      'Utilizamos o algoritmo moderno FSRS (Free Spaced Repetition Scheduler), que calibra o intervalo ótimo de revisão segundo sua curva individual de esquecimento, aliado a cartões de omissão cirúrgica (Cloze). Quando você erra uma questão, o sistema vincula os conceitos vulneráveis ao seu Caderno de Erros e aos Resumos Clínicos com gráficos de incidência real por banca.'
  },
  {
    id: 'faq-5',
    question: 'Posso estudar pelo celular no plantão, tablet e computador?',
    answer:
      'Sim. A interface do Hippocampus foi projetada com modo escuro neutro verdadeiro (#09090b — zero luz azul excessiva para leitura noturna e avaliação fiel de exames de imagem) e sincronização instantânea em nuvem entre smartphone, tablet e desktop.'
  },
  {
    id: 'faq-6',
    question: 'Como funciona a Garantia Incondicional de 7 Dias?',
    answer:
      'Em total conformidade com o Código de Defesa do Consumidor (Art. 49), você tem 7 dias corridos após a assinatura para testar toda a plataforma. Se desejar cancelar por qualquer motivo dentro desse prazo, devolvemos 100% do valor investido de forma imediata.'
  },
  {
    id: 'faq-7',
    question: 'Como funciona o Programa de Embaixadores para estudantes?',
    answer:
      'Assinantes ativos recebem um código exclusivo no painel para compartilhar com colegas de faculdade e internato: o colega ganha 10% de desconto imediato e você recebe 15% de comissão via PIX por indicação confirmada, podendo abater até 100% da sua anuidade.'
  }
];
