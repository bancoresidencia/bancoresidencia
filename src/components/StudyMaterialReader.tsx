'use client';

import React from 'react';
import {
  Clock,
  Calendar,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Play
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
  const formatMedicalMath = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/\\text\{([^}]*)\}/g, '$1')
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

    const flushTable = (key: string) => {
      if (inTable && tableHeaders.length > 0) {
        elements.push(
          <div
            key={`table-${key}`}
            className="my-6 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs"
          >
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold">
                  {tableHeaders.map((th, idx) => (
                    <th key={idx} className="p-3 font-semibold">
                      {renderInlineFormatting(th.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {tableRows.map((tr, rIdx) => (
                  <tr
                    key={rIdx}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    {tr.map((td, cIdx) => (
                      <td key={cIdx} className="p-3 text-zinc-700 dark:text-zinc-300">
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
    let unorderedListItems: string[] = [];

    let inOrderedList = false;
    let orderedListItems: string[] = [];

    const flushUnorderedList = (key: string) => {
      if (inUnorderedList && unorderedListItems.length > 0) {
        const items = [...unorderedListItems];
        elements.push(
          <ul key={`ul-${key}`} className="my-3 space-y-2 list-none pl-0">
            {items.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 shrink-0 mt-2" />
                <div className="flex-1">{renderInlineFormatting(item)}</div>
              </li>
            ))}
          </ul>
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

      // Títulos Markdown
      if (trimmed.startsWith('# ')) {
        flushAllLists(`pre-h1-${index}`);
        elements.push(
          <h1
            key={index}
            className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-zinc-900 dark:text-zinc-100 mt-2 mb-4"
          >
            {renderInlineFormatting(trimmed.replace('# ', ''))}
          </h1>
        );
      } else if (trimmed.startsWith('## ')) {
        flushAllLists(`pre-h2-${index}`);
        const rawTitle = trimmed.replace('## ', '').trim();
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
            className="text-lg sm:text-xl font-heading font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-3 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-2 scroll-mt-20"
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
      } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        flushOrderedList(`pre-ul-${index}`);
        inUnorderedList = true;
        unorderedListItems.push(trimmed.slice(2));
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
    });

    flushAllLists('final');
    if (inCodeBlock) flushCodeBlock('final');
    if (inTable) flushTable('final');

    return elements;
  };

  const sectionPills = React.useMemo(() => {
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Barra Superior de Navegação */}
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

      {/* Cabeçalho do Material */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/80 shadow-xs space-y-4">
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

        <h1 className="text-xl sm:text-2xl font-heading font-black tracking-tight text-zinc-900 dark:text-zinc-100">
          {material.title}
        </h1>

        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {material.summarySnippet}
        </p>

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

      {/* Destaques Cirúrgicos (Key Points) */}
      {material.keyPoints && material.keyPoints.length > 0 && (
        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Pérolas de Alto Rendimento para Prova</span>
          </div>
          <ul className="grid sm:grid-cols-2 gap-2.5">
            {material.keyPoints.map((pt, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300 bg-white dark:bg-[#121215] p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/60"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                <span className="leading-snug">{formatMedicalMath(pt)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Barra de Navegação Rápida (Sumário do Resumo) */}
      {sectionPills.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
          <div className="text-[11px] font-bold font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-1">
            Navegação Rápida por Tópicos
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {sectionPills.map((pill) => (
              <a
                key={pill.slug}
                href={`#${pill.slug}`}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
              >
                {pill.shortTitle}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Corpo Formatado do Material */}
      <article className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/80 shadow-xs prose prose-zinc dark:prose-invert max-w-none">
        {renderMarkdownContent(material.markdownContent)}
      </article>

      {/* Rodapé de Ação */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
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
