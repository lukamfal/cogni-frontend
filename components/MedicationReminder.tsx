'use client'

import { useState, useEffect, useRef } from 'react'
import { Pill, CheckCircle2, X, Clock, Trash2, Plus } from 'lucide-react'

interface Medication {
  id: string
  name: string
  times: string[]
}

const STORAGE_KEY = 'cogni_medications'

function loadMeds(): Medication[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

function saveMeds(meds: Medication[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meds))
}

export function useMedications() {
  const [meds, setMeds] = useState<Medication[]>([])

  useEffect(() => { setMeds(loadMeds()) }, [])

  const add = (name: string, times: string[]) => {
    const updated = [...meds, { id: Date.now().toString(), name, times }]
    setMeds(updated)
    saveMeds(updated)
  }

  const remove = (id: string) => {
    const updated = meds.filter(m => m.id !== id)
    setMeds(updated)
    saveMeds(updated)
  }

  return { meds, add, remove }
}

export function MedicationAlert() {
  const [alert, setAlert] = useState<string | null>(null)
  const shownRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const check = () => {
      const meds = loadMeds()
      const now = new Date()
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

      for (const med of meds) {
        for (const t of med.times) {
          const key = `${med.id}_${t}_${now.toDateString()}`
          if (t === hhmm && !shownRef.current.has(key)) {
            shownRef.current.add(key)
            setAlert(med.name)
            return
          }
        }
      }
    }

    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [])

  if (!alert) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 3000,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '2.5rem 2rem',
        maxWidth: 380, width: '100%', textAlign: 'center',
        boxShadow: '0 24px 64px rgba(20,22,20,0.25)',
        border: '2px solid #c2410c',
        animation: 'fadeUp 0.3s ease',
      }}>
        <div style={{ color: '#c2410c', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}><Pill size={48} strokeWidth={1.5} /></div>
        <h2 style={{ fontFamily: 'Source Serif 4, serif', fontSize: '1.5rem', color: '#c2410c', margin: '0 0 8px' }}>
          Hora do remédio!
        </h2>
        <p style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1.5rem' }}>
          {alert}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 1.5rem' }}>
          Não esqueça de tomar seu medicamento agora.
        </p>
        <button onClick={() => setAlert(null)} style={{
          width: '100%', padding: '16px', borderRadius: 10,
          background: '#c2410c', color: '#fff', border: 'none',
          fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <CheckCircle2 size={20} strokeWidth={2} /> Já tomei!
        </button>
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

export function MedicationManager() {
  const { meds, add, remove } = useMedications()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [times, setTimes] = useState(['08:00'])

  const addTime = () => setTimes(t => [...t, '08:00'])
  const removeTime = (i: number) => setTimes(t => t.filter((_, idx) => idx !== i))
  const updateTime = (i: number, val: string) => setTimes(t => t.map((v, idx) => idx === i ? val : v))

  const save = () => {
    if (!name.trim() || times.length === 0) return
    add(name.trim(), times)
    setName(''); setTimes(['08:00']); setShowForm(false)
  }

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Source Serif 4, serif', fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0 }}>
          <Pill size={20} strokeWidth={1.75} /> Meus Remédios
        </h2>
        <button onClick={() => setShowForm(v => !v)} style={{
          background: 'var(--sage)', color: '#fff', border: 'none', borderRadius: 8,
          padding: '8px 16px', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', minHeight: 'unset',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {showForm ? <><X size={15} strokeWidth={2} /> Cancelar</> : <><Plus size={15} strokeWidth={2} /> Adicionar</>}
        </button>
      </div>

      {showForm && (
        <div style={{
          background: '#fff', borderRadius: 12, padding: '1.25rem',
          border: '1px solid var(--cream-border)', marginBottom: '1rem',
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Nome do remédio
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Losartana 50mg"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: '1.5px solid var(--cream-border)', fontSize: '1rem',
                fontFamily: 'inherit', boxSizing: 'border-box' as const,
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Horários
            </label>
            {times.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <input
                  type="time"
                  value={t}
                  onChange={e => updateTime(i, e.target.value)}
                  style={{
                    flex: 1, padding: '10px 12px', borderRadius: 8,
                    border: '1.5px solid var(--cream-border)', fontSize: '1rem', fontFamily: 'inherit',
                  }}
                />
                {times.length > 1 && (
                  <button onClick={() => removeTime(i)} style={{
                    background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 6,
                    padding: '8px 10px', cursor: 'pointer', minHeight: 'unset',
                    display: 'flex', alignItems: 'center',
                  }}><X size={15} strokeWidth={2} /></button>
                )}
              </div>
            ))}
            <button onClick={addTime} style={{
              background: 'none', border: '1.5px dashed var(--cream-border)', borderRadius: 8,
              padding: '8px 14px', fontSize: '0.85rem', fontWeight: 600,
              color: 'var(--text-secondary)', cursor: 'pointer', minHeight: 'unset',
            }}>
              + Adicionar horário
            </button>
          </div>

          <button onClick={save} disabled={!name.trim()} style={{
            width: '100%', padding: '12px', borderRadius: 8,
            background: name.trim() ? 'var(--sage)' : 'var(--cream-border)',
            color: name.trim() ? '#fff' : 'var(--text-muted)',
            border: 'none', fontSize: '1rem', fontWeight: 700,
            cursor: name.trim() ? 'pointer' : 'default',
          }}>
            Salvar remédio
          </button>
        </div>
      )}

      {meds.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: 12, padding: '2rem',
          border: '1px solid var(--cream-border)', textAlign: 'center',
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Nenhum remédio cadastrado ainda.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {meds.map(med => (
            <div key={med.id} style={{
              background: '#fff', borderRadius: 10, padding: '1rem 1.25rem',
              border: '1px solid var(--cream-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{med.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  <Clock size={13} strokeWidth={2} /> {med.times.join(' · ')}
                </div>
              </div>
              <button onClick={() => remove(med.id)} style={{
                background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 6,
                padding: '6px 10px', cursor: 'pointer', minHeight: 'unset',
                display: 'flex', alignItems: 'center',
              }}><Trash2 size={14} strokeWidth={2} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}