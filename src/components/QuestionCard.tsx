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
  FolderPlus,
  Check,
  RotateCcw,
  Sparkles,
  AlertCircle
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
  activeHighlighterColor?: HighlighterColor;
  onSelectHighlighterColor?: (color: HighlighterColor) => void;
}

export type HighlighterColor = 'yellow' | 'green' | 'pink' | 'blue' | 'orange' | 'purple';

export const HIGHLIGHTER_COLORS: Record<
  HighlighterColor,
  {
    name: string;
    bg: string;
    border: string;
    ring: string;
    markClass: string;
    hex: string;
    borderHex: string;
  }
> = {
  yellow: {
    name: 'Amarelo',
    bg: 'bg-amber-300',
    border: 'border-amber-500',
    ring: 'ring-amber-400/50',
    markClass: 'bg-amber-300 dark:bg-amber-400 text-black dark:text-black font-semibold border-b-2 border-amber-500',
    hex: '#fcd34d',
    borderHex: '#f59e0b'
  },
  green: {
    name: 'Verde',
    bg: 'bg-emerald-300',
    border: 'border-emerald-500',
    ring: 'ring-emerald-400/50',
    markClass: 'bg-emerald-300 dark:bg-emerald-400 text-black dark:text-black font-semibold border-b-2 border-emerald-500',
    hex: '#6ee7b7',
    borderHex: '#10b981'
  },
  pink: {
    name: 'Rosa',
    bg: 'bg-pink-300',
    border: 'border-pink-500',
    ring: 'ring-pink-400/50',
    markClass: 'bg-pink-300 dark:bg-pink-400 text-black dark:text-black font-semibold border-b-2 border-pink-500',
    hex: '#f9a8d4',
    borderHex: '#ec4899'
  },
  blue: {
    name: 'Azul',
    bg: 'bg-sky-300',
    border: 'border-sky-500',
    ring: 'ring-sky-400/50',
    markClass: 'bg-sky-300 dark:bg-sky-400 text-black dark:text-black font-semibold border-b-2 border-sky-500',
    hex: '#7dd3fc',
    borderHex: '#0ea5e9'
  },
  orange: {
    name: 'Laranja',
    bg: 'bg-orange-300',
    border: 'border-orange-500',
    ring: 'ring-orange-400/50',
    markClass: 'bg-orange-300 dark:bg-orange-400 text-black dark:text-black font-semibold border-b-2 border-orange-500',
    hex: '#fdba74',
    borderHex: '#f97316'
  },
  purple: {
    name: 'Roxo',
    bg: 'bg-purple-300',
    border: 'border-purple-500',
    ring: 'ring-purple-400/50',
    markClass: 'bg-purple-300 dark:bg-purple-400 text-black dark:text-black font-semibold border-b-2 border-purple-500',
    hex: '#d8b4fe',
    borderHex: '#a855f7'
  }
};

