'use client'

import { useEffect, useRef, useState } from 'react'

interface Card { v: string; flipped: boolean; matched: boolean }

const shuffle = <T,>(a: T[]) => {
  const b = a.slice()
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] }
  return b
}
const ITEMS = ['🌻', '🍎', '🐱']
const fresh = (random: boolean): Card[] => {
  const deck = [...ITEMS, ...ITEMS]
  return (random ? shuffle(deck) : deck).map(v => ({ v, flipped: false, matched: false }))
}

/** The small "experimente agora" memory game on the landing page. */
export default function MiniMemory() {
  // Fixed order on the server, shuffled after mount, so hydration matches.
  const [cards, setCards] = useState<Card[]>(() => fresh(false))
  const [sel, setSel] = useState<number[]>([])
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCards(fresh(true))
    return () => clearTimeout(timer.current)
  }, [])

  const found = cards.filter(c => c.matched).length / 2
  const done = found === ITEMS.length

  const flip = (i: number) => {
    const c = cards[i]
    if (sel.length === 2 || c.flipped || c.matched) return
    const next = cards.map((x, k) => (k === i ? { ...x, flipped: true } : x))
    const picked = [...sel, i]
    if (picked.length === 2) {
      const [a, b] = picked
      if (next[a].v === next[b].v) {
        setCards(next.map((x, k) => (k === a || k === b ? { ...x, matched: true } : x)))
        setSel([])
        return
      }
      setCards(next)
      setSel(picked)
      timer.current = setTimeout(() => {
        setCards(cur => cur.map((x, k) => (k === a || k === b ? { ...x, flipped: false } : x)))
        setSel([])
      }, 800)
      return
    }
    setCards(next)
    setSel(picked)
  }

  return (
    <div className="try card fade-up" style={{ animationDelay: '.2s' }}>
      <span className="try-float">Experimente agora</span>
      <div className="try-head">
        <div><div className="try-title">🃏 Jogo da Memória</div><div className="try-sub">Encontre os 3 pares</div></div>
        <div className="try-sub">{found}/3</div>
      </div>
      <div className="try-grid mb-grid" style={{ gridTemplateColumns: 'repeat(3,minmax(0,1fr))' }}>
        {cards.map((c, i) => (
          <button
            key={i}
            className={`mb-card ${c.flipped || c.matched ? 'flipped' : ''} ${c.matched ? 'matched' : ''}`}
            onClick={() => flip(i)}
            aria-label={c.flipped || c.matched ? c.v : 'Carta virada'}
          >
            <div className="mb-inner"><div className="mb-face mb-front">?</div><div className="mb-face mb-back">{c.v}</div></div>
          </button>
        ))}
      </div>
      <div className="try-done" role="status">{done ? '🎉 Muito bem! Esse é um exercício do CogniMente.' : ''}</div>
      {done && <button className="try-reset" onClick={() => { setCards(fresh(true)); setSel([]) }}>Jogar de novo</button>}
    </div>
  )
}
