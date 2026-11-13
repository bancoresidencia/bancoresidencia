import { SpecialtyHierarchy, StudyModalidade, Question } from '@/types';

export const studyModalidades: StudyModalidade[] = [
  'Acesso Direto',
  'Revalida',
  'R+',
  'Título de Especialista',
  'Residência Médica',
  'Ciclo Básico',
  'R+ Clínica Médica',
  'R+ Pediatria',
  'R+ Cirurgia',
  'R+ Ginecologia e Obstetrícia',
  'R+ Neuropediatria',
  'Título de Oftalmologia (CBO)',
  'Título Clínica Médica (TECM)'
];

export const tiposProva = [
  'Prova 1',
  'Prova 2',
  '2ª Aplicação',
  'Suplementar',
  'Pró-Residência MFC',
  'Segunda Entrada'
];

export const anosLista = Array.from({ length: 18 }, (_, i) => 2027 - i); // 2027 até 2010

import { allInstituicoesSiglas, medicalInstitutionsDirectory, bancasExaminadorasOficiais } from './instituicoesData';

export const instituicoesSiglas: string[] = allInstituicoesSiglas;
export { medicalInstitutionsDirectory, bancasExaminadorasOficiais };

import { clinicaMedicaHierarchy } from './clinicaMedicaData';
import { cirurgiaHierarchy } from './cirurgiaData';
import { pediatriaHierarchy } from './pediatriaData';
import { obstetriciaHierarchy } from './obstetriciaData';
import { ginecologiaHierarchy } from './ginecologiaData';
import { preventivaHierarchy } from './preventivaData';

export const outrasHierarchy: SpecialtyHierarchy = {
  especialidade: 'Outras / Em Curadoria',
  temas: [
    {
      tema: 'Aguardando Classificação por Subespecialidade',
      focos: [
        {
          foco: 'Geral / Não categorizada',
          subfocos: ['Geral']
        }
      ]
    }
  ]
};

// Hierarquia completa padronizada com Especialidade, Tema, Foco e Subfoco
export const clinicalHierarchy: SpecialtyHierarchy[] = [
  clinicaMedicaHierarchy,
  cirurgiaHierarchy,
  pediatriaHierarchy,
  obstetriciaHierarchy,
  ginecologiaHierarchy,
  preventivaHierarchy,
  outrasHierarchy
];

// As questões são 100% carregadas dinamicamente da API do Supabase (132.965 questões).
// Nenhuma questão sintética/mock é mantida localmente.
export const mockQuestions: Question[] = [];

export const mockInstitutionsList = instituicoesSiglas;
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
  'Medicina Preventiva e Social',
  'Outras / Em Curadoria'
];
export const mockYears = ['Todos', '2027', '2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2014', '2013', '2012', '2011', '2010', '2009', '2008', '2007', '2006', '2005', '2004'];
export const mockDifficulties = ['Todas', 'Fácil', 'Médio', 'Difícil', 'Desconhecido'];
