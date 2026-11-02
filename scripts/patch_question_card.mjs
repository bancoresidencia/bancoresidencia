import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src', 'components', 'QuestionCard.tsx');
let content = fs.readFileSync(filePath, 'utf8');
const isCRLF = content.includes('\r\n');
const eol = isCRLF ? '\r\n' : '\n';

function applyReplace(name, startMarker, endMarker, replacement) {
  const normStart = startMarker.replace(/\r?\n/g, eol);
  const normEnd = endMarker.replace(/\r?\n/g, eol);
  const startIdx = content.indexOf(normStart);
  if (startIdx === -1) {
    console.error(`❌ ${name}: startMarker não encontrado!`);
    console.error('Marker:', normStart);
    process.exit(1);
  }
  const endIdx = content.indexOf(normEnd, startIdx);
  if (endIdx === -1) {
    console.error(`❌ ${name}: endMarker não encontrado!`);
    console.error('Marker:', normEnd);
    process.exit(1);
  }
  const fullEndIdx = endIdx + normEnd.length;
  content = content.slice(0, startIdx) + replacement.replace(/\r?\n/g, eol) + content.slice(fullEndIdx);
  console.log(`✅ ${name} aplicado com sucesso.`);
}

// 1. Inserir isLoadingResolution após solveError
applyReplace(
  'Passo 1: Declaração de isLoadingResolution',
  '  const [solveError, setSolveError] = useState<string | null>(null);',
  '  const [solveError, setSolveError] = useState<string | null>(null);',
  `  const [solveError, setSolveError] = useState<string | null>(null);

  // Rastreia se a resolução de uma questão previamente respondida ainda está sendo carregada via API
  const [isLoadingResolution, setIsLoadingResolution] = useState<boolean>(
    Boolean(userAnswer && !(question.correctAnswer || (question as { correct_answer?: string }).correct_answer))
  );`
);

// 2. Atualizar o useEffect de sincronização [question.id, userAnswer]
applyReplace(
  'Passo 2: useEffect de sincronização de estado',
  '  // Sincroniza estado de forma limpa quando a questão ou a resposta mudam',
  '  }, [question.id, userAnswer]);',
  `  // Sincroniza estado de forma limpa quando a questão ou a resposta mudam
  useEffect(() => {
    setResolvedOverrides({});
    setIsSubmittingAnswer(false);
    setSolveError(null);
    setPendingSelected(userAnswer || null);
    setIsAnswered(!!userAnswer);
    setShowCommentary(!!userAnswer);
    setIsLoadingResolution(Boolean(userAnswer && !(question.correctAnswer || (question as { correct_answer?: string }).correct_answer)));
    setEliminatedOptions({});
    setExpandedOptions({});
    setOpenTopics({});
    setHighlights([]);
    setHoveredOptionLetter(null);
  }, [question.id, question.correctAnswer, userAnswer]);`
);

// 3. Atualizar o useEffect que busca /api/questions/solve
applyReplace(
  'Passo 3: useEffect com fetch sob demanda',
  '  // Carrega sob demanda gabarito e comentários caso a questão tenha sido respondida previamente',
  '  }, [userAnswer, question.id, activeQuestion.correctAnswer, question.options]);',
  `  // Carrega sob demanda gabarito e comentários caso a questão tenha sido respondida previamente
  useEffect(() => {
    const hasCorrectAnswer = Boolean(activeQuestion.correctAnswer || question.correctAnswer);
    if (userAnswer && !hasCorrectAnswer) {
      let isMounted = true;
      setIsLoadingResolution(true);
      fetch('/api/questions/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: question.id,
          selectedOption: userAnswer
        })
      })
        .then((res) => res.json())
        .then((data) => {
          if (isMounted) {
            setIsLoadingResolution(false);
            if (data.success) {
              setResolvedOverrides({
                correctAnswer: data.correctAnswer,
                commentary: data.commentary,
                options: data.options && data.options.length > 0 ? data.options : question.options,
                isAnulada: data.isAnulada
              });
            }
          }
        })
        .catch((err) => {
          if (isMounted) {
            setIsLoadingResolution(false);
          }
          console.warn('[QuestionCard] Falha ao carregar detalhes da questão resolvida:', err);
        });

      return () => {
        isMounted = false;
      };
    } else {
      setIsLoadingResolution(false);
    }
  }, [userAnswer, question.id, activeQuestion.correctAnswer, question.correctAnswer, question.options]);`
);

