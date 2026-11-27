'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { MOODS, dayKey } from '@/lib/health'
import { loadMeds } from '@/lib/medications'
import { tutorialDone } from '@/components/Tutorial'

const doneKey = (userId: number) => `cogni_checkin_${userId}_${dayKey(new Date())}`

/**
 * Quick check-in once a day: how you feel, sleep and medication. Saved to the
 * health log, so it also shows on the Saúde page and for family who follow.
 * Waits for the first-login tutorial, so the two never open at the same time.
 */
export default function DailyCheckin({ userId, firstName }: { userId: number; firstName: string }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [mood, setMood] = useState<number | null>(null)
  const [sleep, setSleep] = useState(7)
  const [meds, setMeds] = useState<boolean | null>(null)
  const [hasMeds, setHasMeds] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const decide = async () => {
      let seen = false
      try { seen = localStorage.getItem(doneKey(userId)) === '1' } catch {}
      if (seen || !tutorialDone(userId)) return
      // Already logged something today on the Saúde page? Then no need to ask.
      const logs = await api.health.history(1).catch(() => [])
      if (logs.some(l => l.log_date === dayKey(new Date()) && l.mood)) return
      setHasMeds(loadMeds().length > 0)
      setOpen(true)
    }
    // On the day of the tutorial the check-in waits for the next visit, so a new user
    // isn't shown two step-by-step windows in a row.
    decide()
  }, [userId])

  const close = () => {
    try { localStorage.setItem(doneKey(userId), '1') } catch {}
    setOpen(false)
  }

  const finish = async () => {
    setSaving(true)
    const today = dayKey(new Date())
    const fields = {
      mood: mood === null ? null : MOODS[mood][2],
      sleep_hours: sleep,
      ...(meds === null ? {} : { medication_taken: meds }),
    }
    try {
      const logs = await api.health.history(1)
      if (logs.some(l => l.log_date === today)) await api.health.patch(today, fields)
      else await api.health.save({ log_date: today, water_cups: 0, notes: null, ...fields })
    } catch {}
    setSaving(false)
    close()
  }

  if (!open) return null

  const h = new Date().getHours()
  const greeting = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
  const lastStep = hasMeds ? 2 : 1

  return (
    <div className="tut-backdrop" role="dialog" aria-modal="true" aria-labelledby="checkin-title">
      <div className="tut-card card pop" key={step}>
        <div className="tut-top">
          <span className="tut-count">Check-in do dia · {step + 1} de {lastStep + 1}</span>
          <button className="tut-skip" onClick={close}>Agora não</button>
        </div>

        {step === 0 && (
          <>
            <h2 id="checkin-title" className="tut-title">{greeting}, {firstName}! ☀️</h2>
            <p className="tut-body">Como você está se sentindo hoje?</p>
            <div className="moods checkin-moods">
              {MOODS.map(([e, l], i) => (
                <button key={l} className={`mood checkin-mood ${mood === i ? 'sel' : ''}`} aria-pressed={mood === i} aria-label={l} onClick={() => setMood(i)}>
                  <span aria-hidden="true">{e}</span><small aria-hidden="true">{l}</small>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 id="checkin-title" className="tut-title">Como foi seu sono? 😴</h2>
            <p className="tut-body">Quantas horas você dormiu esta noite?</p>
            <div className="stepper" style={{ justifyContent: 'center' }}>
              <button className="step-btn" aria-label="Menos sono" onClick={() => setSleep(s => Math.max(0, s - 1))}>−</button>
              <span className="step-val">{sleep}h</span>
              <button className="step-btn" aria-label="Mais sono" onClick={() => setSleep(s => Math.min(12, s + 1))}>+</button>
            </div>
            <p className="note" style={{ textAlign: 'center' }}>{sleep < 6 ? 'Pouco sono. Tente descansar um pouco hoje.' : sleep >= 7 ? 'Ótimo, bem descansado!' : 'Razoável.'}</p>
          </>
        )}

        {step === 2 && (
          <>
            <h2 id="checkin-title" className="tut-title">E os remédios? 💊</h2>
            <p className="tut-body">Você já tomou os remédios de hoje?</p>
            <div className="list">
              {([[true, '✓ Sim, já tomei'], [false, '🕒 Ainda não, vou tomar depois']] as const).map(([v, l]) => (
                <button key={String(v)} className={`role-opt checkin-opt ${meds === v ? 'sel' : ''}`} aria-pressed={meds === v} onClick={() => setMeds(v)}>{l}</button>
              ))}
            </div>
          </>
        )}

        <div className="tut-actions">
          {step > 0 && <button className="btn-outline" onClick={() => setStep(s => s - 1)}>Voltar</button>}
          {step < lastStep
            ? <button className="btn-primary" disabled={step === 0 && mood === null} onClick={() => setStep(s => s + 1)}>Próximo</button>
            : <button className="btn-primary" disabled={saving || (step === 2 && meds === null)} onClick={finish}>{saving ? 'Salvando...' : 'Começar o dia'}</button>}
        </div>
      </div>
    </div>
  )
}
