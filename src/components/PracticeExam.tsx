'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { renderFormattedMedicalText } from '@/utils/textSanitizer'
import Link from 'next/link'
import { fetchQuestionsFromSupabase, type ExtendedFilterState } from '@/services/questionService'
import { getSupabaseInstitutionName } from '@/utils/institutionResolver'
import { StudyInkLayer } from './StudyInkLayer'
import { HippocampusLoading } from '@/components/HippocampusLoading'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import type { Question } from '@/types'
import {
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  ListOrdered,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  BookOpen,
  ZoomIn,
  ZoomOut,
  Strikethrough,
  Check
} from 'lucide-react'

type ExamQuestion = Pick<Question, 'id' | 'statement' | 'images' | 'imageUrl' | 'type' | 'correctAnswer'> & {
  options: { letter: string; text: string }[]
}

type Attempt = {
  id: string
  examTitle: string
  questions: ExamQuestion[]
  index: number
  answers: Record<string, string>
  deadline: number
  durationMinutes: number
  closed: boolean
  startedAt: number
  submittedAt?: number
}

type ViewMode = 'paginated' | 'scroll'
type FontSize = 'sm' | 'base' | 'lg'

export function PracticeExam({
  exam,
  institution = '',
  year = 0
}: {
  exam: string
  institution?: string
  year?: number
}) {
  const { user, isLoading: authLoading } = useAuth()
  const { accentConfig } = useTheme()

  const storageKey = useMemo(() => {
    return JSON.stringify(['practice-exam', user?.id ?? 'guest', exam, institution, year])
  }, [user?.id, exam, institution, year])

  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [message, setMessage] = useState<string>('')
  const [retry, setRetry] = useState<number>(0)
  const [newAttempt, setNewAttempt] = useState<boolean>(false)
  const [remainingMinutes, setRemainingMinutes] = useState<number>(0)
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0)

  // Modos de visualização: Paginado (1 por vez) vs Rolamento Contínuo (scroll de prova)
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hippocampus_exam_view_mode')
      if (saved === 'scroll' || saved === 'paginated') return saved
    }
    return 'paginated'
  })

  // Escala de fonte
  const [fontSize, setFontSize] = useState<FontSize>('base')

  // Risco de assertivas (eliminador de alternativas da prova)
  const [strikethroughs, setStrikethroughs] = useState<Record<string, Record<string, boolean>>>({})
  const [isStrikethroughActive, setIsStrikethroughActive] = useState<boolean>(false)

  // Salvar preferência de modo de rolamento
  const handleToggleViewMode = useCallback((mode: ViewMode) => {
    setViewMode(mode)
    if (typeof window !== 'undefined') {
      localStorage.setItem('hippocampus_exam_view_mode', mode)
    }
  }, [])

  // Carregar dados e tentativa do caderno
  useEffect(() => {
    const controller = new AbortController()
    setIsLoading(true)

    async function open() {
      try {
        if (!newAttempt) {
          const raw = localStorage.getItem(storageKey)
          if (raw) {
            const saved: Attempt = JSON.parse(raw)
            if (saved.questions && saved.questions.length > 0) {
              setAttempt(saved)
              setIsLoading(false)
              return
            }
          }
        }

        let examTitle = institution ? `${institution} ${year || ''}`.trim() : 'Simulado Oficial'
        let durationMinutes = 240
        let targetQuestionIds: string[] | undefined = undefined

        // 1. Tentar recuperar dados do caderno oficial certificado via API
        try {
          const res = await fetch(`/api/exams/${encodeURIComponent(exam)}`, { signal: controller.signal })
          if (res.ok) {
            const data = await res.json()
            if (data.success && data.exam) {
              examTitle = data.exam.title
              durationMinutes = data.exam.duration_minutes || 240
              if (Array.isArray(data.exam.question_ids) && data.exam.question_ids.length > 0) {
                targetQuestionIds = data.exam.question_ids
              }
            }
          }
        } catch {
          // Fallback silencioso para filtros se a rota de caderno falhar
        }

        // 2. Buscar questões do caderno de forma determinística
        let resultQuestions: Question[] = []

        if (targetQuestionIds && targetQuestionIds.length > 0) {
          const result = await fetchQuestionsFromSupabase(
            {},
            1,
            targetQuestionIds.length,
            targetQuestionIds,
            controller.signal
          )
          resultQuestions = result.questions
        } else {
          const resolvedInst = getSupabaseInstitutionName(institution)
          const fallbackFilters: ExtendedFilterState = {
            instituicoes: resolvedInst ? [resolvedInst] : [],
            anos: year ? [year] : []
          }
          const result = await fetchQuestionsFromSupabase(fallbackFilters, 1, 100, undefined, controller.signal)
          resultQuestions = result.questions
        }

        if (controller.signal.aborted) return

        const questions: ExamQuestion[] = resultQuestions.map(
          ({ id, statement, images, imageUrl, type, options, correctAnswer }) => ({
            id,
            statement,
            images,
            imageUrl,
            type,
            correctAnswer,
            options: options.map(({ letter, text }) => ({ letter, text }))
          })
        )

        if (!questions.length) {
          throw new Error('Nenhuma questão encontrada para este caderno de prova.')
        }

        const fresh: Attempt = {
          id: crypto.randomUUID(),
          examTitle,
          questions,
          answers: {},
          index: 0,
          deadline: Date.now() + durationMinutes * 60000,
          durationMinutes,
          closed: false,
          startedAt: Date.now()
        }

        localStorage.setItem(storageKey, JSON.stringify(fresh))
        setAttempt(fresh)
        setNewAttempt(false)
        setMessage('')
      } catch (error) {
        if (!controller.signal.aborted) {
          setMessage(error instanceof Error ? error.message : 'Não foi possível carregar o caderno oficial.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void open()
    return () => controller.abort()
  }, [exam, institution, year, storageKey, retry, newAttempt])

  // Salvar atualização de tentativa
  const updateAttempt = useCallback(
    (next: Attempt) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(next))
        setAttempt(next)
        setMessage('')
      } catch {
        setMessage('Falha ao salvar a tentativa neste dispositivo. Libere espaço para continuar.')
      }
    },
    [storageKey]
  )

  // Cronômetro regressivo da prova oficial
  useEffect(() => {
    if (!attempt || attempt.closed) return
    const tick = () => {
      const now = Date.now()
      const diff = Math.max(0, attempt.deadline - now)
      const totalSec = Math.floor(diff / 1000)
      setRemainingMinutes(Math.floor(totalSec / 60))
      setRemainingSeconds(totalSec % 60)

      if (diff === 0) {
        updateAttempt({ ...attempt, closed: true, submittedAt: Date.now() })
      }
    }
    tick()
    const interval = window.setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [attempt, updateAttempt])

  // Registrar resposta da alternativa
  const answerQuestion = useCallback(
    (questionId: string, letter: string) => {
      if (!attempt || attempt.closed || Date.now() >= attempt.deadline) return
      updateAttempt({
        ...attempt,
        answers: {
          ...attempt.answers,
          [questionId]: attempt.answers[questionId] === letter ? '' : letter
        }
      })
    },
    [attempt, updateAttempt]
  )

  // Alternar risco de assertiva
  const toggleStrikethrough = useCallback((questionId: string, letter: string) => {
    setStrikethroughs((prev) => {
      const qMap = prev[questionId] || {}
      return {
        ...prev,
        [questionId]: {
          ...qMap,
          [letter]: !qMap[letter]
        }
      }
    })
  }, [])

  // Rolar suavemente até uma questão no modo rolamento
  const scrollToQuestion = useCallback((qIndex: number) => {
    if (viewMode === 'paginated') {
      if (attempt) {
        updateAttempt({ ...attempt, index: qIndex })
      }
    } else {
      const target = document.getElementById(`questao-caderno-${qIndex + 1}`)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [viewMode, attempt, updateAttempt])

  // Atalhos de teclado no modo paginado
  useEffect(() => {
    if (!attempt || attempt.closed || viewMode !== 'paginated') return

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

      const activeQ = attempt.questions[attempt.index]
      if (!activeQ) return

      const key = e.key.toUpperCase()
      if (['A', 'B', 'C', 'D', 'E'].includes(key)) {
        if (activeQ.options.some((o) => o.letter === key)) {
          e.preventDefault()
          answerQuestion(activeQ.id, key)
        }
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (attempt.index + 1 < attempt.questions.length) {
          e.preventDefault()
          updateAttempt({ ...attempt, index: attempt.index + 1 })
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (attempt.index > 0) {
          e.preventDefault()
          updateAttempt({ ...attempt, index: attempt.index - 1 })
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [attempt, viewMode, answerQuestion, updateAttempt])

  // Total de questões respondidas
  const answeredCount = useMemo(() => {
    if (!attempt) return 0
    return Object.values(attempt.answers).filter(Boolean).length
  }, [attempt])

  // Cálculos de encerramento e pontuação
  const examResults = useMemo(() => {
    if (!attempt || !attempt.closed) return null
    let correct = 0
    const total = attempt.questions.length

    attempt.questions.forEach((q) => {
      const chosen = attempt.answers[q.id]
      if (chosen && q.correctAnswer && chosen.toUpperCase() === q.correctAnswer.toUpperCase()) {
        correct++
      }
    })

    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0
    return { correct, total, percentage }
  }, [attempt])

  // Tamanho de fonte
  const statementFontClass = useMemo(() => {
    switch (fontSize) {
      case 'sm':
        return 'text-xs sm:text-sm'
      case 'lg':
        return 'text-base sm:text-lg'
      default:
        return 'text-sm sm:text-base'
    }
  }, [fontSize])

  // Estado de Carregamento Padronizado com HippocampusLoading
  if (authLoading || isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <HippocampusLoading size="md" message="Carregando caderno oficial..." fullScreen={false} />
      </div>
    )
  }

  // Falha de carregamento com opção de retry
  if (!attempt || attempt.questions.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4 max-w-lg mx-auto text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 animate-bounce" />
        <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white">
          Não foi possível abrir o caderno
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {message || 'Não encontramos as questões homologadas deste caderno no banco de dados.'}
        </p>
        <button
          type="button"
          onClick={() => {
            setMessage('')
            setRetry((r) => r + 1)
          }}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  const activeQuestion = attempt.questions[attempt.index]
  const isTimeAlert = remainingMinutes < 15 && !attempt.closed

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 space-y-5 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* 1. HEADER OFICIAL DA PROVA COM IDENTIDADE VISUAL DO BANCO */}
      {/* ========================================================================= */}
      <header className="bento-card bg-white dark:bg-[var(--bg-card)] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-4 sm:p-5 shadow-xs transition-all">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Identificação da Prova */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white"
                style={{ backgroundColor: accentConfig.primaryHex }}
              >
                {attempt.closed ? 'Revisão Oficial' : 'Modo Prova'}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {institution} {year > 0 ? `• ${year}` : ''}
              </span>
            </div>
            <h1 className="font-heading font-black text-lg sm:text-xl text-slate-900 dark:text-white">
              {attempt.examTitle}
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>{attempt.questions.length} questões</span>
              <span>•</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {answeredCount} de {attempt.questions.length} respondidas ({Math.round((answeredCount / attempt.questions.length) * 100)}%)
              </span>
            </div>
          </div>

          {/* Ferramentas e Cronômetro */}
          <div className="flex items-center gap-2.5 flex-wrap justify-between md:justify-end">
            {/* Seletor de Modo de Visualização (Rolamento vs Paginado) */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => handleToggleViewMode('paginated')}
                title="Modo Questão Individual (Paginado)"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'paginated'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Paginado</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleViewMode('scroll')}
                title="Modo Rolamento Contínuo (Scroll da Prova Inteira)"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'scroll'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Rolamento</span>
              </button>
            </div>

            {/* Ajuste de Tamanho de Fonte */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => setFontSize((s) => (s === 'lg' ? 'base' : 'sm'))}
                title="Diminuir texto"
                className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono font-bold px-1.5 text-slate-700 dark:text-slate-300">
                {fontSize === 'sm' ? 'A-' : fontSize === 'lg' ? 'A+' : 'A'}
              </span>
              <button
                type="button"
                onClick={() => setFontSize((s) => (s === 'sm' ? 'base' : 'lg'))}
                title="Aumentar texto"
                className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Alternador de Ferramenta de Risco (Strikethrough) */}
            <button
              type="button"
              onClick={() => setIsStrikethroughActive((prev) => !prev)}
              title="Ativar/Desativar modo de riscar assertivas"
              className={`p-2 rounded-2xl border transition-all cursor-pointer ${
                isStrikethroughActive
                  ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950/60 dark:border-amber-700 dark:text-amber-200'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Strikethrough className="w-4 h-4" />
            </button>

            {/* Cronômetro Oficial do Edital */}
            <div
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border font-mono font-bold text-xs transition-all ${
                attempt.closed
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  : isTimeAlert
                  ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 animate-pulse'
                  : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300'
              }`}
            >
              <Clock className={`w-4 h-4 ${isTimeAlert ? 'text-rose-600 dark:text-rose-400 animate-spin' : ''}`} />
              <span>
                {attempt.closed
                  ? 'Encerrado'
                  : `${String(remainingMinutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`}
              </span>
            </div>

            {/* Botão de Finalização / Nova Tentativa */}
            {attempt.closed ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Deseja iniciar uma nova tentativa para este caderno?')) {
                    setNewAttempt(true)
                    setAttempt(null)
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Nova tentativa</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const unanswered = attempt.questions.length - answeredCount
                  const msg =
                    unanswered > 0
                      ? `Você ainda possui ${unanswered} questão(ões) sem resposta. Deseja realmente finalizar o simulado oficial?`
                      : 'Deseja encerrar a prova e calcular o resultado oficial?'
                  if (window.confirm(msg)) {
                    updateAttempt({ ...attempt, closed: true, submittedAt: Date.now() })
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Finalizar Prova</span>
              </button>
            )}
          </div>
        </div>

        {/* Barra de Progresso de Respostas */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${(answeredCount / attempt.questions.length) * 100}%`,
              backgroundColor: accentConfig.primaryHex
            }}
          />
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. PAINEL DE RESULTADO QUANDO O SIMULADO FOR ENCERRADO */}
      {/* ========================================================================= */}
      {attempt.closed && examResults && (
        <div className="bento-card bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Desempenho Geral Homologado
            </span>
            <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
              {examResults.correct} de {examResults.total} acertos ({examResults.percentage}%)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Respostas e gabarito oficial liberados abaixo para revisão cirúrgica.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/questoes?examId=${encodeURIComponent(exam)}&mode=resolucao`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
            >
              <BookOpen className="w-4 h-4" />
              <span>Abrir no Estudo Comentado</span>
            </Link>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CORPO PRINCIPAL COM LAYOUT DUPLO: CONTEÚDO DA PROVA + CARTÃO-RESPOSTA */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* COLUNA ESQUERDA (3 colunas): Questão Individual ou Rolamento Contínuo */}
        <div className="lg:col-span-3 space-y-6">
          {viewMode === 'paginated' ? (
            /* ================================================================= */
            /* CENÁRIO A: MODO QUESTÃO INDIVIDUAL (PAGINADO) */
            /* ================================================================= */
            <QuestionCardItem
              question={activeQuestion}
              index={attempt.index}
              total={attempt.questions.length}
              choice={attempt.answers[activeQuestion.id] || ''}
              closed={attempt.closed}
              statementFontClass={statementFontClass}
              isStrikethroughActive={isStrikethroughActive}
              questionStrikethroughs={strikethroughs[activeQuestion.id] || {}}
              onAnswer={(letter) => answerQuestion(activeQuestion.id, letter)}
              onToggleStrikethrough={(letter) => toggleStrikethrough(activeQuestion.id, letter)}
              attemptId={attempt.id}
            />
          ) : (
            /* ================================================================= */
            /* CENÁRIO B: MODO ROLAMENTO CONTÍNUO (TODAS AS QUESTÕES EM SCROLL) */
            /* ================================================================= */
            <div className="space-y-6">
              {attempt.questions.map((q, idx) => (
                <div key={q.id} id={`questao-caderno-${idx + 1}`} className="scroll-mt-6">
                  <QuestionCardItem
                    question={q}
                    index={idx}
                    total={attempt.questions.length}
                    choice={attempt.answers[q.id] || ''}
                    closed={attempt.closed}
                    statementFontClass={statementFontClass}
                    isStrikethroughActive={isStrikethroughActive}
                    questionStrikethroughs={strikethroughs[q.id] || {}}
                    onAnswer={(letter) => answerQuestion(q.id, letter)}
                    onToggleStrikethrough={(letter) => toggleStrikethrough(q.id, letter)}
                    attemptId={attempt.id}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Barra de Navegação Inferior (No Modo Paginado) */}
          {viewMode === 'paginated' && (
            <div className="bento-card bg-white dark:bg-[var(--bg-card)] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-4 shadow-xs flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={attempt.index === 0}
                onClick={() => updateAttempt({ ...attempt, index: attempt.index - 1 })}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Questão {attempt.index + 1} de {attempt.questions.length}
              </span>

              <button
                type="button"
                disabled={attempt.index + 1 === attempt.questions.length}
                onClick={() => updateAttempt({ ...attempt, index: attempt.index + 1 })}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <span>Próxima</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* COLUNA DIREITA (1 coluna): CARTÃO-RESPOSTA CANÔNICO STICKY */}
        <div className="lg:col-span-1 lg:sticky lg:top-4 space-y-4">
          <div className="bento-card bg-white dark:bg-[var(--bg-card)] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white">
                Cartão-Resposta
              </h3>
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                {answeredCount}/{attempt.questions.length}
              </span>
            </div>

            {/* Legenda rápida */}
            <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 dark:bg-blue-600 inline-block" />
                Respondida
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm border border-slate-300 dark:border-slate-600 inline-block" />
                Em branco
              </span>
            </div>

            {/* Grade de 1..N Questões */}
            <div className="grid grid-cols-5 gap-1.5 max-h-[60vh] overflow-y-auto no-scrollbar pr-0.5">
              {attempt.questions.map((q, i) => {
                const isAnswered = Boolean(attempt.answers[q.id])
                const isCurrent = attempt.index === i && viewMode === 'paginated'
                const isCorrect = attempt.closed && q.correctAnswer && attempt.answers[q.id]?.toUpperCase() === q.correctAnswer.toUpperCase()
                const isWrong = attempt.closed && isAnswered && !isCorrect

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => scrollToQuestion(i)}
                    className={`h-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                      isCurrent ? 'ring-2 ring-blue-500 font-black scale-105' : ''
                    } ${
                      attempt.closed
                        ? isCorrect
                          ? 'bg-emerald-500 text-white'
                          : isWrong
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        : isAnswered
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'border border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Subcomponente canônico para renderizar a questão no padrão de design do Banco
function QuestionCardItem({
  question,
  index,
  total,
  choice,
  closed,
  statementFontClass,
  isStrikethroughActive,
  questionStrikethroughs,
  onAnswer,
  onToggleStrikethrough,
  attemptId
}: {
  question: ExamQuestion
  index: number
  total: number
  choice: string
  closed: boolean
  statementFontClass: string
  isStrikethroughActive: boolean
  questionStrikethroughs: Record<string, boolean>
  onAnswer: (letter: string) => void
  onToggleStrikethrough: (letter: string) => void
  attemptId: string
}) {
  const images = question.images?.length
    ? question.images
    : question.imageUrl
    ? [question.imageUrl]
    : []

  return (
    <div className="bento-card bg-white dark:bg-[var(--bg-card)] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 sm:p-7 shadow-xs relative isolate overflow-hidden transition-all space-y-5">
      {/* Camada de Desenho / Tinta Médica */}
      <StudyInkLayer
        content={`exam:${attemptId}:${question.id}`}
        choose={closed ? undefined : (letter) => onAnswer(letter)}
        eliminate={closed ? undefined : (letter) => onToggleStrikethrough(letter)}
      />

      {/* Topo do Card da Questão */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-heading font-black text-sm text-slate-900 dark:text-white">
            Questão {index + 1}
          </span>
          <span className="text-xs text-slate-400">de {total}</span>
        </div>

        {closed && question.correctAnswer && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            Gabarito Oficial: <strong className="text-emerald-600 dark:text-emerald-400">{question.correctAnswer}</strong>
          </span>
        )}
      </div>

      {/* Enunciado Formatado da Questão */}
      <div data-ink-block="statement" className={`whitespace-pre-line text-slate-800 dark:text-slate-200 leading-relaxed ${statementFontClass}`}>
        {renderFormattedMedicalText(question.statement)}
      </div>

      {/* Imagens Associadas */}
      {images.length > 0 && (
        <div className="space-y-3 pt-2">
          {images.map((url, imgIdx) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${url}-${imgIdx}`}
              src={url}
              alt={`Imagem da questão ${index + 1}`}
              loading="lazy"
              className="max-h-[460px] max-w-full mx-auto object-contain rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs"
            />
          ))}
        </div>
      )}

      {/* Alternativas da Questão no Padrão Canônico do Banco */}
      <div className="space-y-2.5 pt-2">
        {question.options.map((option) => {
          const isSelected = choice === option.letter
          const isStruck = Boolean(questionStrikethroughs[option.letter])
          const isOfficialCorrect = closed && question.correctAnswer?.toUpperCase() === option.letter.toUpperCase()
          const isSelectedWrong = closed && isSelected && !isOfficialCorrect

          return (
            <div key={option.letter} className="relative group">
              <button
                type="button"
                data-ink-option-row={option.letter}
                disabled={closed}
                onClick={() => {
                  if (isStrikethroughActive) {
                    onToggleStrikethrough(option.letter)
                  } else {
                    onAnswer(option.letter)
                  }
                }}
                className={`w-full rounded-2xl border p-4 text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                  isStruck ? 'opacity-40 line-through' : ''
                } ${
                  closed
                    ? isOfficialCorrect
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500'
                      : isSelectedWrong
                      ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100 ring-2 ring-rose-500'
                      : 'border-slate-200 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-900/40'
                    : isSelected
                    ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 ring-2 ring-blue-500'
                    : 'border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
                }`}
              >
                {/* Letra da Alternativa */}
                <span
                  data-ink-option={option.letter}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-heading font-black text-xs shrink-0 transition-all ${
                    closed
                      ? isOfficialCorrect
                        ? 'bg-emerald-600 text-white'
                        : isSelectedWrong
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      : isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                  }`}
                >
                  {option.letter}
                </span>

                {/* Texto da Alternativa com Formatação Médica */}
                <span data-ink-block={option.letter} className={`text-slate-700 dark:text-slate-300 pt-0.5 leading-relaxed ${statementFontClass} flex-1`}>
                  {renderFormattedMedicalText(option.text)}
                </span>

                {/* Ícone de Validação na Revisão */}
                {closed && (
                  <span className="shrink-0 pt-0.5">
                    {isOfficialCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : isSelectedWrong ? (
                      <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    ) : null}
                  </span>
                )}
              </button>

              {/* Botão sutil de riscar assertiva no canto */}
              {!closed && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleStrikethrough(option.letter)
                  }}
                  title="Riscar alternativa"
                  className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <Strikethrough className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