// 4. Limpar o resolvedCorrectAnswer (eliminar regex no comentário e em explicações)
applyReplace(
  'Passo 4: resolvedCorrectAnswer estrito e homologado',
  '  // Resolução robusta do gabarito oficial com fallback inteligente para comentário ou justificativas',
  '  }, [activeQuestion.correctAnswer, activeQuestion.commentary, activeQuestion.options, question.correctAnswer, question.commentary, question.options]);',
  `  // Resolução estrita do gabarito oficial: obtido diretamente da coluna homologada do banco de dados
  const resolvedCorrectAnswer = useMemo(() => {
    const rawAnswer = activeQuestion.correctAnswer || question.correctAnswer;
    if (rawAnswer && rawAnswer.trim()) {
      return rawAnswer.trim().toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E' | 'ANULADA';
    }
    return '';
  }, [activeQuestion.correctAnswer, question.correctAnswer]);`
);

// 5. Inserir isResolutionLoading e ajustar previousIsCorrect
applyReplace(
  'Passo 5: isResolutionLoading e previousIsCorrect resiliente',
  '  const isAnuladaQuestion = Boolean(activeQuestion.isAnulada || resolvedCorrectAnswer === \'ANULADA\');',
  '  const isUserCorrect = isAnswered && (isAnuladaQuestion || pendingSelected === resolvedCorrectAnswer);',
  `  const isAnuladaQuestion = Boolean(activeQuestion.isAnulada || resolvedCorrectAnswer === 'ANULADA');
  const isResolutionLoading = Boolean(isAnswered && isLoadingResolution && !resolvedCorrectAnswer);
  const hasHistoricalAnswer = Boolean(historicalAnswer && (historicalAnswer.letter || (historicalAnswer as { selectedOption?: string }).selectedOption));
  const hasPreviousAnswer = Boolean(userAnswer || hasHistoricalAnswer);
  const previousIsCorrect = Boolean(
    historicalAnswer && typeof historicalAnswer.isCorrect === 'boolean'
      ? (isAnuladaQuestion || historicalAnswer.isCorrect)
      : userAnswer
      ? (isAnuladaQuestion || (resolvedCorrectAnswer ? userAnswer === resolvedCorrectAnswer : false))
      : false
  );
  const isUserCorrect = isAnswered && (isAnuladaQuestion || pendingSelected === resolvedCorrectAnswer);`
);

// 6. Atualizar estilos das opções (evitar flash vermelho enquanto isResolutionLoading)
applyReplace(
  'Passo 6: Estilos visuais do container da opção',
  '            if (!isAnswered) {',
  'opacity-70 hover:opacity-100 border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/30 text-zinc-600 dark:text-zinc-400\';\n              }\n            }',
  `            if (!isAnswered) {
              if (isEliminated) {
                optionContainerStyle =
                  'border-zinc-200 dark:border-zinc-800/60 bg-zinc-50/80 dark:bg-zinc-900/30 text-zinc-400 dark:text-zinc-500 opacity-60';
              } else if (isPending) {
                optionContainerStyle =
                  'border-blue-500 dark:border-blue-400 bg-blue-50/70 dark:bg-blue-950/50 text-blue-950 dark:text-blue-100 ring-2 ring-blue-500/30 shadow-sm font-semibold';
              }
            } else {
              // Já respondeu
              if (isResolutionLoading) {
                if (isPending) {
                  if (historicalAnswer && typeof historicalAnswer.isCorrect === 'boolean') {
                    if (historicalAnswer.isCorrect) {
                      optionContainerStyle =
                        'border-emerald-500/80 bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/30 shadow-sm font-semibold';
                    } else {
                      optionContainerStyle =
                        'border-rose-500/80 bg-rose-50/80 dark:bg-rose-950/50 text-rose-950 dark:text-rose-200 ring-2 ring-rose-500/30 shadow-sm';
                    }
                  } else {
                    // Estado neutro e elegante de carregamento da validação (elimina flash vermelho)
                    optionContainerStyle =
                      'border-blue-400/80 dark:border-blue-500/70 bg-blue-50/50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 ring-2 ring-blue-400/20 shadow-sm font-semibold animate-pulse';
                  }
                } else {
                  optionContainerStyle =
                    'opacity-60 border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/30 text-zinc-600 dark:text-zinc-400';
                }
              } else if (isCorrect) {
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
            }`
);

