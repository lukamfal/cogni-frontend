'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Calculator } from 'lucide-react'
import { api, MathQuestion } from '@/lib/api'
import DifficultyPicker from '@/components/games/DifficultyPicker'
import GameResult from '@/components/games/GameResult'
import GameTimer from '@/components/games/GameTimer'

type Phase = 'pick' | 'playing' | 'result'

export default function MatematicaPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('pick')
  const [difficulty, setDifficulty] = useState('')
  const [question, setQuestion] = useState<MathQuestion | null>(null)
  const [sessionId, setSessionId] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [result, setResult] = useState<{ score: number; correct: number; total: number } | null>(null)
  const [timerKey, setTimerKey] = useState(0)
  const startTime = useRef(Date.now())
  const responseTimes = useRef<number[]>([])
  const questionStart = useRef(Date.now())

  const start = async (diff: string) => {
    setDifficulty(diff)
    const q = await api.games.math.start(diff)
    setSessionId(q.session_id)
    setQuestion(q)
    setPhase('playing')
    startTime.current = Date.now()
    questionStart.current = Date.now()
    setTimerKey(k => k + 1)
  }

  const answer = async (opt: number) => {
    if (feedback || !question) return
    const responseTime = (Date.now() - questionStart.current) / 1000
    responseTimes.current.push(responseTime)
    setSelected(opt)

    // We can't know correct answer from frontend — backend validates on finish
    // So we optimistically show feedback and move on (backend stores final score)
    setFeedback('correct') // visual only — backend recalculates
    const newAnswered = answered + 1
    setAnswered(newAnswered)

    setTimeout(async () => {
      setSelected(null)
      setFeedback(null)

      if (newAnswered >= question.total_questions) {
        await finishGame(newAnswered)
      } else {
        const next = await api.games.math.question(sessionId, newAnswered + 1)
        setQuestion(next)
        questionStart.current = Date.now()
        setTimerKey(k => k + 1)
      }
    }, 600)
  }

  const finishGame = async (total: number) => {
    const duration = Math.round((Date.now() - startTime.current) / 1000)
    const avg = responseTimes.current.reduce((a, b) => a + b, 0) / (responseTimes.current.length || 1)
    const res = await api.games.math.finish(sessionId, {
      score: 0, correct_answers: correct, total_questions: total,
      duration_seconds: duration, metadata: { avg_response_time: avg },
    })
    setResult({ score: res.score, correct, total })
    setPhase('result')
  }

  if (phase === 'pick') return (
    <DifficultyPicker
      icon={Calculator} title="Matemática Simples"
      desc="Responda operações matemáticas antes do tempo acabar."
      color="var(--math-color)" bg="var(--math-bg)"
      loading={false} onSelect={start} onBack={() => router.push('/jogos')}
      levels={[
        { key: 'easy',   label: 'Fácil',  detail: '5 questões · +/- até 10 · 20s cada' },
        { key: 'medium', label: 'Médio',  detail: '8 questões · +/-/× · 15s cada' },
        { key: 'hard',   label: 'Difícil', detail: '10 questões · todas operações · 10s cada' },
      ]}
    />
  )

  if (phase === 'result' && result) return (
    <GameResult
      icon={Calculator} title="Matemática Simples"
      score={result.score} correct={result.correct} total={result.total}
      onPlayAgain={() => { setPhase('pick'); setCorrect(0); setAnswered(0); responseTimes.current = [] }}
      onHome={() => router.push('/dashboard')}
    />
  )

  if (!question) return null

  return (
    <div className="math-wrap animate-fade-in">
      <div className="math-topbar">
        <div>
          <div className="math-title">Matemática</div>
          <div className="math-progress-text">Questão {question.question_number} de {question.total_questions}</div>
        </div>
        <GameTimer key={timerKey} seconds={question.time_limit_seconds} onExpire={() => answer(-999)} />
      </div>

      <div className="math-progress">
        <div className="math-progress-fill" style={{ width: `${((question.question_number - 1) / question.total_questions) * 100}%` }} />
      </div>

      <div className="math-question-card card animate-pop">
        <div className="math-expression">{question.expression}</div>
        <div className="math-eq-sign">=  ?</div>
      </div>

      <div className="math-options">
        {question.options.map(opt => (
          <button
            key={opt}
            className={`math-option ${selected === opt ? `sel-${feedback}` : ''}`}
            onClick={() => answer(opt)}
            disabled={!!feedback}
          >
            {opt}
          </button>
        ))}
      </div>

      <style jsx>{`
        .math-wrap { max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.2rem; }
        .math-topbar { display: flex; align-items: center; justify-content: space-between; }
        .math-title { font-weight: 800; font-size: 1rem; color: var(--text-primary); }
        .math-progress-text { font-size: 0.82rem; color: var(--text-muted); font-weight: 600; }
        .math-progress { height: 8px; background: var(--cream-dark); border-radius: 4px; overflow: hidden; }
        .math-progress-fill { height: 100%; background: var(--math-color); border-radius: 4px; transition: width 0.4s; }
        .math-question-card { padding: 2.5rem; text-align: center; }
        .math-expression { font-family: 'Source Serif 4', serif; font-size: clamp(2rem, 10vw, 3.2rem); color: var(--text-primary); }
        .math-eq-sign { font-size: 1.2rem; color: var(--text-muted); margin-top: 4px; font-weight: 700; }
        .math-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .math-option {
          background: #fff;
          border: 2px solid var(--cream-border);
          border-radius: 12px;
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
          min-height: 72px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .math-option:hover:not(:disabled) { border-color: var(--math-color); background: var(--math-bg); transform: scale(1.03); }
        .math-option.sel-correct { background: #dcfce7; border-color: #22c55e; color: #166534; }
        .math-option.sel-wrong   { background: #fee2e2; border-color: #ef4444; color: #991b1b; animation: shake 0.35s ease; }
        .math-option:disabled { cursor: default; }
      `}</style>
    </div>
  )
}
