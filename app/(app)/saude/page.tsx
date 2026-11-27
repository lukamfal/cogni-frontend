'use client'

import { useEffect, useState } from 'react'
import { api, HealthLog } from '@/lib/api'
import { EMPTY, HealthEntry, MOODS, MOVES, dayKey, fromLog, moodEmoji, toInput, weekDays } from '@/lib/health'
import { toast } from '@/lib/games'

export default function SaudePage() {
  const [h, setH] = useState<HealthEntry>(EMPTY)
  const [logs, setLogs] = useState<HealthLog[] | null>(null)
  const [saving, setSaving] = useState(false)

  // Today's entry is picked by the local date: the server's "today" may be a different day in UTC.
  useEffect(() => {
    api.health.history(7).then(list => {
      setLogs(list)
      const today = list.find(l => l.log_date === dayKey(new Date()))
      if (today) setH(fromLog(today))
    }).catch(() => setLogs([]))
  }, [])

  const update = (patch: Partial<HealthEntry>) => setH(prev => ({ ...prev, ...patch }))

  const save = async () => {
    setSaving(true)
    try {
      const saved = await api.health.save(toInput(h))
      setLogs(prev => [...(prev ?? []).filter(l => l.log_date !== saved.log_date), saved])
      toast('Registro de hoje salvo.')
    } catch {
      toast('Não foi possível salvar. Tente de novo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="stack">
      <div className="fade-up">
        <h1 className="page-title">💚 Saúde de hoje</h1>
        <p className="page-sub">Um registro rápido do corpo e da mente. Leva uns 15 segundos.</p>
      </div>

      <div className="health-grid">
        <div className="h-card card fade-up">
          <div className="h-head"><span className="h-title">💧 Água</span><span className="h-val">{h.water} de 8 copos</span></div>
          <div className="glasses">
            {Array.from({ length: 8 }, (_, i) => (
              <button
                key={i}
                className={`glass ${i < h.water ? 'full' : ''}`}
                aria-label={`${i + 1} ${i ? 'copos' : 'copo'}`}
                onClick={() => update({ water: h.water === i + 1 ? i : i + 1 })}
              />
            ))}
          </div>
        </div>

        <div className="h-card card fade-up" style={{ animationDelay: '.05s' }}>
          <div className="h-head"><span className="h-title">😴 Sono</span><span className="h-val">{h.sleep >= 7 ? 'Bem descansado' : 'Dormiu pouco'}</span></div>
          <div className="stepper">
            <button className="step-btn" aria-label="Menos sono" onClick={() => update({ sleep: Math.max(0, h.sleep - 1) })}>−</button>
            <span className="step-val">{h.sleep}h</span>
            <button className="step-btn" aria-label="Mais sono" onClick={() => update({ sleep: Math.min(12, h.sleep + 1) })}>+</button>
          </div>
        </div>

        <div className="h-card card fade-up" style={{ animationDelay: '.1s' }}>
          <div className="h-head"><span className="h-title">Como você está?</span><span className="h-val">{MOODS[h.mood][1]}</span></div>
          <div className="moods">
            {MOODS.map(([e, l], i) => (
              <button key={l} className={`mood ${i === h.mood ? 'sel' : ''}`} aria-label={l} aria-pressed={i === h.mood} onClick={() => update({ mood: i })}>{e}</button>
            ))}
          </div>
        </div>

        <div className="h-card card fade-up" style={{ animationDelay: '.15s' }}>
          <div className="h-head"><span className="h-title">🚶 Movimento</span><span className="h-val">{h.moves.length ? `${h.moves.length} registrado${h.moves.length > 1 ? 's' : ''}` : 'Nada ainda'}</span></div>
          <div className="move-opts">
            {MOVES.map(m => {
              const on = h.moves.includes(m)
              return (
                <button key={m} className={`move ${on ? 'sel' : ''}`} aria-pressed={on}
                  onClick={() => update({ moves: on ? h.moves.filter(x => x !== m) : [...h.moves, m] })}>{m}</button>
              )
            })}
          </div>
        </div>
      </div>

      {logs && (
        <section className="fade-up" style={{ animationDelay: '.2s', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="section-label">Esta semana</div>
          <div className="week">
            {weekDays(logs).map(({ date, log }, i) => (
              <div key={i} className={`day ${i === 6 ? 'is-today' : ''}`}>
                <div className="day-name">{date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</div>
                <div className="day-mood">{log ? moodEmoji(log.mood) : '·'}</div>
                <div className="day-water">{log ? `💧${log.water_cups}` : ''}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <button className="btn-primary" style={{ maxWidth: 320 }} onClick={save} disabled={saving}>
        {saving ? 'Salvando...' : 'Salvar registro de hoje'}
      </button>
      <p className="note">Quem você autorizou em Ajustes também vê este registro.</p>
    </div>
  )
}
