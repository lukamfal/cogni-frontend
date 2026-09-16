'use client'

import { useState, useEffect } from 'react'
import { HeartPulse, Droplet, Footprints, Moon, Heart, Pill, StickyNote, CheckCircle2, Circle, AlertTriangle, BarChart3 } from 'lucide-react'
import { api } from '@/lib/api'
import { MedicationManager } from '@/components/MedicationReminder'

type Mood = 'great' | 'good' | 'neutral' | 'bad' | 'awful'

interface HealthLog {
  id?: number
  log_date: string
  water_cups: number
  water_goal: number
  steps: number
  steps_goal: number
  exercise_minutes: number
  sleep_hours: number
  mood: Mood | null
  medication_taken: boolean
  medication_notes: string | null
  notes: string | null
}

interface Summary {
  avg_water_cups: number
  avg_sleep_hours: number
  avg_steps: number
  avg_exercise_minutes: number
  medication_adherence: number
  most_common_mood: Mood | null
  logs_this_week: number
}

const MOODS: { key: Mood; emoji: string; label: string }[] = [
  { key: 'great',   emoji: '😄', label: 'Ótimo' },
  { key: 'good',    emoji: '🙂', label: 'Bem' },
  { key: 'neutral', emoji: '😐', label: 'Regular' },
  { key: 'bad',     emoji: '😕', label: 'Mal' },
  { key: 'awful',   emoji: '😢', label: 'Muito mal' },
]

const today = new Date().toISOString().split('T')[0]

function pct(val: number, goal: number) {
  return Math.min(100, Math.round((val / goal) * 100))
}

