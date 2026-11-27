'use client'

import { useState, useEffect, useRef } from 'react'

interface Props {
  seconds: number
  onExpire: () => void
}

export default function GameTimer({ seconds, onExpire }: Props) {
  const [remaining, setRemaining] = useState(seconds)
  const expire = useRef(onExpire)
  useEffect(() => { expire.current = onExpire })

  useEffect(() => {
    if (remaining <= 0) { expire.current(); return }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000)
    return () => clearTimeout(t)
  }, [remaining])

  const m = Math.floor(remaining / 60).toString().padStart(2, '0')
  const s = (remaining % 60).toString().padStart(2, '0')
  const urgent = remaining <= 5 || (seconds > 30 && remaining <= 15)

  return (
    <div className={`timer ${urgent ? 'urgent' : ''}`} aria-label={`Tempo restante: ${m}:${s}`}>
      <span aria-hidden="true">{urgent ? '⚠️' : '⏱️'}</span>
      <span>{m}:{s}</span>
    </div>
  )
}
