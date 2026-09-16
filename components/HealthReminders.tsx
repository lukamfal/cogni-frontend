'use client'

import { useEffect, useState, useCallback } from 'react'
import { Droplet, Footprints, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type ReminderType = 'water' | 'walk'

interface Reminder {
  type: ReminderType
  message: string
  icon: LucideIcon
}

const WATER_INTERVAL = 90 * 60 * 1000
const WALK_INTERVAL  = 60 * 60 * 1000

export default function HealthReminders() {
  const [reminder, setReminder] = useState<Reminder | null>(null)
  const [visible, setVisible] = useState(false)

  const dismiss = useCallback(() => {
    setVisible(false)
    setTimeout(() => setReminder(null), 400)
  }, [])

  const show = useCallback((r: Reminder) => {
    setReminder(r)
    setVisible(true)
  }, [])

  useEffect(() => {
    const waterTimer = setInterval(() => {
      show({ type: 'water', icon: Droplet, message: 'Hora de tomar água! Mantenha-se hidratado.' })
    }, WATER_INTERVAL)

    const walkTimer = setInterval(() => {
      show({ type: 'walk', icon: Footprints, message: 'Você está aqui há uma hora. Que tal dar uma pausa e caminhar um pouco?' })
    }, WALK_INTERVAL)

    return () => {
      clearInterval(waterTimer)
      clearInterval(walkTimer)
    }
  }, [show])

  useEffect(() => {
    if (!visible) return
    const t = setTimeout(dismiss, 12000)
    return () => clearTimeout(t)
  }, [visible, dismiss])

  if (!reminder) return null

  return (
    <div className={`reminder-toast ${reminder.type} ${visible ? 'show' : 'hide'}`}>
      <span className="reminder-icon"><reminder.icon size={20} strokeWidth={1.75} /></span>
      <div className="reminder-content">
        <p className="reminder-msg">{reminder.message}</p>
      </div>
      <button className="reminder-close" onClick={dismiss}><X size={14} strokeWidth={2} /></button>

      <style jsx>{`
        .reminder-toast {
          position: fixed;
          bottom: 90px;
          left: 50%;
          transform: translateX(-50%) translateY(20px);
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          border-radius: 12px;
          box-shadow: var(--shadow-lg);
          max-width: 380px;
          width: calc(100vw - 2rem);
          opacity: 0;
          transition: opacity 0.35s, transform 0.35s;
        }
        .reminder-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
        .reminder-toast.hide { opacity: 0; transform: translateX(-50%) translateY(20px); }
        .reminder-toast.water { background: var(--memory-bg); border: 1px solid var(--memory-color); color: var(--memory-color); }
        .reminder-toast.walk  { background: var(--sage-50); border: 1px solid var(--sage-100); color: var(--sage); }
        .reminder-icon { flex-shrink: 0; display: flex; }
        .reminder-content { flex: 1; }
        .reminder-msg { margin: 0; font-size: 0.92rem; font-weight: 600; color: var(--text-primary); line-height: 1.4; }
        .reminder-close { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; min-height: unset; flex-shrink: 0; display: flex; }
        .reminder-close:hover { color: var(--text-secondary); }
        @media (min-width: 768px) {
          .reminder-toast { bottom: 2rem; left: auto; right: 2rem; transform: translateY(20px); }
          .reminder-toast.show { transform: translateY(0); }
          .reminder-toast.hide { transform: translateY(20px); }
        }
      `}</style>
    </div>
  )
}