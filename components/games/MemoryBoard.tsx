'use client'

import { useState, useEffect, useRef } from 'react'
import { MemoryConfig } from '@/lib/api'
import GameTimer from './GameTimer'

interface Props {
  config: MemoryConfig
  onFinish: (correct: number, duration: number) => void
}

interface Card { id: number; value: string; flipped: boolean; matched: boolean }

export default function MemoryBoard({ config, onFinish }: Props) {
  const [cards, setCards] = useState<Card[]>(() =>
    config.items.map((v, i) => ({ id: i, value: v, flipped: false, matched: false }))
  )
  const [selected, setSelected] = useState<number[]>([])
  const startTime = useRef(0)
  const finished = useRef(false)
  const pending = useRef<ReturnType<typeof setTimeout>[]>([])
  const matched = cards.filter(c => c.matched).length / 2

  useEffect(() => {
    startTime.current = Date.now()
    const timers = pending.current
    return () => timers.forEach(clearTimeout)
  }, [])

  const finish = (m: number) => {
    if (finished.current) return
    finished.current = true
    // Runs from a click or the timer, never during render.
    // eslint-disable-next-line react-hooks/purity
    onFinish(m, Math.round((Date.now() - startTime.current) / 1000))
  }

  const flip = (idx: number) => {
    if (finished.current || selected.length >= 2 || cards[idx].flipped || cards[idx].matched) return
    const next = cards.map(c => (c.id === idx ? { ...c, flipped: true } : c))
    const picked = [...selected, idx]
    if (picked.length < 2) { setCards(next); setSelected(picked); return }

    const [a, b] = picked
    if (next[a].value === next[b].value) {
      setCards(next.map(c => (c.id === a || c.id === b ? { ...c, matched: true } : c)))
      setSelected([])
      if (matched + 1 === config.pairs) pending.current.push(setTimeout(() => finish(matched + 1), 600))
      return
    }
    // Not a pair: show both for a moment, then turn them back.
    setCards(next)
    setSelected(picked)
    pending.current.push(setTimeout(() => {
      setCards(prev => prev.map(c => (c.id === a || c.id === b ? { ...c, flipped: false } : c)))
      setSelected([])
    }, 900))
  }

  return (
    <div className="play fade-up">
      <div className="topbar">
        <div>
          <div className="tb-title">🃏 Jogo da Memória</div>
          <div className="tb-sub">Pares encontrados: {matched}/{config.pairs}</div>
        </div>
        <GameTimer seconds={config.time_limit_seconds} onExpire={() => finish(matched)} />
      </div>
      <div className="progress">
        <div className="progress-fill" style={{ width: `${(matched / config.pairs) * 100}%`, background: 'var(--memory-color)' }} />
      </div>

      <div className="mb-grid">
        {cards.map(card => {
          const up = card.flipped || card.matched
          return (
            <button
              key={card.id}
              className={`mb-card ${up ? 'flipped' : ''} ${card.matched ? 'matched' : ''}`}
              onClick={() => flip(card.id)}
              aria-label={up ? card.value : 'Carta virada'}
            >
              <div className="mb-inner">
                <div className="mb-face mb-front">?</div>
                <div className="mb-face mb-back">{card.value}</div>
              </div>
            </button>
          )
        })}
      </div>

      <p className="hint-text">Toque nas cartas para virar e encontre os pares iguais</p>
    </div>
  )
}
