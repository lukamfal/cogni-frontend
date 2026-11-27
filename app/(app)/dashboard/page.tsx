'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Tutorial from '@/components/Tutorial'
import CareRequests from '@/components/CareRequests'
import { api, Summary, BestScore, GameSession } from '@/lib/api'
import { GAMES, GAME_LIST, DIFF_LABELS, GameId, isSameDay } from '@/lib/games'

const DAILY_GOAL = 3
const PLAN_ORDER: GameId[] = ['math', 'word', 'face', 'memory']

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()

  // Caregivers don't play: their home is the Acompanhar page.
  useEffect(() => {
    if (user?.role === 'caregiver') router.replace('/acompanhar')
  }, [user, router])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [best, setBest] = useState<BestScore[]>([])
  const [history, setHistory] = useState<GameSession[] | null>(null)
  const [suggested, setSuggested] = useState<string | null>(null)

  useEffect(() => {
    api.scores.summary().then(setSummary).catch(() => {})
    api.scores.best().then(setBest).catch(() => {})
    api.scores.history().then(setHistory).catch(() => setHistory([]))
  }, [])

  // Today's plan: the first game not played yet today, at the level the backend suggests.
  const today = (history ?? []).filter(s => s.finished_at && isSameDay(new Date(s.finished_at), new Date()))
  const done = Math.min(DAILY_GOAL, today.length)
  const next = GAMES[PLAN_ORDER.find(id => !today.some(s => s.game_type === id)) ?? 'memory']

  useEffect(() => {
    if (history === null) return
    api.games.suggestDifficulty(next.id).then(r => setSuggested(r.suggested_difficulty)).catch(() => {})
  }, [history, next.id])

  const firstName = user?.name.split(' ')[0] ?? 'Amigo'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const C = 2 * Math.PI * 32

  if (user?.role === 'caregiver') return null

  return (
    <div className="stack">
      <CareRequests />
      <section className="dash-hero fade-up">
        <div>
          <p className="dash-greeting">{greeting} 👋</p>
          <h1 className="dash-title">{firstName},<br />vamos exercitar a mente?</h1>
        </div>
        {summary && summary.streak_days > 0 && (
          <div className="streak pop">
            <span style={{ fontSize: '1.4rem' }}>🔥</span>
            <div><div className="streak-num">{summary.streak_days}</div><div className="streak-label">dias seguidos</div></div>
          </div>
        )}
      </section>

      {history !== null && (
        <div className="today card fade-up" style={{ animationDelay: '.05s' }}>
          <div className="ring">
            <svg viewBox="0 0 76 76" aria-hidden="true">
              <circle cx="38" cy="38" r="32" fill="none" stroke="var(--surface)" strokeWidth="8" />
              <circle cx="38" cy="38" r="32" fill="none" stroke="var(--accent)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={C * (1 - done / DAILY_GOAL)} />
            </svg>
            <div className="ring-txt">{done}/{DAILY_GOAL}</div>
          </div>
          <div>
            <div className="today-label">Plano de hoje</div>
            <div className="today-title">{done >= DAILY_GOAL ? 'Meta do dia concluída! 🎉' : `Próximo: ${next.icon} ${next.name}`}</div>
            <div className="today-desc">
              {done >= DAILY_GOAL
                ? 'Muito bem. Volte amanhã para manter a sequência.'
                : suggested
                  ? `Nível ${DIFF_LABELS[suggested] ?? suggested}, escolhido pelos seus resultados recentes. Cerca de 3 minutos.`
                  : 'Cerca de 3 minutos.'}
            </div>
          </div>
          {done < DAILY_GOAL && <Link href={next.href} className="today-btn">Começar</Link>}
        </div>
      )}

      {summary && (
        <div className="stats-3 fade-up" style={{ animationDelay: '.08s' }}>
          <div className="stat card"><div className="stat-icon">🎮</div><div className="stat-val">{summary.total_sessions}</div><div className="stat-label">Sessões</div></div>
          <div className="stat card accent"><div className="stat-icon">⭐</div><div className="stat-val">{summary.total_points.toLocaleString('pt-BR')}</div><div className="stat-label">Pontos totais</div></div>
          <div className="stat card"><div className="stat-icon">🔥</div><div className="stat-val">{summary.streak_days}</div><div className="stat-label">Dias seguidos</div></div>
        </div>
      )}

      <section className="fade-up" style={{ animationDelay: '.14s', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="section-label">Jogos disponíveis</div>
        <div className="grid-2">
          {GAME_LIST.map(g => {
            const myBest = best.filter(b => b.game_type === g.id).sort((a, b) => b.score - a.score)[0]
            return (
              <Link href={g.href} key={g.id} className="game-tile card">
                <div className="gt-top"><span className="gt-icon">{g.icon}</span><span className="gt-tag">{g.tag}</span></div>
                <div className="gt-name">{g.name}</div>
                <div className="gt-desc">{g.short}</div>
                {myBest && <div className="gt-best">Melhor: {myBest.score} pts</div>}
                <span className="arrow">→</span>
              </Link>
            )
          })}
        </div>
      </section>

      <div className="fade-up" style={{ animationDelay: '.22s', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Link href="/saude" className="row-card">
          <span className="rc-icon">💚</span>
          <div><div className="rc-title">Registrar saúde de hoje</div><div className="rc-desc">Água, sono, humor e movimento</div></div>
          <span className="arrow-in">→</span>
        </Link>
        <Link href="/familia" className="row-card">
          <span className="rc-icon">👨‍👩‍👧</span>
          <div><div className="rc-title">Minha família</div><div className="rc-desc">Cadastre fotos e nomes</div></div>
          <span className="arrow-in">→</span>
        </Link>
      </div>

      {user && <Tutorial userId={user.id} firstName={firstName} startHref={next.href} />}
    </div>
  )
}
