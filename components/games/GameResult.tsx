'use client'

import type { LucideIcon } from 'lucide-react'
import { Trophy, ThumbsUp, Rocket } from 'lucide-react'

interface Props {
  icon: LucideIcon
  title: string
  score: number
  correct: number
  total: number
  onPlayAgain: () => void
  onHome: () => void
}

export default function GameResult({ icon: Icon, title, score, correct, total, onPlayAgain, onHome }: Props) {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
  const ResultIcon = accuracy >= 80 ? Trophy : accuracy >= 50 ? ThumbsUp : Rocket
  const msg = accuracy >= 80 ? 'Excelente! Você foi muito bem!' : accuracy >= 50 ? 'Bom trabalho! Continue praticando.' : 'Continue tentando, você vai melhorar!'

  return (
    <div className="result-wrap animate-pop">
      <div className="result-card card">
        <div className="result-icon"><ResultIcon size={44} strokeWidth={1.5} /></div>
        <h1 className="result-title">Fim de jogo!</h1>
        <p className="result-game"><Icon size={15} strokeWidth={2} /> {title}</p>
        <p className="result-msg">{msg}</p>

        <div className="result-stats">
          <div className="result-stat">
            <div className="result-stat-val">{score}</div>
            <div className="result-stat-label">pontos</div>
          </div>
          <div className="result-divider" />
          <div className="result-stat">
            <div className="result-stat-val">{correct}/{total}</div>
            <div className="result-stat-label">acertos</div>
          </div>
          <div className="result-divider" />
          <div className="result-stat">
            <div className="result-stat-val">{accuracy}%</div>
            <div className="result-stat-label">precisão</div>
          </div>
        </div>

        <div className="result-actions">
          <button className="btn-primary" onClick={onPlayAgain}>Jogar novamente</button>
          <button className="btn-outline" onClick={onHome}>Voltar ao início</button>
        </div>
      </div>

      <style jsx>{`
        .result-wrap { max-width: 420px; margin: 2rem auto; }
        .result-card { padding: 2.5rem 2rem; text-align: center; }
        .result-icon { color: var(--gold-dark); display: flex; justify-content: center; margin-bottom: 0.8rem; }
        .result-title { font-family: 'Source Serif 4', serif; font-size: 1.8rem; color: var(--text-primary); margin-bottom: 4px; }
        .result-game { display: flex; align-items: center; justify-content: center; gap: 6px; color: var(--text-muted); font-size: 0.85rem; font-weight: 700; margin-bottom: 0.8rem; }
        .result-msg { color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 1.8rem; line-height: 1.5; }
        .result-stats { display: flex; justify-content: center; align-items: center; gap: 0; background: var(--cream); border-radius: 12px; padding: 1rem; margin-bottom: 1.8rem; }
        .result-stat { flex: 1; }
        .result-stat-val { font-size: 1.4rem; font-weight: 800; color: var(--sage); }
        .result-stat-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; }
        .result-divider { width: 1.5px; height: 36px; background: var(--cream-border); }
        .result-actions { display: flex; flex-direction: column; gap: 10px; }
      `}</style>
    </div>
  )
}
