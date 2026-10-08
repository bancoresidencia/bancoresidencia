'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Question } from '@/types';
import {
  CheckCircle2,
  XCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Building,
  Layers,
  Highlighter,
  Eraser,
  Strikethrough,
  Send,
  HelpCircle,
  Eye,
  EyeOff,
  Bookmark,
  AlertTriangle,
  Lightbulb,
  Library,
  History,
  FolderPlus
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { QuestionComments } from './QuestionComments';
import { SendQuestionToFolderModal } from './SendQuestionToFolderModal';
import { Folder } from '@/types';

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  onAnswer: (questionId: string, selectedLetter: 'A' | 'B' | 'C' | 'D' | 'E', isCorrect: boolean) => void;
  userAnswer?: 'A' | 'B' | 'C' | 'D' | 'E';
  fontSize?: 'sm' | 'base' | 'lg';
  onChangeFontSize?: (size: 'sm' | 'base' | 'lg') => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (questionId: string) => void;
  folders?: Folder[];
  onCreateFolder?: (name: string, parentId: string | null) => void;
  onSaveToFolder?: (questionId: string, folderId: string, folderName: string) => void;
  savedFolderIds?: string[];
}

interface TextHighlight {
  id: string;
  text: string;
  color: 'yellow' | 'green' | 'pink';
}

