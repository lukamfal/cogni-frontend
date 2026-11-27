'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { api, ElderOverview, FollowingLink } from '@/lib/api'
import { DIFF_LABELS, gameMeta, isSameDay, toast } from '@/lib/games'
import { moodEmoji, weekDays } from '@/lib/health'
import ReportPreview from '@/components/ReportPreview'

export default function AcompanharPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [links, setLinks] = useState<FollowingLink[] | null>(null)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)

  const load = () => api.care.following().then(setLinks).catch(() => setLinks([]))

  useEffect(() => {
    if (loading || !user) return
    if (user.role !== 'caregiver') { router.replace('/dashboard'); return }
    load()
  }, [loading, user, router])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) { toast('Digite o e-mail da pessoa, como maria@email.com.'); return }
    setSending(true)
    try {
      const r = await api.care.request(email.trim())
      toast(r.detail)
      setEmail('')
      load()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível enviar o pedido.')
    } finally {
      setSending(false)
    }
  }

  const remove = async (link: FollowingLink) => {
    await api.care.remove(link.id).catch(() => {})
    load()
  }

  const accepted = (links ?? []).filter(l => l.status === 'accepted' && l.elder_id)
  const pending = (links ?? []).filter(l => l.status === 'pending')

  return (
    <div className="stack">
      <div className="fade-up">
        <h1 className="page-title">👀 Acompanhar</h1>
        <p className="page-sub">Veja como está quem você ama: jogos, pontos e o registro de saúde de cada dia.</p>
      </div>

      <form className="care-form card fade-up" onSubmit={send} noValidate>
        <div>
          <div className="set-label">Acompanhar alguém</div>
          <div className="set-sub">Digite o e-mail que a pessoa usa no CogniMente. Ela recebe um aviso e precisa permitir.</div>
        </div>
        <div className="care-form-row">
          <input className="input-field" type="email" placeholder="email.da.pessoa@email.com" value={email} onChange={e => setEmail(e.target.value)} aria-label="E-mail da pessoa" />
          <button className="btn-add" type="submit" disabled={sending}>{sending ? 'Enviando...' : 'Pedir'}</button>
        </div>
      </form>

      {links === null ? <div className="muted-center">Carregando...</div> : (
        <>
          {accepted.map(l => <ElderCard key={l.id} link={l} onRemove={() => remove(l)} />)}

          {pending.length > 0 && (
            <section className="stack" style={{ gap: 10 }}>
              <div className="section-label">Esperando permissão</div>
              {pending.map(l => (
                <div key={l.id} className="row-card" style={{ cursor: 'default' }}>
                  <span className="rc-icon">⏳</span>
                  <div><div className="rc-title">{l.elder_email}</div><div className="rc-desc">O pedido aparece quando a pessoa entrar no CogniMente.</div></div>
                  <button className="btn-small" style={{ marginLeft: 'auto' }} onClick={() => remove(l)}>Cancelar</button>
                </div>
              ))}
            </section>
          )}

          {links.length === 0 && (
            <div className="empty card">
              <div className="empty-icon">👵</div>
              <div className="empty-title">Você ainda não acompanha ninguém</div>
              <div className="page-sub">Peça acima, com o e-mail da pessoa.</div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ElderCard({ link, onRemove }: { link: FollowingLink; onRemove: () => void }) {
  const [data, setData] = useState<ElderOverview | null>(null)
  const [error, setError] = useState(false)
  const [confirm, setConfirm] = useState(false)

  useEffect(() => {
    if (link.elder_id) api.care.overview(link.elder_id).then(setData).catch(() => setError(true))
  }, [link.elder_id])

  const name = link.elder_name ?? link.elder_email
  const first = name.split(' ')[0]
  if (error) return <div className="card empty"><div className="empty-title">Não foi possível carregar {first}.</div></div>
  if (!data) return <div className="card muted-center">Carregando {first}...</div>

  // Last 7 days: points per day and how many days had a game.
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const sessions = data.recent_sessions.filter(s => s.finished_at && isSameDay(new Date(s.finished_at), d))
    return { pts: sessions.reduce((a, s) => a + s.score, 0), played: sessions.length > 0, sessions }
  })
  const week = days.flatMap(d => d.sessions)
  const correct = week.reduce((a, s) => a + s.correct_answers, 0)
  const total = week.reduce((a, s) => a + s.total_questions, 0)
  const daysPlayed = days.filter(d => d.played).length
  const last = data.recent_sessions[0]?.finished_at

  return (
    <section className="elder card fade-up">
      <div className="elder-head">
        <div className="avatar" style={{ width: 46, height: 46, fontSize: '1.1rem' }}>{first.charAt(0).toUpperCase()}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="elder-name">{data.elder_name}</h2>
          <div className="set-sub">{last ? `Último jogo: ${new Date(last).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}` : 'Ainda não jogou'}</div>
        </div>
      </div>

      <div className="stats-3">
        <div className="stat card"><div className="stat-icon">🔥</div><div className="stat-val">{data.summary.streak_days}</div><div className="stat-label">dias seguidos</div></div>
        <div className="stat card accent"><div className="stat-icon">⭐</div><div className="stat-val">{data.summary.total_points.toLocaleString('pt-BR')}</div><div className="stat-label">pontos</div></div>
        <div className="stat card"><div className="stat-icon">🎮</div><div className="stat-val">{data.summary.total_sessions}</div><div className="stat-label">jogos</div></div>
      </div>

      <ReportPreview
        title={`A semana de ${first}`}
        meta="Últimos 7 dias"
        greeting={daysPlayed ? `${first} jogou em ${daysPlayed} ${daysPlayed > 1 ? 'dias' : 'dia'} esta semana 🌿` : `${first} não jogou nos últimos 7 dias`}
        daysPlayed={`${daysPlayed}/7`}
        accuracy={total ? `${Math.round((correct / total) * 100)}%` : '—'}
        mood={moodEmoji(data.health_summary.most_common_mood)}
        bars={days.map(d => d.pts)}
        note={<>💧 Média de {data.health_summary.avg_water_cups.toFixed(1)} copos de água e {data.health_summary.avg_sleep_hours.toFixed(1)}h de sono, em {data.health_summary.logs_this_week} {data.health_summary.logs_this_week === 1 ? 'registro' : 'registros'} de saúde.</>}
      />

      <div className="section-label">Saúde na semana</div>
      <div className="week">
        {weekDays(data.health_week).map(({ date, log }, i) => (
          <div key={i} className={`day ${i === 6 ? 'is-today' : ''}`}>
            <div className="day-name">{date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</div>
            <div className="day-mood">{log ? moodEmoji(log.mood) : '·'}</div>
            <div className="day-water">{log ? `💧${log.water_cups}` : ''}</div>
          </div>
        ))}
      </div>

      {data.recent_sessions.length > 0 && (
        <>
          <div className="section-label">Últimos jogos</div>
          <div className="list">
            {data.recent_sessions.slice(0, 5).map(s => {
              const g = gameMeta(s.game_type)
              return (
                <div key={s.id} className="li card">
                  <div className="li-icon" style={{ background: g.bg }}>{g.icon}</div>
                  <div className="li-body">
                    <div className="li-name">{g.name} · <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{DIFF_LABELS[s.difficulty] ?? s.difficulty}</span></div>
                    <div className="li-meta">{s.finished_at && new Date(s.finished_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} · {s.correct_answers}/{s.total_questions} acertos</div>
                  </div>
                  <div className="li-right"><div className="li-score" style={{ color: g.color }}>{s.score} pts</div></div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {confirm ? (
        <div className="confirm-row" style={{ maxWidth: 360 }}>
          <button className="cr-yes" onClick={onRemove}>Parar de acompanhar</button>
          <button className="cr-no" onClick={() => setConfirm(false)}>Continuar</button>
        </div>
      ) : (
        <button className="tut-skip" style={{ alignSelf: 'flex-start' }} onClick={() => setConfirm(true)}>Parar de acompanhar {first}</button>
      )}
    </section>
  )
}
