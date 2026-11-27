// Daily health check-in, saved in the backend (/api/health) so family members
// who were given permission can follow it.
import type { HealthLog, HealthLogInput, Mood } from '@/lib/api'

export interface HealthEntry { water: number; sleep: number; mood: number; moves: string[] }

export const MOODS: [emoji: string, label: string, value: Mood][] = [
  ['😄', 'Ótimo', 'great'],
  ['🙂', 'Bem', 'good'],
  ['😐', 'Mais ou menos', 'neutral'],
  ['😔', 'Pra baixo', 'bad'],
  ['😣', 'Indisposto', 'awful'],
]
export const MOVES = ['Caminhada', 'Alongamento', 'Jardinagem', 'Dança', 'Hidroginástica', 'Descanso']
export const EMPTY: HealthEntry = { water: 0, sleep: 7, mood: 1, moves: [] }

// The backend has no field for the kind of movement, so it travels in the notes.
const MOVES_PREFIX = 'Movimento: '

/** Local calendar day as YYYY-MM-DD (not UTC), so an evening check-in stays on the right day. */
export const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const moodIndex = (m: Mood | null | undefined) => Math.max(0, MOODS.findIndex(x => x[2] === m))
export const moodEmoji = (m: Mood | null | undefined) => (m ? MOODS[moodIndex(m)][0] : '·')

export function toInput(e: HealthEntry, d = new Date()): HealthLogInput {
  return {
    log_date: dayKey(d),
    water_cups: e.water,
    sleep_hours: e.sleep,
    mood: MOODS[e.mood][2],
    notes: e.moves.length ? MOVES_PREFIX + e.moves.join(', ') : null,
  }
}

export function fromLog(log: HealthLog): HealthEntry {
  const moves = log.notes?.startsWith(MOVES_PREFIX)
    ? log.notes.slice(MOVES_PREFIX.length).split(', ').filter(m => MOVES.includes(m))
    : []
  return { water: log.water_cups, sleep: Math.round(log.sleep_hours), mood: moodIndex(log.mood), moves }
}

/** The last 7 days, oldest first; today is last. */
export function weekDays(logs: HealthLog[]): { date: Date; log: HealthLog | null }[] {
  const byDay = new Map(logs.map(l => [l.log_date, l]))
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return { date, log: byDay.get(dayKey(date)) ?? null }
  })
}
