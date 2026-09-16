'use client'

import type { LucideIcon } from 'lucide-react'

interface Level { key: string; label: string; detail: string }

interface Props {
  icon: LucideIcon
  title: string
  desc: string
  color: string
  bg: string
  loading: boolean
  levels: Level[]
  onSelect: (key: string) => void
  onBack: () => void
}

export default function DifficultyPicker({ icon: Icon, title, desc, color, bg, loading, levels, onSelect, onBack }: Props) {
  return (
    <div className="dp-wrap animate-fade-up">
      <button className="dp-back" onClick={onBack}>← Voltar</button>

      <div className="dp-header" style={{ background: bg, borderColor: color }}>
        <div className="dp-icon" style={{ color }}><Icon size={40} strokeWidth={1.75} /></div>
        <h1 className="dp-title">{title}</h1>
        <p className="dp-desc">{desc}</p>
      </div>

      <h2 className="dp-subtitle">Escolha a dificuldade</h2>

      <div className="dp-levels">
        {levels.map((lvl, i) => (
          <button
            key={lvl.key}
            className="dp-level-btn"
            onClick={() => onSelect(lvl.key)}
            disabled={loading}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="dp-level-left">
              <span className="dp-level-badge" style={{ background: bg, color }}>{lvl.label}</span>
              <span className="dp-level-detail">{lvl.detail}</span>
            </div>
            <span className="dp-level-arrow" style={{ color }}>→</span>
          </button>
        ))}
      </div>

      {loading && <p className="dp-loading">Preparando o jogo... ⏳</p>}

      <style jsx>{`
        .dp-wrap { max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.2rem; }
        .dp-back { background: none; border: none; color: var(--text-muted); font-size: 0.9rem; font-weight: 700; min-height: unset; padding: 0; cursor: pointer; align-self: flex-start; }
        .dp-back:hover { color: var(--text-primary); }
        .dp-header { border: 1.5px solid; border-radius: 16px; padding: 1.8rem; text-align: center; }
        .dp-icon { display: flex; justify-content: center; margin-bottom: 0.6rem; }
        .dp-title { font-family: 'Source Serif 4', serif; font-size: 1.6rem; color: var(--text-primary); margin-bottom: 0.4rem; }
        .dp-desc { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; }
        .dp-subtitle { font-family: 'Source Serif 4', serif; font-size: 1.1rem; color: var(--text-primary); }
        .dp-levels { display: flex; flex-direction: column; gap: 10px; }
        .dp-level-btn {
          background: #fff;
          border: 1.5px solid var(--cream-border);
          border-radius: 12px;
          padding: 1rem 1.2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.18s;
          animation: fadeUp 0.35s ease both;
        }
        .dp-level-btn:hover { border-color: currentColor; box-shadow: var(--shadow); transform: translateX(4px); }
        .dp-level-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .dp-level-left { display: flex; align-items: center; gap: 12px; }
        .dp-level-badge { font-size: 0.85rem; font-weight: 700; padding: 4px 14px; border-radius: 6px; }
        .dp-level-detail { font-size: 0.85rem; color: var(--text-muted); font-weight: 600; }
        .dp-level-arrow { font-size: 1.2rem; font-weight: 700; transition: transform 0.15s; }
        .dp-level-btn:hover .dp-level-arrow { transform: translateX(4px); }
        .dp-loading { text-align: center; color: var(--text-muted); font-size: 0.9rem; }
      `}</style>
    </div>
  )
}
