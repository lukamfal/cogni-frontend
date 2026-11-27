'use client'

import { useEffect, useState } from 'react'
import { api, IncomingRequest } from '@/lib/api'
import { toast } from '@/lib/games'

/** Notice on the player's home screen when someone asks to follow their progress. */
export default function CareRequests() {
  const [requests, setRequests] = useState<IncomingRequest[]>([])
  const [busy, setBusy] = useState<number | null>(null)

  useEffect(() => { api.care.incoming().then(setRequests).catch(() => {}) }, [])

  const answer = async (r: IncomingRequest, allow: boolean) => {
    setBusy(r.id)
    try {
      if (allow) await api.care.accept(r.id)
      else await api.care.decline(r.id)
      setRequests(list => list.filter(x => x.id !== r.id))
      const first = r.caregiver_name.split(' ')[0]
      toast(allow ? `Pronto! ${first} agora acompanha seu progresso.` : 'Pedido recusado.')
    } catch {
      toast('Não foi possível responder. Tente de novo.')
    } finally {
      setBusy(null)
    }
  }

  if (requests.length === 0) return null

  return (
    <>
      {requests.map(r => {
        const first = r.caregiver_name.split(' ')[0]
        return (
          <section key={r.id} className="care-ask card pop" role="alert" aria-labelledby={`care-${r.id}`}>
            <div className="care-ask-top">
              <span className="care-ask-icon" aria-hidden="true">👀</span>
              <div>
                <div id={`care-${r.id}`} className="care-ask-title">{r.caregiver_name} quer acompanhar você</div>
                <div className="care-ask-email">{r.caregiver_email}</div>
              </div>
            </div>
            <p className="care-ask-text">
              Se você permitir, {first} vai ver seus jogos, seus pontos e o seu registro de saúde.
              Você pode tirar essa permissão quando quiser, em <strong>Ajustes</strong>.
            </p>
            <div className="tut-actions">
              <button className="btn-outline" disabled={busy === r.id} onClick={() => answer(r, false)}>Recusar</button>
              <button className="btn-primary" disabled={busy === r.id} onClick={() => answer(r, true)}>Permitir</button>
            </div>
          </section>
        )
      })}
    </>
  )
}
