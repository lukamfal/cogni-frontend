'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { dayKey } from '@/lib/health'
import { Medication, dueDoses, markDose } from '@/lib/medications'

/** "Hora do remédio" warning. It stays until the person confirms, even if the app was closed at that minute. */
export default function MedicationAlert() {
  const [dose, setDose] = useState<{ med: Medication; time: string } | null>(null)

  useEffect(() => {
    const check = () => setDose(d => d ?? dueDoses()[0] ?? null)
    check()
    const id = setInterval(check, 30 * 1000)
    window.addEventListener('cogni-meds-changed', check)
    return () => { clearInterval(id); window.removeEventListener('cogni-meds-changed', check) }
  }, [])

  if (!dose) return null

  const answer = async (took: boolean) => {
    markDose(dose.med, dose.time)
    setDose(null)
    if (!took) return
    // Record it in today's health log so family members who follow can see it.
    const today = dayKey(new Date())
    const notes = `Tomou ${dose.med.name} (${dose.time})`
    try {
      const logs = await api.health.history(1)
      const log = logs.find(l => l.log_date === today)
      if (log) await api.health.patch(today, { medication_taken: true, medication_notes: notes.slice(0, 300) })
      else await api.health.save({ log_date: today, water_cups: 0, sleep_hours: 0, mood: null, notes: null, medication_taken: true, medication_notes: notes })
    } catch {}
    // Another dose may also be due.
    setTimeout(() => setDose(dueDoses()[0] ?? null), 400)
  }

  return (
    <div className="tut-backdrop med-backdrop" role="alertdialog" aria-modal="true" aria-labelledby="med-title">
      <div className="tut-card card pop med-card">
        <div className="med-icon" aria-hidden="true">💊</div>
        <h2 id="med-title" className="tut-title" style={{ textAlign: 'center' }}>Hora do remédio!</h2>
        <p className="med-name">{dose.med.name}</p>
        <p className="med-time">Horário: {dose.time}</p>
        <button className="btn-primary" onClick={() => answer(true)}>✓ Já tomei</button>
        <button className="tut-skip" style={{ alignSelf: 'center' }} onClick={() => answer(false)}>Agora não</button>
      </div>
    </div>
  )
}
