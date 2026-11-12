'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  Layers,
  X,
  Trash2,
  Check,
  Info,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { FlashcardItem, CsvFlashcardPreview } from '@/types/flashcards';
import { clinicalHierarchy } from '@/data/mockQuestions';
import { formatSubSubfocoDisplay } from '@/components/AdvancedQuestionFilters';
import { flashcardsService } from '@/services/flashcardsService';
import {
  parseFlashcardsCsv,
  buildFlashcardPreviews
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

  // Modo de entrada: Arquivo vs. Colar Texto
  const [inputTab, setInputTab] = useState<'file' | 'paste'>('file');
  const [csvRawText, setCsvRawText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Modo de Distribuição: 'auto' | 'manual'
  const [distributionMode, setDistributionMode] = useState<'auto' | 'manual'>('auto');

  // Seleções para Distribuição Manual
  const [selectedDeckId, setSelectedDeckId] = useState(initialDeckId);
  const [manualSpec, setManualSpec] = useState(defaultSpecialty || 'auto');
  const [manualTema, setManualTema] = useState(defaultTheme || 'auto');
  const [manualFoco, setManualFoco] = useState(defaultFocus || 'auto');
  const [manualSubfoco, setManualSubfoco] = useState('auto');
  const [manualSubSubfoco, setManualSubSubfoco] = useState('auto');

  // Baralhos autorais do aluno
  const userDecks = useMemo(() => {
    return flashcardsService.getCustomDecks(user?.id);
  }, [user?.id]);

  // Temas e Focos disponíveis para a especialidade manual
  const availableTemas = useMemo(() => {
    if (!manualSpec || manualSpec === 'auto') return [];
    const specNode = clinicalHierarchy.find(
      (s) =>
        s.especialidade.toLowerCase() === manualSpec.toLowerCase() ||
        (manualSpec === 'Cirurgia Geral' && s.especialidade === 'Cirurgia') ||
        (manualSpec === 'Cirurgia' && s.especialidade === 'Cirurgia')
    );
    return specNode?.temas || [];
  }, [manualSpec]);

  const availableFocos = useMemo(() => {
    if (!manualTema || manualTema === 'auto') return [];
    const temaNode = availableTemas.find((t) => t.tema === manualTema);
    return temaNode?.focos.map((f) => f.foco) || [];
  }, [availableTemas, manualTema]);

  const availableSubfocos = useMemo(() => {
    if (!manualFoco || manualFoco === 'auto') return [];
    const temaNode = availableTemas.find((t) => t.tema === manualTema);
    const focoNode = temaNode?.focos.find((f) => f.foco === manualFoco);
    return focoNode?.subfocos || [];
  }, [availableTemas, manualTema, manualFoco]);

  const availableSubSubfocos = useMemo(() => {
    if (!manualSubfoco || manualSubfoco === 'auto') return [];
    const subNode = availableSubfocos.find(
      (s) => (typeof s === 'string' ? s : s.subfoco) === manualSubfoco
    );
    if (!subNode || typeof subNode === 'string') return [];
    return subNode.sub_subfocos || [];
  }, [availableSubfocos, manualSubfoco]);

  // Previews dos cartões analisados
  const [cardPreviews, setCardPreviews] = useState<CsvFlashcardPreview[]>([]);
  const [selectedRowIndices, setSelectedRowIndices] = useState<Set<number>>(new Set());
  const [showHelpExample, setShowHelpExample] = useState(false);

  // Reprocessa previews quando o texto CSV ou o modo de distribuição mudar
  const reprocessWithTarget = (
    text = csvRawText,
    mode = distributionMode,
    targetSpec = manualSpec,
    targetTema = manualTema,
    targetFoco = manualFoco,
    targetSubfoco = manualSubfoco,
    targetSubSubfoco = manualSubSubfoco
  ) => {
    if (!text.trim()) {
      setCardPreviews([]);
      setSelectedRowIndices(new Set());
      return;
    }

    const rawRows = parseFlashcardsCsv(text);
    const previews = buildFlashcardPreviews(
      rawRows,
      clinicalHierarchy,
      mode,
      mode === 'manual'
        ? {
            specialty: targetSpec !== 'auto' ? targetSpec : undefined,
            theme: targetTema !== 'auto' ? targetTema : undefined,
            focus: targetFoco !== 'auto' ? targetFoco : undefined,
            subfocus: targetSubfoco !== 'auto' ? targetSubfoco : undefined,
            subSubfocus: targetSubSubfoco !== 'auto' ? targetSubSubfoco : undefined
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

  const handleProcessCsv = (text: string) => {
    reprocessWithTarget(text);
  };

  // Carregamento de arquivo CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvRawText(content);
      reprocessWithTarget(content);
    };
    reader.readAsText(file, 'UTF-8');
  };

  // Atualiza previews se mudar o modo de distribuição ou campos manuais
  const handleDistributionModeChange = (mode: 'auto' | 'manual') => {
    setDistributionMode(mode);
    reprocessWithTarget(csvRawText, mode);
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
    setSelectedRowIndices((prev) => {
      const next = new Set<number>();
      prev.forEach((oldIdx) => {
        if (oldIdx < idx) next.add(oldIdx);
        else if (oldIdx > idx) next.add(oldIdx - 1);
      });
      return next;
    });
  };

  // Salvar e Importar
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
    try {
      flashcardsService.saveNewFlashcardsBatch(cardsToSave, user?.id);
      onImportSuccess(cardsToSave.length);
      onClose();
    } catch (err) {
      console.error('Erro ao importar cartões:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Exemplo de formato CSV para preencher
  const handleLoadSample = () => {
    const sample = `Frente;Verso;Comentario;Especialidade;Tema;Foco
"No rastreamento do câncer de colo uterino no Brasil, qual a faixa etária e a periodicidade preconizadas pelo Ministério da Saúde?";"Mulheres de 25 a 64 anos; a cada 3 anos após 2 exames anuais consecutivos normais.";"O rastreamento antes dos 25 anos aumenta intervenções desnecessárias em lesões que regrediriam espontaneamente.";Ginecologia;Oncologia Ginecológica;Rastreamento e Prevenção do Câncer de Colo Uterino (Citologia, HPV e Colposcopia)
"A presença de lesão intraepitelial cervical de alto grau (LIEAG / HSIL) em paciente de 32 anos exige encaminhamento imediato para {{c1::colposcopia}}.";"colposcopia com biópsia se necessário";"HSIL apresenta risco substancial de neoplasia invasora oculta. Não se repete citologia nesses casos.";Ginecologia;Oncologia Ginecológica;Câncer de Colo Uterino Invasor (Estadiamento e Conduta)
"Na suspeita de apendicite aguda na gestante, qual o método de imagem inicial de escolha?";"Ultrassonografia com compressão gradual";"A ressonância magnética sem contraste é o método de segunda linha quando a USG for inconclusiva.";Cirurgia Geral;Cirurgia Geral e Digestiva;Abdome Agudo Inflamatório`;

    setCsvRawText(sample);
    setFileName('exemplo_bancoresidencia.csv');
    setInputTab('paste');
    handleProcessCsv(sample);
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
              <h2 className="font-heading font-black text-base sm:text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Importar Flashcards via CSV</span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                  Anki &amp; Excel
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Crie dezenas de cartões autorais automaticamente com detecção inteligente de tópicos.
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
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Seletor de Entrada: Upload vs. Colar Texto */}
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
                <span>Carregar Arquivo (.csv, .tsv)</span>
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
                <span>Colar Texto CSV</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Carregar Exemplo Clínico</span>
              </button>

              <button
                type="button"
                onClick={() => setShowHelpExample((prev) => !prev)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                title="Ajuda sobre colunas e delimitadores"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dica de Ajuda do Formato */}
          {showHelpExample && (
            <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-200 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 font-bold">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Formatos Suportados e Delimitadores</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Você pode importar arquivos gerados no <strong>Excel</strong>, <strong>Google Planilhas</strong> ou exports do <strong>Anki</strong>.
                O sistema detecta automaticamente vírgulas (<code>,</code>), ponto e vírgula (<code>;</code>) ou tabs (<code>\t</code>).
              </p>
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-blue-200/60 dark:border-blue-800/50 font-mono text-[11px] overflow-x-auto">
                frente,verso,comentario,especialidade,tema,foco<br />
                &quot;Qual a conduta no LIEAG / HSIL em mulher de 30 anos?&quot;,&quot;Colposcopia com biópsia&quot;,&quot;Alto risco oncogênico&quot;,Ginecologia,Oncologia Ginecológica,Câncer de Colo Uterino
              </div>
            </div>
          )}

          {/* Área de Entrada: File ou Textarea */}
          {inputTab === 'file' ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-300 dark:border-zinc-700/80 hover:border-zinc-400 dark:hover:border-zinc-600 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all bg-zinc-50/60 dark:bg-zinc-900/30 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/60"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-zinc-200/70 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-600 dark:text-zinc-300 mb-3">
                <Upload className="w-6 h-6 stroke-[2]" />
              </div>
              <p className="font-heading font-black text-sm text-zinc-900 dark:text-zinc-100">
                {fileName ? fileName : 'Clique para selecionar seu arquivo CSV / TSV'}
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Suporta exports do Anki (.txt separado por tab), arquivos .csv e planilhas UTF-8
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Cole o conteúdo bruto do seu arquivo:
              </label>
              <textarea
                value={csvRawText}
                onChange={(e) => {
                  setCsvRawText(e.target.value);
                  handleProcessCsv(e.target.value);
                }}
                rows={5}
                placeholder="Cole aqui linhas no formato: Frente;Verso;Comentário..."
                className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-700 resize-none"
              />
            </div>
          )}

          {/* Configuração de Destino e Distribuição */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-heading font-black text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                  Modo de Distribuição dos Cartões
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Escolha como os cartões serão organizados na hierarquia clínica e nos seus baralhos.
                </p>
              </div>

              {/* Toggle de Modo */}
              <div className="flex items-center gap-1 p-1 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDistributionModeChange('auto')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                    distributionMode === 'auto'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xs'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Distribuição Automática</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDistributionModeChange('manual')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                    distributionMode === 'manual'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xs'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Layers className="w-3 h-3 text-blue-400" />
                  <span>Definir Destino Manual</span>
                </button>
              </div>
            </div>

            {/* Controles de Distribuição Manual ou Baralho Selecionado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Baralho Autoral
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

              {distributionMode === 'manual' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      1. Especialidade Alvo
                    </label>
                    <select
                      value={manualSpec}
                      onChange={(e) => {
                        const newSpec = e.target.value;
                        setManualSpec(newSpec);
                        setManualTema('auto');
                        setManualFoco('auto');
                        setManualSubfoco('auto');
                        setManualSubSubfoco('auto');
                        reprocessWithTarget(csvRawText, 'manual', newSpec, 'auto', 'auto', 'auto', 'auto');
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="auto">⚡ Detectar Especialidade Automaticamente</option>
                      {clinicalHierarchy.map((s) => (
                        <option key={s.especialidade} value={s.especialidade}>
                          {s.especialidade}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      2. Tema Clínico
                    </label>
                    <select
                      value={manualTema}
                      disabled={manualSpec === 'auto'}
                      onChange={(e) => {
                        const newTema = e.target.value;
                        setManualTema(newTema);
                        setManualFoco('auto');
                        setManualSubfoco('auto');
                        setManualSubSubfoco('auto');
                        reprocessWithTarget(csvRawText, 'manual', manualSpec, newTema, 'auto', 'auto', 'auto');
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-100 disabled:opacity-50"
                    >
                      <option value="auto">⚡ Detectar Tema Automaticamente</option>
                      {availableTemas.map((t) => (
                        <option key={t.tema} value={t.tema}>
                          {t.tema}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      3. Foco de Estudo
                    </label>
                    <select
                      value={manualFoco}
                      disabled={manualSpec === 'auto' || manualTema === 'auto'}
                      onChange={(e) => {
                        const newFoco = e.target.value;
                        setManualFoco(newFoco);
                        setManualSubfoco('auto');
                        setManualSubSubfoco('auto');
                        reprocessWithTarget(csvRawText, 'manual', manualSpec, manualTema, newFoco, 'auto', 'auto');
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-100 disabled:opacity-50"
                    >
                      <option value="auto">⚡ Detectar Foco Automaticamente</option>
                      {availableFocos.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>

                  {availableSubfocos.length > 0 && (
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                        4. Subfoco (Opcional)
                      </label>
                      <select
                        value={manualSubfoco}
                        disabled={manualFoco === 'auto'}
                        onChange={(e) => {
                          const newSub = e.target.value;
                          setManualSubfoco(newSub);
                          setManualSubSubfoco('auto');
                          reprocessWithTarget(csvRawText, 'manual', manualSpec, manualTema, manualFoco, newSub, 'auto');
                        }}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-100 disabled:opacity-50"
                      >
                        <option value="auto">⚡ Detectar Subfoco Automaticamente</option>
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
                        5. Sub-subfoco (Opcional)
                      </label>
                      <select
                        value={manualSubSubfoco}
                        disabled={manualSubfoco === 'auto'}
                        onChange={(e) => {
                          const newSS = e.target.value;
                          setManualSubSubfoco(newSS);
                          reprocessWithTarget(csvRawText, 'manual', manualSpec, manualTema, manualFoco, manualSubfoco, newSS);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-900 dark:text-zinc-100 disabled:opacity-50"
                      >
                        <option value="auto">⚡ Detectar Sub-subfoco Automaticamente</option>
                        {availableSubSubfocos.map((ss) => (
                          <option key={ss} value={ss}>
                            {formatSubSubfocoDisplay(ss)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}
            </div>

            {distributionMode === 'auto' && (
              <p className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>
                  O classificador semântico analisará o vocabulário médico de cada cartão e o distribuirá automaticamente no Foco e Tema corretos (ex: Câncer de Colo Uterino em Ginecologia).
                </span>
              </p>
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
                            <div className="line-clamp-2">
                              {card.front}
                            </div>
                            {isCloze && (
                              <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
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
                            <div className="line-clamp-2">
                              {card.back}
                            </div>
                          </td>
                          <td className="p-2.5">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-[11px] text-zinc-800 dark:text-zinc-200">
                                {card.specialty}
                              </span>
                              <span className="text-[10px] text-zinc-500 truncate max-w-[200px]" title={`${card.theme} > ${card.focus}`}>
                                {card.theme} &gt; {card.focus}
                              </span>
                              {card.subfocus && (
                                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 truncate max-w-[200px]" title={card.subfocus}>
                                  ↳ {card.subfocus}
                                </span>
                              )}
                              {card.subSubfocus && (
                                <span className="text-[9px] text-purple-600 dark:text-purple-400 font-medium truncate max-w-[200px]" title={card.subSubfocus}>
                                  {formatSubSubfocoDisplay(card.subSubfocus)}
                                </span>
                              )}
                              {card.distributionMode === 'auto' && (
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
                  <span>Importando...</span>
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