export default function SaudePage() {
  const [log, setLog] = useState<HealthLog>({
    log_date: today,
    water_cups: 0,
    water_goal: 8,
    steps: 0,
    steps_goal: 3000,
    exercise_minutes: 0,
    sleep_hours: 0,
    mood: null,
    medication_taken: false,
    medication_notes: null,
    notes: null,
  })
  const [summary, setSummary] = useState<Summary | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [todayLog, sum] = await Promise.all([
          api.health.today(),
          api.health.summary(),
        ])
        if (todayLog) setLog(todayLog)
        setSummary(sum)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const saved = await api.health.upsert(log)
      setLog(saved)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      alert('Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const update = (field: keyof HealthLog, value: unknown) => {
    setLog(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  if (loading) return (
    <div className="page-loading">
      <div className="spinner" />
      <p>Carregando...</p>
    </div>
  )

  return (
    <div className="saude-page">
      <div className="saude-header">
        <div className="saude-header-icon"><HeartPulse size={26} strokeWidth={1.75} /></div>
        <div>
          <h1 className="saude-title">Saúde Física</h1>
          <p className="saude-subtitle">Registro de hoje · {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
      </div>

      <div className="saude-grid">

        {/* Água */}
        <div className="saude-card">
          <div className="card-header">
            <span className="card-icon"><Droplet size={18} strokeWidth={1.75} /></span>
            <span className="card-title">Hidratação</span>
          </div>
          <div className="water-display">
            <span className="water-count">{log.water_cups}</span>
            <span className="water-goal">/ {log.water_goal} copos</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill water" style={{ width: `${pct(log.water_cups, log.water_goal)}%` }} />
          </div>
          <div className="water-buttons">
            <button className="btn-counter minus" onClick={() => update('water_cups', Math.max(0, log.water_cups - 1))}>−</button>
            <span className="counter-hint">Toque para registrar um copo</span>
            <button className="btn-counter plus" onClick={() => update('water_cups', log.water_cups + 1)}>+</button>
          </div>
        </div>

        {/* Passos */}
        <div className="saude-card">
          <div className="card-header">
            <span className="card-icon"><Footprints size={18} strokeWidth={1.75} /></span>
            <span className="card-title">Passos</span>
          </div>
          <div className="water-display">
            <span className="water-count">{log.steps.toLocaleString('pt-BR')}</span>
            <span className="water-goal">/ {log.steps_goal.toLocaleString('pt-BR')}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill steps" style={{ width: `${pct(log.steps, log.steps_goal)}%` }} />
          </div>
          <div className="steps-input-row">
            <input
              type="number"
              className="steps-input"
              value={log.steps || ''}
              placeholder="0"
              min={0}
              onChange={e => update('steps', Number(e.target.value))}
            />
            <span className="steps-label">passos hoje</span>
          </div>
          <div className="exercise-row">
            <label className="field-label">Exercício</label>
            <div className="exercise-input-row">
              <input
                type="number"
                className="steps-input small"
                value={log.exercise_minutes || ''}
                placeholder="0"
                min={0}
                onChange={e => update('exercise_minutes', Number(e.target.value))}
              />
              <span className="steps-label">minutos</span>
            </div>
          </div>
        </div>

        {/* Sono */}
        <div className="saude-card">
          <div className="card-header">
            <span className="card-icon"><Moon size={18} strokeWidth={1.75} /></span>
            <span className="card-title">Sono</span>
          </div>
          <div className="water-display">
            <span className="water-count">{log.sleep_hours.toFixed(1)}</span>
            <span className="water-goal">horas</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill sleep" style={{ width: `${pct(log.sleep_hours, 8)}%` }} />
          </div>
          <div className="sleep-slider-row">
            <span className="sleep-slider-label">0h</span>
            <input
              type="range"
              min={0} max={12} step={0.5}
              value={log.sleep_hours}
              onChange={e => update('sleep_hours', Number(e.target.value))}
              className="sleep-slider"
            />
            <span className="sleep-slider-label">12h</span>
          </div>
          <p className="sleep-hint">
            {log.sleep_hours < 6 ? <><AlertTriangle size={14} strokeWidth={2} /> Menos de 6h — tente descansar mais</> :
             log.sleep_hours >= 7 ? <><CheckCircle2 size={14} strokeWidth={2} /> Ótimo sono!</> :
             'Razoável'}
          </p>
        </div>

        {/* Humor */}
        <div className="saude-card">
          <div className="card-header">
            <span className="card-icon"><Heart size={18} strokeWidth={1.75} /></span>
            <span className="card-title">Como você está?</span>
          </div>
          <div className="mood-grid">
            {MOODS.map(m => (
              <button
                key={m.key}
                className={`mood-btn ${log.mood === m.key ? 'active' : ''}`}
                onClick={() => update('mood', log.mood === m.key ? null : m.key)}
              >
                <span className="mood-emoji">{m.emoji}</span>
                <span className="mood-label">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Medicação */}
        <div className="saude-card">
          <div className="card-header">
            <span className="card-icon"><Pill size={18} strokeWidth={1.75} /></span>
            <span className="card-title">Medicação</span>
          </div>
          <button
            className={`med-toggle ${log.medication_taken ? 'taken' : ''}`}
            onClick={() => update('medication_taken', !log.medication_taken)}
          >
            {log.medication_taken ? <><CheckCircle2 size={18} strokeWidth={2} /> Tomei os remédios hoje</> : <><Circle size={18} strokeWidth={2} /> Ainda não tomei</>}
          </button>
          <textarea
            className="notes-input"
            placeholder="Observações sobre medicação (opcional)..."
            value={log.medication_notes || ''}
            rows={2}
            onChange={e => update('medication_notes', e.target.value || null)}
          />
        </div>

        {/* Observações */}
        <div className="saude-card">
          <div className="card-header">
            <span className="card-icon"><StickyNote size={18} strokeWidth={1.75} /></span>
            <span className="card-title">Observações do dia</span>
          </div>
          <textarea
            className="notes-input"
            placeholder="Como foi seu dia? Alguma dor ou sintoma?"
            value={log.notes || ''}
            rows={3}
            onChange={e => update('notes', e.target.value || null)}
          />
        </div>

      </div>

      {/* Botão salvar */}
      <div className="save-area">
        <button className={`btn-save ${saved ? 'saved' : ''}`} onClick={save} disabled={saving}>
          {saving ? 'Salvando...' : saved ? <><CheckCircle2 size={18} strokeWidth={2} /> Salvo!</> : 'Salvar registro'}
        </button>
      </div>

      {/* Resumo da semana */}
      {summary && summary.logs_this_week > 0 && (
        <div className="summary-section">
          <h2 className="summary-title"><BarChart3 size={18} strokeWidth={1.75} /> Resumo da semana</h2>
          <div className="summary-grid">
            <div className="summary-stat">
              <div className="summary-value"><Droplet size={16} strokeWidth={1.75} /> {summary.avg_water_cups}</div>
              <div className="summary-label">copos/dia</div>
            </div>
            <div className="summary-stat">
              <div className="summary-value"><Moon size={16} strokeWidth={1.75} /> {summary.avg_sleep_hours}h</div>
              <div className="summary-label">sono/dia</div>
            </div>
            <div className="summary-stat">
              <div className="summary-value"><Footprints size={16} strokeWidth={1.75} /> {Math.round(summary.avg_steps)}</div>
              <div className="summary-label">passos/dia</div>
            </div>
            <div className="summary-stat">
              <div className="summary-value"><Pill size={16} strokeWidth={1.75} /> {Math.round(summary.medication_adherence * 100)}%</div>
              <div className="summary-label">adesão remédios</div>
            </div>
          </div>
        </div>
      )}

      <MedicationManager />

      <style jsx>{`
        .saude-page {
          max-width: 820px;
          margin: 0 auto;
          padding: 2rem 1.5rem 6rem;
        }
        .saude-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .saude-header-icon {
          width: 54px;
          height: 54px;
          background: var(--sage-50);
          color: var(--sage);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .saude-title {
          font-family: 'Source Serif 4', serif;
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }
        .saude-subtitle {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin: 0;
          text-transform: capitalize;
        }
        .saude-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        @media (max-width: 600px) {
          .saude-grid { grid-template-columns: 1fr; }
        }
        .saude-card {
          background: #fff;
          border-radius: 14px;
          padding: 1.5rem;
          border: 1px solid var(--cream-border);
          box-shadow: var(--shadow);
        }
        .card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 1rem;
        }
        .card-icon { display: flex; color: var(--sage); }
        .card-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .water-display {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-bottom: 10px;
        }
        .water-count {
          font-size: 2.4rem;
          font-weight: 800;
          color: var(--text-primary);
          font-family: 'Source Serif 4', serif;
        }
        .water-goal { font-size: 1rem; color: var(--text-muted); }
        .progress-bar {
          height: 8px;
          background: #f0ede8;
          border-radius: 99px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        .progress-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.3s;
        }
        .progress-fill.water { background: var(--memory-color); }
        .progress-fill.steps { background: var(--sage); }
        .progress-fill.sleep { background: #6b5b8c; }
        .water-buttons {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .btn-counter {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 2px solid var(--sage);
          background: #fff;
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--sage);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
          min-height: unset;
          padding: 0;
        }
        .btn-counter.plus { background: var(--sage); color: #fff; }
        .btn-counter:hover { opacity: 0.85; }
        .counter-hint { font-size: 0.72rem; color: var(--text-muted); text-align: center; flex: 1; }
        .steps-input-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }
        .steps-input {
          width: 90px;
          padding: 8px 12px;
          border: 1.5px solid var(--cream-border);
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          background: #fff;
        }
        .steps-input.small { width: 70px; }
        .steps-label { font-size: 0.9rem; color: var(--text-muted); }
        .exercise-row { display: flex; align-items: center; justify-content: space-between; }
        .exercise-input-row { display: flex; align-items: center; gap: 8px; }
        .field-label { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); }
        .sleep-slider-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .sleep-slider {
          flex: 1;
          accent-color: #6b5b8c;
          height: 6px;
        }
        .sleep-slider-label { font-size: 0.8rem; color: var(--text-muted); }
        .sleep-hint { display: flex; align-items: center; gap: 6px; font-size: 0.82rem; color: var(--text-muted); margin: 0; }
        .mood-grid {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .mood-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 10px 12px;
          border: 2px solid var(--cream-border);
          border-radius: 12px;
          background: #fff;
          cursor: pointer;
          transition: all 0.15s;
          min-height: unset;
          flex: 1;
        }
        .mood-btn:hover { border-color: var(--sage); }
        .mood-btn.active { border-color: var(--sage); background: var(--sage-50); }
        .mood-emoji { font-size: 1.6rem; }
        .mood-label { font-size: 0.68rem; font-weight: 600; color: var(--text-muted); }
        .med-toggle {
          width: 100%;
          padding: 14px;
          border-radius: 10px;
          border: 2px solid var(--cream-border);
          background: #fff;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          cursor: pointer;
          text-align: left;
          margin-bottom: 12px;
          transition: all 0.15s;
          min-height: unset;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .med-toggle.taken { background: var(--sage-50); border-color: var(--sage); color: var(--sage-dark); }
        .notes-input {
          width: 100%;
          border: 1.5px solid var(--cream-border);
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 0.9rem;
          font-family: inherit;
          color: var(--text-primary);
          background: #fff;
          resize: vertical;
          box-sizing: border-box;
        }
        .notes-input:focus { outline: none; border-color: var(--sage); }
        .save-area {
          display: flex;
          justify-content: center;
          margin: 2rem 0;
        }
        .btn-save {
          padding: 16px 48px;
          background: var(--sage);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .btn-save:hover { background: var(--sage-dark); transform: translateY(-1px); }
        .btn-save:disabled { opacity: 0.6; transform: none; }
        .btn-save.saved { background: var(--sage-dark); }
        .summary-section { margin-top: 1rem; }
        .summary-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }
        @media (max-width: 600px) {
          .summary-grid { grid-template-columns: repeat(2, 1fr); }
        }
        .summary-stat {
          background: #fff;
          border: 1px solid var(--cream-border);
          border-radius: 10px;
          padding: 1rem;
          text-align: center;
        }
        .summary-value { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 1.2rem; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
        .summary-label { font-size: 0.75rem; color: var(--text-muted); }
        .page-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          gap: 1rem;
          color: var(--text-muted);
        }
        .spinner {
          width: 36px;
          height: 36px;
          border: 3px solid var(--cream-border);
          border-top-color: var(--sage);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
