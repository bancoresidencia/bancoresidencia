'use client'

import { useEffect, useState } from 'react'
import { renderFormattedMedicalText } from '@/utils/textSanitizer'
import Link from 'next/link'
import { fetchQuestionsFromSupabase, type ExtendedFilterState } from '@/services/questionService'
import { getSupabaseInstitutionName } from '@/utils/institutionResolver'
import { StudyInkLayer } from './StudyInkLayer'
import { useAuth } from '@/context/AuthContext'
import type { Question } from '@/types'

type ExamQuestion = Pick<Question, 'id' | 'statement' | 'images' | 'imageUrl' | 'type'> & {
  options: { letter: string; text: string }[]
}

type Attempt = {
  id: string
  examTitle: string
  questions: ExamQuestion[]
  index: number
  answers: Record<string, string>
  deadline: number
  closed: boolean
}

function Exam({
  exam,
  institution,
  year,
  owner
}: {
  exam: string
  institution: string
  year: number
  owner: string
}) {
  const storage = JSON.stringify(['practice-exam', owner, exam, institution, year])
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [message, setMessage] = useState('')
  const [retry, setRetry] = useState(0)
  const [newAttempt, setNewAttempt] = useState(false)
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    async function open() {
      try {
        if (!newAttempt) {
          const raw = localStorage.getItem(storage)
          if (raw) {
            const saved: Attempt = JSON.parse(raw)
            if (!saved.questions?.[saved.index]) {
              throw new Error('O registro da tentativa precisa ser recuperado.')
            }
            setAttempt(saved)
            return
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
          ({ id, statement, images, imageUrl, type, options }) => ({
            id,
            statement,
            images,
            imageUrl,
            type,
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
          closed: false
        }

        localStorage.setItem(storage, JSON.stringify(fresh))
        setAttempt(fresh)
        setNewAttempt(false)
      } catch (error) {
        if (!controller.signal.aborted) {
          setMessage(error instanceof Error ? error.message : 'Não foi possível abrir a tentativa.')
        }
      }
    }

    void open()
    return () => controller.abort()
  }, [exam, institution, year, storage, retry, newAttempt])

  function update(next: Attempt) {
    try {
      localStorage.setItem(storage, JSON.stringify(next))
      setAttempt(next)
      setMessage('')
    } catch {
      setMessage('Falha ao salvar a tentativa neste dispositivo. Libere espaço para continuar.')
    }
  }

  useEffect(() => {
    if (!attempt || attempt.closed) return
    const tick = () => {
      const time = Math.max(0, attempt.deadline - Date.now())
      setRemaining(Math.ceil(time / 60000))
      if (time === 0) update({ ...attempt, closed: true })
    }
    tick()
    const interval = window.setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [attempt, storage])

  const question = attempt?.questions[attempt.index]
  if (!attempt || !question) {
    return (
      <section className="mx-auto max-w-4xl p-6 text-center space-y-4">
        <p role="status" className="text-slate-600 dark:text-slate-300">
          {message || 'Abrindo tentativa do caderno oficial…'}
        </p>
        {message && (
          <button
            onClick={() => {
              setMessage('')
              setRetry((v) => v + 1)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
        )}
      </section>
    )
  }

  const choice = attempt.answers[question.id] ?? ''

  function answer(value: string) {
    if (attempt && question && !attempt.closed && Date.now() < attempt.deadline) {
      update({ ...attempt, answers: { ...attempt.answers, [question.id]: value } })
    }
  }

  return (
    <section className="mx-auto max-w-4xl space-y-5 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 relative isolate overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
      <StudyInkLayer
        content={`exam:${attempt.id}:${question.id}`}
        choose={
          attempt.closed
            ? undefined
            : (letter) => {
                if (question.options.some((o) => o.letter === letter)) answer(letter)
              }
        }
      />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-xs uppercase tracking-wider text-slate-500 font-bold">
            {attempt.closed ? 'Revisão da tentativa' : 'Simulado Oficial'}
          </h2>
          <strong className="text-base font-heading font-black text-slate-900 dark:text-white">
            {attempt.examTitle} · Questão {attempt.index + 1} de {attempt.questions.length}
          </strong>
        </div>
        <span
          className={`text-xs font-mono font-bold px-3 py-1 rounded-xl ${
            attempt.closed
              ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              : remaining <= 15
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 animate-pulse'
                : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
          }`}
        >
          {attempt.closed ? 'Encerrado' : `${remaining} min restantes`}
        </span>
      </header>

      <p data-ink-block="statement" className="whitespace-pre-line text-slate-800 dark:text-slate-200 leading-relaxed text-sm sm:text-base">
        {renderFormattedMedicalText(question.statement)}
      </p>

      {(question.images?.length ? question.images : question.imageUrl ? [question.imageUrl] : []).map((url) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={url} src={url} alt="Imagem da questão" className="max-h-96 max-w-full object-contain rounded-xl border border-slate-200 dark:border-slate-800" />
      ))}

      {question.options.length ? (
        question.options.map((option) => (
          <button
            key={option.letter}
            data-ink-block={option.letter}
            type="button"
            disabled={attempt.closed}
            aria-pressed={choice === option.letter}
            onClick={() => answer(option.letter)}
            className={`block w-full rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
              choice === option.letter
                ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <strong data-ink-option={option.letter} className="inline-block w-6 text-slate-900 dark:text-white font-bold">
              {option.letter}
            </strong>{' '}
            <span className="text-slate-700 dark:text-slate-300 text-sm">
              {renderFormattedMedicalText(option.text)}
            </span>
          </button>
        ))
      ) : (
        <label className="block space-y-1.5">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Resposta escrita</span>
          <textarea
            className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            readOnly={attempt.closed}
            value={choice}
            onChange={(e) => answer(e.target.value)}
          />
        </label>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex gap-2">
          <button
            disabled={!attempt.index}
            onClick={() => update({ ...attempt, index: attempt.index - 1 })}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Anterior
          </button>
          <button
            disabled={attempt.index + 1 === attempt.questions.length}
            onClick={() => update({ ...attempt, index: attempt.index + 1 })}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Próxima
          </button>
        </div>

        {attempt.closed ? (
          <div className="flex items-center gap-3">
            <Link
              href={`/questoes?mode=resolucao&examId=${encodeURIComponent(exam)}&ids=${encodeURIComponent(question.id)}`}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Estudar esta questão
            </Link>
            <button
              onClick={() => {
                if (window.confirm('Iniciar outra tentativa para este caderno?')) {
                  setNewAttempt(true)
                  setAttempt(null)
                }
              }}
              className="px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
            >
              Nova tentativa
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              if (window.confirm('Deseja realmente encerrar a prova e ver o resultado?')) {
                update({ ...attempt, closed: true })
              }
            }}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors"
          >
            Finalizar simulado
          </button>
        )}
      </div>

      <nav aria-label="Cartão-resposta" className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
        {attempt.questions.map((q, i) => (
          <button
            key={q.id}
            aria-current={attempt.index === i ? 'step' : undefined}
            aria-label={`Questão ${i + 1}${attempt.answers[q.id] ? ', respondida' : ', em branco'}`}
            onClick={() => update({ ...attempt, index: i })}
            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
              attempt.index === i
                ? 'ring-2 ring-blue-500 font-black'
                : ''
            } ${
              attempt.answers[q.id]
                ? 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200'
                : 'border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </nav>

      {message && <p role="alert" className="text-xs text-rose-600 dark:text-rose-400">{message}</p>}
    </section>
  )
}

export function PracticeExam({
  exam,
  institution = '',
  year = 0
}: {
  exam: string
  institution?: string
  year?: number
}) {
  const { user, isLoading } = useAuth()
  return isLoading ? null : (
    <Exam
      key={JSON.stringify([user?.id, exam, institution, year])}
      owner={user?.id ?? 'guest'}
      exam={exam}
      institution={institution}
      year={year}
    />
  )
}
