'use client'

import { useEffect, useState } from 'react'

/**
 * Pause after long use: after about 1h30 of continuous use, a full-screen
 * break takes over the app for 10 minutes and cannot be closed earlier.
 *
 * Times live in localStorage so reloading the page or opening another tab
 * does not skip the break. Being away from the app for 10+ minutes counts
 * as a break and restarts the count.
 */
export const PLAY_LIMIT_MS = 90 * 60 * 1000
export const BREAK_MS = 10 * 60 * 1000
const AWAY_RESETS_MS = 10 * 60 * 1000
const TICK_MS = 15 * 1000

const K = { start: 'cogni_use_start', seen: 'cogni_use_seen', breakUntil: 'cogni_break_until' }

const read = (k: string) => { try { return Number(localStorage.getItem(k)) || 0 } catch { return 0 } }
const write = (k: string, v: number) => { try { localStorage.setItem(k, String(v)) } catch {} }
const clear = (k: string) => { try { localStorage.removeItem(k) } catch {} }

const SUGGESTIONS = [
  ['🧍', 'Levante-se e estique o corpo'],
  ['💧', 'Beba um copo de água'],
  ['🚶', 'Dê uma pequena caminhada pela casa'],
  ['👀', 'Descanse os olhos olhando para longe'],
]

export default function BreakGuard() {
  const [breakUntil, setBreakUntil] = useState(0)
  const [now, setNow] = useState(0)

  // Count continuous use while the page is visible.
  useEffect(() => {
    const tick = () => {
      const t = Date.now()
      const until = read(K.breakUntil)
      if (until) { setBreakUntil(until); return }
      if (document.hidden) return
      let start = read(K.start)
      const seen = read(K.seen)
      if (!start || !seen || t - seen > AWAY_RESETS_MS) start = t
      write(K.start, start)
      write(K.seen, t)
      if (t - start >= PLAY_LIMIT_MS) {
        write(K.breakUntil, t + BREAK_MS)
        setBreakUntil(t + BREAK_MS)
      }
    }
    tick()
    const id = setInterval(tick, TICK_MS)
    const onVisible = () => { if (!document.hidden) tick() }
    const onStorage = (e: StorageEvent) => { if (e.key === K.breakUntil) setBreakUntil(read(K.breakUntil)) }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('storage', onStorage)
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVisible); window.removeEventListener('storage', onStorage) }
  }, [])

  // While the break is on: a 1-second clock, no scrolling and nothing behind it can be used.
  useEffect(() => {
    if (!breakUntil) return
    const update = () => setNow(Date.now())
    update()
    const id = setInterval(update, 1000)
    const behind = Array.from(document.querySelectorAll<HTMLElement>('body > *:not(.break-backdrop)'))
    behind.forEach(el => el.setAttribute('inert', ''))
    document.body.style.overflow = 'hidden'
    return () => {
      clearInterval(id)
      behind.forEach(el => el.removeAttribute('inert'))
      document.body.style.overflow = ''
    }
  }, [breakUntil])

  if (!breakUntil || !now) return null

  const left = Math.max(0, breakUntil - now)
  const done = left === 0
  const mm = Math.floor(left / 60000)
  const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, '0')
  const progress = 1 - left / BREAK_MS

  const finish = () => {
    clear(K.breakUntil)
    const t = Date.now()
    write(K.start, t)
    write(K.seen, t)
    setBreakUntil(0)
  }

  return (
    <div className="break-backdrop" role="alertdialog" aria-modal="true" aria-labelledby="break-title" aria-describedby="break-desc">
      <div className="break-card card pop">
        <div className="break-icon" aria-hidden="true">🌿</div>
        <h2 id="break-title" className="break-title">{done ? 'Pausa concluída!' : 'Hora de uma pausa'}</h2>
        <p id="break-desc" className="break-desc">
          {done
            ? 'Muito bem! Seu corpo agradece. Pode voltar quando quiser.'
            : 'Você está há 1 hora e meia no CogniMente. Que tal cuidar do corpo um pouquinho?'}
        </p>

        {!done && (
          <ul className="break-list">
            {SUGGESTIONS.map(([icon, text]) => <li key={text}><span aria-hidden="true">{icon}</span>{text}</li>)}
          </ul>
        )}

        <div className="break-timer" aria-live="off">
          <div className="break-clock">{done ? '0:00' : `${mm}:${ss}`}</div>
          <div className="progress" aria-hidden="true"><div className="progress-fill" style={{ width: `${progress * 100}%`, background: 'var(--primary)' }} /></div>
        </div>

        <button className="btn-primary" disabled={!done} onClick={finish}>
          {done ? 'Voltar ao CogniMente' : `O app volta em ${mm}:${ss}`}
        </button>
      </div>
    </div>
  )
}
