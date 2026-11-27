'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, TugConfig } from '@/lib/api'
import { GAMES, toast } from '@/lib/games'
import DifficultyPicker from '@/components/games/DifficultyPicker'
import GameResult from '@/components/games/GameResult'

type Phase = 'pick' | 'playing' | 'result'
type Stage = 'countdown' | 'pulling' | 'won' | 'lost'

const game = GAMES.tug

export default function CaboDeGuerraPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('pick')
  const [difficulty, setDifficulty] = useState('')
  const [cfg, setCfg] = useState<TugConfig | null>(null)
  const [loading, setLoading] = useState(false)
  const [stage, setStage] = useState<Stage>('countdown')
  const [count, setCount] = useState(3)
  const [clicks, setClicks] = useState(0)
  const [msLeft, setMsLeft] = useState(0)
  const [bump, setBump] = useState(0)
  const [result, setResult] = useState<{ score: number; correct: number; total: number } | null>(null)

  const clicksRef = useRef(0)
  const stageRef = useRef<Stage>('countdown')
  const endsAt = useRef(0)
  const startTime = useRef(0)
  const timers = useRef<ReturnType<typeof setTimeout | typeof setInterval>[]>([])

  const clearAll = () => { timers.current.forEach(t => { clearTimeout(t); clearInterval(t) }); timers.current = [] }
  useEffect(() => clearAll, [])

  const setStageBoth = (s: Stage) => { stageRef.current = s; setStage(s) }

  const finish = async (config: TugConfig, won: boolean) => {
    clearAll()
    setStageBoth(won ? 'won' : 'lost')
    timers.current.push(setTimeout(async () => {
      try {
        const res = await api.games.tug.finish(config.session_id, {
          score: 0, correct_answers: won ? 1 : 0, total_questions: 1,
          duration_seconds: Math.round((Date.now() - startTime.current) / 1000),
          metadata: { clicks: clicksRef.current },
        })
        setResult({ score: res.score, correct: res.correct_answers, total: 1 })
      } catch {
        setResult({ score: 0, correct: won ? 1 : 0, total: 1 })
        toast('Não foi possível salvar o jogo.')
      }
      setPhase('result')
    }, 1600))
  }

  const begin = (config: TugConfig) => {
    clicksRef.current = 0
    setClicks(0)
    setStageBoth('countdown')
    setCount(config.countdown_seconds)
    let n = config.countdown_seconds
    const cd = setInterval(() => {
      n -= 1
      if (n > 0) { setCount(n); return }
      clearInterval(cd)
      setStageBoth('pulling')
      endsAt.current = Date.now() + config.time_limit_seconds * 1000
      setMsLeft(config.time_limit_seconds * 1000)
      const tick = setInterval(() => {
        const left = Math.max(0, endsAt.current - Date.now())
        setMsLeft(left)
        if (left === 0 && stageRef.current === 'pulling') finish(config, false)
      }, 100)
      timers.current.push(tick)
    }, 1000)
    timers.current.push(cd)
  }

  const pull = () => {
    if (!cfg || stageRef.current !== 'pulling') return
    clicksRef.current += 1
    setClicks(clicksRef.current)
    setBump(b => b + 1)
    if (clicksRef.current >= cfg.target_clicks) finish(cfg, true)
  }

  // Space or Enter also pull; holding the key down doesn't count.
  useEffect(() => {
    if (phase !== 'playing') return
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); pull() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const start = async (diff: string) => {
    setLoading(true)
    try {
      const c = await api.games.tug.start(diff)
      setDifficulty(diff)
      setCfg(c)
      startTime.current = Date.now()
      setPhase('playing')
      begin(c)
    } catch {
      toast('Erro ao iniciar o jogo. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (phase === 'pick') return (
    <DifficultyPicker
      game={game}
      desc="Toque no botão 30 vezes antes do tempo acabar para puxar a corda."
      loading={loading} onSelect={start} onBack={() => router.push('/jogos')}
      levels={[
        { key: 'easy', label: 'Fácil', detail: '30 toques em 1 minuto' },
        { key: 'medium', label: 'Médio', detail: '30 toques em 40 segundos' },
        { key: 'hard', label: 'Difícil', detail: '30 toques em 25 segundos' },
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

  if (!cfg) return null

  const progress = clicks / cfg.target_clicks
  const timeUsed = stage === 'pulling' ? 1 - msLeft / (cfg.time_limit_seconds * 1000) : 0
  // The flag moves to your side with each pull; the opponent pulls it back a little as time goes by.
  const flag = stage === 'won' ? 14 : Math.min(86, Math.max(14, 50 - progress * 36 + timeUsed * 10))
  const secsLeft = Math.ceil(msLeft / 1000)

  return (
    <div className="play fade-up">
      <div className="topbar">
        <div>
          <div className="tb-title">🪢 Cabo de Guerra</div>
          <div className="tb-sub">{clicks} de {cfg.target_clicks} puxadas</div>
        </div>
        <div className={`timer ${stage === 'pulling' && secsLeft <= 5 ? 'urgent' : ''}`} aria-label={`Tempo restante: ${secsLeft} segundos`}>
          ⏱️ {stage === 'countdown' ? `${cfg.time_limit_seconds}s` : `${secsLeft}s`}
        </div>
      </div>
      <div className="progress"><div className="progress-fill" style={{ width: `${progress * 100}%`, background: game.color }} /></div>

      <div className="cabo card">
        <div className="cabo-lado voce"><span className="cabo-pessoa" aria-hidden="true">💪</span>Você</div>
        <div className="cabo-arena">
          <div className="cabo-marca esquerda" aria-hidden="true" />
          <div className="cabo-marca direita" aria-hidden="true" />
          <div className="corda" aria-hidden="true" />
          <div className="bandeira" style={{ left: `${flag}%` }} aria-hidden="true">🚩</div>
        </div>
        <div className="cabo-lado rival"><span className="cabo-pessoa" aria-hidden="true">🧑</span>Rival</div>
      </div>

      <div className={`race-msg ${stage === 'won' ? 'go' : stage === 'lost' ? 'bad' : ''}`} role="status">
        {stage === 'countdown' ? `Prepare-se... ${count}`
          : stage === 'pulling' ? 'Puxe! Toque no botão o mais rápido que puder.'
            : stage === 'won' ? '🎉 Você venceu o cabo de guerra!'
              : `O tempo acabou. Faltaram ${cfg.target_clicks - clicks} puxadas.`}
      </div>

      <button
        className={`puxar ${stage === 'pulling' ? 'ativo' : ''}`}
        onPointerDown={e => { e.preventDefault(); pull() }}
        disabled={stage !== 'pulling'}
      >
        {/* A new key on each pull replays the little "pop" animation without remounting the button. */}
        <span key={bump} className={bump ? 'puxar-pop' : ''}>{stage === 'countdown' ? count : 'PUXAR!'}</span>
      </button>
    </div>
  )
}
