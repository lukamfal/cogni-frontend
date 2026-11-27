'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { api, MathQuestion } from '@/lib/api'
import { GAMES, Feedback, feedbackText, optClass, solveExpression, toast } from '@/lib/games'
import DifficultyPicker from '@/components/games/DifficultyPicker'
import GameResult from '@/components/games/GameResult'
import GameTimer from '@/components/games/GameTimer'

type Phase = 'pick' | 'playing' | 'result'
const game = GAMES.math

export default function MatematicaPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('pick')
  const [difficulty, setDifficulty] = useState('')
  const [question, setQuestion] = useState<MathQuestion | null>(null)
  const [sessionId, setSessionId] = useState(0)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [result, setResult] = useState<{ score: number; correct: number; total: number } | null>(null)
  const [timerKey, setTimerKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const correct = useRef(0)
  const answered = useRef(0)
  const startTime = useRef(0)
  const responseTimes = useRef<number[]>([])
  const questionStart = useRef(0)

  const start = async (diff: string) => {
    setLoading(true)
    try {
      const q = await api.games.math.start(diff)
      setDifficulty(diff)
      setSessionId(q.session_id)
      setQuestion(q)
      correct.current = 0
      answered.current = 0
      responseTimes.current = []
      setPhase('playing')
      startTime.current = Date.now()
      questionStart.current = Date.now()
      setTimerKey(k => k + 1)
    } catch {
      toast('Erro ao iniciar o jogo. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // pick is null when the timer runs out.
  const answer = (pick: number | null) => {
    if (feedback || !question) return
    // Runs from a click or the timer, never during render.
    // eslint-disable-next-line react-hooks/purity
    responseTimes.current.push((Date.now() - questionStart.current) / 1000)
    const right = solveExpression(question.expression)
    const ok = pick !== null && pick === right
    if (ok) correct.current++
    answered.current++
    setFeedback({ ok, pick: pick === null ? null : String(pick), ans: String(right ?? '?') })

    setTimeout(async () => {
      try {
        if (answered.current >= question.total_questions) {
          await finishGame()
        } else {
          const next = await api.games.math.question(sessionId, answered.current + 1)
          setQuestion(next)
          questionStart.current = Date.now()
          setTimerKey(k => k + 1)
        }
      } catch {
        toast('Erro de conexão. Tente novamente.')
      } finally {
        setFeedback(null)
      }
    }, ok ? 800 : 1600)
  }

  const finishGame = async () => {
    const total = answered.current
    const duration = Math.round((Date.now() - startTime.current) / 1000)
    const avg = responseTimes.current.reduce((a, b) => a + b, 0) / (responseTimes.current.length || 1)
    const res = await api.games.math.finish(sessionId, {
      score: 0, correct_answers: correct.current, total_questions: total,
      duration_seconds: duration, metadata: { avg_response_time: avg },
    })
    setResult({ score: res.score, correct: correct.current, total })
    setPhase('result')
  }

  if (phase === 'pick') return (
    <DifficultyPicker
      game={game}
      desc="Responda às contas antes do tempo acabar."
      loading={loading} onSelect={start} onBack={() => router.push('/jogos')}
      levels={[
        { key: 'easy', label: 'Fácil', detail: '5 questões · +/- até 10 · 20s cada' },
        { key: 'medium', label: 'Médio', detail: '8 questões · +/-/× · 15s cada' },
        { key: 'hard', label: 'Difícil', detail: '10 questões · todas as operações · 10s cada' },
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

  if (!question) return null

  return (
    <div className="play fade-up">
      <div className="topbar">
        <div>
          <div className="tb-title">🔢 Matemática</div>
          <div className="tb-sub">Questão {question.question_number} de {question.total_questions}</div>
        </div>
        {feedback
          ? <div className="timer">⏸️</div>
          : <GameTimer key={timerKey} seconds={question.time_limit_seconds} onExpire={() => answer(null)} />}
      </div>
      <div className="progress">
        <div className="progress-fill" style={{ width: `${((question.question_number - 1) / question.total_questions) * 100}%`, background: game.color }} />
      </div>

      <div className="math-card card pop" key={question.question_number}>
        <div className="math-expr">{question.expression}</div>
        <div className="math-eq">= ?</div>
      </div>

      <div className="opt-grid">
        {question.options.map(opt => (
          <button key={opt} className={`opt ${optClass(feedback, String(opt))}`} onClick={() => answer(opt)} disabled={!!feedback}>
            {opt}
          </button>
        ))}
      </div>

      <div className={`feedback ${feedback ? (feedback.ok ? 'good' : 'bad') : ''}`} role="status">
        {feedback && feedbackText(feedback)}
      </div>
    </div>
  )
}
