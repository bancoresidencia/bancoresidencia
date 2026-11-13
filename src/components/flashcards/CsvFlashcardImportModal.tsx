'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  Upload,
  FileText,
  X,
  Trash2,
  Check,
  Info,
  HelpCircle,
  FileSpreadsheet,
  Package,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import {
  FlashcardItem,
  CsvFlashcardPreview,
  FlashcardImportFormat
} from '@/types/flashcards';
import { clinicalHierarchy } from '@/data/mockQuestions';
import { formatSubSubfocoDisplay } from '@/components/AdvancedQuestionFilters';
import { flashcardsService } from '@/services/flashcardsService';
import {
  parseFlashcardsCsv,
  buildFlashcardPreviews,
  RawParsedCsvRow
} from '@/utils/flashcardDistributionEngine';

interface CsvFlashcardImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (count: number) => void;
  initialDeckId?: string;
  defaultSpecialty?: string;
  defaultTheme?: string;
  defaultFocus?: string;
}

interface FormatOption {
  value: FlashcardImportFormat;
  label: string;
  badge: string;
  accept: string;
  description: string;
}

const IMPORT_FORMAT_OPTIONS: FormatOption[] = [
  {
    value: 'auto',
    label: 'Detectar Automaticamente (Recomendado)',
    badge: 'Multi-formato',
    accept: '.zip,.colpkg,.db,.csv,.apkg,.txt,.tsv,.anki2,.anki21',
    description: 'Arquivos suportados (*.zip *.colpkg *.db *.csv *.apkg *.txt *.tsv)'
  },
  {
    value: 'apkg',
    label: 'Pacote de Baralho do Anki (.apkg)',
    badge: 'Anki Deck',
    accept: '.apkg',
    description: 'Baralho exportado do Anki com cartões, notas e cloze'
  },
  {
    value: 'colpkg',
    label: 'Pacote de Coleções do Anki (.colpkg)',
    badge: 'Anki Col',
    accept: '.colpkg',
    description: 'Coleção completa de baralhos e configurações do Anki'
  },
  {
    value: 'txt_notes',
    label: 'Notas em Texto Puro (.txt)',
    badge: 'Anki Notas',
    accept: '.txt',
    description: 'Exportação do Anki de notas com campos tabulados e tags'
  },
  {
    value: 'txt_cards',
    label: 'Cartões em Texto Simples (.txt)',
    badge: 'Anki Cartões',
    accept: '.txt',
    description: 'Exportação do Anki de pares simples frente e verso'
  },
  {
    value: 'csv_tsv',
    label: 'Planilha / Tabela (.csv, .tsv)',
    badge: 'CSV / TSV',
    accept: '.csv,.tsv',
    description: 'Planilhas delimitadas por vírgula, ponto e vírgula ou tab'
  },
  {
    value: 'db',
    label: 'Banco de Dados Anki / SQLite (.db, .anki2)',
    badge: 'SQLite',
    accept: '.db,.anki2,.anki21',
    description: 'Banco de dados SQLite do Anki (collection.anki2 / .db)'
  },
  {
    value: 'zip',
    label: 'Arquivo Compactado (.zip)',
    badge: 'ZIP',
    accept: '.zip',
    description: 'Arquivo compactado contendo baralhos ou planilhas'
  }
];

