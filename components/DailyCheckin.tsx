'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon, Pill, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/api'

type Mood = 'great' | 'good' | 'neutral' | 'bad' | 'awful'

const MOODS: { key: Mood; emoji: string; label: string }[] = [
  { key: 'great',   emoji: '😄', label: 'Ótimo' },
  { key: 'good',    emoji: '🙂', label: 'Bem' },
  { key: 'neutral', emoji: '😐', label: 'Regular' },
  { key: 'bad',     emoji: '😕', label: 'Mal' },
  { key: 'awful',   emoji: '😢', label: 'Muito mal' },
]

const TODAY = new Date().toISOString().split('T')[0]
const STORAGE_KEY = `cogni_checkin_${TODAY}`

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default function DailyCheckIn({ userName }: { userName: string }) {
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0)
  const [mood, setMood] = useState<Mood | null>(null)
  const [sleep, setSleep] = useState(7)
  const [medication, setMedication] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY)
    if (!done) setShow(true)
  }, [])

  const finish = async () => {
    setSaving(true)
    try {
      await api.health.upsert({
        log_date: TODAY,
        water_cups: 0,
        water_goal: 8,
        steps: 0,
        steps_goal: 3000,
        exercise_minutes: 0,
        sleep_hours: sleep,
        mood,
        medication_taken: medication ?? false,
        medication_notes: null,
        notes: null,
      })
    } catch (e) {
      // salva mesmo se falhar
    } finally {
      localStorage.setItem(STORAGE_KEY, '1')
      setSaving(false)
      setShow(false)
    }
  }

  if (!show) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '2rem',
        maxWidth: 440, width: '100%',
        boxShadow: '0 24px 64px rgba(20,22,20,0.18)',
        animation: 'fadeUp 0.3s ease',
      }}>

        {step === 0 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ color: 'var(--gold-dark)', display: 'flex', justifyContent: 'center', marginBottom: 8 }}><Sun size={36} strokeWidth={1.5} /></div>
              <h2 style={{ fontFamily: 'Source Serif 4, serif', fontSize: '1.5rem', color: 'var(--text-primary)', margin: '0 0 6px' }}>
                {getGreeting()}, {userName.split(' ')[0]}!
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                Como você está se sentindo hoje?
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {MOODS.map(m => (
                <button key={m.key} onClick={() => setMood(m.key)} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  padding: '12px 16px', borderRadius: 10,
                  border: `2px solid ${mood === m.key ? 'var(--sage)' : 'var(--cream-border)'}`,
                  background: mood === m.key ? 'var(--sage-50)' : '#fff',
                  cursor: 'pointer', transition: 'all 0.15s', minHeight: 'unset',
                }}>
                  <span style={{ fontSize: '1.8rem' }}>{m.emoji}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{m.label}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(1)} disabled={!mood} style={{
              width: '100%', padding: '14px', borderRadius: 10,
              background: mood ? 'var(--sage)' : 'var(--cream-border)',
              color: mood ? '#fff' : 'var(--text-muted)',
              border: 'none', fontSize: '1rem', fontWeight: 700, cursor: mood ? 'pointer' : 'default',
            }}>
              Próximo →
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ color: '#6b5b8c', display: 'flex', justifyContent: 'center', marginBottom: 8 }}><Moon size={36} strokeWidth={1.5} /></div>
              <h2 style={{ fontFamily: 'Source Serif 4, serif', fontSize: '1.4rem', color: 'var(--text-primary)', margin: '0 0 6px' }}>
                Como foi seu sono?
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                Quantas horas você dormiu?
              </p>
            </div>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'Source Serif 4, serif', color: 'var(--text-primary)' }}>
                {sleep}h
              </span>
            </div>
            <input type="range" min={0} max={12} step={0.5} value={sleep}
              onChange={e => setSleep(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#6b5b8c', marginBottom: '1rem' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              <span>0h</span><span>12h</span>
            </div>
            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {sleep < 6 ? <><AlertTriangle size={15} strokeWidth={2} /> Menos de 6h — tente descansar mais hoje</> :
               sleep >= 7 ? <><CheckCircle2 size={15} strokeWidth={2} /> Ótimo sono!</> : 'Razoável'}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(0)} style={{
                flex: 1, padding: '14px', borderRadius: 10, border: '2px solid var(--cream-border)',
                background: '#fff', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', color: 'var(--text-secondary)',
              }}>← Voltar</button>
              <button onClick={() => setStep(2)} style={{
                flex: 2, padding: '14px', borderRadius: 10, border: 'none',
                background: 'var(--sage)', color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
              }}>Próximo →</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ color: 'var(--sage)', display: 'flex', justifyContent: 'center', marginBottom: 8 }}><Pill size={36} strokeWidth={1.5} /></div>
              <h2 style={{ fontFamily: 'Source Serif 4, serif', fontSize: '1.4rem', color: 'var(--text-primary)', margin: '0 0 6px' }}>
                Você tomou seus remédios?
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                Ou ainda vai tomar mais tarde?
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1.5rem' }}>
              {[
                { val: true,  Icon: CheckCircle2, label: 'Sim, já tomei' },
                { val: false, Icon: Clock, label: 'Ainda não / Vou tomar depois' },
              ].map(opt => (
                <button key={String(opt.val)} onClick={() => setMedication(opt.val)} style={{
                  padding: '16px', borderRadius: 10,
                  border: `2px solid ${medication === opt.val ? 'var(--sage)' : 'var(--cream-border)'}`,
                  background: medication === opt.val ? 'var(--sage-50)' : '#fff',
                  fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)',
                  minHeight: 'unset',
                }}>
                  <opt.Icon size={20} strokeWidth={1.75} />
                  {opt.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(1)} style={{
                flex: 1, padding: '14px', borderRadius: 10, border: '2px solid var(--cream-border)',
                background: '#fff', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', color: 'var(--text-secondary)',
              }}>← Voltar</button>
              <button onClick={finish} disabled={medication === null || saving} style={{
                flex: 2, padding: '14px', borderRadius: 10, border: 'none',
                background: medication !== null ? 'var(--sage)' : 'var(--cream-border)',
                color: medication !== null ? '#fff' : 'var(--text-muted)',
                fontSize: '1rem', fontWeight: 700, cursor: medication !== null ? 'pointer' : 'default',
              }}>
                {saving ? 'Salvando...' : 'Começar o dia'}
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}