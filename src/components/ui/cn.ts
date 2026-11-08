import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utilitário canônico de composição condicional e mesclagem inteligente de classes CSS
 * Combina clsx para avaliação de booleanos/objetos e tailwind-merge para resolução de conflitos de utilitários Tailwind.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export default cn;

