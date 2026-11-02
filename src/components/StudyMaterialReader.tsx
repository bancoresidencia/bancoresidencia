'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Clock,
  Calendar,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Play,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { StudyMaterialItem } from '@/types/flashcards';
import { useTheme } from '@/context/ThemeContext';
import { MermaidDiagram } from './study-material/MermaidDiagram';
import { FigoAnatomicalDiagram } from './study-material/FigoAnatomicalDiagram';
import { ExamRecurrenceStatsCard } from './study-material/ExamRecurrenceStatsCard';
import { RiskFactorsComparisonCard } from './study-material/RiskFactorsComparisonCard';
import { TopographicSymptomsCard } from './study-material/TopographicSymptomsCard';
import { DiagnosticPipelineCard } from './study-material/DiagnosticPipelineCard';
import { DegenerationsCard } from './study-material/DegenerationsCard';
import { TreatmentAlgorithmCard } from './study-material/TreatmentAlgorithmCard';
import { LasmarStepwCard } from './study-material/LasmarStepwCard';
import { HppRecurrenceStatsCard } from './study-material/HppRecurrenceStatsCard';
import { HppFourTsCard } from './study-material/HppFourTsCard';
import { HppGoldenHourAlgorithmCard } from './study-material/HppGoldenHourAlgorithmCard';

interface StudyMaterialReaderProps {
  material: StudyMaterialItem;
  onBack: () => void;
  onPracticeFlashcards?: (material: StudyMaterialItem) => void;
}

