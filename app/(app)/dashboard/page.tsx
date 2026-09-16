'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { api, Summary, BestScore } from '@/lib/api'
import { Grid3x3, Calculator, Users, BookOpen, Gamepad2, Star, Flame } from 'lucide-react'

const GAMES = [
  {
    id: 'memory',
    icon: Grid3x3,
    name: 'Jogo da Memória',
    desc: 'Encontre os pares de figuras iguais',
    color: 'var(--memory-color)',
    bg: 'var(--memory-bg)',
    href: '/jogos/memoria',
  },
  {
    id: 'math',
    icon: Calculator,
    name: 'Matemática',
    desc: 'Somas e subtrações simples',
    color: 'var(--math-color)',
    bg: 'var(--math-bg)',
    href: '/jogos/matematica',
  },
  {
    id: 'face',
    icon: Users,
    name: 'Reconhecer Família',
    desc: 'Associe rostos a nomes',
    color: 'var(--face-color)',
    bg: 'var(--face-bg)',
    href: '/jogos/familia',
  },
  {
    id: 'word',
    icon: BookOpen,
    name: 'Complete a Palavra',
    desc: 'Descubra as letras faltando',
    color: 'var(--word-color)',
    bg: 'var(--word-bg)',
    href: '/jogos/palavras',
  },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [best, setBest] = useState<BestScore[]>([])

  useEffect(() => {
    api.scores.summary().then(setSummary).catch(() => {})
    api.scores.best().then(setBest).catch(() => {})
  }, [])

  const firstName = user?.name.split(' ')[0] ?? 'Amigo'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div className="dashboard">
      {/* Saudação */}
      <section className="dash-hero animate-fade-up">
        <div>
          <p className="dash-greeting">{greeting}</p>
          <h1 className="dash-title">{firstName}, vamos exercitar a mente?</h1>
          <p className="dash-sub">Escolha um jogo abaixo para começar.</p>
        </div>
        {summary && summary.streak_days > 0 && (
          <div className="streak-badge animate-pop">
            <span className="streak-fire"><Flame size={20} strokeWidth={2} /></span>
            <span className="streak-num">{summary.streak_days}</span>
            <span className="streak-label">dia{summary.streak_days > 1 ? 's' : ''}</span>
          </div>
        )}
      </section>

      {/* Stats */}
      {summary && (
        <section className="stats-row animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="stat-card">
            <div className="stat-icon"><Gamepad2 size={20} strokeWidth={1.75} /></div>
            <div className="stat-value">{summary.total_sessions}</div>
            <div className="stat-label">Sessões jogadas</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><Star size={20} strokeWidth={1.75} /></div>
            <div className="stat-value">{summary.total_points.toLocaleString('pt-BR')}</div>
            <div className="stat-label">Pontos totais</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><Flame size={20} strokeWidth={1.75} /></div>
            <div className="stat-value">{summary.streak_days}</div>
            <div className="stat-label">Dias seguidos</div>
          </div>
        </section>
      )}

      {/* Jogos */}
      <section className="animate-fade-up" style={{ animationDelay: '0.15s' }}>
        <h2 className="section-heading">Jogos disponíveis</h2>
        <div className="games-grid">
          {GAMES.map((game, i) => {
            const myBest = best.find(b => b.game_type === game.id)
            return (
              <Link
                href={game.href}
                key={game.id}
                className="game-card animate-fade-up"
                style={{ animationDelay: `${0.2 + i * 0.07}s`, '--gc': game.color, '--gb': game.bg } as React.CSSProperties}
              >
                <div className="game-card-icon" style={{ color: game.color }}><game.icon size={24} strokeWidth={1.75} /></div>
                <div className="game-card-body">
                  <div className="game-card-name">{game.name}</div>
                  <div className="game-card-desc">{game.desc}</div>
                  {myBest && (
                    <div className="game-card-best">
                      Melhor: <strong>{myBest.score} pts</strong>
                    </div>
                  )}
                </div>
                <div className="game-card-arrow">→</div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Atalho família */}
      <section className="animate-fade-up family-cta" style={{ animationDelay: '0.4s' }}>
        <div className="family-cta-text">
          <div className="family-cta-title"><Users size={17} strokeWidth={2} /> Cadastre sua família</div>
          <div className="family-cta-desc">Adicione fotos e nomes para o jogo de reconhecimento</div>
        </div>
        <Link href="/familia" className="family-cta-btn">Adicionar →</Link>
      </section>

      <style jsx global>{`
        .dashboard { display: flex; flex-direction: column; gap: 2rem; }

        .dash-hero {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
        }
        .dash-greeting { color: var(--text-muted); font-size: 0.9rem; font-weight: 600; margin-bottom: 4px; }
        .dash-title { font-family: 'Source Serif 4', serif; font-size: clamp(1.5rem, 4vw, 2rem); color: var(--text-primary); margin-bottom: 4px; }
        .dash-sub { color: var(--text-secondary); font-size: 0.95rem; }

        .streak-badge {
          background: var(--sage-dark);
          color: #fff;
          border-radius: 12px;
          padding: 12px 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
          min-width: 80px;
          box-shadow: var(--shadow);
        }
        .streak-fire { color: var(--gold-light); display: flex; margin-bottom: 2px; }
        .streak-num { font-size: 1.6rem; font-weight: 800; line-height: 1; }
        .streak-label { font-size: 0.72rem; font-weight: 700; opacity: 0.9; }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .stat-card {
          background: #fff;
          border: 1px solid var(--cream-border);
          border-radius: 12px;
          padding: 1.1rem;
          text-align: center;
        }
        .stat-icon { color: var(--sage); display: flex; justify-content: center; margin-bottom: 4px; }
        .stat-value { font-size: 1.5rem; font-weight: 800; color: var(--sage); }
        .stat-label { font-size: 0.76rem; color: var(--text-muted); font-weight: 600; }

        .section-heading {
          font-family: 'Source Serif 4', serif;
          font-size: 1.2rem;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }
        .games-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        .game-card {
          background: #fff;
          border: 1px solid var(--cream-border);
          border-radius: 14px;
          padding: 1.2rem;
          display: flex;
          align-items: center;
          gap: 14px;
          text-decoration: none;
          transition: all 0.2s;
          color: inherit;
        }
        .game-card:hover {
          border-color: var(--gc);
          box-shadow: var(--shadow-lg);
          transform: translateY(-2px);
        }
        .game-card-icon {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          background: var(--gb);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .game-card-body { flex: 1; min-width: 0; }
        .game-card-name { font-weight: 700; font-size: 0.95rem; color: var(--text-primary); margin-bottom: 2px; }
        .game-card-desc { font-size: 0.78rem; color: var(--text-muted); line-height: 1.4; }
        .game-card-best { font-size: 0.78rem; color: var(--sage); margin-top: 4px; }
        .game-card-arrow { color: var(--text-muted); font-size: 1.1rem; flex-shrink: 0; }
        .game-card:hover .game-card-arrow { color: var(--gc); transform: translateX(3px); }

        .family-cta {
          background: var(--sage-50);
          border: 1px solid var(--sage-100);
          border-radius: 14px;
          padding: 1.2rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .family-cta-title { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.95rem; color: var(--text-primary); margin-bottom: 2px; }
        .family-cta-desc { font-size: 0.82rem; color: var(--text-secondary); }
        .family-cta-btn {
          background: var(--sage);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          font-size: 0.88rem;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
          min-height: 44px;
          display: flex;
          align-items: center;
        }
        .family-cta-btn:hover { background: var(--sage-dark); }

        @media (max-width: 600px) {
          .games-grid { grid-template-columns: 1fr; }
          .stats-row { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
    </div>
  )
}
