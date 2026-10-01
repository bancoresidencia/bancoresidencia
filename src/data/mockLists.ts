import { Folder, QuestionList } from '@/types';

export const initialFolders: Folder[] = [
  { id: 'f-clinica', name: 'Clínica Médica', parentId: null, color: '#3b82f6' },
  { id: 'f-cardio', name: 'Cardiologia', parentId: 'f-clinica', color: '#60a5fa' },
  { id: 'f-cirurgia', name: 'Cirurgia Geral', parentId: null, color: '#10b981' },
  { id: 'f-abdome', name: 'Abdome Agudo', parentId: 'f-cirurgia', color: '#34d399' },
  { id: 'f-pediatria', name: 'Pediatria', parentId: null, color: '#f59e0b' },
  { id: 'f-go', name: 'Ginecologia e Obstetrícia', parentId: null, color: '#ec4899' },
  { id: 'f-preventiva', name: 'Medicina Preventiva', parentId: null, color: '#8b5cf6' }
];

export const initialLists: QuestionList[] = [
  {
    id: 'list-1',
    title: 'Síndromes Coronarianas e Eletrocardiograma',
    folderId: 'f-cardio',
    questionIds: ['q-1'],
    totalQuestions: 25,
    completedQuestions: 18,
    lastStudiedAt: 'Hoje às 21:30',
    inProgress: true,
    progressPercentage: 72
  },
  {
    id: 'list-2',
    title: 'Abdome Agudo Inflamatório (Apendicite e Diverticulite)',
    folderId: 'f-abdome',
    questionIds: ['q-2'],
    totalQuestions: 30,
    completedQuestions: 12,
    lastStudiedAt: 'Ontem',
    inProgress: true,
    progressPercentage: 40
  },
  {
    id: 'list-3',
    title: 'Exantemas Febris na Infância',
    folderId: 'f-pediatria',
    questionIds: ['q-3'],
    totalQuestions: 15,
    completedQuestions: 15,
    lastStudiedAt: 'Há 3 dias',
    inProgress: false,
    progressPercentage: 100
  },
  {
    id: 'list-4',
    title: 'DHEG e Emergências Hipertensivas no Parto',
    folderId: 'f-go',
    questionIds: ['q-4'],
    totalQuestions: 20,
    completedQuestions: 5,
    lastStudiedAt: 'Há 4 dias',
    inProgress: true,
    progressPercentage: 25
  },
  {
    id: 'list-5',
    title: 'Bioestatística e Indicadores Epidemiológicos',
    folderId: 'f-preventiva',
    questionIds: ['q-5'],
    totalQuestions: 10,
    completedQuestions: 10,
    lastStudiedAt: 'Há 5 dias',
    inProgress: false,
    progressPercentage: 100
  }
];