// 7. Atualizar badge da letra da alternativa
applyReplace(
  'Passo 7: Badge de letra da opção',
  '                      className={`${badgeSizeClass} rounded-xl flex items-center justify-center font-extrabold shrink-0 mt-0.5 shadow-xs transition-colors ${',
  ': \'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700\'\n                      }`}',
  `                      className={\`\${badgeSizeClass} rounded-xl flex items-center justify-center font-extrabold shrink-0 mt-0.5 shadow-xs transition-colors \${
                        isAnswered && isResolutionLoading
                          ? (isPending
                              ? (historicalAnswer && typeof historicalAnswer.isCorrect === 'boolean'
                                  ? (historicalAnswer.isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white')
                                  : 'bg-blue-600 text-white animate-pulse')
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700')
                          : isAnswered && isCorrect
                          ? 'bg-emerald-600 text-white'
                          : isAnswered && isPending && isAnuladaQuestion
                          ? 'bg-amber-600 text-white'
                          : isAnswered && isPending && !isCorrect
                          ? 'bg-rose-600 text-white'
                          : isEliminated
                          ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 line-through'
                          : isPending
                          ? 'text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                      }\`}`
);

// 8. Atualizar feedback de ações pós-resposta (mostrar 'Validando...' em vez de 'Incorreta')
applyReplace(
  'Passo 8: Status pós-resposta (Validando... vs Incorreta)',
  '{/* Feedback Visual pós-resposta + Botão de Justificativa */}',
  '<span className="hidden sm:inline">Incorreta</span>\n                          </div>\n                        )}',
  `{/* Feedback Visual pós-resposta + Botão de Justificativa */}
                    {isAnswered && (
                      <div className="flex items-center gap-2">
                        {isResolutionLoading && isPending ? (
                          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-xs font-bold animate-pulse">
                            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                            <span className="hidden sm:inline">Validando...</span>
                          </div>
                        ) : (
                          <>
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
                          </>
                        )}`
);

// 9. Atualizar header do comentário final
applyReplace(
  'Passo 9: Header do comentário oficial',
  '<div className="flex items-center justify-between text-emerald-800 dark:text-emerald-400 font-bold text-xs sm:text-sm">',
  'Padrão de Resposta Oficial:\'}\n                    </span>\n                  </div>\n                </div>',
  `<div className="flex items-center justify-between text-emerald-800 dark:text-emerald-400 font-bold text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    {isResolutionLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Carregando gabarito oficial...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>
                          {activeQuestion.options && activeQuestion.options.length > 0
                            ? (resolvedCorrectAnswer
                                ? \`Gabarito Oficial: Alternativa \${resolvedCorrectAnswer}\`
                                : 'Gabarito Oficial: Em processo de homologação por provas públicas')
                            : 'Padrão de Resposta Oficial:'}
                        </span>
                      </>
                    )}
                  </div>
                </div>`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('\n🚀 PARABÉNS! QuestionCard.tsx 100% blindado com sucesso!');
