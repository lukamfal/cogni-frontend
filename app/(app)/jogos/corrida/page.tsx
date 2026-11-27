'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, RaceConfig } from '@/lib/api'
import { GAMES, toast } from '@/lib/games'
import DifficultyPicker from '@/components/games/DifficultyPicker'
import GameResult from '@/components/games/GameResult'

type Phase = 'pick' | 'playing' | 'result'
type Light = 'off' | 'red' | 'yellow' | 'green'
type Stage = 'waiting' | 'falseStart' | 'racing' | 'roundEnd'

const game = GAMES.race
const RED_MS = 1200
const DRIVE_MS = 1400            // every car takes the same time to cross, so whoever starts first wins
const NO_REACTION_MS = 3000      // after the green, how long we wait for a tap
const OPPONENTS = [
  { name: 'azul', color: '#3a6fc0' },
  { name: 'laranja', color: '#d9822b' },
  { name: 'roxo', color: '#7d5bc4' },
]

const rand = (a: number, b: number) => a + Math.random() * (b - a)
const secs = (ms: number) => `${(ms / 1000).toFixed(2).replace('.', ',')}s`

function Car({ color, label }: { color: string; label?: string }) {
  return (
    <svg viewBox="0 0 72 36" className="car-svg" role="img" aria-label={label ?? 'Carro'}>
      <path d="M6 24 Q6 16 14 15 L24 14 L32 6 Q34 4 38 4 L50 4 Q54 4 56 8 L60 15 L66 17 Q70 18 70 23 L70 26 Q70 28 68 28 L8 28 Q6 28 6 26 Z" fill={color} />
      <path d="M34 8 L39 8 L39 14 L28 14 Z" fill="#dff1ff" opacity=".9" />
      <path d="M42 8 L51 8 Q53 8 54 10 L56 14 L42 14 Z" fill="#dff1ff" opacity=".9" />
      <rect x="62" y="19" width="6" height="3" rx="1.5" fill="#ffe9a3" />
      <circle cx="20" cy="28" r="6" fill="#222" /><circle cx="20" cy="28" r="2.6" fill="#bbb" />
      <circle cx="56" cy="28" r="6" fill="#222" /><circle cx="56" cy="28" r="2.6" fill="#bbb" />
    </svg>
  )
}

function TrafficLight({ light }: { light: Light }) {
  const name = { off: 'apagado', red: 'vermelho', yellow: 'amarelo', green: 'verde' }[light]
  return (
    <div className="semaforo" role="img" aria-label={`Semáforo ${name}`}>
      <span className={`luz red ${light === 'red' ? 'on' : ''}`} />
      <span className={`luz yellow ${light === 'yellow' ? 'on' : ''}`} />
      <span className={`luz green ${light === 'green' ? 'on' : ''}`} />
    </div>
  )
}

