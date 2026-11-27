'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { api, GameSession, BestScore, Summary, HealthLog } from '@/lib/api'
import { DIFF_LABELS, gameMeta, isSameDay } from '@/lib/games'
import { moodEmoji } from '@/lib/health'
import ReportPreview from '@/components/ReportPreview'

const fmt = (n: number) => n.toLocaleString('pt-BR')

function weekDays(history: GameSession[]) {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const sessions = history.filter(s => s.finished_at && isSameDay(new Date(s.finished_at), date))
    return {
      label: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
      pts: sessions.reduce((a, s) => a + s.score, 0),
      sessions,
    }
  })
}

function WeeklyChart({ days }: { days: ReturnType<typeof weekDays> }) {
  const max = Math.max(1000, Math.ceil(Math.max(...days.map(d => d.pts)) / 500) * 500)
  const W = 560, H = 190, L = 44, B = 26, T = 14, bw = (W - L) / 7
  const y = (v: number) => T + (H - T - B) * (1 - v / max)
  const text = { fontSize: 11, fontFamily: 'var(--font-body)' }
  return (
    <div className="chart-card card fade-up" style={{ animationDelay: '.1s' }}>
      <div className="chart-head">
        <span className="chart-title">Pontos nesta semana</span>
        <span className="chart-note">{fmt(days.reduce((a, d) => a + d.pts, 0))} pts em 7 dias</span>
      </div>
      <div className="chart">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Gráfico de barras dos pontos por dia nesta semana">
          {[0, max / 2, max].map(t => (
            <g key={t}>
              <line x1={L} x2={W} y1={y(t)} y2={y(t)} stroke="var(--gray-200)" strokeWidth="1" />
              <text x={L - 8} y={y(t) + 4} textAnchor="end" fill="var(--text-muted)" {...text}>{fmt(t)}</text>
            </g>
          ))}
          {days.map((d, i) => {
            const x = L + i * bw + bw * 0.22, w = bw * 0.56, top = y(d.pts), isToday = i === 6
            return (
              <g key={i}>
                <rect x={x} y={top} width={w} height={Math.max(0, H - B - top)} rx="6" fill={isToday ? 'var(--accent)' : 'var(--gray-300)'} />
                {d.pts > 0 && <text x={x + w / 2} y={top - 5} textAnchor="middle" fontWeight="700" fill="var(--text-secondary)" {...text}>{d.pts}</text>}
                <text x={x + w / 2} y={H - 6} textAnchor="middle" fontWeight="600" fill={isToday ? 'var(--ink)' : 'var(--text-muted)'} {...text}>{isToday ? 'Hoje' : d.label}</text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

export default function ProgressoPage() {
  const { user } = useAuth()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [history, setHistory] = useState<GameSession[]>([])
  const [best, setBest] = useState<BestScore[]>([])
  const [tab, setTab] = useState<'history' | 'best'>('best')
  const [showReport, setShowReport] = useState(false)
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([])

  useEffect(() => {
    api.scores.summary().then(setSummary).catch(() => {})
    api.scores.history().then(setHistory).catch(() => {})
    api.scores.best().then(setBest).catch(() => {})
    api.health.history(7).then(setHealthLogs).catch(() => {})
  }, [])

  const days = weekDays(history)
  const weekSessions = days.flatMap(d => d.sessions)
  const daysPlayed = days.filter(d => d.sessions.length).length
  const q = weekSessions.reduce((a, s) => ({ c: a.c + s.correct_answers, t: a.t + s.total_questions }), { c: 0, t: 0 })
  const moods = healthLogs.flatMap(l => (l.mood ? [l.mood] : []))
  const usualMood = moods.length
    ? moodEmoji([...moods].sort((a, b) => moods.filter(m => m === b).length - moods.filter(m => m === a).length)[0])
    : '—'
  const firstName = user?.name.split(' ')[0] ?? 'Você'

  return (
    <div className="stack">
      <div className="fade-up">
        <h1 className="page-title">📊 Meu Progresso</h1>
        <p className="page-sub">Acompanhe sua evolução em cada jogo.</p>
      </div>

      {summary && (
        <div className="stats-3 fade-up" style={{ animationDelay: '.06s' }}>
          <div className="stat card"><div className="stat-icon">🔥</div><div className="stat-val">{summary.streak_days}</div><div className="stat-label">dias seguidos</div></div>
          <div className="stat card accent"><div className="stat-icon">⭐</div><div className="stat-val">{fmt(summary.total_points)}</div><div className="stat-label">pontos totais</div></div>
          <div className="stat card"><div className="stat-icon">🎮</div><div className="stat-val">{summary.total_sessions}</div><div className="stat-label">sessões</div></div>
        </div>
      )}

      <WeeklyChart days={days} />

      <div className="report-card card fade-up" style={{ animationDelay: '.12s' }}>
        <span style={{ fontSize: '1.6rem' }}>💌</span>
        <div className="rc-body">
          <div className="rc-title">Resumo da semana para a família</div>
          <div className="rc-desc">Veja como fica o resumo dos últimos 7 dias.</div>
        </div>
        <button className="btn-small" onClick={() => setShowReport(v => !v)} aria-expanded={showReport}>
          {showReport ? 'Esconder' : 'Ver resumo'}
        </button>
      </div>
      {showReport && (
        <ReportPreview
          title={`A semana de ${firstName} no CogniMente`}
          meta="Últimos 7 dias"
          greeting={daysPlayed ? `${firstName} jogou em ${daysPlayed} ${daysPlayed > 1 ? 'dias' : 'dia'} esta semana 🌿` : `${firstName} ainda não jogou esta semana`}
          daysPlayed={`${daysPlayed}/7`}
          accuracy={q.t ? `${Math.round((q.c / q.t) * 100)}%` : '—'}
          mood={usualMood}
          bars={days.map(d => d.pts)}
          note={<>💡 {weekSessions.length} {weekSessions.length === 1 ? 'sessão' : 'sessões'} e {fmt(weekSessions.reduce((a, s) => a + s.score, 0))} pontos nos últimos 7 dias.</>}
        />
      )}

      <div className="tabs fade-up" role="tablist">
        <button role="tab" aria-selected={tab === 'best'} className={`tab ${tab === 'best' ? 'active' : ''}`} onClick={() => setTab('best')}>🏆 Melhores</button>
        <button role="tab" aria-selected={tab === 'history'} className={`tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>📋 Histórico</button>
      </div>

      {tab === 'best' && (
        best.length === 0 ? <EmptyState msg="Nenhum recorde ainda. Jogue para começar!" /> : (
          <div className="list">
            {[...best].sort((a, b) => b.score - a.score).map((b, i) => {
              const g = gameMeta(b.game_type)
              return (
                <div key={i} className="li card fade-up" style={{ animationDelay: `${i * 0.03}s` }}>
                  <div className="li-icon" style={{ background: g.bg }}>{g.icon}</div>
                  <div className="li-body">
                    <div className="li-name">{g.name} · <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{DIFF_LABELS[b.difficulty] ?? b.difficulty}</span></div>
                    <div className="li-meta">{Math.round(b.accuracy * 100)}% de precisão</div>
                  </div>
                  <div className="li-right"><div className="li-score" style={{ color: g.color }}>{b.score} pts</div></div>
                </div>
              )
            })}
          </div>
        )
      )}

      {tab === 'history' && (
        history.length === 0 ? <EmptyState msg="Nenhuma sessão ainda. Comece a jogar!" /> : (
          <div className="list">
            {history.map((s, i) => {
              const g = gameMeta(s.game_type)
              const date = s.finished_at ? new Date(s.finished_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : ''
              const dur = s.duration_seconds > 60 ? `${Math.floor(s.duration_seconds / 60)}min ${s.duration_seconds % 60}s` : `${s.duration_seconds}s`
              return (
                <div key={s.id} className="li card fade-up" style={{ animationDelay: `${Math.min(i, 10) * 0.03}s` }}>
                  <div className="li-icon" style={{ background: g.bg }}>{g.icon}</div>
                  <div className="li-body">
                    <div className="li-name">{g.name} · <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{DIFF_LABELS[s.difficulty] ?? s.difficulty}</span></div>
                    <div className="li-meta">{date} · {dur} · {s.correct_answers}/{s.total_questions} acertos</div>
                  </div>
                  <div className="li-right"><div className="li-score" style={{ color: g.color }}>{s.score} pts</div></div>
                </div>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="empty card">
      <div className="empty-icon">🎯</div>
      <div className="empty-title">{msg}</div>
    </div>
  )
}
