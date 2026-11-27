'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { api, FaceQuestion } from '@/lib/api'
import { GAMES, Feedback, feedbackText, optClass, toast } from '@/lib/games'
import DifficultyPicker from '@/components/games/DifficultyPicker'
import GameResult from '@/components/games/GameResult'
import GameTimer from '@/components/games/GameTimer'

type Phase = 'pick' | 'playing' | 'result'
const game = GAMES.face

export default function FamiliaGamePage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('pick')
  const [difficulty, setDifficulty] = useState('')
  const [questions, setQuestions] = useState<FaceQuestion[]>([])
  const [sessionId, setSessionId] = useState(0)
  const [current, setCurrent] = useState(0)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [result, setResult] = useState<{ score: number; correct: number; total: number } | null>(null)
  const [timerKey, setTimerKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const startTime = useRef(0)
  const correct = useRef(0)
  // The backend leaves the right name out of each round, so it is looked up from the photo.
  const nameByPhoto = useRef(new Map<string, string>())

  const start = async (diff: string) => {
    setLoading(true)
    try {
      const [data, family] = await Promise.all([api.games.face.start(diff), api.family.list()])
      nameByPhoto.current = new Map(family.flatMap(m => (m.photo_url ? [[m.photo_url, m.name] as const] : [])))
      setDifficulty(diff)
      setSessionId(data.session_id)
      setQuestions(data.questions)
      setCurrent(0)
      correct.current = 0
      setPhase('playing')
      startTime.current = Date.now()
      setTimerKey(k => k + 1)
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Erro ao iniciar. Cadastre familiares com foto primeiro.')
    } finally {
      setLoading(false)
    }
  }

  // pick is null when the timer runs out.
  const answer = (pick: string | null) => {
    const q = questions[current]
    if (feedback || !q) return
    const right = nameByPhoto.current.get(q.photo_url) ?? ''
    const ok = pick !== null && pick === right
    if (ok) correct.current++
    setFeedback({ ok, pick, ans: right })

    setTimeout(async () => {
      const nextIdx = current + 1
      try {
        if (nextIdx >= questions.length) {
          const duration = Math.round((Date.now() - startTime.current) / 1000)
          const res = await api.games.face.finish(sessionId, {
            score: 0, correct_answers: correct.current,
            total_questions: questions.length, duration_seconds: duration,
          })
          setResult({ score: res.score, correct: correct.current, total: questions.length })
          setPhase('result')
        } else {
          setCurrent(nextIdx)
          setTimerKey(k => k + 1)
        }
      } catch {
        toast('Erro de conexão. Tente novamente.')
      } finally {
        setFeedback(null)
      }
    }, ok ? 900 : 1700)
  }

  if (phase === 'pick') return (
    <DifficultyPicker
      game={game}
      desc="Veja a foto e escolha o nome correto do familiar."
      loading={loading} onSelect={start} onBack={() => router.push('/jogos')}
      hint="Usa os familiares cadastrados na página Família."
      levels={[
        { key: 'easy', label: 'Fácil', detail: '2 opções · 4 rodadas · 30s cada' },
        { key: 'medium', label: 'Médio', detail: '4 opções · 6 rodadas · 20s cada' },
        { key: 'hard', label: 'Difícil', detail: '6 opções · 8 rodadas · 15s cada' },
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

  const q = questions[current]
  if (!q) return null

  return (
    <div className="play fade-up">
      <div className="topbar">
        <div>
          <div className="tb-title">👨‍👩‍👧 Quem é essa pessoa?</div>
          <div className="tb-sub">Rodada {q.question_number} de {q.total_questions}</div>
        </div>
        {feedback
          ? <div className="timer">⏸️</div>
          : <GameTimer key={timerKey} seconds={q.time_limit_seconds} onExpire={() => answer(null)} />}
      </div>
      <div className="progress">
        <div className="progress-fill" style={{ width: `${(current / questions.length) * 100}%`, background: game.color }} />
      </div>

      <div className="card pop" style={{ padding: '1.2rem' }} key={current}>
        <div className="face-photo" style={{ background: game.bg }}>
          <Image src={q.photo_url} alt="Foto de um familiar" fill sizes="260px" style={{ objectFit: 'cover' }} unoptimized />
        </div>
      </div>

      <div className="opt-grid">
        {q.options.map(name => (
          <button key={name} className={`opt name ${optClass(feedback, name)}`} onClick={() => answer(name)} disabled={!!feedback}>
            {name}
          </button>
        ))}
      </div>

      <div className={`feedback ${feedback ? (feedback.ok ? 'good' : 'bad') : ''}`} role="status">
        {feedback && feedbackText(feedback)}
      </div>
    </div>
  )
}