export default function CorridaPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('pick')
  const [difficulty, setDifficulty] = useState('')
  const [cfg, setCfg] = useState<RaceConfig | null>(null)
  const [loading, setLoading] = useState(false)
  const [round, setRound] = useState(0)
  const [light, setLight] = useState<Light>('off')
  const [stage, setStage] = useState<Stage>('waiting')
  const [playerGo, setPlayerGo] = useState(false)
  const [cpuGo, setCpuGo] = useState<boolean[]>([])
  const [message, setMessage] = useState('')
  const [wins, setWins] = useState(0)
  const [result, setResult] = useState<{ score: number; correct: number; total: number } | null>(null)

  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const greenAt = useRef(0)
  const cpuTimes = useRef<number[]>([])
  const noReaction = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const reactions = useRef<number[]>([])
  const winsRef = useRef(0)
  const stageRef = useRef<Stage>('waiting')
  const lightRef = useRef<Light>('off')
  const startTime = useRef(0)

  const later = (fn: () => void, ms: number) => { const t = setTimeout(fn, ms); timers.current.push(t); return t }
  const clearAll = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  const setStageBoth = (s: Stage) => { stageRef.current = s; setStage(s) }
  const setLightBoth = (l: Light) => { lightRef.current = l; setLight(l) }

  useEffect(() => clearAll, [])

  // Plain function declarations: startRound and resolve call each other through timers.
  async function finishGame(config: RaceConfig) {
    const valid = reactions.current
    const avg = valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 3000
    try {
      const res = await api.games.race.finish(config.session_id, {
        score: 0, correct_answers: winsRef.current, total_questions: config.rounds,
        duration_seconds: Math.round((Date.now() - startTime.current) / 1000),
        metadata: { avg_reaction_ms: Math.round(avg) },
      })
      setResult({ score: res.score, correct: res.correct_answers, total: res.total_questions })
    } catch {
      setResult({ score: 0, correct: winsRef.current, total: config.rounds })
      toast('Não foi possível salvar a corrida.')
    }
    setPhase('result')
  }

  function startRound(config: RaceConfig, n: number) {
    clearAll()
    setRound(n)
    setPlayerGo(false)
    setCpuGo(Array(config.opponents).fill(false))
    setMessage('Prepare-se...')
    setStageBoth('waiting')
    setLightBoth('red')
    const yellowFor = rand(1000, 2500) // random, so nobody can guess when the green comes
    later(() => { setLightBoth('yellow'); setMessage('Atenção...') }, RED_MS)
    later(() => {
      setLightBoth('green')
      setMessage('JÁ! Toque agora!')
      greenAt.current = performance.now()
      cpuTimes.current = Array.from({ length: config.opponents }, () => rand(config.cpu_min_ms, config.cpu_max_ms))
      cpuTimes.current.forEach((t, i) => later(() => setCpuGo(g => g.map((v, k) => (k === i ? true : v))), t))
      noReaction.current = later(() => resolve(config, n, null), NO_REACTION_MS)
    }, RED_MS + yellowFor)
  }

  function resolve(config: RaceConfig, n: number, reaction: number | null) {
    if (stageRef.current !== 'waiting') return
    clearTimeout(noReaction.current)
    setStageBoth('racing')
    if (reaction !== null) { setPlayerGo(true); reactions.current.push(reaction) }
    const fastest = Math.min(...cpuTimes.current)
    const won = reaction !== null && reaction < fastest
    if (won) { winsRef.current++; setWins(winsRef.current) }
    const winner = OPPONENTS[cpuTimes.current.indexOf(fastest)]
    const done = Math.max(fastest, reaction ?? 0) + DRIVE_MS
    later(() => {
      setStageBoth('roundEnd')
      setMessage(
        reaction === null ? 'O tempo passou. Na próxima, toque quando ficar verde!'
          : won ? `🏁 Você venceu! Reação de ${secs(reaction)}.`
            : `O carro ${winner.name} chegou primeiro (${secs(fastest)}). Você: ${secs(reaction)}.`,
      )
    }, done)
    later(() => {
      if (n + 1 < config.rounds) startRound(config, n + 1)
      else finishGame(config)
    }, done + 2200)
  }

  const tap = () => {
    if (!cfg || phase !== 'playing' || stageRef.current !== 'waiting') return
    if (lightRef.current !== 'green') {
      // Jumped the start: no penalty, the start is repeated.
      clearAll()
      setStageBoth('falseStart')
      setLightBoth('off')
      setMessage('Calma! Espere o sinal ficar verde. Vamos de novo.')
      later(() => startRound(cfg, round), 1800)
      return
    }
    resolve(cfg, round, performance.now() - greenAt.current)
  }

  // Space or Enter also count as a tap.
  useEffect(() => {
    if (phase !== 'playing') return
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); tap() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const start = async (diff: string) => {
    setLoading(true)
    try {
      const c = await api.games.race.start(diff)
      setDifficulty(diff)
      setCfg(c)
      // Reset what the previous race left on screen.
      reactions.current = []
      winsRef.current = 0
      setWins(0)
      setRound(0)
      setMessage('')
      setLightBoth('off')
      setPlayerGo(false)
      setCpuGo(Array(c.opponents).fill(false))
      startTime.current = Date.now()
      setPhase('playing')
      later(() => startRound(c, 0), 600)
    } catch {
      toast('Erro ao iniciar o jogo. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (phase === 'pick') return (
    <DifficultyPicker
      game={game}
      desc="Espere o sinal verde e toque o mais rápido que puder."
      loading={loading} onSelect={start} onBack={() => router.push('/jogos')}
      levels={[
        { key: 'easy', label: 'Fácil', detail: '3 corridas · 1 carro adversário' },
        { key: 'medium', label: 'Médio', detail: '4 corridas · 2 carros mais rápidos' },
        { key: 'hard', label: 'Difícil', detail: '5 corridas · 3 carros bem rápidos' },
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

  return (
    <div className="play fade-up">
      <div className="topbar">
        <div>
          <div className="tb-title">🏎️ Corrida</div>
          <div className="tb-sub">Corrida {round + 1} de {cfg.rounds} · Vitórias: {wins}</div>
        </div>
        <TrafficLight light={light} />
      </div>

      <div className="pista" onPointerDown={tap}>
        {[{ color: 'var(--primary)', label: 'Você', go: playerGo, you: true },
          ...cpuGo.map((go, i) => ({ color: OPPONENTS[i].color, label: `Carro ${OPPONENTS[i].name}`, go, you: false }))]
          .map((car, i) => (
            <div key={i} className={`faixa ${car.you ? 'sua' : ''}`}>
              <span className="faixa-nome">{car.you ? 'Você' : ''}</span>
              <div className={`carro ${car.go ? 'go' : ''}`} style={{ transitionDuration: `${DRIVE_MS}ms` }}>
                <Car color={car.color} label={car.label} />
              </div>
            </div>
          ))}
        <div className="chegada" aria-hidden="true" />
      </div>

      <div className={`race-msg ${stage === 'falseStart' ? 'bad' : light === 'green' && stage === 'waiting' ? 'go' : ''}`} role="status">{message}</div>

      <button
        className={`race-tap ${light === 'green' && stage === 'waiting' ? 'green' : ''}`}
        onPointerDown={e => { e.preventDefault(); tap() }}
        disabled={stage !== 'waiting'}
      >
        {light === 'green' && stage === 'waiting' ? 'TOQUE!' : 'Toque aqui quando ficar verde'}
      </button>
    </div>
  )
}