export const StudyMaterialReader: React.FC<StudyMaterialReaderProps> = ({
  material,
  onBack,
  onPracticeFlashcards
}) => {
  const { accentConfig } = useTheme();

  // Formatador de expressões matemáticas e clínicas (LaTeX -> Símbolos UTF-8 limpos)
  const formatMedicalMath = (raw: string): string => {
    if (!raw) return '';
    let text = raw;

    // Remove marcadores de bloco $$ ou inline $ se presentes
    text = text.replace(/^\$\$|\$\$$/g, '').replace(/^\$|\$$/g, '');

    // Desempacota recursivamente todas as tags \text{...}
    while (/\\text\{([^{}]*)\}/.test(text)) {
      text = text.replace(/\\text\{([^{}]*)\}/g, '$1');
    }

    // Desempacota recursivamente frações \frac{num}{den} com suporte a chaves aninhadas
    while (/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/.test(text)) {
      text = text.replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, '($1 / $2)');
    }

    // Limpeza de operadores e símbolos matemáticos
    text = text
      .replace(/\\le\b|\\leq\b/g, '≤')
      .replace(/\\ge\b|\\geq\b/g, '≥')
      .replace(/\\approx\b/g, '≈')
      .replace(/\\to\b|\\rightarrow\b/g, '→')
      .replace(/\\downarrow\b/g, '↓')
      .replace(/\\uparrow\b/g, '↑')
      .replace(/\\pm\b/g, '±')
      .replace(/\\times\b/g, '×')
      .replace(/\\mu\b/g, 'µ')
      .replace(/\\%/g, '%')
      .replace(/\\,/g, ' ')
      .replace(/_\{?(\d+)\}?/g, (_, d) => {
        const subs: Record<string, string> = {
          '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
          '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
        };
        return d.split('').map((c: string) => subs[c] || c).join('');
      })
      .replace(/\^\{?(\d+)\}?/g, (_, d) => {
        const sups: Record<string, string> = {
          '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
          '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
        };
        return d.split('').map((c: string) => sups[c] || c).join('');
      })
      .replace(/\$([^$]+)\$/g, '$1')
      .replace(/\$/g, '')
      .replace(/<br\s*\/?>/gi, ' ');

    return text.trim();
  };

  const renderInlineFormatting = (rawText: string) => {
    const text = formatMedicalMath(rawText);

    // Divisão por negrito (**), itálico (*), ou código inline (`)
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    const parts = text.split(regex);

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return (
          <strong key={i} className="font-bold text-zinc-900 dark:text-zinc-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
        return (
          <em key={i} className="italic text-zinc-800 dark:text-zinc-200">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 font-mono text-[11px] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  // Estado do carrossel interativo de Pontos-Chave das Provas
  const [activeKeyPointIndex, setActiveKeyPointIndex] = useState<number>(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const totalKeyPoints = material.keyPoints ? material.keyPoints.length : 0;

  const handlePrevKeyPoint = () => {
    if (totalKeyPoints <= 1) return;
    setSlideDirection('left');
    setActiveKeyPointIndex((prev) => (prev - 1 + totalKeyPoints) % totalKeyPoints);
  };

  const handleNextKeyPoint = () => {
    if (totalKeyPoints <= 1) return;
    setSlideDirection('right');
    setActiveKeyPointIndex((prev) => (prev + 1) % totalKeyPoints);
  };

  // Navegação por teclado (Seta Esquerda / Seta Direita) em loop infinito
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (totalKeyPoints <= 1) return;
      if (e.key === 'ArrowLeft') {
        handlePrevKeyPoint();
      } else if (e.key === 'ArrowRight') {
        handleNextKeyPoint();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalKeyPoints]);

  // Renderizador do Carrossel de Pontos-Chave das Provas (Card central em foco com animação suave, loop infinito)
  const renderKeyPointsCarousel = () => {
    if (!material.keyPoints || material.keyPoints.length === 0) return null;

    const prevIdx = (activeKeyPointIndex - 1 + totalKeyPoints) % totalKeyPoints;
    const currIdx = activeKeyPointIndex;
    const nextIdx = (activeKeyPointIndex + 1) % totalKeyPoints;

    return (
      <div className="my-10 p-5 sm:p-6 rounded-3xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/90 dark:border-zinc-800 space-y-4">
        {/* Cabeçalho do Carrossel de Pontos-Chave */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-heading font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
              Pontos-Chave das Provas
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Regras de ouro e armadilhas cruciais das bancas examinadoras (use as setas ← / → do teclado)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400 mr-1">
              {activeKeyPointIndex + 1} de {totalKeyPoints}
            </span>
            <button
              type="button"
              onClick={handlePrevKeyPoint}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all cursor-pointer shadow-xs active:scale-95"
              aria-label="Ponto-chave anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextKeyPoint}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all cursor-pointer shadow-xs active:scale-95"
              aria-label="Próximo ponto-chave"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carrossel em Loop Infinito: Card central em foco com transição suave, anterior e próximo nas laterais */}
        <div
          onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchStartX === null) return;
            const delta = e.changedTouches[0].clientX - touchStartX;
            if (delta > 40) handlePrevKeyPoint();
            else if (delta < -40) handleNextKeyPoint();
            setTouchStartX(null);
          }}
          className="flex items-stretch justify-center gap-3 sm:gap-4 md:gap-5 py-4 overflow-hidden relative select-none snap-x snap-mandatory"
        >
          {/* Card Anterior (ex.: Último Card antes do Card 1 em loop) */}
          <div
            key={`prev-${prevIdx}`}
            onClick={handlePrevKeyPoint}
            className="hidden sm:flex flex-col justify-start shrink-0 w-[240px] md:w-[280px] lg:w-[320px] p-4 sm:p-5 rounded-2xl bg-white/50 dark:bg-[#121215]/50 border border-zinc-200/60 dark:border-zinc-800/60 scale-95 opacity-35 blur-[0.5px] hover:opacity-70 cursor-pointer transition-all duration-500 ease-out space-y-3 min-h-[170px]"
            title="Clique para ir ao card anterior"
          >
            <div
              className="w-6 h-6 rounded-full text-white font-black text-xs flex items-center justify-center shadow-xs opacity-80 shrink-0"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              {prevIdx + 1}
            </div>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal line-clamp-4">
              {renderInlineFormatting(material.keyPoints[prevIdx])}
            </p>
          </div>

          {/* Card Central em Foco com Transição Suave e Cor do Tema */}
          <div
            key={`curr-${currIdx}`}
            className={`flex flex-col justify-start shrink-0 w-full max-w-[340px] sm:max-w-[420px] md:max-w-[480px] p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121215] border-2 shadow-md scale-100 opacity-100 space-y-3 min-h-[180px] transition-all duration-500 ease-out animate-in fade-in ${
              slideDirection === 'right' ? 'slide-in-from-right-4' : 'slide-in-from-left-4'
            }`}
            style={{
              borderColor: accentConfig.primaryHex,
              boxShadow: `0 4px 14px -2px ${accentConfig.bgRgba}, 0 0 0 3px ${accentConfig.bgRgba}`
            }}
          >
            <div
              className="w-7 h-7 rounded-full text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              {currIdx + 1}
            </div>

            <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-normal">
              {renderInlineFormatting(material.keyPoints[currIdx])}
            </p>
          </div>

          {/* Próximo Card (ex.: Card 2 depois do Card 1 em loop) */}
          <div
            key={`next-${nextIdx}`}
            onClick={handleNextKeyPoint}
            className="hidden sm:flex flex-col justify-start shrink-0 w-[240px] md:w-[280px] lg:w-[320px] p-4 sm:p-5 rounded-2xl bg-white/50 dark:bg-[#121215]/50 border border-zinc-200/60 dark:border-zinc-800/60 scale-95 opacity-35 blur-[0.5px] hover:opacity-70 cursor-pointer transition-all duration-500 ease-out space-y-3 min-h-[170px]"
            title="Clique para ir ao próximo card"
          >
            <div
              className="w-6 h-6 rounded-full text-white font-black text-xs flex items-center justify-center shadow-xs opacity-80 shrink-0"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              {nextIdx + 1}
            </div>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal line-clamp-4">
              {renderInlineFormatting(material.keyPoints[nextIdx])}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Renderizador principal de Markdown com substituição por componentes nativos
  const renderMarkdownContent = (content: string) => {
    const lines = content.split(/\r?\n/);
    const elements: React.ReactNode[] = [];

    let inCodeBlock = false;
    let codeBlockLang = '';
    let codeBlockLines: string[] = [];

    let inTable = false;
    let tableRows: string[][] = [];
    let tableHeaders: string[] = [];
    let hasRenderedKeyPoints = false;

    const flushTable = (key: string) => {
      if (inTable && tableHeaders.length > 0) {
        elements.push(
          <div
            key={`table-${key}`}
            className="my-6 overflow-x-auto rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs"
          >
            <table className="w-full text-left text-xs sm:text-sm border-collapse table-auto">
              <thead>
                <tr className="bg-zinc-100/90 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold">
                  {tableHeaders.map((th, idx) => (
                    <th key={idx} className="p-3.5 font-bold tracking-tight">
                      {renderInlineFormatting(th.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 bg-white dark:bg-[#121215]">
                {tableRows.map((tr, rIdx) => (
                  <tr
                    key={rIdx}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors"
                  >
                    {tr.map((td, cIdx) => (
                      <td key={cIdx} className="p-3.5 text-zinc-700 dark:text-zinc-300 align-top leading-relaxed">
                        {renderInlineFormatting(td.trim())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        inTable = false;
        tableRows = [];
        tableHeaders = [];
      }
    };

    const flushCodeBlock = (key: string) => {
      const fullCode = codeBlockLines.join('\n').trim();
      const lang = codeBlockLang.toLowerCase();

      // Interceptação por componentes nativos ricos integrados ao tema do site
      if (
        lang === 'hpp-exam-stats' ||
        fullCode.includes('Recorrência Temática de Hemorragia Pós-Parto') ||
        fullCode.includes('Recorrência Temática de HPP')
      ) {
        elements.push(<HppRecurrenceStatsCard key={`hpp-stats-${key}`} />);
      } else if (
        lang === 'hpp-four-ts' ||
        fullCode.includes('REGRA_DOS_4_TS') ||
        fullCode.includes('DIAGNOSTICO_4_TS')
      ) {
        elements.push(<HppFourTsCard key={`hpp-four-ts-${key}`} />);
      } else if (
        lang === 'hpp-golden-hour' ||
        fullCode.includes('FLUXO_GOLDEN_HOUR') ||
        fullCode.includes('ALGORITMO_GOLDEN_HOUR')
      ) {
        elements.push(<HppGoldenHourAlgorithmCard key={`hpp-golden-${key}`} />);
      } else if (
        lang === 'exam-stats' ||
        fullCode.includes('Recorrência Estatística em Provas') ||
        fullCode.includes('Frequência Relativa de Cobrança')
      ) {
        elements.push(<ExamRecurrenceStatsCard key={`exam-stats-${key}`} />);
      } else if (
        lang === 'risk-factors' ||
        fullCode.includes('FATORES_RISCO') ||
        fullCode.includes('FATORES_PROTECAO')
      ) {
        elements.push(<RiskFactorsComparisonCard key={`risk-factors-${key}`} />);
      } else if (
        lang === 'topography-symptoms' ||
        fullCode.includes('Localização do Mioma') ||
        fullCode.includes('Submucosos (FIGO 0, 1, 2)')
      ) {
        elements.push(<TopographicSymptomsCard key={`topography-${key}`} />);
      } else if (
        lang === 'diagnostic-pipeline' ||
        fullCode.includes('Suspeita Clínica de Mioma') ||
        fullCode.includes('EXAME INICIAL DE ESCOLHA')
      ) {
        elements.push(<DiagnosticPipelineCard key={`pipeline-${key}`} />);
      } else if (
        lang === 'degenerations' ||
        fullCode.includes('DegeneracaoHialina') ||
        fullCode.includes('DegeneracaoRubra')
      ) {
        elements.push(<DegenerationsCard key={`degenerations-${key}`} />);
      } else if (
        lang === 'treatment-algorithm' ||
        fullCode.includes('Inicio["Paciente com Diagnóstico de Miomatose Uterina"]') ||
        fullCode.includes('CONTROLE_SANGRAMENTO')
      ) {
        elements.push(<TreatmentAlgorithmCard key={`treatment-${key}`} />);
      } else if (
        lang === 'lasmar-score' ||
        lang === 'stepw' ||
        fullCode.includes('STEPW') ||
        fullCode.includes('Lasmar')
      ) {
        elements.push(<LasmarStepwCard key={`stepw-${key}`} />);
      } else if (
        lang === 'figo' ||
        fullCode.includes('SEROSA UTERINA') ||
        fullCode.includes('CAVIDADE ENDOMETRIAL') ||
        fullCode.includes('Classificação FIGO')
      ) {
        elements.push(<FigoAnatomicalDiagram key={`figo-${key}`} />);
      } else if (lang === 'mermaid') {
        let diagramTitle = '';
        const titleMatch = fullCode.match(/title\s+["']?([^"'\n]+)["']?/i);
        if (titleMatch) {
          diagramTitle = titleMatch[1].trim();
        }
        elements.push(
          <MermaidDiagram
            key={`mermaid-${key}`}
            code={fullCode}
            title={diagramTitle || 'Esquema Visual de Decisão Clínica'}
          />
        );
      } else {
        elements.push(
          <div
            key={`code-${key}`}
            className="my-5 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
          >
            {lang && (
              <div className="bg-zinc-100 dark:bg-zinc-900 px-4 py-1.5 text-[11px] font-mono text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                {lang}
              </div>
            )}
            <pre className="p-4 bg-zinc-950 text-zinc-200 font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed">
              <code>{fullCode}</code>
            </pre>
          </div>
        );
      }

      inCodeBlock = false;
      codeBlockLang = '';
      codeBlockLines = [];
    };

    let inUnorderedList = false;
    let unorderedListItems: Array<{ text: string; level: number }> = [];

    let inOrderedList = false;
    let orderedListItems: string[] = [];

    const flushUnorderedList = (key: string) => {
      if (inUnorderedList && unorderedListItems.length > 0) {
        const items = [...unorderedListItems];
        elements.push(
          <div key={`ul-${key}`} className="my-3 space-y-2 not-prose">
            {items.map((item, idx) => {
              if (item.level === 0) {
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 font-medium leading-relaxed pt-1"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0 mt-1.5 shadow-2xs"
                      style={{ backgroundColor: accentConfig.primaryHex }}
                    />
                    <div className="flex-1">{renderInlineFormatting(item.text)}</div>
                  </div>
                );
              }

              if (item.level === 1) {
                return (
                  <div
                    key={idx}
                    className="ml-5 sm:ml-6 pl-3 sm:pl-4 border-l-2 border-zinc-200 dark:border-zinc-700/60 my-1 flex items-start gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed"
                  >
                    <span className="text-zinc-400 dark:text-zinc-500 font-mono text-xs shrink-0 select-none mt-0.5">
                      ↳
                    </span>
                    <div className="flex-1">{renderInlineFormatting(item.text)}</div>
                  </div>
                );
              }

              // level >= 2
              return (
                <div
                  key={idx}
                  className="ml-9 sm:ml-11 pl-3 border-l-2 border-zinc-200/60 dark:border-zinc-800 my-0.5 flex items-start gap-2 text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed"
                >
                  <span className="w-1.5 h-0.5 bg-zinc-400 dark:bg-zinc-500 shrink-0 mt-2" />
                  <div className="flex-1">{renderInlineFormatting(item.text)}</div>
                </div>
              );
            })}
          </div>
        );
        inUnorderedList = false;
        unorderedListItems = [];
      }
    };

    const flushOrderedList = (key: string) => {
      if (inOrderedList && orderedListItems.length > 0) {
        const items = [...orderedListItems];
        elements.push(
          <ol
            key={`ol-${key}`}
            className="my-3 space-y-2 list-decimal pl-5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed"
          >
            {items.map((item, idx) => (
              <li key={idx} className="pl-1">
                {renderInlineFormatting(item)}
              </li>
            ))}
          </ol>
        );
        inOrderedList = false;
        orderedListItems = [];
      }
    };

    const flushAllLists = (key: string) => {
      flushUnorderedList(key);
      flushOrderedList(key);
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Detecção de blocos de código (```)
      if (trimmed.startsWith('```')) {
        flushAllLists(`pre-cb-${index}`);
        if (inCodeBlock) {
          flushCodeBlock(`cb-${index}`);
        } else {
          if (inTable) flushTable(`pre-cb-${index}`);
          inCodeBlock = true;
          codeBlockLang = trimmed.slice(3).trim();
          codeBlockLines = [];
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockLines.push(line);
        return;
      }

      // Detecção de Imagens em Markdown: ![Alt](url)
      const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        flushAllLists(`pre-img-${index}`);
        if (inTable) flushTable(`pre-img-${index}`);
        const alt = imgMatch[1];
        const src = imgMatch[2];
        elements.push(
          <figure key={`img-${index}`} className="my-6 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="mx-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-md max-h-[500px] object-contain"
            />
            {alt && (
              <figcaption className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 italic">
                {alt}
              </figcaption>
            )}
          </figure>
        );
        return;
      }

      // Detecção de Tabelas Markdown
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        flushAllLists(`pre-table-${index}`);
        const cols = trimmed.slice(1, -1).split('|');
        if (!inTable) {
          inTable = true;
          tableHeaders = cols;
        } else if (cols.some((c) => c.includes('---'))) {
          // Linha divisória da tabela
        } else {
          tableRows.push(cols);
        }
        return;
      } else if (inTable) {
        flushTable(`flush-${index}`);
      }

      // Detecção de Bloco Matemático de Fórmula: $$...$$ ou fórmulas de fração isoladas
      if (
        (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4) ||
        (trimmed.includes('\\frac') && trimmed.includes('='))
      ) {
        flushAllLists(`pre-math-${index}`);
        const mathContent = trimmed.startsWith('$$') && trimmed.endsWith('$$')
          ? trimmed.slice(2, -2).trim()
          : trimmed.replace(/^\$+/, '').replace(/\$+$/, '').trim();

        // Extrai lado esquerdo e fração com suporte a chaves aninhadas (\text{...})
        const eqIdx = mathContent.indexOf('=');
        if (eqIdx !== -1 && mathContent.includes('\\frac')) {
          const leftRaw = mathContent.slice(0, eqIdx).trim();
          const rightRaw = mathContent.slice(eqIdx + 1).trim();

          // Regex que suporta chaves aninhadas no numerador e denominador
          const fracRegex = /\\frac\s*\{((?:[^{}]|\{[^{}]*\})*)\}\s*\{((?:[^{}]|\{[^{}]*\})*)\}/;
          const match = rightRaw.match(fracRegex);
          if (match) {
            const leftSide = formatMedicalMath(leftRaw);
            const num = formatMedicalMath(match[1]);
            const den = formatMedicalMath(match[2]);

            elements.push(
              <div
                key={`math-${index}`}
                className="my-5 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800 shadow-xs flex flex-col items-center justify-center text-center space-y-3 not-prose"
              >
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 font-heading font-black text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                  <span className="text-zinc-800 dark:text-zinc-200">{leftSide}</span>
                  <span className="text-zinc-400 font-normal text-base">=</span>
                  <div className="inline-flex flex-col items-center">
                    <span className="px-4 pb-1.5 border-b-2 border-zinc-500 dark:border-zinc-400 text-zinc-900 dark:text-zinc-100 font-bold text-center">
                      {num}
                    </span>
                    <span className="px-4 pt-1.5 text-zinc-600 dark:text-zinc-400 font-semibold text-center text-xs">
                      {den}
                    </span>
                  </div>
                </div>
              </div>
            );
            return;
          }
        }
      }

      // Títulos Markdown: Elimina repetição do título principal já presente no cabeçalho do leitor
      if (trimmed.startsWith('# ')) {
        // Todo H1 no topo do markdown é ignorado pois o cabeçalho do componente já renderiza o H1 oficial
        return;
      } else if (trimmed.startsWith('## ')) {
        const rawTitle = trimmed.replace('## ', '').trim();
        const isReferencesSection =
          rawTitle.toLowerCase().includes('diretrizes') ||
          rawTitle.toLowerCase().includes('referencias') ||
          rawTitle.toLowerCase().includes('referências');

        // Se for a seção de referências e ainda não renderizou os pontos-chave, insere o carrossel ANTES das referências!
        if (isReferencesSection && !hasRenderedKeyPoints) {
          flushAllLists(`pre-keypoints-${index}`);
          elements.push(
            <React.Fragment key={`keypoints-carousel-inline-${index}`}>
              {renderKeyPointsCarousel()}
            </React.Fragment>
          );
          hasRenderedKeyPoints = true;
        }

        flushAllLists(`pre-h2-${index}`);
        const sectionSlug = rawTitle
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        elements.push(
          <h2
            key={index}
            id={sectionSlug}
            className="text-lg sm:text-xl font-heading font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-3 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-2 scroll-mt-24"
          >
            <span
              className="w-1.5 h-4.5 rounded-full inline-block"
              style={{ backgroundColor: accentConfig.primaryHex }}
            />
            {renderInlineFormatting(rawTitle)}
          </h2>
        );
      } else if (trimmed.startsWith('### ')) {
        flushAllLists(`pre-h3-${index}`);
        elements.push(
          <h3
            key={index}
            className="text-base sm:text-lg font-heading font-semibold text-zinc-800 dark:text-zinc-200 mt-5 mb-2"
          >
            {renderInlineFormatting(trimmed.replace('### ', ''))}
          </h3>
        );
      } else if (trimmed.startsWith('> [!IMPORTANT]')) {
        flushAllLists(`pre-callout-${index}`);
        elements.push(
          <div
            key={index}
            className="my-4 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 text-xs sm:text-sm flex gap-3 items-start"
          >
            <Sparkles className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <div className="space-y-1">
              <strong className="block font-bold">Atualização de Diretriz Oficial</strong>
              <div>{renderInlineFormatting(trimmed.replace('> [!IMPORTANT]', '').trim())}</div>
            </div>
          </div>
        );
      } else if (trimmed.startsWith('> [!WARNING]') || trimmed.startsWith('> [!CAUTION]')) {
        flushAllLists(`pre-callout-${index}`);
        elements.push(
          <div
            key={index}
            className="my-4 p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 dark:bg-rose-500/10 text-rose-900 dark:text-rose-300 text-xs sm:text-sm flex gap-3 items-start"
          >
            <AlertTriangle className="w-4 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div className="space-y-1">
              <strong className="block font-bold">Ponto Crítico / Armadilha da Banca</strong>
              <div>{renderInlineFormatting(trimmed.replace(/> \[(?:!WARNING|!CAUTION)\]/, '').trim())}</div>
            </div>
          </div>
        );
      } else if (trimmed.startsWith('> ')) {
        flushAllLists(`pre-quote-${index}`);
        elements.push(
          <blockquote
            key={index}
            className="my-3 pl-4 border-l-3 border-zinc-400 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 italic text-xs sm:text-sm"
          >
            {renderInlineFormatting(trimmed.replace('> ', ''))}
          </blockquote>
        );
      } else {
        // Listas com marcadores hierárquicos (Indentação)
        const ulMatch = line.match(/^(\s*)([\*\-])\s+(.+)$/);
        if (ulMatch) {
          flushOrderedList(`pre-ul-${index}`);
          inUnorderedList = true;
          const indentSpaces = ulMatch[1].replace(/\t/g, '  ').length;
          const level = indentSpaces >= 4 ? 2 : indentSpaces >= 2 ? 1 : 0;
          unorderedListItems.push({ text: ulMatch[3], level });
        } else if (/^\d+\.\s/.test(trimmed)) {
          flushUnorderedList(`pre-ol-${index}`);
          inOrderedList = true;
          orderedListItems.push(trimmed.replace(/^\d+\.\s/, ''));
        } else if (trimmed === '---') {
          flushAllLists(`pre-hr-${index}`);
          elements.push(<hr key={index} className="my-6 border-zinc-200 dark:border-zinc-800" />);
        } else if (trimmed.length > 0) {
          flushAllLists(`pre-p-${index}`);
          elements.push(
            <p
              key={index}
              className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 my-2.5 leading-relaxed"
            >
              {renderInlineFormatting(trimmed)}
            </p>
          );
        }
      }
    });

    flushAllLists('final');
    if (inCodeBlock) flushCodeBlock('final');
    if (inTable) flushTable('final');

    // Se o resumo não possuía seção formal de referências, renderiza os pontos-chave aqui
    if (!hasRenderedKeyPoints) {
      elements.push(
        <React.Fragment key="keypoints-carousel-fallback">
          {renderKeyPointsCarousel()}
        </React.Fragment>
      );
    }

    return elements;
  };

  const sectionPills = useMemo(() => {
    if (!material.markdownContent) return [];
    const h2Lines = material.markdownContent
      .split(/\r?\n/)
      .filter((l) => l.trim().startsWith('## '));

    return h2Lines.map((l) => {
      const rawTitle = l.trim().replace('## ', '').trim();
      const slug = rawTitle
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const shortTitle = rawTitle.replace(/^[0-9.]+\s*/, '').replace(/^[^\w\s]+\s*/, '');
      return { rawTitle, slug, shortTitle };
    });
  }, [material.markdownContent]);

  // Scroll Spy com Observer ajustado para não conflitar com a barra superior
  const [activeSectionSlug, setActiveSectionSlug] = useState<string>('');
  const pillRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    if (sectionPills.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSectionSlug(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -55% 0px' }
    );

    sectionPills.forEach((p) => {
      const el = document.getElementById(p.slug);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sectionPills]);

  // Animação suave e automática para centralizar o botão ativo na barra de tópicos sem precisar rolar manualmente
  useEffect(() => {
    if (activeSectionSlug && pillRefs.current[activeSectionSlug]) {
      pillRefs.current[activeSectionSlug]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeSectionSlug]);

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      {/* Barra Superior de Ações */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para lista</span>
        </button>

        <div className="flex items-center gap-2">
          {material.flashcardCount && material.flashcardCount > 0 ? (
            <button
              type="button"
              onClick={() => onPracticeFlashcards && onPracticeFlashcards(material)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer hover:opacity-95 transition-all"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Praticar {material.flashcardCount} Flashcards</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Cabeçalho do Material Limpo (Largura total harmonizada com o restante do site) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/80 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-0.5 rounded-md font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            {material.specialty}
          </span>
          <span className="text-zinc-400">•</span>
          <span className="text-zinc-500 dark:text-zinc-400 font-medium">{material.theme}</span>
          {material.guidelineBadge && (
            <>
              <span className="text-zinc-400">•</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[11px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                {material.guidelineBadge}
              </span>
            </>
          )}
        </div>

        <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-black tracking-tight text-zinc-900 dark:text-zinc-100">
          {material.title}
        </h1>

        <div className="flex items-center gap-4 text-[11px] text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5" />
            {material.readTimeMinutes} min de leitura
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            Atualizado {material.lastUpdatedYear}
          </span>
        </div>
      </div>

      {/* Barra de Navegação Rápida Sticky com Scroll Spy (Fixa abaixo da barra superior top-[4.5rem] com bordas retangulares) */}
      {sectionPills.length > 0 && (
        <div className="sticky top-[4.5rem] z-20 p-2 sm:p-2.5 rounded-none bg-white/95 dark:bg-[#121215]/95 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-800/80 shadow-xs transition-all">
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {sectionPills.map((pill) => {
              const isActive = activeSectionSlug === pill.slug;
              return (
                <a
                  key={pill.slug}
                  ref={(el) => {
                    pillRefs.current[pill.slug] = el;
                  }}
                  href={`#${pill.slug}`}
                  onClick={() => setActiveSectionSlug(pill.slug)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-all duration-200 border shrink-0 ${
                    isActive
                      ? 'text-white shadow-xs'
                      : 'bg-zinc-100/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: accentConfig.primaryHex,
                          borderColor: accentConfig.primaryHex
                        }
                      : {}
                  }
                >
                  {pill.shortTitle}
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Corpo Formatado do Material (Largura total expandida) */}
      <article className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/80 shadow-xs prose prose-zinc dark:prose-invert max-w-none">
        {renderMarkdownContent(material.markdownContent)}
      </article>

      {/* Rodapé de Ação */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Fixar este conteúdo na memória
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Pratique os cartões de repetição espaçada derivados deste resumo clínico.
          </p>
        </div>

        {material.flashcardCount && material.flashcardCount > 0 ? (
          <button
            type="button"
            onClick={() => onPracticeFlashcards && onPracticeFlashcards(material)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer hover:opacity-95 transition-all"
            style={{ backgroundColor: accentConfig.primaryHex }}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Iniciar Prática de Flashcards</span>
          </button>
        ) : null}
      </div>
    </div>
  );
};
