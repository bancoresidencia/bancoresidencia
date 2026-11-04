export type RecurrenceTrend = 'alta' | 'estavel' | 'queda';

export type RecurrencePriority = 'Crítica' | 'Alta' | 'Média';

export interface BancaPatternDetail {
  howItCharges: string; // Como a banca cobra este tópico
  trapAlert?: string;   // Pegadinha clássica / armadilha de distrator
  questionStyle?: string; // Estilo de questão (ex: Caso Clínico, Direta, etc.)
}

export interface RecurrenceSliceItem {
  id: number;
  name: string;
  shortName: string;
  percentage: number; // 0 a 100 (garantido soma total = 100.0)
  questionCount: number;
  priority: RecurrencePriority;
  color: string;
  trend: RecurrenceTrend;
  trendLabel?: string; // Ex: "🔥 Em Alta (2024-2026)" ou "🏛️ Clássico Estável"
  takeaway: string; // Resumo cirúrgico de prova / armadilha do distrator
  focusExplanation?: string; // Explicação clínica canônica densa (Imagem 3)
  bancaPatterns?: Record<string, string | BancaPatternDetail>; // Como a banca selecionada cobra
  auditQuestionIds?: string[]; // Rastreabilidade estrita: IDs reais das questões
}

export interface BancaSubfocoStat {
  subfoco: string;
  questionCount: number;
  percentageInBanca: number;
}

export interface BancaBreakdownItem {
  banca: string;
  totalQuestions: number;
  topSubfocos: BancaSubfocoStat[];
  predominantDifficulty: 'Fácil' | 'Médio' | 'Difícil';
}

export interface FocusExamAnalytics {
  id?: string;
  focusSlug: string;
  specialty: string;
  theme: string;
  focus: string;
  totalQuestions: number;
  timeframeRange: string; // Ex: "2017-2026"
  version: number;
  donutSlices: RecurrenceSliceItem[];
  bancaBreakdown: Record<string, BancaBreakdownItem>;
  topTraps: Array<{
    subfoco: string;
    trapTitle: string;
    trapDescription: string;
  }>;
  auditHash: string; // Hash SHA-256 de certificação
  needsRecalc: boolean;
  lastRecalculatedAt: string;
  certifiedAt?: string;
  status: 'draft' | 'certified' | 'deprecated';
}

