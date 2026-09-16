'use client'

import { useState, useEffect, useCallback } from 'react'
import { HelpCircle, Grid3x3 } from 'lucide-react'
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
  const [locked, setLocked] = useState(false)
  const [matched, setMatched] = useState(0)
  const [startTime] = useState(Date.now())

  const finish = useCallback((m: number) => {
    const duration = Math.round((Date.now() - startTime) / 1000)
    onFinish(m, duration)
  }, [startTime, onFinish])

  // Check match when 2 cards selected
  useEffect(() => {
    if (selected.length !== 2) return
    setLocked(true)
    const [a, b] = selected
    const cardA = cards[a], cardB = cards[b]

    if (cardA.value === cardB.value) {
      setCards(prev => prev.map(c => c.id === a || c.id === b ? { ...c, matched: true } : c))
      const newMatched = matched + 1
      setMatched(newMatched)
      setSelected([])
      setLocked(false)
      if (newMatched === config.pairs) finish(newMatched)
    } else {
      setTimeout(() => {
        setCards(prev => prev.map(c => c.id === a || c.id === b ? { ...c, flipped: false } : c))
        setSelected([])
        setLocked(false)
      }, 900)
    }
  }, [selected])

  const flip = (idx: number) => {
    if (locked || cards[idx].flipped || cards[idx].matched || selected.length >= 2) return
    setCards(prev => prev.map(c => c.id === idx ? { ...c, flipped: true } : c))
    setSelected(prev => [...prev, idx])
  }

  const cols = config.pairs <= 4 ? 4 : config.pairs <= 6 ? 4 : 4

  return (
    <div className="mb-wrap animate-fade-in">
      <div className="mb-topbar">
        <div className="mb-info">
          <span className="mb-game-name"><Grid3x3 size={16} strokeWidth={2} /> Jogo da Memória</span>
          <span className="mb-pairs">Pares: <strong>{matched}/{config.pairs}</strong></span>
        </div>
        <GameTimer seconds={config.time_limit_seconds} onExpire={() => finish(matched)} />
      </div>

      <div className="mb-progress">
        <div className="mb-progress-fill" style={{ width: `${(matched / config.pairs) * 100}%` }} />
      </div>

      <div className="mb-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {cards.map((card) => (
          <button
            key={card.id}
            className={`mb-card ${card.flipped || card.matched ? 'flipped' : ''} ${card.matched ? 'matched' : ''}`}
            onClick={() => flip(card.id)}
            disabled={card.matched || locked}
            aria-label={card.flipped || card.matched ? card.value : 'Carta virada'}
          >
            <div className="mb-card-inner">
              <div className="mb-card-front"><HelpCircle size={22} strokeWidth={1.75} /></div>
              <div className="mb-card-back">{card.value}</div>
            </div>
          </button>
        ))}
      </div>

      <p className="mb-hint">Toque nas cartas para virar e encontre os pares iguais</p>

      <style jsx>{`
        .mb-wrap { max-width: 520px; margin: 0 auto; display: flex; flex-direction: column; gap: 1rem; }
        .mb-topbar { display: flex; align-items: center; justify-content: space-between; }
        .mb-info { display: flex; flex-direction: column; gap: 2px; }
        .mb-game-name { display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: 1rem; color: var(--text-primary); }
        .mb-pairs { font-size: 0.85rem; color: var(--text-muted); font-weight: 600; }
        .mb-progress { height: 8px; background: var(--cream-dark); border-radius: 4px; overflow: hidden; }
        .mb-progress-fill { height: 100%; background: var(--memory-color); border-radius: 4px; transition: width 0.4s ease; }
        .mb-grid { display: grid; gap: 10px; }
        .mb-card {
          aspect-ratio: 1;
          border: 2px solid var(--cream-border);
          border-radius: 12px;
          background: #fff;
          cursor: pointer;
          perspective: 600px;
          padding: 0;
          min-height: unset;
          transition: transform 0.15s;
          position: relative;
        }
        .mb-card:hover:not(:disabled) { transform: scale(1.04); border-color: var(--memory-color); }
        .mb-card:disabled { cursor: default; }
        .mb-card-inner {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.4s cubic-bezier(0.4,0,0.2,1);
          border-radius: 12px;
          min-height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mb-card.flipped .mb-card-inner { transform: rotateY(180deg); }
        .mb-card-front, .mb-card-back {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: clamp(1.2rem, 4vw, 1.8rem);
          backface-visibility: hidden;
          border-radius: 10px;
        }
        .mb-card-front { background: var(--cream-dark); color: var(--text-muted); }
        .mb-card-back { background: var(--memory-bg); color: var(--memory-color); transform: rotateY(180deg); }
        .mb-card.matched { border-color: var(--memory-color); }
        .mb-card.matched .mb-card-back { background: var(--memory-color); color: #fff; }
        .mb-hint { text-align: center; font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }
      `}</style>
    </div>
  )
}
