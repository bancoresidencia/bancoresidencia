import { SpecialtyHierarchy, StudyModalidade, Question } from '@/types';

export const medevoModalidades: StudyModalidade[] = [
  'Residência Médica',
  'Revalida',
  'Ciclo Básico',
  'R+ Clínica Médica',
  'R+ Pediatria',
  'R+ Cirurgia',
  'R+ Ginecologia e Obstetrícia',
  'R+ Neuropediatria',
  'Título de Oftalmologia (CBO)',
  'Título Clínica Médica (TECM)'
];

export const medevoTiposProva = [
  'Prova 1',
  'Prova 2',
  '2ª Aplicação',
  'Suplementar',
  'Pró-Residência MFC',
  'Segunda Entrada'
];

export const medevoAnos = Array.from({ length: 18 }, (_, i) => 2027 - i); // 2027 até 2010

import { allInstituicoesSiglas, medicalInstitutionsDirectory, bancasExaminadorasOficiais } from './instituicoesData';

export const medevoInstituicoes: string[] = allInstituicoesSiglas;
export { medicalInstitutionsDirectory, bancasExaminadorasOficiais };

import { clinicaMedicaHierarchy } from './clinicaMedicaData';
import { cirurgiaHierarchy } from './cirurgiaData';
import { pediatriaHierarchy } from './pediatriaData';
import { obstetriciaHierarchy } from './obstetriciaData';
import { ginecologiaHierarchy } from './ginecologiaData';
import { preventivaHierarchy } from './preventivaData';

// Hierarquia completa extraída do banco Supabase com Especialidade, Tema, Foco e Subfoco
export const medevoHierarchy: SpecialtyHierarchy[] = [
  clinicaMedicaHierarchy,
  cirurgiaHierarchy,
  pediatriaHierarchy,
  obstetriciaHierarchy,
  ginecologiaHierarchy,
  preventivaHierarchy
];

// As questões são 100% carregadas dinamicamente da API do Supabase (132.965 questões).
// Nenhuma questão sintética/mock é mantida localmente.
export const mockQuestions: Question[] = [];

export const mockInstitutionsList = medevoInstituicoes;
export const mockInstitutions = ['Todas', ...mockInstitutionsList];
export const mockBancas = ['Todas', ...bancasExaminadorasOficiais.map((b) => b.split(' (')[0])];
export const mockSpecialties = [
  'Todas',
  'Clínica Médica',
  'Cirurgia Geral',
  'Cirurgia',
  'Pediatria',
  'Ginecologia',
  'Obstetrícia',
  'Ginecologia e Obstetrícia',
  'Medicina Preventiva e Social'
];
export const mockYears = ['Todos', '2027', '2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2014', '2013', '2012', '2011', '2010'];
export const mockDifficulties = ['Todas', 'Fácil', 'Médio', 'Difícil', 'Desconhecido'];
