'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  Stethoscope,
  Building2,
  FileCheck2,
  Folder,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { ActiveTab, QuestionList } from '@/types';
import { mockQuestions, medevoHierarchy, medevoInstituicoes } from '@/data/mockQuestions';

interface GlobalSearchBarProps {
  onNavigate: (tab: ActiveTab) => void;
  onSearchQuestions: (searchTerm: string) => void;
  onSelectSpecialty: (specialty: string, tema?: string) => void;
  onSelectInstitution: (institution: string) => void;
  onSelectList?: (listId: string) => void;
  onSelectQuestion?: (questionId: string) => void;
  lists?: QuestionList[];
  placeholder?: string;
}

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  onNavigate,
  onSearchQuestions,
  onSelectSpecialty,
  onSelectInstitution,
  onSelectList,
  onSelectQuestion,
  lists = [],
  placeholder = 'Pesquisa geral (questões, temas, especialidades, bancas)...'
}) => {
  const { accentConfig } = useTheme();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Tecla de atalho Ctrl+K / Cmd+K para focar na pesquisa
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Normalização para busca sem acentos
  const normalize = (text: string) =>
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  // Resultados calculados
  const searchResults = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return {
        questions: [],
        specialties: [],
        institutions: [],
        simulados: [],
        lists: [],
        total: 0
      };
    }

    const qNorm = normalize(trimmed);

    // 1. Questões correspondentes (até 4)
    const matchingQuestions = mockQuestions
      .filter((q) => {
        const inStatement = normalize(q.statement).includes(qNorm);
        const inCode = normalize(q.code).includes(qNorm);
        const inTema = q.tema ? normalize(q.tema).includes(qNorm) : false;
        const inSubfoco = q.subfoco ? normalize(q.subfoco).includes(qNorm) : false;
        const inFoco = q.foco ? normalize(q.foco).includes(qNorm) : false;
        const inInst = q.institution ? normalize(q.institution).includes(qNorm) : false;
        return inStatement || inCode || inTema || inSubfoco || inFoco || inInst;
      })
      .slice(0, 4);

    // 2. Especialidades e Temas correspondentes (até 4)
    const matchingSpecialties: { specialty: string; tema?: string; type: 'esp' | 'tema' }[] = [];
    for (const esp of medevoHierarchy) {
      if (normalize(esp.especialidade).includes(qNorm)) {
        if (!matchingSpecialties.some((m) => m.specialty === esp.especialidade && !m.tema)) {
          matchingSpecialties.push({ specialty: esp.especialidade, type: 'esp' });
        }
      }
      for (const t of esp.temas) {
        if (normalize(t.tema).includes(qNorm)) {
          if (!matchingSpecialties.some((m) => m.specialty === esp.especialidade && m.tema === t.tema)) {
            matchingSpecialties.push({ specialty: esp.especialidade, tema: t.tema, type: 'tema' });
          }
        }
      }
      if (matchingSpecialties.length >= 4) break;
    }

    // 3. Bancas e Instituições correspondentes (até 4)
    const matchingInstitutions = medevoInstituicoes
      .filter((inst) => normalize(inst).includes(qNorm))
      .slice(0, 4);

    // 4. Simulados Oficiais
    const officialExams = [
      { id: 'ex-1', title: 'Simulado Nacional ENARE 2024 / 2025', banca: 'FGV Concursos' },
      { id: 'ex-2', title: 'Simulado Específico USP-SP 2024', banca: 'FUVEST Residência' },
      { id: 'ex-3', title: 'Simulado Express: Cirurgia e Clínica Médica', banca: 'Bancas Mistas' },
      { id: 'ex-4', title: 'Simulado SUS-SP / UNIFESP', banca: 'Fundação VUNESP' }
    ];
    const matchingSimulados = officialExams.filter(
      (ex) => normalize(ex.title).includes(qNorm) || normalize(ex.banca).includes(qNorm)
    );

    // 5. Cadernos e Listas do Aluno
    const matchingLists = lists
      .filter((l) => normalize(l.title).includes(qNorm))
      .slice(0, 3);

    const total =
      matchingQuestions.length +
      matchingSpecialties.length +
      matchingInstitutions.length +
      matchingSimulados.length +
      matchingLists.length;

    return {
      questions: matchingQuestions,
      specialties: matchingSpecialties.slice(0, 4),
      institutions: matchingInstitutions,
      simulados: matchingSimulados,
      lists: matchingLists,
      total
    };
  }, [query, lists]);

  const handleExecuteGeneralSearch = (customQuery?: string) => {
    const finalQuery = customQuery !== undefined ? customQuery : query;
    if (!finalQuery.trim()) return;
    onSearchQuestions(finalQuery.trim());
    onNavigate('banco');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecuteGeneralSearch();
    }
  };

  // Sugestões populares para quando o campo estiver vazio
  const quickSuggestions = [
    { label: 'ENARE', type: 'inst', action: () => { onSelectInstitution('ENARE'); onNavigate('banco'); setIsOpen(false); } },
    { label: 'USP-SP', type: 'inst', action: () => { onSelectInstitution('USP-SP'); onNavigate('banco'); setIsOpen(false); } },
    { label: 'Ginecologia', type: 'esp', action: () => { onSelectSpecialty('Ginecologia e Obstetrícia'); onNavigate('banco'); setIsOpen(false); } },
    { label: 'Pré-eclâmpsia', type: 'search', action: () => handleExecuteGeneralSearch('Pré-eclâmpsia') },
    { label: 'Clínica Médica', type: 'esp', action: () => { onSelectSpecialty('Clínica Médica'); onNavigate('banco'); setIsOpen(false); } },
    { label: 'Simulados Oficiais', type: 'nav', action: () => { onNavigate('simulados'); setIsOpen(false); } }
  ];

  return (
    <div ref={containerRef} className="relative flex-1 max-w-2xl mx-1 sm:mx-4">
      {/* Barra de Pesquisa */}
      <div
        className={`flex items-center gap-2.5 px-3 sm:px-4 py-2 rounded-2xl border transition-all duration-200 ${
          isOpen
            ? 'bg-white dark:bg-[#0b1220] ring-2 shadow-lg'
            : 'bg-slate-100/90 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-900 border-slate-200/90 dark:border-slate-800'
        }`}
        style={{
          borderColor: isOpen ? accentConfig.primaryHex : undefined,
          boxShadow: isOpen ? `0 4px 20px -2px ${accentConfig.bgRgba}` : undefined
        }}
      >
        <Search
          className={`w-4 h-4 shrink-0 transition-colors ${
            isOpen ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500'
          }`}
          style={{ color: isOpen ? accentConfig.primaryHex : undefined }}
        />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
        />

        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            title="Limpar pesquisa"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-1 shrink-0">
            <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300/80 dark:border-slate-700/80 rounded-md">
              Ctrl K
            </kbd>
          </div>
        )}
      </div>

      {/* Dropdown Flutuante de Resultados e Sugestões */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-[#0a1120] border border-slate-200 dark:border-slate-800/90 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 max-h-[80vh] flex flex-col">
          {/* Header do dropdown */}
          <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800/70 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {query.trim() ? `Resultados para "${query}"` : 'Pesquisa Global Médica'}
            </span>
            <span className="text-[10px] text-slate-400">Pressione Enter para buscar no banco</span>
          </div>

          <div className="overflow-y-auto p-2 sm:p-3 space-y-4 flex-1">
            {/* ESTADO VAZIO: SUGESTÕES RÁPIDAS */}
            {!query.trim() && (
              <div className="space-y-3 py-1">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 px-2 mb-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Sugestões de busca frequente</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 px-2">
                    {quickSuggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={item.action}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        {item.type === 'inst' && <Building2 className="w-3 h-3 text-blue-500" />}
                        {item.type === 'esp' && <Stethoscope className="w-3 h-3 text-emerald-500" />}
                        {item.type === 'nav' && <FileCheck2 className="w-3 h-3 text-purple-500" />}
                        {item.type === 'search' && <Search className="w-3 h-3 text-amber-500" />}
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 shrink-0 text-blue-500 mt-0.5" />
                  <p className="leading-relaxed">
                    Você pode pesquisar por <strong>enunciados de questões</strong>, <strong>doenças</strong> (ex: Pré-eclâmpsia, Apendicite), <strong>instituições</strong> (ex: ENARE, USP, UNICAMP) ou <strong>especialidades</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* COM RESULTADOS */}
            {query.trim() && (
              <>
                {/* 1. SEÇÃO QUESTÕES */}
                {searchResults.questions.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between px-2 mb-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-blue-500" />
                        Questões no Acervo ({searchResults.questions.length})
                      </span>
                    </div>
                    <div className="space-y-1">
                      {searchResults.questions.map((q) => (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => {
                            if (onSelectQuestion) {
                              onSelectQuestion(q.id);
                            } else {
                              handleExecuteGeneralSearch(q.code || q.statement.slice(0, 30));
                            }
                            setIsOpen(false);
                          }}
                          className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all cursor-pointer group flex items-start justify-between gap-3 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="text-[10px] font-extrabold px-2 py-0.5 rounded-md font-mono"
                                style={{
                                  backgroundColor: accentConfig.bgRgba,
                                  color: accentConfig.primaryHex
                                }}
                              >
                                {q.code}
                              </span>
                              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                {q.institution} {q.year}
                              </span>
                              {q.especialidade && (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                  {q.especialidade}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                              {q.statement}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. SEÇÃO ESPECIALIDADES & TEMAS */}
                {searchResults.specialties.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 px-2 mb-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                      <Stethoscope className="w-3.5 h-3.5 text-emerald-500" />
                      Especialidades & Temas ({searchResults.specialties.length})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {searchResults.specialties.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            onSelectSpecialty(item.specialty, item.tema);
                            onNavigate('banco');
                            setIsOpen(false);
                          }}
                          className="text-left p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all cursor-pointer flex items-center justify-between border border-slate-100 dark:border-slate-800/60"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                              {item.specialty}
                            </span>
                            {item.tema && (
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                                {item.tema}
                              </span>
                            )}
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. SEÇÃO INSTITUIÇÕES & BANCAS */}
                {searchResults.institutions.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 px-2 mb-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                      <Building2 className="w-3.5 h-3.5 text-blue-500" />
                      Bancas e Instituições ({searchResults.institutions.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5 px-1">
                      {searchResults.institutions.map((inst, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            onSelectInstitution(inst);
                            onNavigate('banco');
                            setIsOpen(false);
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50/70 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all cursor-pointer flex items-center gap-1.5 border border-blue-200/60 dark:border-blue-800/60"
                        >
                          <Building2 className="w-3 h-3 text-blue-500" />
                          <span>{inst}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. SEÇÃO SIMULADOS OFICIAIS */}
                {searchResults.simulados.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 px-2 mb-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                      <FileCheck2 className="w-3.5 h-3.5 text-purple-500" />
                      Simulados Oficiais
                    </div>
                    <div className="space-y-1">
                      {searchResults.simulados.map((exam) => (
                        <button
                          key={exam.id}
                          type="button"
                          onClick={() => {
                            onNavigate('simulados');
                            setIsOpen(false);
                          }}
                          className="w-full text-left p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100/60 dark:hover:bg-purple-900/40 transition-all cursor-pointer flex items-center justify-between border border-purple-200/50 dark:border-purple-800/40"
                        >
                          <div>
                            <span className="text-xs font-bold text-purple-900 dark:text-purple-300 block">
                              {exam.title}
                            </span>
                            <span className="text-[11px] text-purple-700 dark:text-purple-400">
                              Banca: {exam.banca}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                            Acessar <ArrowRight className="w-3 h-3" />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. SEÇÃO CADERNOS */}
                {searchResults.lists.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 px-2 mb-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                      <Folder className="w-3.5 h-3.5 text-amber-500" />
                      Meus Cadernos & Pastas
                    </div>
                    <div className="space-y-1">
                      {searchResults.lists.map((l) => (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => {
                            if (onSelectList) onSelectList(l.id);
                            onNavigate('banco');
                            setIsOpen(false);
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200"
                        >
                          <span className="truncate">{l.title}</span>
                          <span className="text-[11px] font-normal text-slate-400 shrink-0">
                            {l.totalQuestions} questões
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* SE NÃO ENCONTROU NADA ESPECÍFICO */}
                {searchResults.total === 0 && (
                  <div className="text-center py-6 px-4 space-y-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Nenhum resultado direto para <strong className="text-slate-800 dark:text-white">&quot;{query}&quot;</strong>.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleExecuteGeneralSearch()}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
                      style={{ backgroundColor: accentConfig.primaryHex }}
                    >
                      Filtrar questões com este termo no Banco
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* RODAPÉ DO DROPDOWN COM AÇÃO PRINCIPAL */}
          {query.trim() && (
            <div className="p-2 sm:p-3 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                Dica: aperte <strong>Enter</strong> para pesquisar no acervo
              </span>
              <button
                type="button"
                onClick={() => handleExecuteGeneralSearch()}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ml-auto"
                style={{ backgroundColor: accentConfig.primaryHex }}
              >
                <span>Ver resultados no Banco de Questões</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
