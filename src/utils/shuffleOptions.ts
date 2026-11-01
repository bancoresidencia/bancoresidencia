import { QuestionOption } from '@/types';

export type OptionLetter = 'A' | 'B' | 'C' | 'D' | 'E';

export interface ShuffledQuestionResult {
  options: QuestionOption[];
  newCorrectAnswer: OptionLetter | '' | 'ANULADA';
  /** Mapeia a letra original -> nova letra */
  originalToNewMapping: Record<string, OptionLetter>;
  /** Mapeia a nova letra -> letra original */
  newToOriginalMapping: Record<OptionLetter, string>;
  /** Retorna qual é a nova letra para o erro anterior do aluno */
  remappedPreviousLetter?: OptionLetter;
}

const LETTERS: OptionLetter[] = ['A', 'B', 'C', 'D', 'E'];

/**
 * Embaralha as alternativas de uma questão para evitar o viés de memória visual,
 * mantendo estritamente íntegros o gabarito oficial, as explicações pedagógicas
 * e a rastreabilidade do erro anterior do estudante.
 */
export function shuffleQuestionOptions(
  originalOptions: QuestionOption[] = [],
  originalCorrectAnswer: string = '',
  shouldShuffle: boolean = true,
  previousLetter?: OptionLetter
): ShuffledQuestionResult {
  // Se não deve embaralhar ou a lista de opções tem 1 ou menos itens
  if (!shouldShuffle || originalOptions.length <= 1) {
    const originalToNewMapping: Record<string, OptionLetter> = {};
    const newToOriginalMapping = {} as Record<OptionLetter, string>;

    originalOptions.forEach((opt) => {
      originalToNewMapping[opt.letter] = opt.letter;
      newToOriginalMapping[opt.letter] = opt.letter;
    });

    return {
      options: originalOptions,
      newCorrectAnswer: (originalCorrectAnswer || '') as OptionLetter | '' | 'ANULADA',
      originalToNewMapping,
      newToOriginalMapping,
      remappedPreviousLetter: previousLetter
    };
  }

  // Clona o array original para não mutar estado
  const shuffled = [...originalOptions];

  // Algoritmo Fisher-Yates clássico
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }

  const originalToNewMapping: Record<string, OptionLetter> = {};
  const newToOriginalMapping = {} as Record<OptionLetter, string>;
  let newCorrectAnswer: OptionLetter | '' | 'ANULADA' = originalCorrectAnswer as OptionLetter | '' | 'ANULADA';

  // Atribui as novas letras A-E na ordem embaralhada
  const remappedOptions: QuestionOption[] = shuffled.map((opt, index) => {
    const assignedLetter = LETTERS[index] || opt.letter;
    const oldLetter = opt.letter;

    originalToNewMapping[oldLetter] = assignedLetter;
    newToOriginalMapping[assignedLetter] = oldLetter;

    if (oldLetter === originalCorrectAnswer) {
      newCorrectAnswer = assignedLetter;
    }

    return {
      ...opt,
      letter: assignedLetter
    };
  });

  // Se a questão é anulada, mantém ANULADA
  if (originalCorrectAnswer === 'ANULADA') {
    newCorrectAnswer = 'ANULADA';
  }

  const remappedPreviousLetter = previousLetter ? originalToNewMapping[previousLetter] : undefined;

  return {
    options: remappedOptions,
    newCorrectAnswer,
    originalToNewMapping,
    newToOriginalMapping,
    remappedPreviousLetter
  };
}
