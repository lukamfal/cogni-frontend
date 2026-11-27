'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, MemoryConfig } from '@/lib/api'
import { GAMES, toast } from '@/lib/games'
import DifficultyPicker from '@/components/games/DifficultyPicker'
import GameResult from '@/components/games/GameResult'
import MemoryBoard from '@/components/games/MemoryBoard'

type Phase = 'pick' | 'playing' | 'result'
const game = GAMES.memory

export default function MemoriaPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('pick')
  const [difficulty, setDifficulty] = useState('')
  const [config, setConfig] = useState<MemoryConfig | null>(null)
  const [result, setResult] = useState<{ score: number; correct: number; total: number } | null>(null)
  const [loading, setLoading] = useState(false)

  const start = async (diff: string) => {
    setLoading(true)
    try {
      const cfg = await api.games.memory.start(diff)
      setDifficulty(diff)
      setConfig(cfg)
      setPhase('playing')
    } catch {
      toast('Erro ao iniciar o jogo. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const finish = async (correct: number, duration: number) => {
    if (!config) return
    const total = config.pairs
    const res = await api.games.memory.finish(config.session_id, {
      score: 0, correct_answers: correct, total_questions: total, duration_seconds: duration,
    })
    setResult({ score: res.score, correct, total })
    setPhase('result')
  }

  if (phase === 'pick') return (
    <DifficultyPicker
      game={game}
      desc="Encontre todos os pares de figuras iguais antes do tempo acabar."
      loading={loading} onSelect={start} onBack={() => router.push('/jogos')}
      levels={[
        { key: 'easy', label: 'Fácil', detail: '4 pares · 2 minutos' },
        { key: 'medium', label: 'Médio', detail: '6 pares · 90 segundos' },
        { key: 'hard', label: 'Difícil', detail: '8 pares · 60 segundos' },
      ]}
    />
  )

  if (phase === 'playing' && config) return <MemoryBoard config={config} onFinish={finish} />

  if (phase === 'result' && result) return (
    <GameResult
      game={game} difficulty={difficulty}
      score={result.score} correct={result.correct} total={result.total}
      onPlayAgain={() => setPhase('pick')}
      onHome={() => router.push('/dashboard')}
    />
  )

  return null
}
