import { ErrorReasonType } from '@/types';

export const ERROR_REASON_CONFIG: Record<
  ErrorReasonType,
  { label: string; icon: string; bg: string; text: string; border: string; desc: string }
> = {
  lacuna_teorica: {
    label: 'Lacuna Teórica',
    icon: '🧠',
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-300 dark:border-rose-800/60',
    desc: 'Não lembrava do conceito, critério ou conduta.'
  },
  desatencao: {
    label: 'Falta de Atenção',
    icon: '⚡',
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-800/60',
    desc: 'Sabia o conteúdo, mas errou por leitura rápida ou distração.'
  },
  duvida_entre_duas: {
    label: 'Dúvida entre 2',
    icon: '⚖️',
    bg: 'bg-sky-500/10 dark:bg-sky-500/15',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-300 dark:border-sky-800/60',
    desc: 'Eliminou as outras, mas escolheu o distrator final.'
  },
  interpretacao: {
    label: 'Interpretação',
    icon: '📄',
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-300 dark:border-indigo-800/60',
    desc: 'Confundiu o comando da questão ou enunciado longo.'
  },
  pegadinha: {
    label: 'Pegadinha de Banca',
    icon: '🪤',
    bg: 'bg-purple-500/10 dark:bg-purple-500/15',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-300 dark:border-purple-800/60',
    desc: 'Exceção ou detalhe capcioso formulado pela banca.'
  },
  tempo_esgotado: {
    label: 'Pressão de Tempo',
    icon: '⏳',
    bg: 'bg-orange-500/10 dark:bg-orange-500/15',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-300 dark:border-orange-800/60',
    desc: 'Sem tempo para raciocinar, precisou chutar.'
  },
  outro: {
    label: 'Outro Motivo',
    icon: '📌',
    bg: 'bg-zinc-500/10 dark:bg-zinc-500/15',
    text: 'text-zinc-700 dark:text-zinc-300',
    border: 'border-zinc-300 dark:border-zinc-700/60',
    desc: 'Outro fator pessoal ou questão ambígua.'
  }
};
