export type HighlighterColor = 'yellow' | 'green' | 'pink' | 'blue' | 'orange' | 'purple';

export type HighlightStyle = 'highlight' | 'underline' | 'strikethrough';

export interface StudyHighlight {
  id: string;
  materialId: string;
  userId?: string | null;
  textQuote: string;
  color: HighlighterColor;
  style: HighlightStyle;
  note?: string;
  prefix?: string;
  suffix?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface HighlightColorConfig {
  name: string;
  hex: string;
  borderHex: string;
  bg: string;
  border: string;
  ring: string;
  markClass: string;
}

// Mesmas cores e hexadecimais canônicos do QuestionCard.tsx (Resolução de Provas)
export const HIGHLIGHTER_COLORS: Record<HighlighterColor, HighlightColorConfig> = {
  yellow: {
    name: 'Amarelo',
    hex: '#fcd34d',
    borderHex: '#f59e0b',
    bg: 'bg-amber-300',
    border: 'border-amber-500',
    ring: 'ring-amber-400/50',
    markClass: 'bg-amber-300 dark:bg-amber-400 text-black dark:text-black font-semibold border-b-2 border-amber-500'
  },
  green: {
    name: 'Verde',
    hex: '#6ee7b7',
    borderHex: '#10b981',
    bg: 'bg-emerald-300',
    border: 'border-emerald-500',
    ring: 'ring-emerald-400/50',
    markClass: 'bg-emerald-300 dark:bg-emerald-400 text-black dark:text-black font-semibold border-b-2 border-emerald-500'
  },
  pink: {
    name: 'Rosa',
    hex: '#f9a8d4',
    borderHex: '#ec4899',
    bg: 'bg-pink-300',
    border: 'border-pink-500',
    ring: 'ring-pink-400/50',
    markClass: 'bg-pink-300 dark:bg-pink-400 text-black dark:text-black font-semibold border-b-2 border-pink-500'
  },
  blue: {
    name: 'Azul',
    hex: '#7dd3fc',
    borderHex: '#0ea5e9',
    bg: 'bg-sky-300',
    border: 'border-sky-500',
    ring: 'ring-sky-400/50',
    markClass: 'bg-sky-300 dark:bg-sky-400 text-black dark:text-black font-semibold border-b-2 border-sky-500'
  },
  orange: {
    name: 'Laranja',
    hex: '#fdba74',
    borderHex: '#f97316',
    bg: 'bg-orange-300',
    border: 'border-orange-500',
    ring: 'ring-orange-400/50',
    markClass: 'bg-orange-300 dark:bg-orange-400 text-black dark:text-black font-semibold border-b-2 border-orange-500'
  },
  purple: {
    name: 'Roxo',
    hex: '#d8b4fe',
    borderHex: '#a855f7',
    bg: 'bg-purple-300',
    border: 'border-purple-500',
    ring: 'ring-purple-400/50',
    markClass: 'bg-purple-300 dark:bg-purple-400 text-black dark:text-black font-semibold border-b-2 border-purple-500'
  }
};

// Aliases retrocompatíveis
export type HighlightColor = HighlighterColor;
export const HIGHLIGHT_COLORS = HIGHLIGHTER_COLORS;

export interface MedicalGlossaryEntry {
  term: string;
  fullName: string;
  definition: string;
  examTip: string;
  category: 'obstetricia' | 'ginecologia' | 'cardiologia' | 'cirurgia' | 'pediatria' | 'clinica' | 'geral';
}
