import Link from 'next/link'
import { GAME_LIST } from '@/lib/games'

export default function JogosPage() {
  return (
    <div className="stack">
      <div className="fade-up">
        <h1 className="page-title">🎮 Jogos</h1>
        <p className="page-sub">Escolha um jogo para começar. Cada um exercita uma área diferente da sua mente.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {GAME_LIST.map((g, i) => (
          <Link
            key={g.id}
            href={g.href}
            className="jogo-card card fade-up"
            style={{ animationDelay: `${i * 0.07}s`, '--gc': g.color } as React.CSSProperties}
          >
            <div className="jogo-icon" style={{ background: g.bg }}>{g.icon}</div>
            <div className="jogo-body">
              <div className="jogo-name">{g.name}</div>
              <div className="jogo-desc">{g.long}</div>
              <div className="chips">
                {g.tags.map(t => <span key={t} className="chip" style={{ background: g.bg, color: g.color }}>{t}</span>)}
              </div>
            </div>
            <span style={{ color: 'var(--gray-300)', fontSize: '1.2rem' }}>→</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
