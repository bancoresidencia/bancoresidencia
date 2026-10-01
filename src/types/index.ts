export interface Question {
  id: string;
  code: string;
  institution: string;
  year: number;
  specialty: 'Clínica Médica' | 'Cirurgia Geral' | 'Pediatria' | 'Ginecologia e Obstetrícia' | 'Medicina Preventiva e Social';
  subtheme: string;
  difficulty: 'Fácil' | 'Média' | 'Difícil';
  statement: string;
  options: {
    letter: 'A' | 'B' | 'C' | 'D' | 'E';
    text: string;
  }[];
  correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E';
  commentary: string;
  references?: string[];
}

export interface UserStats {
  totalAnswered: number;
  totalCorrect: number;
  totalIncorrect: number;
  accuracyRate: number;
  streakDays: number;
  studyTimeMinutes: number;
  historyByDay: {
    date: string;
    answered: number;
    correct: number;
  }[];
  bySpecialty: {
    specialty: string;
    total: number;
    correct: number;
    accuracy: number;
  }[];
}

export interface FilterState {
  specialty: string;
  institution: string;
  year: string;
  difficulty: string;
  search: string;
}
