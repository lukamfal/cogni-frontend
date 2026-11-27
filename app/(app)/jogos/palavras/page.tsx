'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, WordQuestion } from '@/lib/api'
import { GAMES, toast } from '@/lib/games'
import DifficultyPicker from '@/components/games/DifficultyPicker'
import GameResult from '@/components/games/GameResult'
import GameTimer from '@/components/games/GameTimer'

type Phase = 'pick' | 'playing' | 'result'
const game = GAMES.word

interface WordFeedback { ok: boolean; timeout: boolean; answer: string }

/** Check the letters typed into the blanks (left to right) against the answer the backend sent. */
function check(q: WordQuestion, letters: string[]): { ok: boolean; answer: string } | null {
  if (q.full_word) {
    let k = 0
    const word = q.masked_word.split('').map(ch => (ch === '_' ? letters[k++] ?? '' : ch)).join('')
    return { ok: word === q.full_word, answer: q.full_word }
  }
  if (q.correct_letters) {
    const sort = (a: string[]) => [...a].sort().join('')
    return { ok: sort(letters) === sort(q.correct_letters), answer: q.correct_letters.join(', ') }
  }
  return null // Older backend without answers: nothing to check against.
}

export default function PalavrasPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('pick')
  const [difficulty, setDifficulty] = useState('')
  const [questions, setQuestions] = useState<WordQuestion[]>([])
  const [sessionId, setSessionId] = useState(0)
  const [current, setCurrent] = useState(0)
  const [used, setUsed] = useState<number[]>([]) // indexes into q.options, in blank order
  const [feedback, setFeedback] = useState<WordFeedback | null>(null)
  const [timerKey, setTimerKey] = useState(0)
  const [result, setResult] = useState<{ score: number; correct: number; total: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const startTime = useRef(0)
  const correct = useRef(0)

  const start = async (diff: string) => {
    setLoading(true)
    try {
      const data = await api.games.word.start(diff)
      setDifficulty(diff)
      setSessionId(data.session_id)
      setQuestions(data.questions)
      setCurrent(0)
      setUsed([])
      correct.current = 0
      setPhase('playing')
      startTime.current = Date.now()
      setTimerKey(k => k + 1)
    } catch {
      toast('Erro ao iniciar o jogo. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const q = questions[current]
  const blanks = q ? q.masked_word.split('').filter(ch => ch === '_').length : 0

  const submit = (picked: number[] | null) => {
    if (!q || feedback) return
    const letters = (picked ?? []).map(i => q.options[i])
    const verdict = check(q, letters)
    const ok = picked !== null && (verdict ? verdict.ok : true)
    if (ok) correct.current++
    setFeedback({ ok, timeout: picked === null, answer: verdict?.answer ?? '' })

    setTimeout(async () => {
      const nextIdx = current + 1
      try {
        if (nextIdx >= questions.length) {
          const duration = Math.round((Date.now() - startTime.current) / 1000)
          const res = await api.games.word.finish(sessionId, {
            score: 0, correct_answers: correct.current,
            total_questions: questions.length, duration_seconds: duration,
          })
          setResult({ score: res.score, correct: correct.current, total: questions.length })
          setPhase('result')
        } else {
          setCurrent(nextIdx)
          setUsed([])
          setTimerKey(k => k + 1)
        }
      } catch {
        toast('Erro de conexão. Tente novamente.')
      } finally {
        setFeedback(null)
      }
    }, ok ? 900 : 1900)
  }

  const pickLetter = (i: number) => {
    if (feedback || used.includes(i) || used.length >= blanks) return
    const next = [...used, i]
    setUsed(next)
    if (next.length === blanks) submit(next)
  }

  if (phase === 'pick') return (
    <DifficultyPicker
      game={game}
      desc="Descubra as letras que faltam para completar a palavra."
      loading={loading} onSelect={start} onBack={() => router.push('/jogos')}
      levels={[
        { key: 'easy', label: 'Fácil', detail: '1 letra faltando · com dica · 30s cada' },
        { key: 'medium', label: 'Médio', detail: '2 letras faltando · com dica · 20s cada' },
        { key: 'hard', label: 'Difícil', detail: '3 letras faltando · sem dica · 15s cada' },
      ]}
    />
  )

  if (phase === 'result' && result) return (
    <GameResult
      game={game} difficulty={difficulty}
      score={result.score} correct={result.correct} total={result.total}
      onPlayAgain={() => setPhase('pick')}
      onHome={() => router.push('/dashboard')}
    />
  )

  if (!q) return null

  let k = 0
  const fbClass = feedback ? (feedback.ok ? 'filled-good' : 'filled-bad') : ''

  return (
    <div className="play fade-up">
      <div className="topbar">
        <div>
          <div className="tb-title">📝 Complete a Palavra</div>
          <div className="tb-sub">Questão {q.question_number} de {q.total_questions}</div>
        </div>
        {feedback
          ? <div className="timer">⏸️</div>
          : <GameTimer key={timerKey} seconds={q.time_limit_seconds} onExpire={() => submit(null)} />}
      </div>
      <div className="progress">
        <div className="progress-fill" style={{ width: `${(current / questions.length) * 100}%`, background: game.color }} />
      </div>

      {q.hint && <div className="word-hint"><strong>💡 Dica:</strong> {q.hint}</div>}

      <div className="word-card card pop" key={current}>
        <div className="word-chars">
          {q.masked_word.split('').map((ch, i) => {
            if (ch !== '_') return <div key={i} className="word-char">{ch}</div>
            const idx = used[k++]
            return <div key={i} className={`word-char blank ${fbClass}`}>{idx !== undefined ? q.options[idx] : '?'}</div>
          })}
        </div>
      </div>

      <div className="opt-grid">
        {q.options.map((letter, i) => (
          <button key={i} className="opt" onClick={() => pickLetter(i)} disabled={!!feedback || used.includes(i)}
            style={used.includes(i) && !feedback ? { opacity: 0.35 } : undefined}>
            {letter}
          </button>
        ))}
      </div>

      {blanks > 1 && !feedback && (
        <button className="btn-outline" onClick={() => setUsed(u => u.slice(0, -1))} disabled={used.length === 0} style={{ maxWidth: 220, margin: '0 auto' }}>
          ↩ Apagar letra
        </button>
      )}

      <div className={`feedback ${feedback ? (feedback.ok ? 'good' : 'bad') : ''}`} role="status">
        {feedback && (feedback.ok
          ? 'Correto! Muito bem 👏'
          : `${feedback.timeout ? 'O tempo acabou.' : 'Não foi dessa vez.'}${feedback.answer ? ` A resposta era ${feedback.answer}.` : ''}`)}
      </div>
    </div>
  )
}
