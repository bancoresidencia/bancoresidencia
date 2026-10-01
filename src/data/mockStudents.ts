import { StudentProfile } from '@/types';

// População simulada de estudantes para cálculo de percentil e ranking oficial
export const mockStudentsCohort: StudentProfile[] = [
  {
    id: 'st-01',
    name: 'Dr. Lucas Silveira',
    modalidade: 'Residência',
    institution: 'USP-SP',
    banca: 'FUVEST',
    answered: 1240,
    correct: 1042, // ~84%
    uniqueAnswered: 950,
    reviews: 180,
    repeated: 110,
    semester: '2026.1'
  },
  {
    id: 'st-02',
    name: 'Dra. Beatriz Mendes',
    modalidade: 'Residência',
    institution: 'ENARE',
    banca: 'FGV',
    answered: 980,
    correct: 804, // ~82%
    uniqueAnswered: 760,
    reviews: 140,
    repeated: 80,
    semester: '2026.1'
  },
  {
    id: 'st-03',
    name: 'Dr. Rafael Zanetti',
    modalidade: 'Residência',
    institution: 'UNIFESP',
    banca: 'VUNESP',
    answered: 750,
    correct: 592, // ~79%
    uniqueAnswered: 580,
    reviews: 110,
    repeated: 60,
    semester: '2026.1'
  },
  {
    id: 'st-04',
    name: 'Dra. Mariana Costa',
    modalidade: 'Residência',
    institution: 'UNICAMP',
    banca: 'FCM/UNICAMP',
    answered: 610,
    correct: 469, // ~77%
    uniqueAnswered: 480,
    reviews: 90,
    repeated: 40,
    semester: '2026.1'
  },
  {
    id: 'st-05',
    name: 'Dr. Thiago Arantes',
    modalidade: 'Residência',
    institution: 'UERJ',
    banca: 'CEPUERJ',
    answered: 540,
    correct: 399, // ~74%
    uniqueAnswered: 420,
    reviews: 80,
    repeated: 40,
    semester: '2026.1'
  },
  {
    id: 'st-06',
    name: 'Dra. Camila Duarte',
    modalidade: 'Residência',
    institution: 'SUS-SP',
    banca: 'VUNESP',
    answered: 510,
    correct: 367, // ~72%
    uniqueAnswered: 390,
    reviews: 70,
    repeated: 50,
    semester: '2026.1'
  },
  {
    id: 'st-07',
    name: 'Dr. Gabriel Martins',
    modalidade: 'Residência',
    institution: 'USP-SP',
    banca: 'FUVEST',
    answered: 380,
    correct: 266, // ~70%
    uniqueAnswered: 310,
    reviews: 50,
    repeated: 20,
    semester: '2026.1'
  },
  {
    id: 'st-08',
    name: 'Dra. Fernanda Rocha',
    modalidade: 'Residência',
    institution: 'ENARE',
    banca: 'FGV',
    answered: 310,
    correct: 207, // ~67%
    uniqueAnswered: 240,
    reviews: 45,
    repeated: 25,
    semester: '2026.1'
  },
  {
    id: 'st-09',
    name: 'Dr. Vinicius Prado',
    modalidade: 'Residência',
    institution: 'UFRJ',
    banca: 'IBFC',
    answered: 260,
    correct: 169, // ~65%
    uniqueAnswered: 200,
    reviews: 40,
    repeated: 20,
    semester: '2026.1'
  },
  {
    id: 'st-10',
    name: 'Dra. Letícia Carvalho',
    modalidade: 'Residência',
    institution: 'UFMG',
    banca: 'FGV',
    answered: 210,
    correct: 130, // ~62%
    uniqueAnswered: 160,
    reviews: 30,
    repeated: 20,
    semester: '2026.1'
  },
  {
    id: 'st-11',
    name: 'Dr. André Fonseca',
    modalidade: 'Residência',
    institution: 'SCMSP',
    banca: 'VUNESP',
    answered: 180,
    correct: 104, // ~58%
    uniqueAnswered: 130,
    reviews: 30,
    repeated: 20,
    semester: '2026.1'
  },
  {
    id: 'st-12',
    name: 'Dra. Juliana Neves',
    modalidade: 'Residência',
    institution: 'ENARE',
    banca: 'FGV',
    answered: 140,
    correct: 77, // ~55%
    uniqueAnswered: 110,
    reviews: 20,
    repeated: 10,
    semester: '2026.1'
  },
  {
    id: 'st-13',
    name: 'Dr. Rodrigo Barreto',
    modalidade: 'Residência',
    institution: 'UNIFESP',
    banca: 'VUNESP',
    answered: 110,
    correct: 57, // ~52%
    uniqueAnswered: 85,
    reviews: 15,
    repeated: 10,
    semester: '2026.1'
  },
  {
    id: 'st-14',
    name: 'Dra. Larissa Toledo',
    modalidade: 'Residência',
    institution: 'UNICAMP',
    banca: 'FCM/UNICAMP',
    answered: 95,
    correct: 45, // ~47%
    uniqueAnswered: 75,
    reviews: 12,
    repeated: 8,
    semester: '2026.1'
  },
  {
    id: 'st-15',
    name: 'Dr. Matheus Albuquerque',
    modalidade: 'Residência',
    institution: 'UERJ',
    banca: 'CEPUERJ',
    answered: 85,
    correct: 38,
    uniqueAnswered: 65,
    reviews: 12,
    repeated: 8,
    semester: '2026.1'
  },
  {
    id: 'st-16',
    name: 'Dra. Carolina Lima',
    modalidade: 'Revalida',
    institution: 'ENARE',
    banca: 'FGV',
    answered: 620,
    correct: 465,
    uniqueAnswered: 500,
    reviews: 80,
    repeated: 40,
    semester: '2026.1'
  },
  {
    id: 'st-17',
    name: 'Dr. Felipe Azevedo',
    modalidade: 'Graduação / Internato',
    institution: 'USP-SP',
    banca: 'FUVEST',
    answered: 340,
    correct: 245,
    uniqueAnswered: 270,
    reviews: 45,
    repeated: 25,
    semester: '2026.1'
  },
  // Alunos no semestre 2026.2 (simulação do segundo semestre)
  {
    id: 'st-18',
    name: 'Dra. Tatiana Moura',
    modalidade: 'Residência',
    institution: 'USP-SP',
    banca: 'FUVEST',
    answered: 890,
    correct: 740,
    uniqueAnswered: 700,
    reviews: 120,
    repeated: 70,
    semester: '2026.2'
  },
  {
    id: 'st-19',
    name: 'Dr. Gustavo Ramos',
    modalidade: 'Residência',
    institution: 'ENARE',
    banca: 'FGV',
    answered: 640,
    correct: 505,
    uniqueAnswered: 510,
    reviews: 80,
    repeated: 50,
    semester: '2026.2'
  },
  {
    id: 'st-20',
    name: 'Dra. Sofia Gouveia',
    modalidade: 'Residência',
    institution: 'UNIFESP',
    banca: 'VUNESP',
    answered: 530,
    correct: 397,
    uniqueAnswered: 410,
    reviews: 70,
    repeated: 50,
    semester: '2026.2'
  }
];