// Verifica se o texto da alternativa é uma imagem (URL ou caminho local)
const isOptionImage = (text?: string): boolean => {
  if (!text) return false;
  const t = text.trim();
  return (
    (t.startsWith('http://') || t.startsWith('https://') || t.startsWith('/images/')) &&
    (/\.(webp|png|jpe?g|gif|svg)(\?.*)?$/i.test(t) ||
      t.includes('/storage/v1/object/public/') ||
      t.includes('/alternativas/'))
  );
};

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  total,
  onAnswer,
  userAnswer,
  fontSize = 'sm',
  onChangeFontSize,
  isBookmarked,
  onToggleBookmark,
  folders,
  onCreateFolder,
  onSaveToFolder,
  savedFolderIds = []
}) => {
  const { accentConfig } = useTheme();

  // Modal para salvar em pastas de 3 níveis
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

  // Estado de favoritar (sincronizado com props e localStorage)
  const [internalBookmarked, setInternalBookmarked] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('medevo_bookmarked_ids');
        if (raw) {
          const map = JSON.parse(raw);
          setInternalBookmarked(!!map[question.id]);
        }
      } catch {
        // ignore
      }
    }
  }, [question.id]);

  const isFavorited = isBookmarked !== undefined ? isBookmarked : internalBookmarked;

  const handleToggleBookmark = () => {
    if (onToggleBookmark) {
      onToggleBookmark(question.id);
    }
    setInternalBookmarked((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('medevo_bookmarked_ids');
          const map = raw ? JSON.parse(raw) : {};
          map[question.id] = next;
          localStorage.setItem('medevo_bookmarked_ids', JSON.stringify(map));
        } catch {
          // ignore
        }
      }
      return next;
    });
  };

  // Estados de resolução da questão (seleção prévia vs confirmação no botão Resolver)
  const [pendingSelected, setPendingSelected] = useState<'A' | 'B' | 'C' | 'D' | 'E' | null>(userAnswer || null);
  const [isAnswered, setIsAnswered] = useState<boolean>(!!userAnswer);
  const [showCommentary, setShowCommentary] = useState<boolean>(!!userAnswer);

  // Estado de alternativas riscadas/cortadas pelo aluno
  const [eliminatedOptions, setEliminatedOptions] = useState<Record<string, boolean>>({});

  // Estado de justificativas das alternativas expandidas pelo aluno
  const [expandedOptions, setExpandedOptions] = useState<Record<string, boolean>>({});

  // Estados de Marcador de Texto (Highlight)
  const [highlights, setHighlights] = useState<TextHighlight[]>([]);
  const [activeHighlighterColor, setActiveHighlighterColor] = useState<'yellow' | 'green' | 'pink'>('yellow');

  const statementRef = useRef<HTMLDivElement>(null);

  // Visibilidade dos detalhes extras da questão (Banca e Ano aparecem por padrão; demais detalhes apenas se o aluno apertar)
  const [showDetails, setShowDetails] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('medevo_question_show_details');
      if (saved !== null) {
        setShowDetails(saved === 'true');
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleShowDetails = () => {
    setShowDetails((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('medevo_question_show_details', String(next));
      }
      return next;
    });
  };

  // Sincroniza estado de forma limpa durante a renderização quando a questão ou a resposta mudam
  const currentKey = `${question.id}-${userAnswer || ''}`;
  const [prevQuestionKey, setPrevQuestionKey] = useState(currentKey);
  if (prevQuestionKey !== currentKey) {
    setPrevQuestionKey(currentKey);
    setPendingSelected(userAnswer || null);
    setIsAnswered(!!userAnswer);
    setShowCommentary(!!userAnswer);
    setEliminatedOptions({});
    setExpandedOptions({});
    setHighlights([]);
  }

  // Alterna expansão da justificativa de uma alternativa específica
  const toggleOptionExplanation = (letter: string) => {
    setExpandedOptions((prev) => ({
      ...prev,
      [letter]: !prev[letter]
    }));
  };

  // Separação inteligente das justificativas das alternativas, comentário final, motivo de erro e take-home message
  const { optionExplanations, finalCommentary, mainErrorReason, takeHomeMessage, guidelineEvolution, references } = useMemo(() => {
    const rawCommentary = question.commentary || '';
    const explanations: Record<string, string> = {};

    // 1. Justificativas diretas de question.options se existirem
    if (question.options) {
      question.options.forEach((opt: { letter: string; text: string; explanation?: string }) => {
        if (opt.explanation) {
          explanations[opt.letter] = opt.explanation;
        }
      });
    }

    let cleanedFinal = rawCommentary;
    let extractedError = question.mainErrorReason || '';
    let extractedTakeHome = question.takeHomeMessage || '';
    let extractedGuideline = question.guidelineEvolution || '';
    let extractedRefs: string[] = question.references ? [...question.references] : [];

    // Função de sanitização: remove qualquer menção a termos comerciais/concorrentes
    const sanitizeText = (txt: string): string => {
      if (!txt) return '';
      return txt
        .replace(/estrat[ée]gia\s*med/gi, 'Base Médica Teórica')
        .replace(/estrat[ée]gia\s*vestibulares/gi, 'Base Teórica')
        .replace(/estrat[ée]gia/gi, 'Literatura Oficial');
    };

    // Extração de Evolução de Diretrizes & Contexto Histórico
    if (!extractedGuideline) {
      const gRegex = /(?:Evolução de Diretrizes(?: & Contexto Histórico)?|Contexto Histórico(?: da Banca)?|Mudança de Diretriz(?:es)?|Diretrizes Anteriores vs Atuais|Atualização de Conduta)[:.]?\s*([\s\S]*?)(?=(?:\n\s*\n\s*(?:Take-Home Message|Pérola Prática|Principal Motivo|Motivo de Erro|Referências|Fontes|Gabarito)|$))/i;
      const gMatch = cleanedFinal.match(gRegex);
      if (gMatch) {
        extractedGuideline = gMatch[1].trim();
        cleanedFinal = cleanedFinal.replace(gMatch[0], '').trim();
      }
    }

    // Extração de Take-Home Message / Pérola Prática do comentário
    if (!extractedTakeHome) {
      const thRegex = /(?:Take-Home Message|Mensagem-Chave|Pérola Prática(?: para Prova)?|Pérola Clínica|Clinical Pearl|Pérola de Prova)[:.]?\s*([\s\S]*?)(?=(?:\n\s*\n\s*(?:Principal Motivo|Motivo de Erro|Armadilha|Evolução de Diretrizes|Referências|Fontes|Gabarito)|$))/i;
      const thMatch = cleanedFinal.match(thRegex);
      if (thMatch) {
        extractedTakeHome = thMatch[1].trim();
        cleanedFinal = cleanedFinal.replace(thMatch[0], '').trim();
      }
    }

    // Extração do Principal Motivo de Erro / Armadilha da Questão
    if (!extractedError) {
      const errRegex = /(?:Principal Motivo (?:de Erro|que Leva ao Erro)|Motivo de Erro|Armadilha da Questão|Pegadinha de Prova|Onde o Aluno Costuma Errar)[:.]?\s*([\s\S]*?)(?=(?:\n\s*\n\s*(?:Take-Home Message|Pérola Prática|Evolução de Diretrizes|Referências|Fontes|Gabarito)|$))/i;
      const errMatch = cleanedFinal.match(errRegex);
      if (errMatch) {
        extractedError = errMatch[1].trim();
        cleanedFinal = cleanedFinal.replace(errMatch[0], '').trim();
      }
    }

    // Extração de Referências Teóricas
    if (extractedRefs.length === 0) {
      const refRegex = /(?:Referências(?:\s+Bibliográficas)?|Fontes Bibliográficas|Base Teórica(?: Consultada)?|Diretrizes)[:.]?\s*([\s\S]*?)(?=(?:\n\s*\n\s*(?:Take-Home Message|Pérola Prática|Principal Motivo|Evolução de Diretrizes)|$))/i;
      const refMatch = cleanedFinal.match(refRegex);
      if (refMatch) {
        const lines = refMatch[1]
          .split('\n')
          .map((l) => l.replace(/^[•\-*]\s*/, '').trim())
          .filter(Boolean);
        extractedRefs = lines;
        cleanedFinal = cleanedFinal.replace(refMatch[0], '').trim();
      }
    }

    // Detecta bloco "Análise das Alternativas"
    const altBlockRegex = /(?:Análise das Alternativas|Comentário das Alternativas|Justificativa das Alternativas|Alternativas):([\s\S]*?)(?=(?:\n\s*\n\s*(?:Resumo Clínico|Pérola Prática|Clinical Pearl|Take-Home|Principal Motivo|Evolução|Referências|Gabarito Oficial)|$))/i;
    const match = cleanedFinal.match(altBlockRegex);

    if (match) {
      const blockText = match[1];
      const itemRegex = /(?:^[•\-*]?\s*(?:Alternativa|Opção)?\s*([A-E])\s*(?:\([^)]+\))?[:.]?\s*)([\s\S]*?)(?=(?:^[•\-*]?\s*(?:Alternativa|Opção)?\s*[A-E]\s*(?:\([^)]+\))?[:.]?\s*)|$)/gim;
      let itemMatch: RegExpExecArray | null;
      while ((itemMatch = itemRegex.exec(blockText)) !== null) {
        const letter = itemMatch[1].toUpperCase();
        const text = sanitizeText(itemMatch[2].trim());
        if (text && !explanations[letter]) {
          explanations[letter] = text;
        }
      }
      cleanedFinal = cleanedFinal.replace(match[0], '').replace(/\n{3,}/g, '\n\n').trim();
    } else {
      const standaloneAltRegex = /(?:^[•\-*]\s*(?:Alternativa|Opção)\s*([A-E])\s*(?:\([^)]+\))?[:.]?\s*)([\s\S]*?)(?=(?:^[•\-*]\s*(?:Alternativa|Opção)\s*[A-E])|\n\n|$)/gim;
      let foundAny = false;
      let itemMatch: RegExpExecArray | null;
      while ((itemMatch = standaloneAltRegex.exec(cleanedFinal)) !== null) {
        const letter = itemMatch[1].toUpperCase();
        const text = sanitizeText(itemMatch[2].trim());
        if (text && !explanations[letter]) {
          explanations[letter] = text;
          foundAny = true;
        }
      }
      if (foundAny) {
        cleanedFinal = cleanedFinal.replace(standaloneAltRegex, '').replace(/\n{3,}/g, '\n\n').trim();
      }
    }

    cleanedFinal = sanitizeText(cleanedFinal);
    extractedError = sanitizeText(extractedError);
    extractedTakeHome = sanitizeText(extractedTakeHome);
    extractedGuideline = sanitizeText(extractedGuideline);
    extractedRefs = extractedRefs.map(sanitizeText);

    if (!cleanedFinal.trim() && question.correctAnswer) {
      cleanedFinal = `Gabarito Oficial: Alternativa ${question.correctAnswer}.`;
    }

    return {
      optionExplanations: explanations,
      finalCommentary: cleanedFinal,
      mainErrorReason: extractedError,
      takeHomeMessage: extractedTakeHome,
      guidelineEvolution: extractedGuideline,
      references: extractedRefs
    };
  }, [
    question.commentary,
    question.options,
    question.correctAnswer,
    question.mainErrorReason,
    question.takeHomeMessage,
    question.guidelineEvolution,
    question.references
  ]);

  // Captura seleção de texto dentro do enunciado e destaca automaticamente com a cor ativa
  const handleStatementMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      return;
    }

    const selectedText = selection.toString().trim();
    if (selectedText.length >= 2) {
      addHighlight(selectedText, activeHighlighterColor);
    }
  };

  const addHighlight = (text: string, color: 'yellow' | 'green' | 'pink') => {
    if (!text.trim()) return;
    // Evita duplicar exatamente o mesmo trecho com a mesma cor
    const alreadyExists = highlights.some((h) => h.text === text && h.color === color);
    if (!alreadyExists) {
      const newHighlight: TextHighlight = {
        id: `hl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        text,
        color
      };
      setHighlights((prev) => [...prev, newHighlight]);
    }
    window.getSelection()?.removeAllRanges();
  };

  const removeHighlight = (id: string) => {
    setHighlights((prev) => prev.filter((h) => h.id !== id));
  };

  const clearAllHighlights = () => {
    setHighlights([]);
  };

  // Alterna o corte/risco de uma alternativa (eliminar distrator)
  const toggleEliminateOption = (letter: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAnswered) return;
    setEliminatedOptions((prev) => ({
      ...prev,
      [letter]: !prev[letter]
    }));
  };

  // Seleciona a alternativa ou expande justificativa pós-resolução
  const handleSelectOption = (letter: 'A' | 'B' | 'C' | 'D' | 'E') => {
    if (isAnswered) {
      toggleOptionExplanation(letter);
      return;
    }
    // Se estava riscada, desseleciona o risco ao escolher
    if (eliminatedOptions[letter]) {
      setEliminatedOptions((prev) => ({ ...prev, [letter]: false }));
    }
    setPendingSelected(letter);
  };

  // Envio final ao apertar o botão "Resolver"
  const handleConfirmAnswer = () => {
    if (isAnswered || !pendingSelected) return;
    setIsAnswered(true);
    const isCorrect = pendingSelected === question.correctAnswer;
    onAnswer(question.id, pendingSelected, isCorrect);
    setShowCommentary(true);
  };

  // Mapeamento dinâmico de fontes ergonômicas com alta visibilidade médica
  const statementSizeClass =
    fontSize === 'sm'
      ? 'text-[15px] sm:text-[15.5px] leading-[1.75]'
      : fontSize === 'lg'
      ? 'text-[18px] sm:text-[19px] leading-[1.85]'
      : 'text-[16.5px] sm:text-[17px] leading-[1.8]';

  const optionSizeClass =
    fontSize === 'sm'
      ? 'text-[13.5px] sm:text-[14px] leading-relaxed'
      : fontSize === 'lg'
      ? 'text-[16px] sm:text-[17px] leading-relaxed'
      : 'text-[14.5px] sm:text-[15px] leading-relaxed';

  const optionPaddingClass =
    fontSize === 'sm'
      ? 'p-3.5 sm:p-4 rounded-xl gap-3.5'
      : fontSize === 'lg'
      ? 'p-4.5 sm:p-5.5 rounded-2xl gap-4.5'
      : 'p-4 sm:p-4.5 rounded-xl gap-4';

  const badgeSizeClass =
    fontSize === 'sm'
      ? 'w-7 h-7 text-xs font-black'
      : fontSize === 'lg'
      ? 'w-9 h-9 text-sm font-black'
      : 'w-8 h-8 text-xs sm:text-sm font-black';

  // Renderizador do enunciado com suporte a destaques múltiplos do marca-texto
  const renderHighlightedStatement = (statement: string) => {
    if (highlights.length === 0) {
      return <span>{statement}</span>;
    }

    // Cria regex com todas as palavras/trechos destacados
    const sortedHighlights = [...highlights].sort((a, b) => b.text.length - a.text.length);
    const escapedTerms = sortedHighlights.map((h) =>
      h.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
    const parts = statement.split(regex);

    return (
      <>
        {parts.map((part, i) => {
          const matchedHl = sortedHighlights.find(
            (h) => h.text.toLowerCase() === part.toLowerCase()
          );

          if (matchedHl) {
            const colorClasses =
              matchedHl.color === 'yellow'
                ? 'bg-amber-300 dark:bg-amber-400 text-black dark:text-black font-semibold border-b-2 border-amber-500'
                : matchedHl.color === 'green'
                ? 'bg-emerald-300 dark:bg-emerald-400 text-black dark:text-black font-semibold border-b-2 border-emerald-500'
                : 'bg-pink-300 dark:bg-pink-400 text-black dark:text-black font-semibold border-b-2 border-pink-500';

            return (
              <mark
                key={i}
                onClick={() => removeHighlight(matchedHl.id)}
                title="Clique para remover este destaque"
                className={`cursor-pointer px-1 py-0.5 rounded-md transition-all hover:opacity-85 ${colorClasses}`}
              >
                {part}
              </mark>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </>
    );
  };

  const isUserCorrect = isAnswered && pendingSelected === question.correctAnswer;

  return (
    <article className="bento-card bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative transition-all">
      {/* Header com Badges Médicos & Ferramentas da Questão */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-wrap items-center gap-2">
          {/* Banca e Ano: Sempre visíveis por padrão conforme solicitado */}
          <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 flex items-center gap-1.5 shadow-xs">
            <Building className="w-3.5 h-3.5 text-blue-500" />
            <span>{question.institution}</span>
            <span className="text-slate-400">•</span>
            <span>{question.year}</span>
          </span>

          {/* Botão para Revelar/Ocultar detalhes da questão (Especialidade, Dificuldade, Tema) */}
          <button
            type="button"
            onClick={toggleShowDetails}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold transition-all cursor-pointer shadow-xs ${
              showDetails
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300'
                : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
            title={showDetails ? 'Ocultar detalhes extras da questão' : 'Visualizar detalhes extras (especialidade, nível e temas)'}
          >
            {showDetails ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-blue-500" />
                <span>Ocultar Detalhes</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>Ver Detalhes</span>
              </>
            )}
          </button>

          {/* Botão de Favoritar a Questão na Barra Superior */}
          <button
            type="button"
            onClick={handleToggleBookmark}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold transition-all cursor-pointer shadow-xs ${
              isFavorited
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/60 text-amber-700 dark:text-amber-300'
                : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
            title={isFavorited ? 'Remover dos favoritos' : 'Favoritar esta questão'}
          >
            <Bookmark
              className={`w-3.5 h-3.5 transition-transform ${
                isFavorited ? 'fill-amber-500 text-amber-500 scale-110' : 'text-slate-400'
              }`}
            />
            <span>{isFavorited ? 'Favoritada' : 'Favoritar'}</span>
          </button>

          {/* Botão de Salvar a Questão em Pasta Personalizada */}
          {folders && onSaveToFolder && (
            <button
              type="button"
              onClick={() => setIsFolderModalOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold transition-all cursor-pointer shadow-xs ${
                savedFolderIds.length > 0
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700/60 text-blue-700 dark:text-blue-300'
                  : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Salvar esta questão em uma pasta de estudos"
            >
              <FolderPlus
                className={`w-3.5 h-3.5 transition-transform ${
                  savedFolderIds.length > 0 ? 'text-blue-600 dark:text-blue-400 scale-110' : 'text-slate-400'
                }`}
              />
              <span>{savedFolderIds.length > 0 ? `Na Pasta (${savedFolderIds.length})` : 'Salvar na Pasta'}</span>
            </button>
          )}

          {/* Badges Extras: Visíveis APENAS se o aluno apertar para ver detalhes */}
          {showDetails && (
            <>
              {(question.especialidade || question.specialty) && (
                <span className="text-xs font-bold px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-xs animate-in fade-in duration-150">
                  {question.especialidade || question.specialty}
                </span>
              )}

              {question.difficulty && (
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-xl border shadow-xs animate-in fade-in duration-150 ${
                    question.difficulty === 'Fácil'
                      ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50'
                      : question.difficulty === 'Médio'
                      ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50'
                      : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50'
                  }`}
                >
                  {question.difficulty}
                </span>
              )}

              {question.tipoProva && (
                <span className="text-xs px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium border border-slate-200 dark:border-slate-800 animate-in fade-in duration-150">
                  {question.tipoProva}
                </span>
              )}
            </>
          )}
        </div>

        {/* Ferramentas: Marca-texto, Tamanho de Fonte e Contador */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Seletor do Marca-Texto */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-bold shadow-xs">
            <span className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 px-1 font-semibold">
              <Highlighter className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Marca-texto:</span>
            </span>
            <button
              type="button"
              onClick={() => setActiveHighlighterColor('yellow')}
              title="Marca-texto Amarelo"
              className={`w-5 h-5 rounded-md transition-all cursor-pointer border ${
                activeHighlighterColor === 'yellow'
                  ? 'bg-amber-300 border-amber-500 ring-2 ring-amber-400/40 scale-105'
                  : 'bg-amber-200 border-amber-300 opacity-60 hover:opacity-100'
              }`}
            />
            <button
              type="button"
              onClick={() => setActiveHighlighterColor('green')}
              title="Marca-texto Verde"
              className={`w-5 h-5 rounded-md transition-all cursor-pointer border ${
                activeHighlighterColor === 'green'
                  ? 'bg-emerald-300 border-emerald-500 ring-2 ring-emerald-400/40 scale-105'
                  : 'bg-emerald-200 border-emerald-300 opacity-60 hover:opacity-100'
              }`}
            />
            <button
              type="button"
              onClick={() => setActiveHighlighterColor('pink')}
              title="Marca-texto Rosa"
              className={`w-5 h-5 rounded-md transition-all cursor-pointer border ${
                activeHighlighterColor === 'pink'
                  ? 'bg-pink-300 border-pink-500 ring-2 ring-pink-400/40 scale-105'
                  : 'bg-pink-200 border-pink-300 opacity-60 hover:opacity-100'
              }`}
            />
            {highlights.length > 0 && (
              <button
                type="button"
                onClick={clearAllHighlights}
                title="Limpar todas as marcações desta questão"
                className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 px-1 py-0.5 rounded transition-colors cursor-pointer ml-1"
              >
                <Eraser className="w-3 h-3" />
                <span className="hidden md:inline">Limpar ({highlights.length})</span>
              </button>
            )}
          </div>

          {/* Ajuste de Fonte */}
          {onChangeFontSize && (
            <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-bold shadow-xs">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 px-1 font-semibold">Fonte:</span>
              <button
                type="button"
                onClick={() => onChangeFontSize('sm')}
                title="Fonte Compacta"
                className={`px-1.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                  fontSize === 'sm'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-black'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => onChangeFontSize('base')}
                title="Fonte Padrão"
                className={`px-1.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                  fontSize === 'base'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-black'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => onChangeFontSize('lg')}
                title="Fonte Grande"
                className={`px-1.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                  fontSize === 'lg'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-black'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                A+
              </button>
            </div>
          )}

          <span className="text-sm sm:text-base font-sans font-black text-slate-700 dark:text-slate-300">
            {index + 1}/{total}
          </span>
        </div>
      </div>

      {/* Tema, Foco e Subfoco Clínico (Exibido apenas se o aluno apertar para ver detalhes) */}
      {showDetails && (question.subtheme || question.tema) && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 animate-in fade-in duration-150">
          <Layers className="w-3.5 h-3.5 text-blue-500" />
          <span className="font-semibold">Tema:</span>
          <span className="text-slate-900 dark:text-slate-200 font-bold">
            {question.subtheme || question.tema}
          </span>
          {question.foco && (
            <>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-purple-600 dark:text-purple-400 font-medium">
                {question.foco}
              </span>
            </>
          )}
          {question.subfoco && (
            <>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-slate-600 dark:text-slate-400 italic">
                {question.subfoco}
              </span>
            </>
          )}
        </div>
      )}

      {/* Enunciado Clínico com Marcador de Texto Ativo - Texto Justificado */}
      <div className="relative">
        <div
          ref={statementRef}
          onMouseUp={handleStatementMouseUp}
          onTouchEnd={handleStatementMouseUp}
          className={`${statementSizeClass} text-slate-950 dark:text-slate-100 font-medium whitespace-pre-line tracking-normal select-text text-justify selection:bg-amber-300 selection:text-black dark:selection:bg-amber-400 dark:selection:text-black`}
          style={{ textAlign: 'justify', textJustify: 'inter-word' }}
        >
          {renderHighlightedStatement(question.statement)}
        </div>
      </div>

      {/* Imagens Anexadas */}
      {((question.images && question.images.length > 0) || question.imageUrl) && (
        <div className="pt-2 flex flex-col gap-3">
          {(question.images || (question.imageUrl ? [question.imageUrl] : [])).map((imgUrl, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 p-3 max-w-2xl shadow-inner"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgUrl}
                alt={`Imagem ${i + 1} da questão`}
                className="w-full h-auto object-contain rounded-xl max-h-[480px]"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}

      {/* Alternativas (Múltipla Escolha) com Riscador e Seleção Prévia */}
      {question.options && question.options.length > 0 ? (
        <div className="space-y-3 pt-2">
          {question.options.map((option) => {
            const isEliminated = !!eliminatedOptions[option.letter];
            const isPending = pendingSelected === option.letter;
            const isCorrect = option.letter === question.correctAnswer;

            // Estilos condicionais (Antes de Responder vs Depois de Responder)
            let optionContainerStyle =
              'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 hover:bg-slate-50/80 dark:hover:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200 shadow-xs';

            const isExplanationExpanded = !!expandedOptions[option.letter];
            const explanationText = optionExplanations[option.letter];

            if (!isAnswered) {
              if (isPending) {
                optionContainerStyle =
                  'border-blue-500 dark:border-blue-400 bg-blue-50/70 dark:bg-blue-950/50 text-blue-950 dark:text-blue-100 ring-2 ring-blue-500/30 shadow-sm font-semibold';
              } else if (isEliminated) {
                optionContainerStyle =
                  'border-slate-200 dark:border-slate-800/60 bg-slate-50/80 dark:bg-slate-950/30 text-slate-400 dark:text-slate-500 opacity-60';
              }
            } else {
              // Já respondeu
              if (isCorrect) {
                optionContainerStyle =
                  'border-emerald-500/80 bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/30 shadow-sm font-semibold';
              } else if (isPending && !isCorrect) {
                optionContainerStyle =
                  'border-rose-500/80 bg-rose-50/80 dark:bg-rose-950/50 text-rose-950 dark:text-rose-200 ring-2 ring-rose-500/30 shadow-sm';
              } else if (isExplanationExpanded) {
                optionContainerStyle =
                  'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-sm';
              } else {
                optionContainerStyle =
                  'opacity-70 hover:opacity-100 border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/30 text-slate-600 dark:text-slate-400';
              }
            }

            return (
              <div
                key={option.letter}
                onClick={() => handleSelectOption(option.letter)}
                className={`w-full text-left ${optionPaddingClass} border transition-all duration-200 flex flex-col group rounded-2xl cursor-pointer ${optionContainerStyle}`}
              >
                <div className="flex items-start justify-between w-full gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Letra da Alternativa */}
                    <span
                      className={`${badgeSizeClass} rounded-xl flex items-center justify-center font-extrabold shrink-0 mt-0.5 shadow-xs transition-colors ${
                        isAnswered && isCorrect
                          ? 'bg-emerald-600 text-white'
                          : isAnswered && isPending && !isCorrect
                          ? 'bg-rose-600 text-white'
                          : isPending
                          ? 'bg-blue-600 text-white ring-2 ring-blue-400/50'
                          : isEliminated
                          ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 line-through'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {option.letter}
                    </span>

                    {/* Conteúdo da Alternativa: Imagem ou Texto */}
                    {isOptionImage(option.text) ? (
                      <div className="flex-1 pt-0.5">
                        <div className="inline-block rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xs max-w-sm sm:max-w-md">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={option.text.trim()}
                            alt={`Alternativa ${option.letter}`}
                            className={`max-h-56 max-w-full object-contain rounded-lg transition-transform ${
                              isEliminated ? 'opacity-40 grayscale' : 'hover:scale-102'
                            }`}
                            loading="lazy"
                          />
                        </div>
                      </div>
                    ) : (
                      <span
                        className={`${optionSizeClass} flex-1 pt-0.5 font-medium transition-all ${
                          isEliminated && !isPending && !isAnswered
                            ? 'line-through text-slate-400 dark:text-slate-500 opacity-60 italic'
                            : ''
                        }`}
                      >
                        {option.text}
                      </span>
                    )}
                  </div>

                  {/* Ações da Alternativa: Riscar (Antes) ou Feedback + Toggle Justificativa (Depois) */}
                  <div className="flex items-center gap-2 shrink-0 ml-3 pt-0.5">
                    {/* Botão de Cortar/Riscar (apenas antes de responder) */}
                    {!isAnswered && (
                      <button
                        type="button"
                        onClick={(e) => toggleEliminateOption(option.letter, e)}
                        title={
                          isEliminated
                            ? 'Restaurar alternativa descartada'
                            : 'Riscar alternativa (descartar distrator)'
                        }
                        className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                          isEliminated
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold border border-rose-300 dark:border-rose-800'
                            : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <Strikethrough className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Feedback Visual pós-resposta + Botão de Justificativa */}
                    {isAnswered && (
                      <div className="flex items-center gap-2">
                        {isCorrect && (
                          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span className="hidden sm:inline">Correta</span>
                          </div>
                        )}
                        {isPending && !isCorrect && (
                          <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 text-xs font-bold">
                            <XCircle className="w-4 h-4 shrink-0" />
                            <span className="hidden sm:inline">Incorreta</span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOptionExplanation(option.letter);
                          }}
                          className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer border ${
                            isExplanationExpanded
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/70 hover:bg-blue-100 dark:hover:bg-blue-900/60'
                          }`}
                          title="Clique para ver ou ocultar a justificativa desta alternativa"
                        >
                          <span>{isExplanationExpanded ? 'Ocultar Justificativa' : 'Ver Justificativa'}</span>
                          {isExplanationExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Justificativa Detalhada da Alternativa (Aberta sob demanda) */}
                {isAnswered && isExplanationExpanded && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="w-full mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 animate-in fade-in duration-150"
                  >
                    <div
                      className={`p-3.5 rounded-xl border text-xs sm:text-[13px] leading-relaxed ${
                        isCorrect
                          ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200'
                          : 'bg-slate-50 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold mb-1.5">
                        <span className={isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}>
                          Justificativa da Alternativa {option.letter} {isCorrect ? '(Correta)' : '(Incorreta)'}:
                        </span>
                      </div>
                      <p className="font-normal whitespace-pre-line text-slate-700 dark:text-slate-300">
                        {explanationText ||
                          (isCorrect
                            ? 'Alternativa correta segundo o gabarito oficial da banca examinadora.'
                            : `Alternativa incorreta. O gabarito oficial definido pela banca é a Alternativa ${question.correctAnswer}.`)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* BARRA DE AÇÃO: BOTÃO "RESOLVER" (Ao selecionar, confirma envio) */}
          {!isAnswered ? (
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-600 dark:text-slate-400">
                {pendingSelected ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span>
                      Alternativa <strong className="text-blue-600 dark:text-blue-400 font-black">{pendingSelected}</strong> selecionada.
                    </span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Selecione uma alternativa acima e clique em Resolver para confirmar.</span>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleConfirmAnswer}
                disabled={!pendingSelected}
                className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer ${
                  pendingSelected
                    ? 'text-white hover:scale-102 active:scale-98 shadow-md'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
                style={
                  pendingSelected
                    ? {
                        backgroundColor: accentConfig.primaryHex,
                        boxShadow: `0 4px 14px 0 ${accentConfig.bgRgba}`
                      }
                    : undefined
                }
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {pendingSelected ? 'Resolver Questão' : 'Selecione uma Alternativa'}
                </span>
              </button>
            </div>
          ) : (
            /* Banner pós-resposta */
            <div
              className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold border shadow-xs ${
                isUserCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/60'
              }`}
            >
              <div className="flex items-center gap-2">
                {isUserCorrect ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>
                  {isUserCorrect
                    ? 'Parabéns! Você acertou a questão!'
                    : `Você errou esta questão. O gabarito oficial é Alternativa ${question.correctAnswer}.`}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowCommentary(!showCommentary)}
                className="text-[11px] underline cursor-pointer hover:opacity-80"
              >
                {showCommentary ? 'Recolher Gabarito' : 'Ver Comentário'}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Questão Dissertativa */
        <div className="pt-2 space-y-3">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
              Questão Dissertativa
            </span>
            <textarea
              placeholder="Digite seu raciocínio clínico, hipótese diagnóstica e condutas aqui..."
              className="w-full h-32 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-sans"
            />
            <button
              onClick={() => {
                setShowCommentary(true);
                setIsAnswered(true);
                onAnswer(question.id, 'A', true);
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md hover:scale-102 flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Resolver e Ver Padrão de Resposta</span>
            </button>
          </div>
        </div>
      )}

      {/* Comentário Final e Resumo Clínico (Exclusivo para o desfecho/síntese da questão) */}
      {(isAnswered || showCommentary) && (
        <div className="pt-2">
          <button
            onClick={() => setShowCommentary(!showCommentary)}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>
              {showCommentary
                ? 'Ocultar comentário final do professor'
                : 'Ver comentário final e resumo clínico'}
            </span>
            {showCommentary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showCommentary && (
            <div className="mt-3 space-y-3.5 animate-in fade-in duration-200">
              {/* Card de Comentário Final / Gabarito */}
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 dark:bg-slate-950 border border-emerald-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 space-y-2.5 shadow-inner">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-xs sm:text-sm">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    {question.options && question.options.length > 0
                      ? `Gabarito Oficial: Alternativa ${question.correctAnswer}`
                      : 'Padrão de Resposta Oficial:'}
                  </span>
                </div>
                <p
                  className={`${
                    fontSize === 'sm'
                      ? 'text-[12.5px] sm:text-[13px] leading-relaxed'
                      : fontSize === 'lg'
                      ? 'text-sm sm:text-base leading-relaxed'
                      : 'text-xs sm:text-sm leading-relaxed'
                  } font-normal text-slate-800 dark:text-slate-300 whitespace-pre-line`}
                >
                  {finalCommentary}
                </p>
              </div>

              {/* Card: Principal Motivo que Poderia Levar ao Erro */}
              {mainErrorReason && (
                <div className="p-4 sm:p-4.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-slate-900 dark:text-slate-200 space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-xs sm:text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Principal Motivo de Erro (Armadilha da Questão)</span>
                  </div>
                  <p className="text-xs sm:text-[13px] leading-relaxed text-amber-950 dark:text-amber-200/90 whitespace-pre-line pl-6">
                    {mainErrorReason}
                  </p>
                </div>
              )}

              {/* Card: Take-Home Message / Pérola Prática */}
              {takeHomeMessage && (
                <div className="p-4 sm:p-4.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 text-slate-900 dark:text-slate-200 space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-2 text-blue-800 dark:text-blue-400 font-bold text-xs sm:text-sm">
                    <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Take-Home Message (Pérola Prática)</span>
                  </div>
                  <p className="text-xs sm:text-[13px] leading-relaxed text-blue-950 dark:text-blue-200/90 font-medium whitespace-pre-line pl-6">
                    {takeHomeMessage}
                  </p>
                </div>
              )}

              {/* Card: Evolução de Diretrizes & Contexto Histórico da Banca */}
              {guidelineEvolution && (
                <div className="p-4 sm:p-4.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 text-slate-900 dark:text-slate-200 space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-400 font-bold text-xs sm:text-sm">
                    <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>Evolução de Diretrizes & Contexto Histórico da Banca</span>
                  </div>
                  <p className="text-xs sm:text-[13px] leading-relaxed text-indigo-950 dark:text-indigo-200/90 whitespace-pre-line pl-6">
                    {guidelineEvolution}
                  </p>
                </div>
              )}

              {/* Referências e Fontes da Literatura Médica Oficial */}
              {references && references.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                    <Library className="w-3.5 h-3.5 text-slate-500" />
                    <span>Base Teórica & Diretrizes Médicas:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 pl-1 text-slate-600 dark:text-slate-400">
                    {references.map((ref, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {ref}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Espaço de Interação: Comentários dos Alunos Abaixo da Questão */}
      <QuestionComments
        questionId={question.id}
        isAnswered={isAnswered}
      />

      {/* Modal para Salvar Questão em Pastas (3 níveis) */}
      {folders && onSaveToFolder && (
        <SendQuestionToFolderModal
          isOpen={isFolderModalOpen}
          onClose={() => setIsFolderModalOpen(false)}
          question={question}
          folders={folders}
          onCreateFolder={(name, parentId) => {
            if (onCreateFolder) onCreateFolder(name, parentId);
          }}
          onSaveToFolder={onSaveToFolder}
          savedFolderIds={savedFolderIds}
        />
      )}
    </article>
  );
};
