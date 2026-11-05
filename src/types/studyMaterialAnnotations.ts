export type HighlightColor = 'yellow' | 'green' | 'red' | 'blue' | 'purple';

export type HighlightStyle = 'highlight' | 'underline' | 'strikethrough';

export interface StudyHighlight {
  id: string;
  materialId: string;
  userId?: string | null;
  textQuote: string;
  color: HighlightColor;
  style: HighlightStyle;
  note?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface HighlightColorConfig {
  id: HighlightColor;
  label: string;
  medicalMeaning: string;
  hex: string;
  dotClass: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  activeRingClass: string;
}

export const HIGHLIGHT_COLORS: Record<HighlightColor, HighlightColorConfig> = {
  yellow: {
    id: 'yellow',
    label: 'Alto Rendimento',
    medicalMeaning: 'Conceito essencial e definições-chave',
    hex: '#eab308',
    dotClass: 'bg-amber-400',
    bgClass: 'bg-amber-300/35 dark:bg-amber-400/25 text-amber-950 dark:text-amber-100',
    borderClass: 'border-b-2 border-amber-400 dark:border-amber-500',
    textClass: 'text-amber-700 dark:text-amber-300',
    activeRingClass: 'ring-2 ring-amber-400 ring-offset-2'
  },
  green: {
    id: 'green',
    label: 'Conduta & Tratamento',
    medicalMeaning: 'Conduta padrão-ouro, doses e terapias de 1ª linha',
    hex: '#10b981',
    dotClass: 'bg-emerald-500',
    bgClass: 'bg-emerald-300/35 dark:bg-emerald-500/25 text-emerald-950 dark:text-emerald-100',
    borderClass: 'border-b-2 border-emerald-400 dark:border-emerald-500',
    textClass: 'text-emerald-700 dark:text-emerald-300',
    activeRingClass: 'ring-2 ring-emerald-500 ring-offset-2'
  },
  red: {
    id: 'red',
    label: 'Contraindicação & Alerta',
    medicalMeaning: 'Efeitos adversos graves, sinais de alarme e pegadinhas',
    hex: '#f43f5e',
    dotClass: 'bg-rose-500',
    bgClass: 'bg-rose-300/35 dark:bg-rose-500/25 text-rose-950 dark:text-rose-100',
    borderClass: 'border-b-2 border-rose-400 dark:border-rose-500',
    textClass: 'text-rose-700 dark:text-rose-300',
    activeRingClass: 'ring-2 ring-rose-500 ring-offset-2'
  },
  blue: {
    id: 'blue',
    label: 'Diagnóstico & Propedêutica',
    medicalMeaning: 'Exame padrão-ouro, achados clínicos e critérios',
    hex: '#0ea5e9',
    dotClass: 'bg-sky-500',
    bgClass: 'bg-sky-300/35 dark:bg-sky-500/25 text-sky-950 dark:text-sky-100',
    borderClass: 'border-b-2 border-sky-400 dark:border-sky-500',
    textClass: 'text-sky-700 dark:text-sky-300',
    activeRingClass: 'ring-2 ring-sky-500 ring-offset-2'
  },
  purple: {
    id: 'purple',
    label: 'Epidemiologia & Provas',
    medicalMeaning: 'Prevalências, estatísticas e recorrência de bancas',
    hex: '#a855f7',
    dotClass: 'bg-purple-500',
    bgClass: 'bg-purple-300/35 dark:bg-purple-500/25 text-purple-950 dark:text-purple-100',
    borderClass: 'border-b-2 border-purple-400 dark:border-purple-500',
    textClass: 'text-purple-700 dark:text-purple-300',
    activeRingClass: 'ring-2 ring-purple-500 ring-offset-2'
  }
};

export interface MedicalGlossaryEntry {
  term: string;
  fullName: string;
  definition: string;
  examTip: string;
  category: 'obstetricia' | 'ginecologia' | 'cardiologia' | 'cirurgia' | 'pediatria' | 'clinica' | 'geral';
}

