// Medication list and reminder state. Kept on this device (localStorage), like the
// reminder settings in the original CogniMente version.
import { dayKey } from '@/lib/health'

export interface Medication { id: string; name: string; times: string[] }

const MEDS_KEY = 'cogni_medications'
const TAKEN_KEY = 'cogni_meds_taken'
/** A reminder stays on screen for this long after its time if it was not confirmed yet. */
export const REMIND_WINDOW_MIN = 60

export const loadMeds = (): Medication[] => {
  try { return JSON.parse(localStorage.getItem(MEDS_KEY) || '[]') } catch { return [] }
}
export const saveMeds = (meds: Medication[]) => {
  try { localStorage.setItem(MEDS_KEY, JSON.stringify(meds)) } catch {}
  window.dispatchEvent(new Event('cogni-meds-changed'))
}

const doseKey = (med: Medication, time: string, d = new Date()) => `${dayKey(d)}_${med.id}_${time}`

const loadTaken = (): string[] => {
  try { return JSON.parse(localStorage.getItem(TAKEN_KEY) || '[]') } catch { return [] }
}

/** Mark a dose as handled today (taken or dismissed), keeping only today's entries. */
export function markDose(med: Medication, time: string) {
  const today = dayKey(new Date())
  const list = loadTaken().filter(k => k.startsWith(today))
  list.push(doseKey(med, time))
  try { localStorage.setItem(TAKEN_KEY, JSON.stringify(list)) } catch {}
}

/** Doses whose time has come within the reminder window and were not confirmed today. */
export function dueDoses(now = new Date()): { med: Medication; time: string }[] {
  const taken = new Set(loadTaken())
  const mins = now.getHours() * 60 + now.getMinutes()
  const due: { med: Medication; time: string }[] = []
  for (const med of loadMeds()) {
    for (const time of med.times) {
      const [h, m] = time.split(':').map(Number)
      const diff = mins - (h * 60 + m)
      if (diff >= 0 && diff <= REMIND_WINDOW_MIN && !taken.has(doseKey(med, time))) due.push({ med, time })
    }
  }
  return due
}
