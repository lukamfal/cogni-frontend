'use client'

import { useEffect } from 'react'
import { GameMeta, DIFF_LABELS, confetti } from '@/lib/games'

interface Props {
  game: GameMeta
  difficulty?: string
  score: number
  correct: number
  total: number
  onPlayAgain: () => void
  onHome: () => void
}

export default function GameResult({ game, difficulty, score, correct, total, onPlayAgain, onHome }: Props) {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
  const emoji = accuracy >= 80 ? '🎉' : accuracy >= 50 ? '👏' : '💪'
  const msg = accuracy >= 80 ? 'Excelente! Você foi muito bem!' : accuracy >= 50 ? 'Bom trabalho! Continue praticando.' : 'Continue tentando, você vai melhorar a cada vez!'

  useEffect(() => { if (accuracy >= 80) confetti() }, [accuracy])

  return (
    <div className="result card pop">
      <div className="result-emoji">{emoji}</div>
      <h1 className="result-title">Fim de jogo!</h1>
      <p className="result-game">{game.icon} {game.name}{difficulty ? ` · ${DIFF_LABELS[difficulty] ?? difficulty}` : ''}</p>
      <p className="result-msg">{msg}</p>

      <div className="result-stats">
        <div><div className="rs-val">{score}</div><div className="rs-label">pontos</div></div>
        <div className="rs-div" />
        <div><div className="rs-val">{correct}/{total}</div><div className="rs-label">acertos</div></div>
        <div className="rs-div" />
        <div><div className="rs-val">{accuracy}%</div><div className="rs-label">precisão</div></div>
      </div>

      <div className="result-actions">
        <button className="btn-primary" onClick={onPlayAgain}>Jogar novamente</button>
        <button className="btn-outline" onClick={onHome}>Voltar ao início</button>
      </div>
    </div>
  )
}
