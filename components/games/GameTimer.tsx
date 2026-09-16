'use client'

import { useState, useEffect } from 'react'
import { Timer, AlertTriangle } from 'lucide-react'

interface Props {
  seconds: number
  onExpire: () => void
}

export default function GameTimer({ seconds, onExpire }: Props) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    if (remaining <= 0) { onExpire(); return }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000)
    return () => clearTimeout(t)
  }, [remaining])

  const m = Math.floor(remaining / 60).toString().padStart(2, '0')
  const s = (remaining % 60).toString().padStart(2, '0')
  const urgent = remaining <= 15

  return (
    <div className={`timer ${urgent ? 'urgent' : ''}`}>
      <span className="timer-icon">{urgent ? <AlertTriangle size={16} strokeWidth={2} /> : <Timer size={16} strokeWidth={2} />}</span>
      <span className="timer-val">{m}:{s}</span>
      <style jsx>{`
        .timer {
          display: flex; align-items: center; gap: 6px;
          background: #fff; border: 2px solid var(--cream-border);
          border-radius: 10px; padding: 8px 14px;
          font-weight: 700; font-size: 1.05rem; color: var(--text-primary);
          transition: all 0.3s;
        }
        .timer.urgent { border-color: #ef4444; color: #ef4444; animation: pulse-ring 1s infinite; }
        .timer-icon { display: flex; }
      `}</style>
    </div>
  )
}
