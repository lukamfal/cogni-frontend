'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { GameMeta } from '@/lib/games'

interface Level { key: string; label: string; detail: string }

interface Props {
  game: GameMeta
  desc: string
  loading: boolean
  levels: Level[]
  onSelect: (key: string) => void
  onBack: () => void
  hint?: string
}

export default function DifficultyPicker({ game, desc, loading, levels, onSelect, onBack, hint }: Props) {
  const [suggested, setSuggested] = useState<string | null>(null)

  useEffect(() => {
    api.games.suggestDifficulty(game.id).then(r => setSuggested(r.suggested_difficulty)).catch(() => {})
  }, [game.id])

  return (
    <div className="stack fade-up" style={{ gap: '1.4rem', maxWidth: 620, margin: '0 auto' }}>
      <button className="back" onClick={onBack}>← Voltar</button>

      <div className="dp-header" style={{ background: game.bg, borderColor: game.color }}>
        <div className="dp-icon">{game.icon}</div>
        <h1 className="dp-title">{game.name}</h1>
        <p className="dp-desc">{desc}</p>
      </div>

      <section className="howto card" aria-labelledby="howto-title">
        <h2 id="howto-title" className="howto-title">Como jogar</h2>
        <ol className="howto-list">
          {game.howTo.map((step, i) => (
            <li key={i}><span className="howto-n" style={{ background: game.bg, color: game.color }}>{i + 1}</span>{step}</li>
          ))}
        </ol>
      </section>

      <h2 style={{ fontSize: '1.5rem' }}>Escolha a dificuldade</h2>

      <div className="dp-levels">
        {levels.map((lvl, i) => (
          <button
            key={lvl.key}
            className="dp-level fade-up"
            onClick={() => onSelect(lvl.key)}
            disabled={loading}
            style={{ animationDelay: `${i * 0.07}s`, '--lc': game.color } as React.CSSProperties}
          >
            <div className="dp-left">
              <span className="dp-badge" style={{ background: game.bg, color: game.color }}>{lvl.label}</span>
              <span className="dp-detail">{lvl.detail}</span>
              {lvl.key === suggested && <span className="dp-suggest">Sugerido para você</span>}
            </div>
            <span style={{ color: game.color, fontSize: '1.1rem' }}>→</span>
          </button>
        ))}
      </div>

      {loading && <p className="hint-text" role="status">Preparando o jogo... ⏳</p>}
      {hint && !loading && <p className="hint-text">{hint}</p>}
    </div>
  )
}
