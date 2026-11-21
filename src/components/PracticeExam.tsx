'use client'

import { useEffect, useState } from 'react'
import { renderFormattedMedicalText } from '@/utils/textSanitizer'
import Link from 'next/link'
import { fetchQuestionsFromSupabase, type ExtendedFilterState } from '@/services/questionService'
import { StudyInkLayer } from './StudyInkLayer'
import { useAuth } from '@/context/AuthContext'
import type { Question } from '@/types'

const catalog: Record<string, { filters: ExtendedFilterState; count: number; minutes: number }> = {
  'ex-1': { filters: { instituicoes: ['ENARE'], anos: [2024, 2025] }, count: 100, minutes: 240 },
  'ex-2': { filters: { instituicoes: ['USP-SP'], anos: [2024] }, count: 100, minutes: 270 },
  'ex-3': { filters: { especialidades: ['Cirurgia Geral', 'Clínica Médica'] }, count: 50, minutes: 120 },
  'ex-4': { filters: { instituicoes: ['SUS-SP', 'UNIFESP'] }, count: 80, minutes: 210 },
}
type ExamQuestion = Pick<Question, 'id' | 'statement' | 'images' | 'imageUrl' | 'type'> & {options: {letter: string; text: string}[]}
type Attempt = { id: string; questions: ExamQuestion[]; index: number; answers: Record<string,string>; deadline: number; closed: boolean }

function Exam({ exam, institution, year, owner }: { exam: string; institution: string; year: number; owner: string }) {
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
            if (!saved.questions?.[saved.index]) throw new Error('O registro da tentativa precisa ser recuperado.')
            setAttempt(saved); return
          }
        }
        const spec = catalog[exam] ?? { filters: { instituicoes: [institution], anos: [year] }, count: 200, minutes: 240 }
        const result = await fetchQuestionsFromSupabase(spec.filters, 1, spec.count, undefined, controller.signal)
        const questions = result.questions.slice(0,spec.count).map(({ id, statement, images, imageUrl, type, options }) =>
          ({ id, statement, images, imageUrl, type, options: options.map(({letter,text}) => ({letter,text})) }))
        if (!questions.length) throw new Error('Nenhuma questão encontrada para esta prova.')
        if (controller.signal.aborted) return
        const fresh = { id: crypto.randomUUID(), questions, answers: {}, index: 0, deadline: Date.now() + spec.minutes * 60000, closed: false }
        localStorage.setItem(storage, JSON.stringify(fresh))
        setAttempt(fresh); setNewAttempt(false)
      } catch (error) { if (!controller.signal.aborted) setMessage(error instanceof Error ? error.message : 'Não foi possível abrir a tentativa.') }
    }
    void open()
    return () => controller.abort()
  }, [exam, institution, year, storage, retry, newAttempt])

  function update(next: Attempt) {
    try { localStorage.setItem(storage, JSON.stringify(next)); setAttempt(next); setMessage('') }
    catch { setMessage('Falha ao salvar a tentativa neste dispositivo. Libere espaço para continuar.') }
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
  if (!attempt || !question) return <section><p role="status">{message || 'Abrindo tentativa…'}</p>{message && <button onClick={() => { setMessage(''); setRetry(value => value + 1) }}>Tentar novamente</button>}</section>
  const choice = attempt.answers[question.id] ?? ''
  function answer(value: string) {
    if (attempt && question && !attempt.closed && Date.now() < attempt.deadline) update({ ...attempt, answers: { ...attempt.answers, [question.id]: value } })
  }
  return <section className="mx-auto max-w-4xl space-y-5 rounded-2xl border p-5">
    <StudyInkLayer content={`exam:${attempt.id}:${question.id}`} choose={attempt.closed ? undefined : letter => { if (question.options.some(o => o.letter === letter)) answer(letter) }} />
    <header className="flex flex-wrap justify-between gap-2"><strong>{attempt.closed ? 'Revisão da tentativa' : 'Simulado'} · Questão {attempt.index+1} de {attempt.questions.length}</strong><span>{attempt.closed ? 'Encerrado' : remaining + ' min restantes'}</span></header>
    <p data-ink-block="statement" className="whitespace-pre-line">{renderFormattedMedicalText(question.statement)}</p>
    {(question.images?.length ? question.images : question.imageUrl ? [question.imageUrl] : []).map(url => <img key={url} src={url} alt="Imagem da questão" className="max-h-96 max-w-full object-contain" />)}
    {question.options.length ? question.options.map(option => <button key={option.letter} data-ink-block={option.letter} type="button" disabled={attempt.closed} aria-pressed={choice === option.letter} onClick={() => answer(option.letter)} className={`block w-full rounded-xl border p-3 text-left ${choice === option.letter ? 'ring-2 ring-blue-500' : ''}`}><strong data-ink-option={option.letter}>{option.letter}</strong> {renderFormattedMedicalText(option.text)}</button>) :
      <label>Resposta escrita<textarea className="block w-full rounded border p-3" readOnly={attempt.closed} value={choice} onChange={e => answer(e.target.value)} /></label>}
    <div className="flex flex-wrap gap-3"><button disabled={!attempt.index} onClick={() => update({...attempt,index:attempt.index-1})}>Anterior</button><button disabled={attempt.index+1 === attempt.questions.length} onClick={() => update({...attempt,index:attempt.index+1})}>Próxima</button>
      {attempt.closed ? <><Link href={'/questoes?mode=resolucao&ids='+encodeURIComponent(question.id)}>Estudar esta questão</Link><button onClick={() => { if (window.confirm('Iniciar outra tentativa?')) { setNewAttempt(true); setAttempt(null) } }}>Nova tentativa</button></> : <button onClick={() => { if (window.confirm('Encerrar e revisar o cartão-resposta?')) update({...attempt,closed:true}) }}>Finalizar simulado</button>}
    </div>
    <nav aria-label="Cartão-resposta" className="flex flex-wrap gap-2">{attempt.questions.map((q,i) => <button aria-current={attempt.index === i ? 'step' : undefined} aria-label={'Questão '+(i+1)+(attempt.answers[q.id] ? ', respondida' : ', em branco')} className={attempt.answers[q.id] ? 'rounded border bg-blue-100 px-2 text-blue-900' : 'rounded border px-2'} key={q.id} onClick={() => update({...attempt,index:i})}>{i+1}</button>)}</nav>
    {message && <p role="alert">{message}</p>}
  </section>
}

export function PracticeExam({ exam, institution = '', year = 0 }: {exam: string; institution?: string; year?: number}) {
  const {user,isLoading} = useAuth()
  return isLoading ? null : <Exam key={JSON.stringify([user?.id,exam,institution,year])} owner={user?.id ?? 'guest'} exam={exam} institution={institution} year={year} />
}
