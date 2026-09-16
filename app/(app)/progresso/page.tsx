'use client'

import { useState, useEffect } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Grid3x3, Calculator, Users, BookOpen, Gamepad2, Flame, Star, Trophy, ClipboardList, Target, BarChart3 } from 'lucide-react'
import { api, GameSession, BestScore, Summary } from '@/lib/api'

const GAME_LABELS: Record<string, { label: string; icon: LucideIcon; color: string }> = {
  memory: { label: 'Memória',    icon: Grid3x3, color: 'var(--memory-color)' },
  math:   { label: 'Matemática', icon: Calculator, color: 'var(--math-color)' },
  face:   { label: 'Família',    icon: Users, color: 'var(--face-color)' },
  word:   { label: 'Palavras',   icon: BookOpen, color: 'var(--word-color)' },
}

const DIFF_LABELS: Record<string, string> = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' }

export default function ProgressoPage() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [history, setHistory] = useState<GameSession[]>([])
  const [best, setBest] = useState<BestScore[]>([])
  const [tab, setTab] = useState<'history' | 'best'>('best')

  useEffect(() => {
    api.scores.summary().then(setSummary).catch(() => {})
    api.scores.history().then(setHistory).catch(() => {})
    api.scores.best().then(setBest).catch(() => {})
  }, [])

  return (
    <div className="prog-page">
      <div className="prog-header animate-fade-up">
        <h1 className="prog-title"><BarChart3 size={24} strokeWidth={1.75} /> Meu Progresso</h1>
        <p className="prog-sub">Acompanhe sua evolução em cada jogo.</p>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="prog-stats animate-fade-up" style={{ animationDelay: '0.08s' }}>
          <div className="prog-stat">
            <div className="prog-stat-icon"><Flame size={20} strokeWidth={1.75} /></div>
            <div className="prog-stat-val">{summary.streak_days}</div>
            <div className="prog-stat-label">dias seguidos</div>
          </div>
          <div className="prog-stat highlight">
            <div className="prog-stat-icon"><Star size={20} strokeWidth={1.75} /></div>
            <div className="prog-stat-val">{summary.total_points.toLocaleString('pt-BR')}</div>
            <div className="prog-stat-label">pontos totais</div>
          </div>
          <div className="prog-stat">
            <div className="prog-stat-icon"><Gamepad2 size={20} strokeWidth={1.75} /></div>
            <div className="prog-stat-val">{summary.total_sessions}</div>
            <div className="prog-stat-label">sessões</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="prog-tabs animate-fade-up" style={{ animationDelay: '0.14s' }}>
        <button className={`prog-tab ${tab === 'best' ? 'active' : ''}`} onClick={() => setTab('best')}><Trophy size={16} strokeWidth={2} /> Melhores</button>
        <button className={`prog-tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}><ClipboardList size={16} strokeWidth={2} /> Histórico</button>
      </div>

      {/* Best scores */}
      {tab === 'best' && (
        <div className="best-list animate-fade-in">
          {best.length === 0 ? (
            <EmptyState msg="Nenhum recorde ainda. Jogue para começar!" />
          ) : best.map((b, i) => {
            const meta = GAME_LABELS[b.game_type] ?? { label: b.game_type, icon: Gamepad2, color: 'var(--sage)' }
            return (
              <div key={i} className="best-card card animate-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="best-icon" style={{ color: meta.color }}><meta.icon size={22} strokeWidth={1.75} /></div>
                <div className="best-info">
                  <div className="best-name">{meta.label}</div>
                  <div className="best-diff">{DIFF_LABELS[b.difficulty] ?? b.difficulty}</div>
                </div>
                <div className="best-right">
                  <div className="best-score" style={{ color: meta.color }}>{b.score} pts</div>
                  <div className="best-acc">{Math.round(b.accuracy * 100)}% precisão</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* History */}
      {tab === 'history' && (
        <div className="hist-list animate-fade-in">
          {history.length === 0 ? (
            <EmptyState msg="Nenhuma sessão ainda. Comece a jogar!" />
          ) : history.map((s, i) => {
            const meta = GAME_LABELS[s.game_type] ?? { label: s.game_type, icon: Gamepad2, color: 'var(--sage)' }
            const date = s.finished_at ? new Date(s.finished_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : ''
            const duration = s.duration_seconds > 60
              ? `${Math.floor(s.duration_seconds / 60)}min`
              : `${s.duration_seconds}s`
            return (
              <div key={s.id} className="hist-item card animate-fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                <div className="hist-icon" style={{ color: meta.color }}><meta.icon size={18} strokeWidth={1.75} /></div>
                <div className="hist-info">
                  <div className="hist-name">{meta.label} · <span className="hist-diff">{DIFF_LABELS[s.difficulty] ?? s.difficulty}</span></div>
                  <div className="hist-meta">{date} · {duration} · {s.correct_answers}/{s.total_questions} acertos</div>
                </div>
                <div className="hist-score" style={{ color: meta.color }}>{s.score} pts</div>
              </div>
            )
          })}
        </div>
      )}

      <style jsx>{`
        .prog-page { display: flex; flex-direction: column; gap: 1.4rem; }
        .prog-header { }
        .prog-title { display: flex; align-items: center; gap: 10px; font-family: 'Source Serif 4', serif; font-size: 1.8rem; color: var(--text-primary); margin-bottom: 4px; }
        .prog-sub { color: var(--text-secondary); font-size: 0.88rem; }

        .prog-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .prog-stat {
          background: #fff; border: 1px solid var(--cream-border);
          border-radius: 12px; padding: 1rem; text-align: center;
        }
        .prog-stat.highlight { background: var(--sage); border-color: var(--sage); }
        .prog-stat.highlight .prog-stat-val { color: #fff; }
        .prog-stat.highlight .prog-stat-icon { color: var(--gold-light); }
        .prog-stat.highlight .prog-stat-label { color: rgba(255,255,255,0.8); }
        .prog-stat-icon { color: var(--sage); display: flex; justify-content: center; margin-bottom: 4px; }
        .prog-stat-val { font-size: 1.4rem; font-weight: 800; color: var(--sage); }
        .prog-stat-label { font-size: 0.72rem; color: var(--text-muted); font-weight: 600; }

        .prog-tabs { display: flex; gap: 8px; background: var(--cream-dark); border-radius: 10px; padding: 4px; }
        .prog-tab {
          flex: 1; border: none; background: transparent; border-radius: 8px;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 10px; font-size: 0.9rem; font-weight: 700; color: var(--text-muted); cursor: pointer; min-height: unset;
        }
        .prog-tab.active { background: #fff; color: var(--text-primary); box-shadow: var(--shadow); }

        .best-list, .hist-list { display: flex; flex-direction: column; gap: 10px; }

        .best-card { padding: 1rem 1.2rem; display: flex; align-items: center; gap: 14px; }
        .best-icon { flex-shrink: 0; display: flex; }
        .best-info { flex: 1; }
        .best-name { font-weight: 700; font-size: 0.95rem; color: var(--text-primary); }
        .best-diff { font-size: 0.78rem; color: var(--text-muted); font-weight: 600; }
        .best-right { text-align: right; }
        .best-score { font-size: 1.1rem; font-weight: 800; }
        .best-acc { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; }

        .hist-item { padding: 0.9rem 1.1rem; display: flex; align-items: center; gap: 12px; }
        .hist-icon { flex-shrink: 0; display: flex; }
        .hist-info { flex: 1; min-width: 0; }
        .hist-name { font-weight: 700; font-size: 0.9rem; color: var(--text-primary); }
        .hist-diff { color: var(--text-muted); }
        .hist-meta { font-size: 0.76rem; color: var(--text-muted); font-weight: 600; }
        .hist-score { font-weight: 800; font-size: 0.95rem; flex-shrink: 0; }
      `}</style>
    </div>
  )
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="empty-state card">
      <div style={{ color: 'var(--text-muted)', display: 'flex', justifyContent: 'center', marginBottom: '0.8rem' }}><Target size={32} strokeWidth={1.5} /></div>
      <div style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.92rem' }}>{msg}</div>
      <style jsx>{`
        .empty-state { padding: 3rem 2rem; text-align: center; }
      `}</style>
    </div>
  )
}
