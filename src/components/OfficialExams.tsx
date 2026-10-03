'use client';

import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Play,
  Calendar,
  Building2
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface OfficialExamItem {
  id: string;
  name: string;
  institution: string;
  banca: string;
  ano: number;
  questionsCount: number;
  region: 'Nacional' | 'São Paulo' | 'Rio de Janeiro' | 'Sul';
  tag: string;
  description: string;
}

interface OfficialExamsProps {
  onStartExam: (institution: string, year: number, banca?: string) => void;
  onExploreInFilters?: (institution: string, year: number) => void;
}

const officialExamsData: OfficialExamItem[] = [
  {
    id: 'enare-2024',
    name: 'ENARE 2024 — Exame Nacional de Residência',
    institution: 'ENARE',
    banca: 'FGV Concursos',
    ano: 2024,
    questionsCount: 100,
    region: 'Nacional',
    tag: 'Nacional',
    description: 'Prova oficial aplicada nacionalmente para mais de 80 hospitais universitários federais.'
  },
  {
    id: 'usp-sp-2024',
      name: 'USP São Paulo 2024 (FUVEST)',
      institution: 'USP-SP',
      banca: 'FUVEST Residência',
      ano: 2024,
      questionsCount: 100,
      region: 'São Paulo',
      tag: 'SP',
      description: 'Caderno oficial da Faculdade de Medicina da Universidade de São Paulo (FMUSP).'
    },
    {
      id: 'unicamp-2024',
      name: 'UNICAMP 2024 — Residência Médica',
      institution: 'UNICAMP',
      banca: 'Comissão de Residência UNICAMP',
      ano: 2024,
      questionsCount: 80,
      region: 'São Paulo',
      tag: 'SP',
      description: 'Prova de acesso direto da Faculdade de Ciências Médicas da Unicamp.'
    },
    {
      id: 'sus-sp-2024',
      name: 'SUS-SP 2024 — Processo Seletivo Unificado',
      institution: 'SUS-SP',
      banca: 'Fundação VUNESP',
      ano: 2024,
      questionsCount: 100,
      region: 'São Paulo',
      tag: 'SP',
      description: 'O maior processo seletivo unificado de residência do país com dezenas de instituições participantes.'
    },
    {
      id: 'unifesp-2023',
      name: 'UNIFESP 2023 — Escola Paulista de Medicina',
      institution: 'UNIFESP',
      banca: 'UNIFESP / FAP',
      ano: 2023,
      questionsCount: 100,
      region: 'São Paulo',
      tag: 'SP',
      description: 'Caderno oficial da EPM/UNIFESP para programas de Acesso Direto.'
    },
    {
      id: 'amrigs-2023',
      name: 'AMRIGS 2023 — Exame AMRIGS',
      institution: 'AMRIGS',
      banca: 'Associação Médica do RS',
      ano: 2023,
      questionsCount: 100,
      region: 'Sul',
      tag: 'Sul',
      description: 'Exame de seleção unificado para dezenas de hospitais no RS, SC e outros estados.'
    },
    {
      id: 'uerj-2024',
      name: 'UERJ 2024 — Universidade do Estado do RJ',
      institution: 'UERJ',
      banca: 'CEPUERJ',
      ano: 2024,
      questionsCount: 100,
      region: 'Rio de Janeiro',
      tag: 'RJ',
      description: 'Prova oficial para ingresso no Hospital Universitário Pedro Ernesto (HUPE/UERJ).'
    },
    {
      id: 'sms-rj-2024',
      name: 'SMS-RJ 2024 — Residência Municipal',
      institution: 'SMS-RJ',
      banca: 'IBFC / Prefeitura RJ',
      ano: 2024,
      questionsCount: 100,
      region: 'Rio de Janeiro',
      tag: 'RJ',
      description: 'Caderno oficial da Secretaria Municipal de Saúde da Cidade do Rio de Janeiro.'
    }
  ];

export const OfficialExams: React.FC<OfficialExamsProps> = ({
  onStartExam
}) => {
  const { accentConfig } = useTheme();
  const [selectedRegion, setSelectedRegion] = useState<string>('Todas');
  const [selectedYear, setSelectedYear] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredExams = useMemo(() => {
    return officialExamsData.filter((exam) => {
      if (selectedRegion !== 'Todas' && exam.region !== selectedRegion) {
        return false;
      }
      if (selectedYear !== 'Todos' && exam.ano.toString() !== selectedYear) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = exam.name.toLowerCase().includes(query);
        const matchesInst = exam.institution.toLowerCase().includes(query);
        const matchesBanca = exam.banca.toLowerCase().includes(query);
        const matchesDesc = exam.description.toLowerCase().includes(query);
        if (!matchesName && !matchesInst && !matchesBanca && !matchesDesc) {
          return false;
        }
      }
      return true;
    });
  }, [selectedRegion, selectedYear, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Topo / Hero Card */}
      <div className="bento-card bg-white dark:bg-[#070d18] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
              style={{ backgroundColor: accentConfig.bgRgba, color: accentConfig.primaryHex }}
            >
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Provas de Residência Médica na Íntegra
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Resolva cadernos oficiais aplicados pelas principais bancas e instituições do país com correção imediata.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {filteredExams.length} {filteredExams.length === 1 ? 'prova disponível' : 'provas disponíveis'}
            </span>
          </div>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="pt-2 flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Campo de Busca */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por prova, instituição (USP, ENARE, SUS-SP) ou banca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro por Região */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {['Todas', 'Nacional', 'São Paulo', 'Rio de Janeiro', 'Sul'].map((reg) => (
              <button
                key={reg}
                type="button"
                onClick={() => setSelectedRegion(reg)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  selectedRegion === reg
                    ? 'text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                style={{
                  backgroundColor: selectedRegion === reg ? accentConfig.primaryHex : undefined
                }}
              >
                {reg}
              </button>
            ))}
          </div>

          {/* Filtro por Ano */}
          <div className="flex items-center gap-1.5 shrink-0">
            {['Todos', '2024', '2023'].map((ano) => (
              <button
                key={ano}
                type="button"
                onClick={() => setSelectedYear(ano)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedYear === ano
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {ano}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grade de Provas */}
      {filteredExams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredExams.map((exam) => (
            <div
              key={exam.id}
              className="bento-card bg-white dark:bg-[#070d18] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 rounded-3xl p-5 sm:p-6 transition-all shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 uppercase tracking-wider">
                    {exam.tag}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{exam.ano}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white line-clamp-2">
                    {exam.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{exam.banca}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {exam.description}
                </p>

                {/* Metadados */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold border border-blue-200/50 dark:border-blue-900/50">
                    {exam.questionsCount} Questões
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/50 dark:border-emerald-900/50">
                    Gabarito Oficial
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold border border-purple-200/50 dark:border-purple-900/50">
                    Acesso Direto
                  </span>
                </div>
              </div>

              {/* Botão para Resolver Prova Diretamente */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onStartExam(exam.institution, exam.ano, exam.banca)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs sm:text-sm font-extrabold text-white shadow-md transition-all hover:scale-102 cursor-pointer"
                  style={{ backgroundColor: accentConfig.primaryHex }}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Resolver Prova Completa</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-[#070d18] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
            Nenhuma prova encontrada
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Não foram encontradas provas correspondentes aos filtros selecionados.
          </p>
        </div>
      )}
    </div>
  );
};