interface TextHighlight {
  id: string;
  text: string;
  color: HighlighterColor;
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
  savedFolderIds = [],
  activeHighlighterColor: propHighlighterColor,
  onSelectHighlighterColor
}) => {
  const { accentConfig } = useTheme();

  // Modal para salvar em pastas de 3 níveis
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

  // Estados de resolução da questão (seleção prévia vs confirmação no botão Resolver)
  const [pendingSelected, setPendingSelected] = useState<'A' | 'B' | 'C' | 'D' | 'E' | null>(userAnswer || null);
  const [isAnswered, setIsAnswered] = useState<boolean>(!!userAnswer);
  const [showCommentary, setShowCommentary] = useState<boolean>(!!userAnswer);

  // Estado de alternativas riscadas/cortadas pelo aluno
  const [eliminatedOptions, setEliminatedOptions] = useState<Record<string, boolean>>({});

  // Estado de justificativas das alternativas expandidas pelo aluno
  const [expandedOptions, setExpandedOptions] = useState<Record<string, boolean>>({});

  // Estado dos tópicos auxiliares do comentário (motivo de erro, take-home, diretrizes, referências)
  const [openTopics, setOpenTopics] = useState<Record<string, boolean>>({});
  const toggleTopic = (key: string) => {
    setOpenTopics((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Helper para renderizar texto com marcações em negrito (**texto**) de forma limpa e nativa
  const renderFormattedText = (text: string | null | undefined) => {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  // Detecção de gabarito sob suspeita/possível erro da banca
  const isSuspectKey = useMemo(() => {
    const comm = question.commentary || '';
    return (
      comm.includes('[POSSÍVEL ERRO DE GABARITO') ||
      comm.includes('POSSIVEL ERRO DE GABARITO')
    );
  }, [question.commentary]);

  // Estados de Marcador de Texto (Highlight)
  const [highlights, setHighlights] = useState<TextHighlight[]>([]);
  const activeHighlighterColor = propHighlighterColor || 'yellow';

  // Rastreamento da alternativa em hover para atalho de corte/risco (Backspace/Delete)
  const [hoveredOptionLetter, setHoveredOptionLetter] = useState<string | null>(null);

  const statementRef = useRef<HTMLDivElement>(null);

  // Visibilidade dos detalhes extras da questão (Banca e Ano aparecem por padrão; demais detalhes apenas se o aluno apertar)
  const [showDetails, setShowDetails] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('bancoresidencia_question_show_details');
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
        localStorage.setItem('bancoresidencia_question_show_details', String(next));
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
    setOpenTopics({});
    setHighlights([]);
    setHoveredOptionLetter(null);
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

    // Extração de Evolução de Diretrizes
    if (!extractedGuideline) {
      const gRegex = /(?:^|\n)\s*(?:Evolução de Diretrizes(?:\s*(?:&|e)\s*Contexto Histórico)?|Contexto Histórico(?:\s*da Banca)?|Mudança de Diretriz(?:es)?|Diretrizes Anteriores vs Atuais|Atualização de Conduta):\s*([\s\S]*?)(?=(?:\n\s*\n\s*(?:Take-Home Message|Pérola Prática|Principal Motivo|Motivo de Erro|Referências|Fontes|Gabarito)|$))/i;
      const gMatch = cleanedFinal.match(gRegex);
      if (gMatch) {
        extractedGuideline = gMatch[1].trim();
        cleanedFinal = cleanedFinal.replace(gMatch[0], '').trim();
      }
    }

    // Extração de Take-Home Message / Pérola Prática do comentário
    if (!extractedTakeHome) {
      const thRegex = /(?:^|\n)\s*(?:Take-Home Message|Mensagem-Chave|Pérola Prática(?: para Prova)?|Pérola Clínica|Clinical Pearl|Pérola de Prova):\s*([\s\S]*?)(?=(?:\n\s*\n\s*(?:Principal Motivo|Motivo de Erro|Armadilha|Evolução de Diretrizes|Referências|Fontes|Gabarito)|$))/i;
      const thMatch = cleanedFinal.match(thRegex);
      if (thMatch) {
        extractedTakeHome = thMatch[1].trim();
        cleanedFinal = cleanedFinal.replace(thMatch[0], '').trim();
      }
    }

    // Extração do Principal Motivo de Erro / Armadilha da Questão
    if (!extractedError) {
      const errRegex = /(?:^|\n)\s*(?:Principal Motivo (?:de Erro|que Leva ao Erro)|Motivo de Erro|Armadilha da Questão|Pegadinha de Prova|Onde o Aluno Costuma Errar):\s*([\s\S]*?)(?=(?:\n\s*\n\s*(?:Take-Home Message|Pérola Prática|Evolução de Diretrizes|Referências|Fontes|Gabarito)|$))/i;
      const errMatch = cleanedFinal.match(errRegex);
      if (errMatch) {
        extractedError = errMatch[1].trim();
        cleanedFinal = cleanedFinal.replace(errMatch[0], '').trim();
      }
    }

    // Extração de Referências Teóricas
    if (extractedRefs.length === 0) {
      const refRegex = /(?:^|\n)\s*(?:Referências(?:\s+Bibliográficas)?|Fontes Bibliográficas|Base Teórica(?: Consultada)?):\s*([\s\S]*?)(?=(?:\n\s*\n\s*(?:Take-Home Message|Pérola Prática|Principal Motivo|Evolução de Diretrizes)|$))/i;
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
    const altBlockRegex = /(?:^|\n)\s*(?:Análise das Alternativas|Comentário das Alternativas|Justificativa das Alternativas|Alternativas):([\s\S]*?)(?=(?:\n\s*\n\s*(?:Resumo Clínico|Pérola Prática|Clinical Pearl|Take-Home|Principal Motivo|Evolução|Referências|Gabarito Oficial)|$))/i;
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

    cleanedFinal = sanitizeText(cleanedFinal)
      .replace(/^Gabarito Oficial:\s*Alternativa\s*[A-E]\.?\s*/im, '')
      .replace(/^Resumo Clínico e Diagnóstico:\s*/im, '')
      .replace(/^Resumo Clínico:\s*/im, '')
      .trim();

    extractedError = sanitizeText(extractedError);

    extractedTakeHome = sanitizeText(extractedTakeHome)
      .replace(/^\(?\s*Pérola Prática\s*[:)]?\s*/i, '')
      .trim();

    extractedGuideline = sanitizeText(extractedGuideline)
      .replace(/^(?:(?:&|e)\s*)?Contexto Histórico(?:\s*da Banca)?[:\s]*/i, '')
      .replace(/^da Banca[:\s]*/i, '')
      .trim();

    extractedRefs = extractedRefs
      .map(sanitizeText)
      .filter((r) => !/^(te[oó]ricas?|base te[oó]rica|refer[eê]ncias?)\b/i.test(r.trim()));

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

  const addHighlight = (text: string, color: HighlighterColor) => {
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

  // Permite ao aluno re-resolver a questão já respondida
  const handleStartReSolve = () => {
    setIsAnswered(false);
    setPendingSelected(null);
    setShowCommentary(false);
  };

  // Envio final ao apertar o botão "Resolver"
  const handleConfirmAnswer = () => {
    if (isAnswered || !pendingSelected) return;
    setIsAnswered(true);
    const isAnuladaQuestion = Boolean(question.isAnulada || question.correctAnswer === 'ANULADA');
    // Questões anuladas pela banca nunca devem contar como erro ao aluno confirmar
    const isCorrect = isAnuladaQuestion ? true : pendingSelected === question.correctAnswer;
    onAnswer(question.id, pendingSelected, isCorrect);
    setShowCommentary(true);
  };

  // Atalhos de teclado: 1 a 5 ou A a E, Enter para finalizar, Backspace/Del para riscar e C para gabarito
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignora digitação em campos de texto ou elementos editáveis
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Ignora se o modal de salvar em pasta estiver aberto
      if (isFolderModalOpen) return;

      // Tecla Backspace ou Delete: Riscar / Cortar a alternativa selecionada pelo teclado (ou sob o mouse)
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (!isAnswered) {
          const targetLetter = (pendingSelected || hoveredOptionLetter) as 'A' | 'B' | 'C' | 'D' | 'E' | null;
          if (targetLetter) {
            e.preventDefault();
            setEliminatedOptions((prev) => {
              const nextEliminated = !prev[targetLetter];
              if (nextEliminated && pendingSelected === targetLetter) {
                setPendingSelected(null);
              }
              return {
                ...prev,
                [targetLetter]: nextEliminated
              };
            });
            return;
          }
        }
      }

      // Se pressionou C ou G e já respondeu, permite usar como atalho para Comentário do Professor / Gabarito
      if ((e.key === 'c' || e.key === 'C' || e.key === 'g' || e.key === 'G') && isAnswered) {
        e.preventDefault();
        setShowCommentary((prev) => !prev);
        return;
      }

      // Se pressionou V e já respondeu, permite alternar justificativa da opção selecionada ou em hover
      if ((e.key === 'v' || e.key === 'V') && isAnswered) {
        const targetLetter = (hoveredOptionLetter || pendingSelected || question.correctAnswer) as 'A' | 'B' | 'C' | 'D' | 'E' | undefined;
        if (targetLetter) {
          e.preventDefault();
          toggleOptionExplanation(targetLetter);
          return;
        }
      }

      // Teclas 1 a 5 ou A a E para seleção de alternativas
      const keyMap: Record<string, 'A' | 'B' | 'C' | 'D' | 'E'> = {
        '1': 'A',
        '2': 'B',
        '3': 'C',
        '4': 'D',
        '5': 'E',
        Digit1: 'A',
        Digit2: 'B',
        Digit3: 'C',
        Digit4: 'D',
        Digit5: 'E',
        Numpad1: 'A',
        Numpad2: 'B',
        Numpad3: 'C',
        Numpad4: 'D',
        Numpad5: 'E',
        a: 'A',
        b: 'B',
        c: 'C',
        d: 'D',
        e: 'E',
        A: 'A',
        B: 'B',
        C: 'C',
        D: 'D',
        E: 'E',
        KeyA: 'A',
        KeyB: 'B',
        KeyC: 'C',
        KeyD: 'D',
        KeyE: 'E'
      };

      const letter = keyMap[e.key] || keyMap[e.code];
      if (letter) {
        const hasOption = question.options?.some((opt) => opt.letter === letter);
        if (hasOption) {
          if (!isAnswered) {
            e.preventDefault();
            handleSelectOption(letter);
          } else {
            e.preventDefault();
            toggleOptionExplanation(letter);
          }
        }
        return;
      }

      // Tecla Enter para finalizar (confirmar resposta da questão)
      if (e.key === 'Enter') {
        if (!isAnswered && pendingSelected) {
          e.preventDefault();
          handleConfirmAnswer();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, pendingSelected, question, isFolderModalOpen, hoveredOptionLetter]);

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
            const colorConfig = HIGHLIGHTER_COLORS[matchedHl.color] || HIGHLIGHTER_COLORS.yellow;

            return (
              <mark
                key={i}
                onClick={() => removeHighlight(matchedHl.id)}
                title="Clique para remover este destaque"
                style={{
                  backgroundColor: colorConfig.hex,
                  borderBottomColor: colorConfig.borderHex
                }}
                className="cursor-pointer px-1 py-0.5 rounded-md transition-all hover:opacity-85 text-black font-semibold border-b-2"
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

  const isAnuladaQuestion = Boolean(question.isAnulada || question.correctAnswer === 'ANULADA');
  const hasPreviousAnswer = !!userAnswer;
  const previousIsCorrect = hasPreviousAnswer && (isAnuladaQuestion || userAnswer === question.correctAnswer);
  const isUserCorrect = isAnswered && (isAnuladaQuestion || pendingSelected === question.correctAnswer);

  const selectionColorClass =
    activeHighlighterColor === 'green'
      ? 'selection:bg-emerald-300 dark:selection:bg-emerald-400 selection:text-black dark:selection:text-black'
      : activeHighlighterColor === 'pink'
      ? 'selection:bg-pink-300 dark:selection:bg-pink-400 selection:text-black dark:selection:text-black'
      : activeHighlighterColor === 'blue'
      ? 'selection:bg-sky-300 dark:selection:bg-sky-400 selection:text-black dark:selection:text-black'
      : activeHighlighterColor === 'orange'
      ? 'selection:bg-orange-300 dark:selection:bg-orange-400 selection:text-black dark:selection:text-black'
      : activeHighlighterColor === 'purple'
      ? 'selection:bg-purple-300 dark:selection:bg-purple-400 selection:text-black dark:selection:text-black'
      : 'selection:bg-amber-300 dark:selection:bg-amber-400 selection:text-black dark:selection:text-black';

  return (
    <article className="bento-card bg-white dark:bg-[var(--bg-card)] border border-zinc-200 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative transition-all">
      {/* Header Reorganizado: Origem da Questão (Esquerda) + Ações e Contador (Direita) */}
      <div className="flex flex-col gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
        {/* Linha Principal do Topo */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Canto Superior Esquerdo: Origem da Questão (Banca • Ano) + Status Resolvida */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 shadow-xs">
              <Building className="w-3.5 h-3.5" style={{ color: accentConfig.primaryHex }} />
              <span>{question.institution}</span>
              <span className="text-slate-400">•</span>
              <span>{question.year}</span>
            </span>

            {/* Mini-card de Status de Resolução Anterior */}
            {hasPreviousAnswer && (
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-xl border shadow-xs transition-all ${
                  isAnuladaQuestion
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300'
                    : previousIsCorrect
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300'
                }`}
              >
                {isAnuladaQuestion ? (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                ) : previousIsCorrect ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
                <span>Resolvida</span>
                <button
                  type="button"
                  onClick={handleStartReSolve}
                  title="Resolver novamente esta questão"
                  className="ml-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-white dark:bg-zinc-900 border border-current hover:opacity-80 transition-all cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Refazer</span>
                </button>
              </div>
            )}

            {/* Borracha rápida de limpar destaques se houver marcações na questão */}
            {highlights.length > 0 && (
              <button
                type="button"
                onClick={clearAllHighlights}
                title={`Limpar ${highlights.length} marcação(ões) desta questão`}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer border border-rose-200 dark:border-rose-900/50 shadow-xs"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Limpar ({highlights.length})</span>
              </button>
            )}
          </div>

          {/* Canto Superior Direito: Ações (Detalhes, Salvar na Pasta) + Contador da Questão */}
          <div className="flex items-center gap-2">
            {/* Botão para Revelar/Ocultar detalhes da questão (Apenas Ícone) */}
            <button
              type="button"
              onClick={toggleShowDetails}
              className={`p-1.5 sm:px-2 sm:py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer shadow-xs ${
                showDetails
                  ? 'shadow-xs'
                  : 'btn-secondary-adaptive hover:scale-105'
              }`}
              style={showDetails ? {
                backgroundColor: accentConfig.bgRgba,
                borderColor: accentConfig.borderRgba,
                color: accentConfig.primaryHex
              } : undefined}
              title={showDetails ? 'Ocultar detalhes extras da questão' : 'Visualizar detalhes extras (especialidade, nível e temas)'}
            >
              {showDetails ? (
                <EyeOff className="w-3.5 h-3.5" style={{ color: accentConfig.primaryHex }} />
              ) : (
                <Eye className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {/* Botão de Salvar em Pasta Personalizada */}
            {folders && onSaveToFolder && (
              <button
                type="button"
                onClick={() => setIsFolderModalOpen(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer shadow-xs ${
                  savedFolderIds.length > 0
                    ? 'shadow-xs'
                    : 'btn-secondary-adaptive hover:scale-102'
                }`}
                style={savedFolderIds.length > 0 ? {
                  backgroundColor: accentConfig.bgRgba,
                  borderColor: accentConfig.borderRgba,
                  color: accentConfig.primaryHex
                } : undefined}
                title="Salvar esta questão em uma pasta de estudos"
              >
                <FolderPlus
                  className="w-3.5 h-3.5 transition-transform"
                  style={{
                    color: savedFolderIds.length > 0 ? accentConfig.primaryHex : undefined
                  }}
                />
                <span className="hidden sm:inline">{savedFolderIds.length > 0 ? `Na Pasta (${savedFolderIds.length})` : 'Salvar na Pasta'}</span>
              </button>
            )}

            {/* Contador de Questão (1/50) */}
            <div className="ml-1 pl-2 border-l border-slate-200 dark:border-slate-800">
              <span className="text-xs sm:text-sm font-sans font-black text-slate-700 dark:text-slate-300 whitespace-nowrap">
                {index + 1}/{total}
              </span>
            </div>
          </div>
        </div>

        {/* Linha 2: Badges Médicos & Hierarquia Temática (Visíveis quando showDetails está ativo) */}
        {showDetails && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 animate-in fade-in duration-150">
            {/* Badges de Especialidade, Dificuldade e Tipo de Prova */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(question.especialidade || question.specialty) && (
                <span className="text-xs font-bold px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
                  {question.especialidade || question.specialty}
                </span>
              )}

              {question.difficulty && (
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-xl border shadow-xs ${
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
                <span className="text-xs px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium border border-slate-200 dark:border-slate-800">
                  {question.tipoProva}
                </span>
              )}
            </div>

            {/* Tema, Foco e Subfoco Clínico */}
            {(question.subtheme || question.tema) && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                <Layers className="w-3.5 h-3.5" style={{ color: accentConfig.primaryHex }} />
                <span className="font-semibold">Tema:</span>
                <span className="text-slate-900 dark:text-slate-200 font-bold">
                  {question.subtheme || question.tema}
                </span>
                {question.foco && (
                  <>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-purple-600 dark:text-purple-400 font-medium">{question.foco}</span>
                  </>
                )}
                {question.subfoco && (
                  <>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-slate-600 dark:text-slate-400 italic">{question.subfoco}</span>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enunciado Clínico com Marcador de Texto Ativo - Texto Justificado */}
      <div className="relative">
        <div
          ref={statementRef}
          onMouseUp={handleStatementMouseUp}
          onTouchEnd={handleStatementMouseUp}
          className={`${statementSizeClass} text-slate-950 dark:text-slate-100 font-medium whitespace-pre-line tracking-normal select-text text-justify ${selectionColorClass}`}
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
              className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-3 max-w-2xl shadow-inner"
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
              'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[var(--bg-card)] hover:bg-zinc-50/80 dark:hover:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200 shadow-xs';

            const isExplanationExpanded = !!expandedOptions[option.letter];
            const explanationText = optionExplanations[option.letter];

            if (!isAnswered) {
              if (isPending) {
                optionContainerStyle =
                  'border-blue-500 dark:border-blue-400 bg-blue-50/70 dark:bg-blue-950/50 text-blue-950 dark:text-blue-100 ring-2 ring-blue-500/30 shadow-sm font-semibold';
              } else if (isEliminated) {
                optionContainerStyle =
                  'border-zinc-200 dark:border-zinc-800/60 bg-zinc-50/80 dark:bg-zinc-900/30 text-zinc-400 dark:text-zinc-500 opacity-60';
              }
            } else {
              // Já respondeu
              if (isCorrect) {
                optionContainerStyle =
                  'border-emerald-500/80 bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/30 shadow-sm font-semibold';
              } else if (isPending && isAnuladaQuestion) {
                optionContainerStyle =
                  'border-amber-500/80 bg-amber-50/80 dark:bg-amber-950/50 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500/30 shadow-sm font-semibold';
              } else if (isPending && !isCorrect) {
                optionContainerStyle =
                  'border-rose-500/80 bg-rose-50/80 dark:bg-rose-950/50 text-rose-950 dark:text-rose-200 ring-2 ring-rose-500/30 shadow-sm';
              } else if (isExplanationExpanded) {
                optionContainerStyle =
                  'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 shadow-sm';
              } else {
                optionContainerStyle =
                  'opacity-70 hover:opacity-100 border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/30 text-zinc-600 dark:text-zinc-400';
              }
            }

            return (
              <div
                key={option.letter}
                onClick={() => handleSelectOption(option.letter)}
                onMouseEnter={() => setHoveredOptionLetter(option.letter)}
                onMouseLeave={() => setHoveredOptionLetter(null)}
                className={`w-full text-left ${optionPaddingClass} border transition-all duration-200 flex flex-col group rounded-2xl cursor-pointer ${optionContainerStyle}`}
                style={!isAnswered && isPending ? {
                  borderColor: accentConfig.selectionAccent.borderHex,
                  backgroundColor: accentConfig.selectionAccent.bgRgba,
                  boxShadow: `0 0 0 2px ${accentConfig.borderRgba}`
                } : undefined}
              >
                <div className="flex items-start justify-between w-full gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Letra da Alternativa */}
                    <span
                      title={`Alternativa ${option.letter} (tecla ${['A', 'B', 'C', 'D', 'E'].indexOf(option.letter) + 1})`}
                      className={`${badgeSizeClass} rounded-xl flex items-center justify-center font-extrabold shrink-0 mt-0.5 shadow-xs transition-colors ${
                        isAnswered && isCorrect
                          ? 'bg-emerald-600 text-white'
                          : isAnswered && isPending && isAnuladaQuestion
                          ? 'bg-amber-600 text-white'
                          : isAnswered && isPending && !isCorrect
                          ? 'bg-rose-600 text-white'
                          : isPending
                          ? 'text-white shadow-sm'
                          : isEliminated
                          ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 line-through'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                      }`}
                      style={!isAnswered && isPending ? {
                        backgroundColor: accentConfig.primaryHex,
                        boxShadow: `0 0 0 2px ${accentConfig.borderRgba}`
                      } : undefined}
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
                        {isPending && isAnuladaQuestion && !isCorrect && (
                          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-bold">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span className="hidden sm:inline">Sua Opção (Anulada)</span>
                          </div>
                        )}
                        {isPending && !isCorrect && !isAnuladaQuestion && (
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
                          Justificativa da Alternativa {option.letter}:
                        </span>
                      </div>
                      <div className="font-normal whitespace-pre-line text-slate-700 dark:text-slate-300">
                        {renderFormattedText(
                          explanationText ||
                            (isCorrect
                              ? 'Alternativa correta segundo o gabarito oficial da banca examinadora.'
                              : (question.correctAnswer
                                  ? `Alternativa incorreta. O gabarito oficial definido pela banca é a Alternativa ${question.correctAnswer}.`
                                  : 'Gabarito oficial em processo de homologação por provas públicas.'))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* BARRA DE AÇÃO: BOTÃO "RESOLVER" */}
          {!isAnswered ? (
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
              {hasPreviousAnswer ? (
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                  Refazendo questão (resposta anterior: opção {userAnswer})
                </span>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={handleConfirmAnswer}
                disabled={!pendingSelected}
                title={pendingSelected ? (hasPreviousAnswer ? 'Resolver novamente' : 'Resolver questão') : 'Selecione uma alternativa'}
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
                {hasPreviousAnswer ? <RotateCcw className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                <span>{hasPreviousAnswer ? 'Resolver Novamente' : 'Resolver'}</span>
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        /* Questão Dissertativa */
        <div className="pt-2 space-y-3">
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
              Questão Dissertativa
            </span>
            <textarea
              placeholder="Digite seu raciocínio clínico, hipótese diagnóstica e condutas aqui..."
              className="w-full h-32 p-4 rounded-xl bg-white dark:bg-[var(--bg-input)] border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] resize-none font-sans"
            />
            {!isAnswered ? (
              <button
                type="button"
                onClick={() => {
                  setShowCommentary(true);
                  setIsAnswered(true);
                }}
                className="px-5 py-2.5 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md hover:scale-102 flex items-center gap-2"
                style={{ backgroundColor: accentConfig.primaryHex }}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ver Padrão de Resposta & Espelho</span>
              </button>
            ) : (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500 font-bold">Autoavaliação do Espelho:</span>
                <button
                  type="button"
                  onClick={() => onAnswer(question.id, 'A', true)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Acertei os Critérios</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAnswer(question.id, 'E', false)}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Preciso Revisar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comentário Final e Resumo Clínico (Exclusivo para o desfecho/síntese da questão) */}
      {(isAnswered || showCommentary) && (
        <div className="pt-2">
          <button
            onClick={() => setShowCommentary(!showCommentary)}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold hover:underline transition-colors cursor-pointer"
            style={{ color: accentConfig.primaryHex }}
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
              {/* Alerta de Possível Erro no Gabarito da Banca */}
              {isSuspectKey && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 space-y-1 shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Aviso aos Alunos: Possível Inconsistência no Gabarito da Banca</span>
                  </div>
                  <p className="text-xs sm:text-[12.5px] leading-relaxed opacity-90 pl-6">
                    Nossos professores identificaram divergência médica relevante entre o gabarito oficial e a literatura consensual vigente na data da realização da prova. Esta questão está sob curadoria médica.
                  </p>
                </div>
              )}

              {/* Card de Comentário Final / Síntese Clínica (SEMPRE ABERTO POR PADRÃO) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 dark:bg-slate-950 border border-emerald-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 space-y-2.5 shadow-inner">
                <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-400 font-bold text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>
                      {question.options && question.options.length > 0
                        ? (question.correctAnswer
                            ? `Gabarito Oficial: Alternativa ${question.correctAnswer}`
                            : 'Gabarito Oficial: Em processo de homologação por provas públicas')
                        : 'Padrão de Resposta Oficial:'}
                    </span>
                  </div>
                </div>
                <div
                  className={`${
                    fontSize === 'sm'
                      ? 'text-[12.5px] sm:text-[13px] leading-relaxed'
                      : fontSize === 'lg'
                      ? 'text-sm sm:text-base leading-relaxed'
                      : 'text-xs sm:text-sm leading-relaxed'
                  } font-normal text-slate-800 dark:text-slate-300 whitespace-pre-line`}
                >
                  {renderFormattedText(finalCommentary)}
                </div>
              </div>

              {/* Card: Principal Motivo que Poderia Levar ao Erro (Abre ao Clicar) */}
              {mainErrorReason && (
                <div className="rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 overflow-hidden shadow-xs transition-all">
                  <button
                    type="button"
                    onClick={() => toggleTopic('error')}
                    className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left cursor-pointer hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-xs sm:text-sm">
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>Principal Motivo de Erro (Armadilha da Questão)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                      <span>{openTopics['error'] ? 'Ocultar' : 'Ver Detalhes'}</span>
                      {openTopics['error'] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                  {openTopics['error'] && (
                    <div className="px-4 pb-4 pt-1 border-t border-amber-200/60 dark:border-amber-800/40 animate-in fade-in duration-150">
                      <div className="text-xs sm:text-[13px] leading-relaxed text-amber-950 dark:text-amber-200/90 whitespace-pre-line">
                        {renderFormattedText(mainErrorReason)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Card: Take-Home Message (Abre ao Clicar) */}
              {takeHomeMessage && (
                <div className="rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 overflow-hidden shadow-xs transition-all">
                  <button
                    type="button"
                    onClick={() => toggleTopic('takeHome')}
                    className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-blue-800 dark:text-blue-400 font-bold text-xs sm:text-sm">
                      <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span>Take-Home Message</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-blue-700 dark:text-blue-400 font-medium">
                      <span>{openTopics['takeHome'] ? 'Ocultar' : 'Ver Mensagem'}</span>
                      {openTopics['takeHome'] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                  {openTopics['takeHome'] && (
                    <div className="px-4 pb-4 pt-1 border-t border-blue-200/60 dark:border-blue-800/40 animate-in fade-in duration-150">
                      <div className="text-xs sm:text-[13px] leading-relaxed text-blue-950 dark:text-blue-200/90 font-medium whitespace-pre-line">
                        {renderFormattedText(takeHomeMessage)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Card: Evolução de Diretrizes & Contexto Histórico (Abre ao Clicar) */}
              {guidelineEvolution && (
                <div className="rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 overflow-hidden shadow-xs transition-all">
                  <button
                    type="button"
                    onClick={() => toggleTopic('guidelines')}
                    className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left cursor-pointer hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-400 font-bold text-xs sm:text-sm">
                      <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span>Evolução de Diretrizes</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-indigo-700 dark:text-indigo-400 font-medium">
                      <span>{openTopics['guidelines'] ? 'Ocultar' : 'Ver Diretrizes'}</span>
                      {openTopics['guidelines'] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                  {openTopics['guidelines'] && (
                    <div className="px-4 pb-4 pt-1 border-t border-indigo-200/60 dark:border-indigo-800/40 animate-in fade-in duration-150">
                      <div className="text-xs sm:text-[13px] leading-relaxed text-indigo-950 dark:text-indigo-200/90 whitespace-pre-line">
                        {renderFormattedText(guidelineEvolution)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Referências Oficiais (Abre ao Clicar) */}
              {references && references.length > 0 && (
                <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs transition-all">
                  <button
                    type="button"
                    onClick={() => toggleTopic('references')}
                    className="w-full p-3 sm:p-3.5 flex items-center justify-between text-left cursor-pointer hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-slate-700 dark:text-slate-300">
                      <Library className="w-3.5 h-3.5 text-slate-500" />
                      <span>Referências Oficiais ({references.length})</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      <span>{openTopics['references'] ? 'Ocultar' : 'Ver Fontes'}</span>
                      {openTopics['references'] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                  {openTopics['references'] && (
                    <div className="px-3.5 pb-3.5 pt-1 border-t border-zinc-200 dark:border-zinc-800 animate-in fade-in duration-150">
                      <ul className="list-disc list-inside space-y-1 text-[11.5px] text-slate-600 dark:text-slate-400">
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
