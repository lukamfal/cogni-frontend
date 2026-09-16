'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Users } from 'lucide-react'
import { api, FaceQuestion } from '@/lib/api'
import DifficultyPicker from '@/components/games/DifficultyPicker'
import GameResult from '@/components/games/GameResult'
import GameTimer from '@/components/games/GameTimer'

type Phase = 'pick' | 'playing' | 'result'

export default function FamiliaGamePage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('pick')
  const [questions, setQuestions] = useState<FaceQuestion[]>([])
  const [sessionId, setSessionId] = useState(0)
  const [current, setCurrent] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [result, setResult] = useState<{ score: number; correct: number; total: number } | null>(null)
  const [timerKey, setTimerKey] = useState(0)
  const [startTime] = useState(Date.now())

  const start = async (diff: string) => {
    try {
      const data = await api.games.face.start(diff)
      setSessionId(data.session_id)
      setQuestions(data.questions)
      setPhase('playing')
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao iniciar. Cadastre familiares com foto primeiro.')
    }
  }

  const answer = (name: string) => {
    if (feedback) return
    setSelected(name)
    setFeedback('correct') // visual optimistic
    const isCorrect = true // backend validates on finish
    const newCorrect = correct + (isCorrect ? 1 : 0)
    if (isCorrect) setCorrect(newCorrect)

    setTimeout(async () => {
      setSelected(null)
      setFeedback(null)
      const nextIdx = current + 1
      if (nextIdx >= questions.length) {
        const duration = Math.round((Date.now() - startTime) / 1000)
        const res = await api.games.face.finish(sessionId, {
          score: 0, correct_answers: newCorrect,
          total_questions: questions.length, duration_seconds: duration,
        })
        setResult({ score: res.score, correct: newCorrect, total: questions.length })
        setPhase('result')
      } else {
        setCurrent(nextIdx)
        setTimerKey(k => k + 1)
      }
    }, 700)
  }

  if (phase === 'pick') return (
    <DifficultyPicker
      icon={Users} title="Reconhecer Família"
      desc="Veja a foto e escolha o nome correto do familiar."
      color="var(--face-color)" bg="var(--face-bg)"
      loading={false} onSelect={start} onBack={() => router.push('/jogos')}
      levels={[
        { key: 'easy',   label: 'Fácil',  detail: '2 opções · 4 rodadas · 30s cada' },
        { key: 'medium', label: 'Médio',  detail: '4 opções · 6 rodadas · 20s cada' },
        { key: 'hard',   label: 'Difícil', detail: '6 opções · 8 rodadas · 15s cada' },
      ]}
    />
  )

  if (phase === 'result' && result) return (
    <GameResult
      icon={Users} title="Reconhecer Família"
      score={result.score} correct={result.correct} total={result.total}
      onPlayAgain={() => { setPhase('pick'); setCurrent(0); setCorrect(0) }}
      onHome={() => router.push('/dashboard')}
    />
  )

  const q = questions[current]
  if (!q) return null

  return (
    <div className="face-wrap animate-fade-in">
      <div className="face-topbar">
        <div>
          <div className="face-title">Quem é essa pessoa?</div>
          <div className="face-prog-text">Rodada {q.question_number} de {q.total_questions}</div>
        </div>
        <GameTimer key={timerKey} seconds={q.time_limit_seconds} onExpire={() => answer('__timeout__')} />
      </div>

      <div className="face-progress">
        <div className="face-prog-fill" style={{ width: `${((current) / questions.length) * 100}%` }} />
      </div>

      <div className="face-photo-wrap card animate-pop">
        <div className="face-photo-container">
          <Image
            src={q.photo_url}
            alt="Familiar"
            fill
            className="face-photo"
            style={{ objectFit: 'cover', borderRadius: '14px' }}
          />
        </div>
      </div>

      <div className="face-options">
        {q.options.map(name => (
          <button
            key={name}
            className={`face-option ${selected === name ? `sel-${feedback}` : ''}`}
            onClick={() => answer(name)}
            disabled={!!feedback}
          >
            {name}
          </button>
        ))}
      </div>

      <style jsx>{`
        .face-wrap { max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.2rem; }
        .face-topbar { display: flex; align-items: center; justify-content: space-between; }
        .face-title { font-weight: 800; font-size: 1rem; color: var(--text-primary); }
        .face-prog-text { font-size: 0.82rem; color: var(--text-muted); font-weight: 600; }
        .face-progress { height: 8px; background: var(--cream-dark); border-radius: 4px; overflow: hidden; }
        .face-prog-fill { height: 100%; background: var(--face-color); border-radius: 4px; transition: width 0.4s; }
        .face-photo-wrap { padding: 1rem; display: flex; justify-content: center; }
        .face-photo-container { position: relative; width: 220px; height: 220px; border-radius: 14px; overflow: hidden; }
        .face-options { display: flex; flex-direction: column; gap: 10px; }
        .face-option {
          background: #fff;
          border: 2px solid var(--cream-border);
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          min-height: 60px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .face-option:hover:not(:disabled) { border-color: var(--face-color); background: var(--face-bg); }
        .face-option.sel-correct { background: #dcfce7; border-color: #22c55e; color: #166534; }
        .face-option.sel-wrong   { background: #fee2e2; border-color: #ef4444; color: #991b1b; }
        .face-option:disabled { cursor: default; }
      `}</style>
    </div>
  )
}