export const CsvFlashcardImportModal: React.FC<CsvFlashcardImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  initialDeckId = 'deck-padrao',
  defaultSpecialty,
  defaultTheme,
  defaultFocus
}) => {
  const { accentConfig } = useTheme();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formato de importação selecionado
  const [selectedFormat, setSelectedFormat] = useState<FlashcardImportFormat>('auto');

  // Modo de entrada: Arquivo vs. Colar Texto
  const [inputTab, setInputTab] = useState<'file' | 'paste'>('file');
  const [csvRawText, setCsvRawText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [detectedDeckName, setDetectedDeckName] = useState<string | null>(null);

  // Linhas brutas em memória
  const [parsedRows, setParsedRows] = useState<RawParsedCsvRow[]>([]);

  // Destinos dos cartões (se 'auto', detecta pelo vocabulário clínico / taxonomia)
  const [selectedDeckId, setSelectedDeckId] = useState(initialDeckId);
  const [targetSpec, setTargetSpec] = useState(defaultSpecialty || 'auto');
  const [targetTema, setTargetTema] = useState(defaultTheme || 'auto');
  const [targetFoco, setTargetFoco] = useState(defaultFocus || 'auto');
  const [targetSubfoco, setTargetSubfoco] = useState('auto');
  const [targetSubSubfoco, setTargetSubSubfoco] = useState('auto');

  // Baralhos autorais do aluno
  const userDecks = useMemo(() => {
    return flashcardsService.getCustomDecks(user?.id);
  }, [user?.id]);

  // Temas e Focos disponíveis para a especialidade
  const availableTemas = useMemo(() => {
    if (!targetSpec || targetSpec === 'auto') return [];
    const specNode = clinicalHierarchy.find(
      (s) =>
        s.especialidade.toLowerCase() === targetSpec.toLowerCase() ||
        (targetSpec === 'Cirurgia Geral' && s.especialidade === 'Cirurgia') ||
        (targetSpec === 'Cirurgia' && s.especialidade === 'Cirurgia')
    );
    return specNode?.temas || [];
  }, [targetSpec]);

  const availableFocos = useMemo(() => {
    if (!targetTema || targetTema === 'auto') return [];
    const temaNode = availableTemas.find((t) => t.tema === targetTema);
    return temaNode?.focos.map((f) => f.foco) || [];
  }, [availableTemas, targetTema]);

  const availableSubfocos = useMemo(() => {
    if (!targetFoco || targetFoco === 'auto') return [];
    const temaNode = availableTemas.find((t) => t.tema === targetTema);
    const focoNode = temaNode?.focos.find((f) => f.foco === targetFoco);
    return focoNode?.subfocos || [];
  }, [availableTemas, targetTema, targetFoco]);

  const availableSubSubfocos = useMemo(() => {
    if (!targetSubfoco || targetSubfoco === 'auto') return [];
    const subNode = availableSubfocos.find(
      (s) => (typeof s === 'string' ? s : s.subfoco) === targetSubfoco
    );
    if (!subNode || typeof subNode === 'string') return [];
    return subNode.sub_subfocos || [];
  }, [availableSubfocos, targetSubfoco]);

  // Previews dos cartões analisados
  const [cardPreviews, setCardPreviews] = useState<CsvFlashcardPreview[]>([]);
  const [selectedRowIndices, setSelectedRowIndices] = useState<Set<number>>(new Set());
  const [showHelpExample, setShowHelpExample] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Formato ativo atual
  const activeFormatConfig = useMemo(() => {
    return (
      IMPORT_FORMAT_OPTIONS.find((f) => f.value === selectedFormat) ||
      IMPORT_FORMAT_OPTIONS[0]
    );
  }, [selectedFormat]);

  // Converte linhas brutas para os previews clínicos
  const applyPreviewsFromRows = (
    rows: RawParsedCsvRow[],
    spec = targetSpec,
    tema = targetTema,
    foco = targetFoco,
    sub = targetSubfoco,
    subSub = targetSubSubfoco
  ) => {
    if (!rows || rows.length === 0) {
      setCardPreviews([]);
      setSelectedRowIndices(new Set());
      return;
    }

    const hasSpecificTarget =
      spec !== 'auto' || tema !== 'auto' || foco !== 'auto';

    const previews = buildFlashcardPreviews(
      rows,
      clinicalHierarchy,
      hasSpecificTarget ? 'manual' : 'auto',
      hasSpecificTarget
        ? {
            specialty: spec !== 'auto' ? spec : undefined,
            theme: tema !== 'auto' ? tema : undefined,
            focus: foco !== 'auto' ? foco : undefined,
            subfocus: sub !== 'auto' ? sub : undefined,
            subSubfocus: subSub !== 'auto' ? subSub : undefined
          }
        : undefined,
      selectedDeckId
    );

    setCardPreviews(previews);
    const validIndices = new Set<number>();
    previews.forEach((p, idx) => {
      if (p.isValid) validIndices.add(idx);
    });
    setSelectedRowIndices(validIndices);
  };

  // Reprocessa texto quando colado ou atualizado
  const reprocessWithText = (
    text = csvRawText,
    spec = targetSpec,
    tema = targetTema,
    foco = targetFoco,
    sub = targetSubfoco,
    subSub = targetSubSubfoco
  ) => {
    if (!text.trim()) {
      setParsedRows([]);
      setCardPreviews([]);
      setSelectedRowIndices(new Set());
      return;
    }

    const rawRows = parseFlashcardsCsv(text);
    setParsedRows(rawRows);
    applyPreviewsFromRows(rawRows, spec, tema, foco, sub, subSub);
  };

  // Processa o upload de arquivos (suportando .zip, .colpkg, .db, .csv, .apkg, .txt, .tsv)
  const processUploadedFile = async (file: File) => {
    setFileName(file.name);
    setErrorMessage(null);
    setDetectedDeckName(null);

    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const isBinaryOrArchive =
      ['.apkg', '.colpkg', '.zip', '.db', '.anki2', '.anki21'].includes(ext) ||
      ['apkg', 'colpkg', 'zip', 'db'].includes(selectedFormat);

    if (isBinaryOrArchive) {
      setIsProcessing(true);
      setLoadingMessage(
        ext === '.apkg' || ext === '.colpkg'
          ? 'Descompactando pacote do Anki e extraindo notas...'
          : ext === '.zip'
          ? 'Descompactando arquivo ZIP e localizando baralhos...'
          : 'Lendo banco de dados SQLite...'
      );

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('format', selectedFormat);

        const response = await fetch('/api/flashcards/parse-import', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Falha ao analisar o arquivo fornecido.');
        }

        if (data.detectedDeckName) {
          setDetectedDeckName(data.detectedDeckName);
        }

        interface ApiReturnedCard {
          front: string;
          back: string;
          comment?: string;
          specialty?: string;
          theme?: string;
          focus?: string;
          subfocus?: string;
          deckId?: string;
          priority?: 'essential' | 'standard';
          studyDepth?: 'study' | 'review';
          tags?: string[];
        }

        const rawRows: RawParsedCsvRow[] = (data.cards || []).map(
          (c: ApiReturnedCard, idx: number) => ({
            front: c.front,
            back: c.back,
            comment: c.comment,
            specialty: c.specialty,
            theme: c.theme,
            focus: c.focus,
            subfocus: c.subfocus,
            deckId: c.deckId,
            priority: c.priority,
            studyDepth: c.studyDepth,
            tags: c.tags,
            rawLineIndex: idx + 1
          })
        );

        if (rawRows.length === 0) {
          throw new Error('Nenhum cartão válido foi encontrado neste arquivo.');
        }

        setParsedRows(rawRows);
        applyPreviewsFromRows(rawRows);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro ao processar arquivo.';
        console.error('Erro na importação de pacote:', err);
        setErrorMessage(message);
        setParsedRows([]);
        setCardPreviews([]);
        setSelectedRowIndices(new Set());
      } finally {
        setIsProcessing(false);
        setLoadingMessage('');
      }
    } else {
      // Arquivo texto (.csv, .tsv, .txt)
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = (event.target?.result as string) || '';
        setCsvRawText(content);
        reprocessWithText(content);
      };
      reader.onerror = () => {
        setErrorMessage('Não foi possível ler o arquivo de texto.');
      };
      reader.readAsText(file, 'UTF-8');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  // Alterna seleção de uma linha no preview
  const toggleRowSelection = (idx: number) => {
    setSelectedRowIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  // Alterna todos
  const toggleAllSelections = () => {
    if (selectedRowIndices.size === cardPreviews.filter((p) => p.isValid).length) {
      setSelectedRowIndices(new Set());
    } else {
      const allValid = new Set<number>();
      cardPreviews.forEach((p, idx) => {
        if (p.isValid) allValid.add(idx);
      });
      setSelectedRowIndices(allValid);
    }
  };

  // Remove um card do preview
  const handleDeletePreviewCard = (idx: number) => {
    setCardPreviews((prev) => prev.filter((_, i) => i !== idx));
    setParsedRows((prev) => prev.filter((_, i) => i !== idx));
    setSelectedRowIndices((prev) => {
      const next = new Set<number>();
      prev.forEach((oldIdx) => {
        if (oldIdx < idx) next.add(oldIdx);
        else if (oldIdx > idx) next.add(oldIdx - 1);
      });
      return next;
    });
  };

  // Salvar e Importar no banco do aluno
  const handleConfirmImport = async () => {
    const cardsToSave: FlashcardItem[] = [];

    cardPreviews.forEach((preview, idx) => {
      if (selectedRowIndices.has(idx) && preview.isValid) {
        cardsToSave.push({
          id: `fc-user-${Date.now()}-${idx}`,
          front: preview.front,
          back: preview.back,
          comment: preview.comment,
          specialty: preview.specialty,
          theme: preview.theme,
          focus: preview.focus,
          subfocus: preview.subfocus,
          sub_subfocus: preview.subSubfocus || preview.sub_subfocus,
          subSubfocus: preview.subSubfocus || preview.sub_subfocus,
          deckId: selectedDeckId,
          priority: preview.priority,
          studyDepth: preview.studyDepth,
          tags: preview.tags,
          createdAt: new Date().toISOString()
        });
      }
    });

    if (cardsToSave.length === 0) return;

    setIsProcessing(true);
    setLoadingMessage('Gravando cartões no seu baralho...');
    try {
      flashcardsService.saveNewFlashcardsBatch(cardsToSave, user?.id);
      onImportSuccess(cardsToSave.length);
      onClose();
    } catch (err) {
      console.error('Erro ao importar cartões:', err);
      setErrorMessage('Falha ao gravar os cartões importados.');
    } finally {
      setIsProcessing(false);
      setLoadingMessage('');
    }
  };

  // Carregar exemplos prontos
  const handleLoadSampleCsv = () => {
    const sample = `Frente;Verso;Comentario;Especialidade;Tema;Foco
"No rastreamento do câncer de colo uterino no Brasil, qual a faixa etária e a periodicidade preconizadas pelo Ministério da Saúde?";"Mulheres de 25 a 64 anos; a cada 3 anos após 2 exames anuais consecutivos normais.";"O rastreamento antes dos 25 anos aumenta intervenções desnecessárias em lesões que regrediriam espontaneamente.";Ginecologia;Oncologia Ginecológica;Rastreamento e Prevenção do Câncer de Colo Uterino (Citologia, HPV e Colposcopia)
"A presença de lesão intraepitelial cervical de alto grau (LIEAG / HSIL) em paciente de 32 anos exige encaminhamento imediato para {{c1::colposcopia}}.";"colposcopia com biópsia se necessário";"HSIL apresenta risco substancial de neoplasia invasora oculta. Não se repete citologia nesses casos.";Ginecologia;Oncologia Ginecológica;Câncer de Colo Uterino Invasor (Estadiamento e Conduta)
"Na suspeita de apendicite aguda na gestante, qual o método de imagem inicial de escolha?";"Ultrassonografia com compressão gradual";"A ressonância magnética sem contraste é o método de segunda linha quando a USG for inconclusiva.";Cirurgia Geral;Cirurgia Geral e Digestiva;Abdome Agudo Inflamatório`;

    setCsvRawText(sample);
    setFileName('exemplo_bancoresidencia.csv');
    setInputTab('paste');
    setDetectedDeckName(null);
    setErrorMessage(null);
    reprocessWithText(sample);
  };

  const handleLoadSampleAnki = () => {
    const sample = `#separator:tab
#html:true
#tags column:3
#deck:Ginecologia::Oncologia Ginecológica::Câncer de Colo Uterino
<div>Qual a tríade clássica do <b>tamponamento cardíaco</b> (Tríade de Beck)?</div>\tHipofonese de bulhas, turgência jugular patológica e hipotensão arterial.\tcardiologia trauma urgencia
<div>A presença do {{c1::sinal de Auspitz}} (orvalho sangrento) e do {{c2::fenômeno de Koebner}} é característica da <b>psoríase em placas</b>.</div>\t\tdermatologia psoríase
<div>Qual o esquema antimicrobiano empírico de escolha para <b>neutropenia febril</b> de alto risco?</div>\tMonoterapia antipseudomonas com Cefepime EV (ou Piperacilina/Tazobactam ou Meropenem).\toncologia neutropenia cefepime`;

    setCsvRawText(sample);
    setFileName('exemplo_anki_notas.txt');
    setInputTab('paste');
    setDetectedDeckName('Ginecologia::Oncologia Ginecológica::Câncer de Colo Uterino');
    setErrorMessage(null);
    reprocessWithText(sample);
  };

  if (!isOpen) return null;

  const validCount = cardPreviews.filter((p) => p.isValid).length;
  const selectedCount = selectedRowIndices.size;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Topo do Modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              <FileSpreadsheet className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-heading font-black text-base sm:text-lg text-zinc-900 dark:text-zinc-100">
                  Importar Flashcards
                </h2>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                    Anki (.apkg, .colpkg)
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                    Planilhas (.csv, .tsv)
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60">
                    Texto (.txt)
                  </span>
                </div>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Crie dezenas de cartões autorais automaticamente a partir de baralhos do Anki, arquivos ZIP, SQLite ou tabelas.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com Scroll */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Seletor de Formato de Importação */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shrink-0">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <label
                  htmlFor="import-format-select"
                  className="block text-xs font-bold text-zinc-900 dark:text-zinc-100"
                >
                  Formato de Importação
                </label>
                <p className="text-[11px] text-zinc-500">
                  {activeFormatConfig.description}
                </p>
              </div>
            </div>

            <div className="relative shrink-0 sm:min-w-[280px]">
              <select
                id="import-format-select"
                value={selectedFormat}
                onChange={(e) => {
                  setSelectedFormat(e.target.value as FlashcardImportFormat);
                }}
                className="w-full appearance-none px-3 py-2 pr-8 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-zinc-100 cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {IMPORT_FORMAT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Seletor de Entrada: Upload de Arquivo vs. Colar Texto */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setInputTab('file')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                  inputTab === 'file'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Carregar Arquivo</span>
              </button>

              <button
                type="button"
                onClick={() => setInputTab('paste')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                  inputTab === 'paste'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Colar Texto / Anki</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadSampleAnki}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                title="Exemplo com notas Anki, oclusão cloze e tags"
              >
                Exemplo Anki (Cloze)
              </button>

              <span className="text-zinc-300 dark:text-zinc-700">|</span>

              <button
                type="button"
                onClick={handleLoadSampleCsv}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                title="Exemplo com planilha CSV com colunas de Especialidade e Tema"
              >
                Exemplo Planilha CSV
              </button>

              <button
                type="button"
                onClick={() => setShowHelpExample((prev) => !prev)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                title="Ajuda sobre formatos suportados e delimitadores"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Painel de Ajuda Expansível */}
          {showHelpExample && (
            <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-200 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 font-bold">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Formatos Suportados na Central de Importação</span>
              </div>
              <ul className="list-disc list-inside text-[11px] space-y-1 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                <li>
                  <strong>Pacotes Anki (.apkg, .colpkg):</strong> extraídos nativamente com seus campos, tags, baralhos e tags cloze (<code>{"{{c1::...}}"}</code>).
                </li>
                <li>
                  <strong>Notas em Texto Puro (.txt):</strong> exportações tabuladas do Anki contendo diretivas <code>#separator:tab</code>, <code>#tags column</code> e <code>#deck</code>.
                </li>
                <li>
                  <strong>Cartões em Texto Simples (.txt):</strong> formato clássico frente e verso com delimitador tab.
                </li>
                <li>
                  <strong>Planilhas e Tabelas (.csv, .tsv):</strong> delimitados por vírgula, ponto e vírgula ou tabulação (Excel, Google Planilhas).
                </li>
                <li>
                  <strong>Compactados (.zip) &amp; SQLite (.db):</strong> pacotes compactados contendo baralhos ou bases brutas do Anki (<code>collection.anki2</code>).
                </li>
              </ul>
            </div>
          )}

          {/* Mensagem de Erro se houver */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-rose-600 p-1 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Badge Informativo do Baralho Detectado no Anki */}
          {detectedDeckName && (
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 text-xs text-purple-800 dark:text-purple-300 flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-600 shrink-0" />
              <span>
                Baralho detectado no pacote Anki: <strong>{detectedDeckName}</strong>
              </span>
            </div>
          )}

          {/* Área de Entrada: File Dropzone ou Textarea */}
          {inputTab === 'file' ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                  : 'border-zinc-300 dark:border-zinc-700/80 hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50/60 dark:bg-zinc-900/30 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={activeFormatConfig.accept}
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-2xl bg-zinc-200/70 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-600 dark:text-zinc-300 mb-3 shadow-2xs">
                {isProcessing ? (
                  <span className="w-6 h-6 border-2 border-zinc-400 border-t-zinc-900 dark:border-t-white rounded-full animate-spin" />
                ) : (
                  <Upload className="w-6 h-6 stroke-[2]" />
                )}
              </div>

              <p className="font-heading font-black text-sm text-zinc-900 dark:text-zinc-100">
                {isProcessing
                  ? loadingMessage || 'Lendo pacote de flashcards...'
                  : fileName
                  ? fileName
                  : 'Clique para selecionar seu arquivo ou arraste para cá'}
              </p>

              <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-1">
                Arquivos suportados (*.zip *.colpkg *.db *.csv *.apkg *.txt *.tsv)
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                <span>Cole o conteúdo bruto (CSV, TSV ou export do Anki):</span>
                <span className="text-[11px] font-normal text-zinc-400">
                  Suporta diretivas Anki (<code>#separator:tab</code>, <code>#tags</code>)
                </span>
              </label>
              <textarea
                value={csvRawText}
                onChange={(e) => {
                  setCsvRawText(e.target.value);
                  reprocessWithText(e.target.value);
                }}
                rows={5}
                placeholder="Cole aqui linhas no formato: Frente;Verso;Comentário ou dados tabulados do Anki..."
                className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-700 resize-none"
              />
            </div>
          )}

          {/* Configuração de Destino e Classificação */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Baralho de Destino
                </label>
                <select
                  value={selectedDeckId}
                  onChange={(e) => {
                    setSelectedDeckId(e.target.value);
                    if (cardPreviews.length > 0) {
                      setCardPreviews((prev) =>
                        prev.map((p) => ({ ...p, deckId: e.target.value }))
                      );
                    }
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-100"
                >
                  {userDecks.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Especialidade
                </label>
                <select
                  value={targetSpec}
                  onChange={(e) => {
                    const newSpec = e.target.value;
                    setTargetSpec(newSpec);
                    setTargetTema('auto');
                    setTargetFoco('auto');
                    setTargetSubfoco('auto');
                    setTargetSubSubfoco('auto');
                    if (parsedRows.length > 0) {
                      applyPreviewsFromRows(parsedRows, newSpec, 'auto', 'auto', 'auto', 'auto');
                    } else {
                      reprocessWithText(csvRawText, newSpec, 'auto', 'auto', 'auto', 'auto');
                    }
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-100"
                >
                  <option value="auto">Detectar Especialidade Automaticamente</option>
                  {clinicalHierarchy.map((s) => (
                    <option key={s.especialidade} value={s.especialidade}>
                      {s.especialidade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Tema
                </label>
                <select
                  value={targetTema}
                  disabled={targetSpec === 'auto'}
                  onChange={(e) => {
                    const newTema = e.target.value;
                    setTargetTema(newTema);
                    setTargetFoco('auto');
                    setTargetSubfoco('auto');
                    setTargetSubSubfoco('auto');
                    if (parsedRows.length > 0) {
                      applyPreviewsFromRows(parsedRows, targetSpec, newTema, 'auto', 'auto', 'auto');
                    } else {
                      reprocessWithText(csvRawText, targetSpec, newTema, 'auto', 'auto', 'auto');
                    }
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-100 disabled:opacity-50"
                >
                  <option value="auto">Detectar Tema Automaticamente</option>
                  {availableTemas.map((t) => (
                    <option key={t.tema} value={t.tema}>
                      {t.tema}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Foco
                </label>
                <select
                  value={targetFoco}
                  disabled={targetSpec === 'auto' || targetTema === 'auto'}
                  onChange={(e) => {
                    const newFoco = e.target.value;
                    setTargetFoco(newFoco);
                    setTargetSubfoco('auto');
                    setTargetSubSubfoco('auto');
                    if (parsedRows.length > 0) {
                      applyPreviewsFromRows(parsedRows, targetSpec, targetTema, newFoco, 'auto', 'auto');
                    } else {
                      reprocessWithText(csvRawText, targetSpec, targetTema, newFoco, 'auto', 'auto');
                    }
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-100 disabled:opacity-50"
                >
                  <option value="auto">Detectar Foco Automaticamente</option>
                  {availableFocos.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(availableSubfocos.length > 0 || availableSubSubfocos.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
                {availableSubfocos.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Subfoco (Opcional)
                    </label>
                    <select
                      value={targetSubfoco}
                      disabled={targetFoco === 'auto'}
                      onChange={(e) => {
                        const newSub = e.target.value;
                        setTargetSubfoco(newSub);
                        setTargetSubSubfoco('auto');
                        if (parsedRows.length > 0) {
                          applyPreviewsFromRows(parsedRows, targetSpec, targetTema, targetFoco, newSub, 'auto');
                        } else {
                          reprocessWithText(csvRawText, targetSpec, targetTema, targetFoco, newSub, 'auto');
                        }
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-100 disabled:opacity-50"
                    >
                      <option value="auto">Detectar Subfoco Automaticamente</option>
                      {availableSubfocos.map((s) => {
                        const sName = typeof s === 'string' ? s : s.subfoco;
                        return (
                          <option key={sName} value={sName}>
                            {sName}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {availableSubSubfocos.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Sub-subfoco (Opcional)
                    </label>
                    <select
                      value={targetSubSubfoco}
                      disabled={targetSubfoco === 'auto'}
                      onChange={(e) => {
                        const newSS = e.target.value;
                        setTargetSubSubfoco(newSS);
                        if (parsedRows.length > 0) {
                          applyPreviewsFromRows(parsedRows, targetSpec, targetTema, targetFoco, targetSubfoco, newSS);
                        } else {
                          reprocessWithText(csvRawText, targetSpec, targetTema, targetFoco, targetSubfoco, newSS);
                        }
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-100 disabled:opacity-50"
                    >
                      <option value="auto">Detectar Sub-subfoco Automaticamente</option>
                      {availableSubSubfocos.map((ss) => (
                        <option key={ss} value={ss}>
                          {formatSubSubfocoDisplay(ss)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pré-visualização da Tabela de Cartões Identificados */}
          {cardPreviews.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-black text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                    Cartões Identificados ({cardPreviews.length})
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
                    {validCount} válidos
                  </span>
                  {cardPreviews.length - validCount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold">
                      {cardPreviews.length - validCount} com erro
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={toggleAllSelections}
                  className="text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                >
                  {selectedCount === validCount ? 'Desmarcar Todos' : 'Selecionar Todos Válidos'}
                </button>
              </div>

              {/* Tabela de Previews */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-100/80 dark:bg-zinc-900 text-[11px] font-bold text-zinc-500 uppercase sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="p-2.5 w-8 text-center">
                        <input
                          type="checkbox"
                          checked={selectedCount === validCount && validCount > 0}
                          onChange={toggleAllSelections}
                          className="rounded text-blue-600"
                        />
                      </th>
                      <th className="p-2.5">Frente / Pergunta</th>
                      <th className="p-2.5">Verso / Resposta</th>
                      <th className="p-2.5">Distribuição Atribuída</th>
                      <th className="p-2.5 text-center w-14">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 bg-white dark:bg-[#121215]">
                    {cardPreviews.map((card, idx) => {
                      const isSelected = selectedRowIndices.has(idx);
                      const isCloze = card.front.includes('{{c');

                      return (
                        <tr
                          key={idx}
                          className={`hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors ${
                            !card.isValid ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''
                          }`}
                        >
                          <td className="p-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={!card.isValid}
                              onChange={() => toggleRowSelection(idx)}
                              className="rounded text-blue-600 cursor-pointer disabled:opacity-40"
                            />
                          </td>
                          <td className="p-2.5 max-w-xs font-medium text-zinc-900 dark:text-zinc-100">
                            <div className="line-clamp-2">{card.front}</div>
                            {isCloze && (
                              <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                                Cloze
                              </span>
                            )}
                            {card.validationError && (
                              <p className="text-[10px] text-rose-500 font-bold mt-0.5">
                                {card.validationError}
                              </p>
                            )}
                          </td>
                          <td className="p-2.5 max-w-xs text-zinc-600 dark:text-zinc-400">
                            <div className="line-clamp-2">{card.back}</div>
                          </td>
                          <td className="p-2.5">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-[11px] text-zinc-800 dark:text-zinc-200">
                                {card.specialty}
                              </span>
                              <span
                                className="text-[10px] text-zinc-500 truncate max-w-[200px]"
                                title={`${card.theme} > ${card.focus}`}
                              >
                                {card.theme} &gt; {card.focus}
                              </span>
                              {card.subfocus && (
                                <span
                                  className="text-[9px] text-zinc-400 dark:text-zinc-500 truncate max-w-[200px]"
                                  title={card.subfocus}
                                >
                                  ↳ {card.subfocus}
                                </span>
                              )}
                              {card.subSubfocus && (
                                <span
                                  className="text-[9px] text-purple-600 dark:text-purple-400 font-medium truncate max-w-[200px]"
                                  title={card.subSubfocus}
                                >
                                  {formatSubSubfocoDisplay(card.subSubfocus)}
                                </span>
                              )}
                              {card.confidence && (
                                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono">
                                  {card.confidence}% confiança
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeletePreviewCard(idx)}
                              className="p-1 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Remover linha"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com Ações */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 hidden sm:inline">
              {selectedCount} de {validCount} selecionados
            </span>

            <button
              type="button"
              disabled={selectedCount === 0 || isProcessing}
              onClick={handleConfirmImport}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer shadow-xs inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-95 active:scale-98"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              {isProcessing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{loadingMessage || 'Importando...'}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Importar {selectedCount} Flashcards</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FlashcardImportModal = CsvFlashcardImportModal;
